import type { AccessCodeDTO, IssuedAccessCodeDTO } from "@/dto";
import { ConfigurationError, NotFoundError } from "@/lib/errors";
import { withTransaction } from "@/lib/database";
import { PrismaAccessCodeRepository, PrismaCardRepository } from "@/repositories";
import { accessCodeSchema, issueAccessCodeSchema, type IssueAccessCodeInput } from "@/validation";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(26));
  return Array.from(bytes, (byte) => ALPHABET[byte & 31]).join("");
}
function displayCode(code: string): string { return `OI-${code.slice(0, 5)}-${code.slice(5, 10)}-${code.slice(10, 15)}-${code.slice(15, 20)}-${code.slice(20)}`; }

export interface AccessCodeHasher { hash(code: string): Promise<Uint8Array<ArrayBuffer>>; }
export function createAccessCodeHasher(secret: string): AccessCodeHasher {
  if (new TextEncoder().encode(secret).byteLength < 32) throw new ConfigurationError("Access-code HMAC key must contain at least 32 bytes");
  return {
    async hash(code) {
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(code)));
    },
  };
}
export class AccessCodeService {
  constructor(private readonly hasher: AccessCodeHasher) {}
  async verify(input: string): Promise<AccessCodeDTO | null> {
    const code = accessCodeSchema.parse(input);
    const hash = await this.hasher.hash(code);
    return withTransaction((tx) => new PrismaAccessCodeRepository(tx).findActiveByHash(hash));
  }
  async issue(input: IssueAccessCodeInput): Promise<IssuedAccessCodeDTO> {
    const data = issueAccessCodeSchema.parse(input);
    const code = generateCode();
    const codeHash = await this.hasher.hash(code);
    return withTransaction(async (tx) => {
      const cards = new PrismaCardRepository(tx);
      if (!await cards.findById(data.cardId)) throw new NotFoundError("Card", data.cardId);
      const codes = new PrismaAccessCodeRepository(tx);
      const previous = await codes.findActiveByCard(data.cardId);
      await codes.revokeActive(data.cardId, new Date(), "ROTATED");
      const accessCode = await codes.create({
        card: { connect: { id: data.cardId } },
        codeHash,
        version: await codes.nextVersion(data.cardId),
        expiresAt: data.expiresAt,
        ...(previous ? { rotatedFrom: { connect: { id: previous.id } } } : {}),
      });
      await tx.card.update({ where: { id: data.cardId }, data: { accessVersion: { increment: 1 } }, select: { id: true } });
      return { accessCode, code: displayCode(code) };
    });
  }
  async revoke(cardId: string): Promise<void> {
    await withTransaction(async (tx) => {
      const codes = new PrismaAccessCodeRepository(tx);
      await codes.revokeActive(cardId, new Date());
      await tx.editorSession.updateMany({ where: { cardId, status: "ACTIVE" }, data: { status: "REVOKED", revokedAt: new Date() } });
      await tx.card.update({ where: { id: cardId }, data: { accessVersion: { increment: 1 } }, select: { id: true } });
    });
  }
}
