import "server-only";
import { prisma } from "@/lib/database/prisma";
import { PrismaAccessCodeReadRepository } from "@/repositories/access-code.repository";
import { PrismaCardReadRepository } from "@/repositories/card.repository";
import { PrismaCustomerReadRepository } from "@/repositories/customer.repository";
import { PrismaLegacyReadRepository } from "@/repositories/legacy.repository";
import { PrismaLegacyMigrationReadRepository } from "@/repositories/legacy-migration.repository";
import { PrismaOrderReadRepository } from "@/repositories/order.repository";
import { PrismaAdminReadRepository } from "@/repositories/admin-read.repository";
import { PrismaPlatformManagementRepository } from "@/repositories/platform-management.repository";
import { PrismaSubscriptionLifecycleRepository } from "@/repositories/subscription-lifecycle.repository";
import { ManualSubscriptionLifecycleService } from "@/services/manual-subscription-lifecycle.service";
import { LegacyCardMigrationService } from "@/services/legacy-card-migration.service";
import { PrismaUnitOfWork } from "@/repositories/prisma-unit-of-work";
import {
  AccessCodeService,
  createAccessCodeHasher,
} from "@/services/access-code.service";
import { CardService } from "@/services/card.service";
import { CustomerService } from "@/services/customer.service";
import { AdminReadService } from "@/services/admin-read.service";
import {
  LegacyAdminUserService,
  LegacyCardService,
} from "@/lib/services/business-card.service";
import { LegacySocialLinkService } from "@/lib/services/social-link.service";
import { getEnvironment } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PrismaNotificationRepository } from "@/repositories/notification.repository";
import { PrismaInvoiceRepository } from "@/repositories/invoice.repository";
import { PrismaPaymentRepository } from "@/repositories/payment.repository";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import { BillingReadService } from "@/services/billing-read.service";
import { DashboardProjectionService } from "@/services/dashboard-projection.service";
import { PrismaMediaRepository } from "@/repositories/media.repository";
import { PrismaNfcCardRepository } from "@/repositories/nfc-card.repository";
import { PrismaActivationRepository } from "@/repositories/activation.repository";
import { MediaService } from "@/services/media.service";
import { LocalStorageProvider } from "@/services/local-storage.provider";
import { SupabaseStorageProvider } from "@/services/supabase-storage.provider";
import { NotificationService } from "@/notifications/notification.service";
import { ResendEmailProvider } from "@/notifications/resend-email.provider";
import { OrderApprovalNotificationCoordinator } from "@/notifications/order-approval-notification.coordinator";
import { PlatformOperationsReadService } from "@/services/platform-operations-read.service";
import { PlatformSettingsService } from "@/services/platform-settings.service";
import { NfcCardService } from "@/services/nfc-card.service";
import { ActivationService } from "@/services/activation.service";

const unitOfWork = new PrismaUnitOfWork(prisma);
const customerReads = new PrismaCustomerReadRepository(prisma);
const cardReads = new PrismaCardReadRepository(prisma);
const accessCodeReads = new PrismaAccessCodeReadRepository(prisma);
const legacyReads = new PrismaLegacyReadRepository(prisma);
const legacyMigrationReads = new PrismaLegacyMigrationReadRepository(prisma);
const orderReads = new PrismaOrderReadRepository(prisma);
const adminReads = new PrismaAdminReadRepository(prisma);
const platformManagement = new PrismaPlatformManagementRepository(prisma);
const subscriptionLifecycleRepository = new PrismaSubscriptionLifecycleRepository(prisma);
const notificationRepository = new PrismaNotificationRepository(prisma);
const nfcCardRepository = new PrismaNfcCardRepository(prisma);
const activationRepository = new PrismaActivationRepository(prisma);

