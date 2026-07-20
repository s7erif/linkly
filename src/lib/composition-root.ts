import "server-only";
import { prisma } from "@/lib/database/prisma";
import { PrismaAccessCodeReadRepository } from "@/repositories/access-code.repository";
import { PrismaCardReadRepository } from "@/repositories/card.repository";
import { PrismaCustomerReadRepository } from "@/repositories/customer.repository";
import { PrismaLegacyReadRepository } from "@/repositories/legacy.repository";
import { PrismaUnitOfWork } from "@/repositories/prisma-unit-of-work";
import { AccessCodeService, createAccessCodeHasher } from "@/services/access-code.service";
import { CardService } from "@/services/card.service";
import { CustomerService } from "@/services/customer.service";
import { LegacyAdminUserService, LegacyCardService } from "@/lib/services/business-card.service";
import { LegacySocialLinkService } from "@/lib/services/social-link.service";
import { getEnvironment } from "@/lib/env";

const unitOfWork = new PrismaUnitOfWork(prisma);
const customerReads = new PrismaCustomerReadRepository(prisma);
const cardReads = new PrismaCardReadRepository(prisma);
const accessCodeReads = new PrismaAccessCodeReadRepository(prisma);
const legacyReads = new PrismaLegacyReadRepository(prisma);

export const customerService = new CustomerService({ customers: customerReads, unitOfWork });
export const cardService = new CardService({ cards: cardReads, unitOfWork });
export const legacyCardService = new LegacyCardService(legacyReads, unitOfWork);
export const legacySocialLinkService = new LegacySocialLinkService(legacyReads, unitOfWork);
export const legacyAdminUserService = new LegacyAdminUserService(legacyReads, unitOfWork);
export function getAccessCodeService(): AccessCodeService {
  const secret = getEnvironment().ACCESS_CODE_HMAC_KEY;
  if (!secret) throw new Error("ACCESS_CODE_HMAC_KEY is required to construct AccessCodeService");
  return new AccessCodeService({ accessCodes: accessCodeReads, unitOfWork }, createAccessCodeHasher(secret));
}

import { CreateCard, CreateCustomer, CreateEditorSession, GenerateInitialAccessCode, ReadPublicCard, VerifyAccessCode } from "@/use-cases";
import { createHmacSecretHasher, secureAccessCodeGenerator, secureSessionTokenGenerator } from "@/services/credential-security.service";

export const createCustomer = new CreateCustomer(unitOfWork);
export const createCard = new CreateCard(unitOfWork);
export const readPublicCard = new ReadPublicCard(cardReads);
export function getAccessCodeUseCases() {
  const secret = getEnvironment().ACCESS_CODE_HMAC_KEY;
  if (!secret) throw new Error("ACCESS_CODE_HMAC_KEY is required to construct access-code use cases");
  const hasher = createHmacSecretHasher(secret);
  return {
    generateInitialAccessCode: new GenerateInitialAccessCode(unitOfWork, hasher, secureAccessCodeGenerator),
    verifyAccessCode: new VerifyAccessCode(unitOfWork, hasher),
    createEditorSession: new CreateEditorSession(unitOfWork, hasher, secureSessionTokenGenerator),
  };
}
