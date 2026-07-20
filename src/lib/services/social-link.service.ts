import type { LegacySocialLinkDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { LegacyReadRepository, UnitOfWork } from "@/repositories";
import type { SocialLinkInput } from "@/lib/validation/social-link";

export class LegacySocialLinkService {
  constructor(private readonly reads: LegacyReadRepository, private readonly unitOfWork: UnitOfWork) {}
  async list(cardId: string, userId: string): Promise<LegacySocialLinkDTO[]> {
    if (!await this.reads.findCardByIdAndUser(cardId, userId)) throw new NotFoundError("Card not found");
    return this.reads.listLinks(cardId);
  }
  replace(cardId: string, links: SocialLinkInput[], userId: string): Promise<LegacySocialLinkDTO[]> {
    return this.unitOfWork.execute(async ({ legacy }) => {
      if (!await legacy.findCardByIdAndUser(cardId, userId)) throw new NotFoundError("Card not found");
      return legacy.replaceLinks(cardId, links.map((link, index) => ({ platform: link.platform, url: link.url, order: link.order ?? index })));
    });
  }
  async delete(cardId: string, userId: string): Promise<void> {
    await this.unitOfWork.execute(async ({ legacy }) => {
      if (!await legacy.findCardByIdAndUser(cardId, userId)) throw new NotFoundError("Card not found");
      await legacy.deleteLinks(cardId);
    });
  }
}
