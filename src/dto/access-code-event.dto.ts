export interface AccessCodeEventDTO {
  id: string;
  accessCodeId: string;
  occurredAt: Date;
  success: boolean;
  failureReason: string | null;
}
export interface VerifiedAccessCodeDTO {
  accessCodeId: string;
  cardId: string;
  verifiedAt: Date;
  expiresAt: Date | null;
}
