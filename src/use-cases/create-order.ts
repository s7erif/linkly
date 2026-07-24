import type { OrderDTO } from "@/dto";
import type { UnitOfWork } from "@/repositories";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { createOrderSchema, type CreateOrderInput } from "@/validation/order";
import { parseUseCaseInput, type Clock, systemClock } from "./shared";
export interface OrderNumberGenerator { generate(now: Date): string }
export const secureOrderNumberGenerator: OrderNumberGenerator = { generate(now) { const date = now.toISOString().slice(0, 10).replaceAll("-", ""); const random = Array.from(crypto.getRandomValues(new Uint8Array(4)), byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase(); return `OI-${date}-${random}`; } };
export class CreateOrder {
 constructor(private readonly unitOfWork: UnitOfWork, private readonly numbers: OrderNumberGenerator = secureOrderNumberGenerator, private readonly clock: Clock = systemClock) {}
 execute(input: CreateOrderInput): Promise<OrderDTO> {
  const command = parseUseCaseInput(createOrderSchema, input);
  return this.unitOfWork.execute(async repositories => {
   const interval = command.billingInterval ?? "MONTHLY";
   let snapshot: { planNameSnapshot?: string; planDescriptionSnapshot?: string | null; billingIntervalSnapshot?: typeof interval; currency?: string; planPriceSnapshot?: number; subtotal?: number; discount?: number; tax?: number; total?: number } = {};
   if (command.planId) {
    if (!repositories.platform) throw new ValidationError("Plan management is not configured");
    const plan = await repositories.platform.findPlan(command.planId);
    if (!plan) throw new NotFoundError("Plan", command.planId);
    const price = interval === "QUARTERLY" ? (plan.quarterlyMinor ?? plan.monthlyMinor ?? 0) : interval === "YEARLY" ? (plan.yearlyMinor ?? plan.monthlyMinor ?? 0) : (plan.monthlyMinor ?? 0);
    const subtotal = price * command.quantity;
    snapshot = { planNameSnapshot: plan.name, planDescriptionSnapshot: plan.description, billingIntervalSnapshot: interval, currency: plan.currency, planPriceSnapshot: price, subtotal, discount: 0, tax: 0, total: subtotal };
   }
   return repositories.orders.create({ orderNumber: this.numbers.generate(this.clock.now()), customerName: command.customerName, company: command.company ?? null, email: command.email, phone: command.phone, package: command.package, quantity: command.quantity, notes: command.notes ?? null, planId: command.planId, billingInterval: command.billingInterval, ...snapshot, accountPasswordHash: command.accountPasswordHash, accountPasswordSalt: command.accountPasswordSalt, status: "PENDING", paymentStatus: "PENDING", fulfillmentStatus: "NOT_STARTED" });
  });
 }
}
