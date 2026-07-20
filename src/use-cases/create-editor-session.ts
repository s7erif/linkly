import type { IssuedEditorSessionDTO } from "@/dto";
import { InvalidAccessCodeError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { SecretHasher, SessionTokenGenerator } from "@/services/credential-security.service";
import { createEditorSessionSchema, type CreateEditorSessionInput } from "@/validation";
import type { Clock } from "./shared";
import { parseUseCaseInput, systemClock } from "./shared";

export class CreateEditorSession {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessCodeHasher: SecretHasher,
    private readonly sessionTokens: SessionTokenGenerator,
    private readonly clock: Clock = systemClock,
  ) {}
  async execute(input: CreateEditorSessionInput): Promise<IssuedEditorSessionDTO> {
    const data = parseUseCaseInput(createEditorSessionSchema, input);
    const codeHash = await this.accessCodeHasher.hash(data.code);
    const token = this.sessionTokens.generate();
    const tokenHash = await this.sessionTokens.hash(token);
    const session = await this.unitOfWork.execute(async ({ accessCodes, editorSessions }) => {
      const occurredAt = data.occurredAt ?? this.clock.now();
      const accessCode = await accessCodes.findByHash(codeHash);
      if (!accessCode) throw new InvalidAccessCodeError();
      const failureReason = accessCode.status !== "ACTIVE" ? accessCode.status : accessCode.expiresAt && accessCode.expiresAt <= occurredAt ? "EXPIRED" : null;
      if (failureReason) {
        await accessCodes.recordEvent({ accessCodeId: accessCode.id, occurredAt, success: false, failureReason, ipHash: data.ipHash, userAgentHash: data.userAgentHash });
        return null;
      }
      const expiresAt = new Date(occurredAt.getTime() + data.lifetimeSeconds * 1000);
      const created = await editorSessions.create({ cardId: accessCode.cardId, accessCodeId: accessCode.id, tokenHash, expiresAt });
      await accessCodes.markUsed(accessCode.id, occurredAt);
      await accessCodes.recordEvent({ accessCodeId: accessCode.id, occurredAt, success: true, ipHash: data.ipHash, userAgentHash: data.userAgentHash });
      return created;
    });
    if (!session) throw new InvalidAccessCodeError();
    return { session, token };
  }
}