export const customerService = new CustomerService({
  customers: customerReads,
  unitOfWork,
});
export const adminReadService = new AdminReadService(adminReads);
export function getNfcCardService() {
  return new NfcCardService(nfcCardRepository);
}
export function getActivationService() {
  const environment = getEnvironment();
  if (!environment.ACCESS_CODE_HMAC_KEY) throw new Error("ACCESS_CODE_HMAC_KEY is required for activation");
  return new ActivationService(activationRepository, environment.ACCESS_CODE_HMAC_KEY);
}
export const cardService = new CardService({ cards: cardReads, unitOfWork });
export const legacyCardService = new LegacyCardService(legacyReads, unitOfWork);
export const legacySocialLinkService = new LegacySocialLinkService(
  legacyReads,
  unitOfWork,
);
export const legacyAdminUserService = new LegacyAdminUserService(
  legacyReads,
  unitOfWork,
);
export const legacyCardMigrationService = new LegacyCardMigrationService(
  legacyMigrationReads,
  unitOfWork,
);
export function getAccessCodeService(): AccessCodeService {
  const secret = getEnvironment().ACCESS_CODE_HMAC_KEY;
  if (!secret)
    throw new Error(
      "ACCESS_CODE_HMAC_KEY is required to construct AccessCodeService",
    );
  return new AccessCodeService(
    { accessCodes: accessCodeReads, unitOfWork },
    createAccessCodeHasher(secret),
  );
}

import {
  ApproveOrder,
  CancelOrder,
  CompleteOrder,
  CreateCard,
  CreateCustomer,
  CreateEditorSession,
  CreateOrder,
  GenerateInitialAccessCode,
  GetOrder,
  ListOrders,
  ReadPublicCard,
  ReadWorkspaceCard,
  VerifyAccessCode,
  UpdateCardAppearance,
  UpdateCardProfile,
  UpdateCardPublication,
  UpdateCardSections,
  CreateCardButton,
  UpdateCardButton,
  DeleteCardButton,
  ReorderCardButtons,
  CreateSocialLink,
  UpdateSocialLink,
  DeleteSocialLink,
  ReorderSocialLinks,
  ChangeCardSlug,
  ValidateCardSlug,
  UpdateCardMetadata,
  InitializeCardBlocks,
  CreateCardBlock,
  UpdateCardBlock,
  DeleteCardBlock,
  DuplicateCardBlock,
  ReorderCardBlocks,
  EnsureBootstrapAdmin, ListActivePlans, ManagePlan, ManagePlanOperation, ListSubscriptions, ManageSubscription, CreateOrderSubscription,
  RegenerateAccessCode,
  AdminManageCard,
  AdminWorkspace,
  AuthorizeAdminAction,
} from "@/use-cases";
import {
  createHmacSecretHasher,
  secureAccessCodeGenerator,
  secureSessionTokenGenerator,
} from "@/services/credential-security.service";

