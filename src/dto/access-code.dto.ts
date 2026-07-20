import type { AccessCodeStatus } from "@/types";

export interface AccessCodeDTO {
  id: string;
  cardId: string;
  version: number;
  status: AccessCodeStatus;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  useCount: number;
  createdAt: Date;
  revokedAt: Date | null;
}
export interface IssuedAccessCodeDTO {
  accessCode: AccessCodeDTO;
  code: string;
}
