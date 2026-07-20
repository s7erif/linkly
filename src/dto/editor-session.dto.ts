export interface EditorSessionDTO {
  id: string;
  cardId: string;
  accessCodeId: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  expiresAt: Date;
  lastSeenAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}
export interface IssuedEditorSessionDTO {
  session: EditorSessionDTO;
  token: string;
}
