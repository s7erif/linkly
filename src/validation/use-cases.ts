import { z } from "zod";
import { accessCodeSchema } from "./access-code";
import { createCardSchema } from "./card";
import { createCustomerSchema } from "./customer";
import { slugSchema, uuidSchema } from "./common";
import { appearanceSettingsSchema } from "./appearance";
import { profileFieldsSchema } from "./fields";

const optionalHash = z.instanceof(Uint8Array).optional();
export const createCustomerUseCaseSchema = createCustomerSchema;
export const createCardUseCaseSchema = createCardSchema;
export const generateInitialAccessCodeSchema = z
  .object({
    cardId: uuidSchema,
    expiresAt: z.date().nullable().optional(),
  })
  .superRefine((input, context) => {
    if (input.expiresAt && input.expiresAt <= new Date())
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiration must be in the future",
      });
  });
export const verifyAccessCodeSchema = z.object({
  code: accessCodeSchema,
  occurredAt: z.date().optional(),
  ipHash: optionalHash,
  userAgentHash: optionalHash,
});
export const createEditorSessionSchema = z.object({
  code: accessCodeSchema,
  lifetimeSeconds: z.number().int().min(300).max(86400).default(3600),
  occurredAt: z.date().optional(),
  ipHash: optionalHash,
  userAgentHash: optionalHash,
});
export const readPublicCardSchema = z.object({ slug: slugSchema });
export const readWorkspaceCardSchema = z.object({
  cardId: uuidSchema,
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
});
export const updateCardProfileSchema = z.object({
  cardId: uuidSchema,
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
  profile: profileFieldsSchema.strict(),
});
export const updateCardAppearanceSchema = z.object({
  cardId: uuidSchema,
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
  appearance: appearanceSettingsSchema,
});
export type CreateCustomerUseCaseInput = z.input<
  typeof createCustomerUseCaseSchema
>;
export type CreateCardUseCaseInput = z.input<typeof createCardUseCaseSchema>;
export type GenerateInitialAccessCodeInput = z.input<
  typeof generateInitialAccessCodeSchema
>;
export type VerifyAccessCodeInput = z.input<typeof verifyAccessCodeSchema>;
export type CreateEditorSessionInput = z.input<
  typeof createEditorSessionSchema
>;
export type ReadPublicCardInput = z.input<typeof readPublicCardSchema>;
export type ReadWorkspaceCardInput = z.input<typeof readWorkspaceCardSchema>;
export type UpdateCardProfileInput = z.input<typeof updateCardProfileSchema>;
export type UpdateCardAppearanceInput = z.input<
  typeof updateCardAppearanceSchema
>;
