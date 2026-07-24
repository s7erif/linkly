import { z } from "zod";

const sessionToken = z.string().regex(/^[0-9a-f]{64}$/);
export const publicationActionSchema = z.enum(["PUBLISH", "UNPUBLISH", "RESTORE"]);
export const cardPublicationBodySchema = z
  .object({ sessionToken, action: publicationActionSchema })
  .strict();
export const cardPublicationSchema = cardPublicationBodySchema
  .extend({ cardId: z.string().uuid() })
  .strict();
export type CardPublicationInput = z.input<typeof cardPublicationSchema>;
