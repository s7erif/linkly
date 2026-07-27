import type { ApprovedOrderDTO, CardDTO, IssuedAccessCodeDTO } from "@/dto";
import { assertFulfillmentTransition, assertOrderTransition } from "@/domain/order";
import { ConflictError, NotFoundError, UniqueConstraintError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import { orderIdSchema, type OrderIdInput } from "@/validation/order";
import { CreateOrderSubscription } from "./subscription-platform";
import { CreateCard } from "./create-card";
import { CreateCustomer } from "./create-customer";
import { GenerateInitialAccessCode } from "./generate-initial-access-code";
import { parseUseCaseInput } from "./shared";
import { generateAccountUsername, generateCardSlug } from "@/lib/slug-generator";

/** Maximum attempts to find a database-unique card slug before giving up. */
const MAX_SLUG_RETRIES = 5;

export class ApproveOrder {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly createCustomer: CreateCustomer,
    private readonly createCard: CreateCard,
    private readonly generateInitialAccessCode: GenerateInitialAccessCode,
    private readonly createSubscription?: CreateOrderSubscription,
  ) {}

  async execute(input: OrderIdInput): Promise<ApprovedOrderDTO> {
    const { orderId } = parseUseCaseInput(orderIdSchema, input);
    return this.unitOfWork.execute(async (repositories) => {
      // ── 1. Load & transition the order ──────────────────────────
      const order = await repositories.orders.findById(orderId);
      if (!order) throw new NotFoundError("Order", orderId);

      assertOrderTransition(order.status, "APPROVED");
      const approved = await repositories.orders.transition({
        id: order.id,
        fromStatus: order.status,
        update: { status: "APPROVED" },
      });
      if (!approved) {
        throw new ConflictError(
          "Order changed while it was being approved",
        );
      }

      // ── 2. Create customer ──────────────────────────────────────
      const customer = await this.createCustomer.executeIn(repositories, {
        displayName: order.customerName,
        email: order.email,
        phone: order.phone,
        locale: "en",
        timezone: "UTC",
      });

      assertFulfillmentTransition("NOT_STARTED", "CUSTOMER_CREATED");
      await repositories.orders.update(order.id, {
        customerId: customer.id,
        fulfillmentStatus: "CUSTOMER_CREATED",
      });

      // ── 3. Provision account (if credentials were stored) ───────
      const credentials =
        await repositories.orders.findAccountCredentials(order.id);
      if (credentials) {
        await repositories.customers.provisionAccount({
          customerId: customer.id,
          email: order.email,
          passwordHash: credentials.accountPasswordHash,
          passwordSalt: credentials.accountPasswordSalt,
        });
      }

      // ── 4. Create subscription (optional) ───────────────────────
      const subscription =
        order.planId &&
        order.billingInterval &&
        this.createSubscription
          ? await this.createSubscription.executeIn(repositories, {
              customerId: customer.id,
              planId: order.planId,
              billingInterval: order.billingInterval,
            })
          : undefined;

      // ── 5. Create cards — database is the authority on uniqueness ─
      const baseSlug = generateAccountUsername(order.customerName);
      // Local Set tracks slugs we've already consumed (successfully
      // created or found to be taken) so generateCardSlug doesn't
      // propose them again.
      const takenSlugs = new Set<string>();
      const cards: CardDTO[] = [];

      for (let index = 0; index < order.quantity; index++) {
        const name =
          order.quantity > 1
            ? `${order.customerName} Card ${index + 1}`
            : `${order.customerName} Card`;

        let slug = generateCardSlug(baseSlug, takenSlugs);
        let card: CardDTO | undefined;

        for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
          // Fast-path optimisation: avoid an INSERT we know will fail.
          // This is NOT the correctness guarantee — that lives in the
          // P2002 catch below.  The database is the ultimate authority.
          if (
            attempt > 0 ||
            (await repositories.cards.slugExists(slug))
          ) {
            takenSlugs.add(slug);
            slug = generateCardSlug(baseSlug, takenSlugs);
          }

          try {
            card = await this.createCard.executeIn(
              repositories,
              {
                customerId: customer.id,
                slug,
                name,
                fullName: order.customerName,
              },
              {
                orderId: order.id,
                initialProfile: {
                  company: order.company,
                  email: order.email,
                  phone: order.phone,
                },
              },
            );
            break; // success — exit retry loop
          } catch (error) {
            if (
              error instanceof UniqueConstraintError &&
              error.target.includes("slug")
            ) {
              // Slug was claimed between slugExists() and the INSERT.
              // Blacklist it and loop around with a fresh candidate.
              takenSlugs.add(slug);
              slug = generateCardSlug(baseSlug, takenSlugs);
              continue;
            }
            throw error; // not a slug collision — propagate
          }
        }

        if (!card) {
          throw new ConflictError(
            `Unable to generate a unique card slug after ${MAX_SLUG_RETRIES} attempts`,
          );
        }

        takenSlugs.add(slug);
        cards.push(card);
      }

      assertFulfillmentTransition("CUSTOMER_CREATED", "CARD_CREATED");
      await repositories.orders.update(order.id, {
        fulfillmentStatus: "CARD_CREATED",
      });

      // ── 6. Issue initial access codes ───────────────────────────
      const issuedAccessCodes: IssuedAccessCodeDTO[] = [];
      for (const card of cards) {
        issuedAccessCodes.push(
          await this.generateInitialAccessCode.executeIn(repositories, {
            cardId: card.id,
            expiresAt: null,
          }),
        );
      }

      assertFulfillmentTransition("CARD_CREATED", "ACCESS_CODE_ISSUED");
      assertOrderTransition("APPROVED", "FULFILLED");

      const fulfilled = await repositories.orders.update(order.id, {
        status: "FULFILLED",
        fulfillmentStatus: "ACCESS_CODE_ISSUED",
      });

      return {
        order: fulfilled,
        customer,
        cards,
        issuedAccessCodes,
        ...(subscription ? { subscription } : {}),
      };
    });
  }
}
