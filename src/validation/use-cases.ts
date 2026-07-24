import { z } from "zod";
import { accessCodeSchema } from "./access-code";
import { createCardSchema } from "./card";
import { createCustomerSchema } from "./customer";
import { slugSchema, uuidSchema } from "./common";
import { appearanceSettingsSchema } from "./appearance";

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
  profile: z
    .object({
      fullName: z.string().trim().min(1).max(120),
      headline: z.string().trim().max(160).nullable(),
      company: z.string().trim().max(160).nullable(),
      bio: z.string().trim().max(2000).nullable(),
      email: z.string().email().nullable(),
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ()\-.]{7,40}$/, "Enter a valid phone number")
        .nullable(),
      website: z.string().url().nullable(),
      address: z.string().trim().max(300).nullable(),
      countryCode: z.string().length(2).nullable(),
    })
    .strict(),
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
