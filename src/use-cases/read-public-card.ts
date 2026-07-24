import type { PublicCardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { CardReadRepository } from "@/repositories";
import { readPublicCardSchema, type ReadPublicCardInput } from "@/validation";
import { toRenderableCardDTO } from "./card-mappers";
import { parseUseCaseInput } from "./shared";

export class ReadPublicCard {
  constructor(private readonly cards: CardReadRepository) {}
  async execute(input: ReadPublicCardInput): Promise<PublicCardDTO> {
    const { slug } = parseUseCaseInput(readPublicCardSchema, input);
    const source = await this.cards.findRenderSourceBySlug({ slug, statuses: ["PUBLISHED"], visibilities: ["PUBLIC"], deletedAt: null });
    if (!source) throw new NotFoundError("Card", slug);
    return toRenderableCardDTO(source);
  }
}
