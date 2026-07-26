import type { WorkspaceCardDTO } from "@/dto";
import type { CustomerPlanSummaryDTO } from "@/dto/subscription.dto";
import type { CardReadRepository, UnitOfWork } from "@/repositories";
import type { PlatformManagementRepository } from "@/repositories/platform-management.repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { toWorkspaceCardDTO } from "./card-mappers";
import { hasAdminPermission } from "./subscription-platform";

export interface AdminWorkspaceDTO {
  customerId: string;
  card: WorkspaceCardDTO;
  plan: CustomerPlanSummaryDTO;
}

export class AdminWorkspace {
  constructor(
    _unitOfWork: UnitOfWork,
    private readonly cards: CardReadRepository,
    private readonly platformReads: PlatformManagementRepository,
  ) {}

  async read(email: string, cardId: string): Promise<AdminWorkspaceDTO> {
    const [actor, card, subscription] = await Promise.all([
      this.platformReads.findAdminByEmail(email),
      (this.cards.findWorkspaceById?.(cardId, null) ?? this.cards.findEditorById(cardId, null)),
      this.platformReads.findActiveSubscriptionByCard(cardId),
    ]);
    if (!actor || !hasAdminPermission(actor, "CARD_SUPPORT_EDIT"))
      throw new ForbiddenError("Missing permission: CARD_SUPPORT_EDIT");
    if (!card) throw new NotFoundError("Card", cardId);
    return {
      customerId: card.customerId,
      card: toWorkspaceCardDTO(card),
      plan: {
        subscription,
        enabledFeatures: subscription?.plan.features.filter((feature) => feature.enabled) ?? [],
        disabledFeatures: subscription?.plan.features.filter((feature) => !feature.enabled) ?? [],
      },
    };
  }
}
