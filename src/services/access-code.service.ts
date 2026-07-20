import type { AccessCodeDTO, IssuedAccessCodeDTO } from "@/dto";
import { ConfigurationError, NotFoundError } from "@/lib/errors";
import type { AccessCodeReadRepository, UnitOfWork } from "@/repositories";
import { accessCodeSchema, issueAccessCodeSchema, type IssueAccessCodeInput } from "@/validation";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function generateCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(26)), (byte) => ALPHABET[byte & 31]).join("");
}
function displayCode(code: string): string { return `OI-${code.slice(0, 5)}-${code.slice(5, 10)}-${code.slice(10, 15)}-${code.slice(15, 20)}-${code.slice(20)}`; }
export interface AccessCodeHasher { hash(code: string): Promise<Uint8Array<ArrayBuffer>>; }
export function createAccessCodeHasher(secret: string): AccessCodeHasher {
  if (new TextEncoder().encode(secret).byteLength < 32) throw new ConfigurationError("Access-code HMAC key must contain at least 32 bytes");
  return { async hash(code) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(code)));
  } };
}
export interface AccessCodeServiceDependencies { accessCodes: AccessCodeReadRepository; unitOfWork: UnitOfWork; }
export class AccessCodeService {
  constructor(private readonly dependencies: AccessCodeServiceDependencies, private readonly hasher: AccessCodeHasher) {}
  async verify(input: string): Promise<AccessCodeDTO | null> {
    const hash = await this.hasher.hash(accessCodeSchema.parse(input));
    return this.dependencies.accessCodes.findByHash({ hash, statuses: ["ACTIVE"], validAt: new Date() });
  }
  async issue(input: IssueAccessCodeInput): Promise<IssuedAccessCodeDTO> {
    const command = issueAccessCodeSchema.parse(input);
    const code = generateCode();
    const codeHash = await this.hasher.hash(code);
    return this.dependencies.unitOfWork.execute(async ({ accessCodes, cards }) => {
      if (!await cards.findById(command.cardId, null)) throw new NotFoundError("Card", command.cardId);
      const now = new Date();
      const previous = await accessCodes.findLatestByCard(command.cardId, ["ACTIVE"]);
      await accessCodes.updateMany({ cardId: command.cardId, fromStatuses: ["ACTIVE"], status: "ROTATED", revokedAt: now });
      const maximumVersion = await accessCodes.findMaximumVersion(command.cardId);
      const accessCode = await accessCodes.create({ cardId: command.cardId, codeHash, version: (maximumVersion ?? 0) + 1, expiresAt: command.expiresAt, rotatedFromId: previous?.id });
      await cards.incrementAccessVersion(command.cardId);
      return { accessCode, code: displayCode(code) };
    });
  }
  async revoke(cardId: string): Promise<void> {
    await this.dependencies.unitOfWork.execute(async ({ accessCodes, cards, editorSessions }) => {
      const now = new Date();
      await accessCodes.updateMany({ cardId, fromStatuses: ["ACTIVE"], status: "REVOKED", revokedAt: now });
      await editorSessions.revokeByCard(cardId, "ACTIVE", now);
      await cards.incrementAccessVersion(cardId);
    });
  }
}
