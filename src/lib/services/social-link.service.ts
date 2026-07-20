import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../prisma";
import { SocialLinkInput } from "../validation/social-link";
import { getCardById } from "./business-card.service";

/**
 * Gets all social links for a specific business card after verifying ownership.
 */
export async function getSocialLinks(cardId: string, userId: string) {
  // Verify card existence and ownership first
  await getCardById(cardId, userId);

  return prisma.socialLink.findMany({
    where: { businessCardId: cardId },
    orderBy: { order: "asc" }
  });
}

/**
 * Replaces all social links for a card in a Prisma transaction, verifying ownership first.
 * Returns the newly created SocialLink[] rows.
 */
export async function replaceSocialLinks(cardId: string, links: SocialLinkInput[], userId: string) {
  // Verify card existence and ownership first
  await getCardById(cardId, userId);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Delete existing social links
    await tx.legacySocialLink.deleteMany({
      where: { businessCardId: cardId }
    });

    // Create new ones using createMany
    const data = links.map((link, index) => ({
      businessCardId: cardId,
      platform: link.platform,
      url: link.url,
      order: link.order !== undefined ? link.order : index
    }));

    if (data.length > 0) {
      await tx.legacySocialLink.createMany({ data });
    }

    // Query and return the newly created records
    return tx.legacySocialLink.findMany({
      where: { businessCardId: cardId },
      orderBy: { order: "asc" }
    });
  });
}

/**
 * Deletes all social links for a specific card after verifying ownership.
 */
export async function deleteSocialLinks(cardId: string, userId: string) {
  // Verify card existence and ownership first
  await getCardById(cardId, userId);

  await prisma.socialLink.deleteMany({
    where: { businessCardId: cardId }
  });
}