export const createCustomer = new CreateCustomer(unitOfWork);
export const createCard = new CreateCard(unitOfWork);
export const readPublicCard = new ReadPublicCard(cardReads);
export const readWorkspaceCard = new ReadWorkspaceCard(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardAppearance = new UpdateCardAppearance(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardPublication = new UpdateCardPublication(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardProfile = new UpdateCardProfile(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const initializeCardBlocks = new InitializeCardBlocks(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const createCardBlock = new CreateCardBlock(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardBlock = new UpdateCardBlock(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const deleteCardBlock = new DeleteCardBlock(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const duplicateCardBlock = new DuplicateCardBlock(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const reorderCardBlocks = new ReorderCardBlocks(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardSections = new UpdateCardSections(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const createCardButton = new CreateCardButton(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardButton = new UpdateCardButton(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const deleteCardButton = new DeleteCardButton(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const reorderCardButtons = new ReorderCardButtons(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const createSocialLink = new CreateSocialLink(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateSocialLink = new UpdateSocialLink(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const deleteSocialLink = new DeleteSocialLink(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const reorderSocialLinks = new ReorderSocialLinks(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const changeCardSlug = new ChangeCardSlug(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const validateCardSlug = new ValidateCardSlug(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const updateCardMetadata = new UpdateCardMetadata(
  unitOfWork,
  secureSessionTokenGenerator,
);
export const createOrder = new CreateOrder(unitOfWork);
export const platformSettingsService = new PlatformSettingsService(platformManagement);
export const listActivePlans = new ListActivePlans(platformManagement);
export const listAllPlans = { execute: () => platformManagement.listPlans(false) };
export const managePlan = new ManagePlan(unitOfWork);
export const managePlanOperation = new ManagePlanOperation(unitOfWork);
export const listSubscriptions = new ListSubscriptions(platformManagement);
export const listSubscriptionsWithPlans = { execute: () => platformManagement.listSubscriptionsWithPlans() };
export const manageSubscription = new ManageSubscription(unitOfWork);
export function getManualSubscriptionLifecycleService(){const environment=getEnvironment();return new ManualSubscriptionLifecycleService(subscriptionLifecycleRepository,new ResendEmailProvider(environment.RESEND_API_KEY),logger,{from:environment.RESEND_FROM_EMAIL})}
export const ensureBootstrapAdmin = new EnsureBootstrapAdmin(unitOfWork);
export const adminManageCard = new AdminManageCard(unitOfWork);
export const adminWorkspace = new AdminWorkspace(unitOfWork, cardReads, platformManagement);
export const authorizeAdminAction = new AuthorizeAdminAction(unitOfWork);
export const getOrder = new GetOrder(orderReads);
export const listOrders = new ListOrders(orderReads);
export const registrationReadService = {
  pendingRegistrationByEmail: (email: string) => orderReads.findPendingRegistrationByEmail(email),
};
export const customerSubscriptionReadService = {
  activeForCustomer: (customerId: string) => platformManagement.findActiveSubscriptionByCustomer(customerId),
};
export function getOrderMutationUseCases() {
  const environment = getEnvironment();
  const secret = environment.ACCESS_CODE_HMAC_KEY;
  if (!secret)
    throw new Error(
      "ACCESS_CODE_HMAC_KEY is required to construct order fulfillment use cases",
    );
  const generateInitialAccessCode = new GenerateInitialAccessCode(
    unitOfWork,
    createHmacSecretHasher(secret),
    secureAccessCodeGenerator,
  );
  const approveOrder = new ApproveOrder(
    unitOfWork,
    createCustomer,
    createCard,
    generateInitialAccessCode,
    new CreateOrderSubscription(unitOfWork),
  );
  const notificationService = new NotificationService(
    notificationRepository,
    new ResendEmailProvider(environment.RESEND_API_KEY),
    logger,
    { from: environment.RESEND_FROM_EMAIL },
  );
  return {
    approveOrder: new OrderApprovalNotificationCoordinator(
      approveOrder,
      notificationService,
      logger,
    ),
    cancelOrder: new CancelOrder(unitOfWork),
    completeOrder: new CompleteOrder(unitOfWork),
  };
}

export function getAccessCodeUseCases() {
  const secret = getEnvironment().ACCESS_CODE_HMAC_KEY;
  if (!secret)
    throw new Error(
      "ACCESS_CODE_HMAC_KEY is required to construct access-code use cases",
    );
  const hasher = createHmacSecretHasher(secret);
  const regenerateAccessCode = new RegenerateAccessCode(unitOfWork, hasher, secureAccessCodeGenerator);
  return {
    generateInitialAccessCode: new GenerateInitialAccessCode(
      unitOfWork,
      hasher,
      secureAccessCodeGenerator,
    ),
    verifyAccessCode: new VerifyAccessCode(unitOfWork, hasher),
    createEditorSession: new CreateEditorSession(
      unitOfWork,
      hasher,
      secureSessionTokenGenerator,
    ),
    regenerateAccessCode,
    revokeAccessCode: { execute: (cardId: string) => getAccessCodeService().revoke(cardId) },
  };
}

export const platformOperationsReadService = new PlatformOperationsReadService(adminReads);

const invoiceRepository = new PrismaInvoiceRepository(prisma);
export const invoiceService = new InvoiceService(invoiceRepository);
export const paymentService = new PaymentService(new PrismaPaymentRepository(prisma));
export const billingReadService = new BillingReadService(invoiceRepository, new PrismaPaymentRepository(prisma));
export const dashboardProjectionService = new DashboardProjectionService();

const environment = getEnvironment();
const storageProvider = environment.SUPABASE_URL && environment.SUPABASE_SERVICE_ROLE_KEY && environment.SUPABASE_STORAGE_BUCKET ? new SupabaseStorageProvider(environment) : new LocalStorageProvider();
export const mediaService = new MediaService(new PrismaMediaRepository(prisma), storageProvider);

// ── Email Platform ────────────────────────────────────────────
import { createEmailService } from "@/features/email";
export const emailService = createEmailService({
  apiKey: environment.RESEND_API_KEY,
  from: environment.RESEND_FROM_EMAIL,
  logger,
});
