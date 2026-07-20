import type { VerifiedAccessCodeDTO } from "@/dto";
import { InvalidAccessCodeError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { SecretHasher } from "@/services/credential-security.service";
import { verifyAccessCodeSchema, type VerifyAccessCodeInput } from "@/validation";
import type { Clock } from "./shared";
import { parseUseCaseInput, systemClock } from "./shared";

export class VerifyAccessCode {
  constructor(private readonly unitOfWork: UnitOfWork, private readonly hasher: SecretHasher, private readonly clock: Clock = systemClock) {}
  async execute(input: VerifyAccessCodeInput): Promise<VerifiedAccessCodeDTO> {
    const data = parseUseCaseInput(verifyAccessCodeSchema, input);
    const hash = await this.hasher.hash(data.code);
    const result = await this.unitOfWork.execute(async ({ accessCodes }) => {
      const occurredAt = data.occurredAt ?? this.clock.now();
      const accessCode = await accessCodes.findByHash(hash);
      if (!accessCode) throw new InvalidAccessCodeError();
      const failureReason = accessCode.status !== "ACTIVE" ? accessCode.status : accessCode.expiresAt && accessCode.expiresAt <= occurredAt ? "EXPIRED" : null;
      if (failureReason) {
        await accessCodes.recordEvent({ accessCodeId: accessCode.id, occurredAt, success: false, failureReason, ipHash: data.ipHash, userAgentHash: data.userAgentHash });
        return null;
      }
      await accessCodes.markUsed(accessCode.id, occurredAt);
      await accessCodes.recordEvent({ accessCodeId: accessCode.id, occurredAt, success: true, ipHash: data.ipHash, userAgentHash: data.userAgentHash });
      return { accessCodeId: accessCode.id, cardId: accessCode.cardId, verifiedAt: occurredAt, expiresAt: accessCode.expiresAt };
    });
    if (!result) throw new InvalidAccessCodeError();
    return result;
  }
}
