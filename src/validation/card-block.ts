import { z } from "zod";
const heading = z.string().trim().max(120).nullable().optional(),
  mediaId = z.string().uuid().nullable().optional();
const schemas = {
  HERO: z
    .object({
      title: z.string().trim().max(120).nullable().optional(),
      subtitle: z.string().trim().max(200).nullable().optional(),
      showAvatar: z.boolean().optional(),
      mediaId,
    })
    .strict(),
  ABOUT: z
    .object({
      heading,
      body: z.string().trim().max(4000).nullable().optional(),
    })
    .strict(),
  CONTACT: z.object({ heading }).strict(),
  SOCIAL_LINKS: z.object({ heading }).strict(),
  CTA_BUTTONS: z.object({ heading }).strict(),
  GALLERY: z
    .object({
      heading,
      mediaIds: z.array(z.string().uuid()).max(24).default([]),
      columns: z.union([z.literal(2), z.literal(3)]).default(3),
    })
    .strict(),
  VIDEO: z
    .object({
      heading,
      url: z.string().url().max(2048).nullable().optional(),
      mediaId,
      caption: z.string().trim().max(300).nullable().optional(),
    })
    .strict(),
  FAQ: z
    .object({
      heading,
      items: z
        .array(
          z
            .object({
              id: z.string().uuid(),
              question: z.string().trim().min(1).max(300),
              answer: z.string().trim().min(1).max(2000),
            })
            .strict(),
        )
        .max(30)
        .default([]),
    })
    .strict(),
  LOCATION_MAP: z
    .object({
      heading,
      address: z.string().trim().min(1).max(500),
      latitude: z.number().min(-90).max(90).nullable().optional(),
      longitude: z.number().min(-180).max(180).nullable().optional(),
      zoom: z.number().int().min(1).max(20).default(14),
    })
    .strict(),
  DIVIDER: z
    .object({ style: z.enum(["SOLID", "DASHED", "DOTTED"]).default("SOLID") })
    .strict(),
  RICH_TEXT: z
    .object({ heading, content: z.string().trim().max(10000).default("") })
    .strict(),
} as const;
export const cardBlockKindSchema = z.enum([
  "HERO",
  "ABOUT",
  "CONTACT",
  "SOCIAL_LINKS",
  "CTA_BUTTONS",
  "GALLERY",
  "VIDEO",
  "FAQ",
  "LOCATION_MAP",
  "DIVIDER",
  "RICH_TEXT",
]);
export function parseCardBlockConfig(
  kind: z.infer<typeof cardBlockKindSchema>,
  value: unknown,
) {
  return schemas[kind].parse(value);
}
export function safeCardBlockConfig(kind: string, value: unknown) {
  const parsedKind = cardBlockKindSchema.safeParse(kind);
  if (!parsedKind.success) return null;
  const result = schemas[parsedKind.data].safeParse(value);
  return result.success ? { kind: parsedKind.data, config: result.data } : null;
}
const sessionToken = z.string().regex(/^[0-9a-f]{64}$/);
const cardIdentity = z.object({ cardId: z.string().uuid() });
export const blockSessionBodySchema = z.object({ sessionToken }).strict();
export const createCardBlockBodySchema = blockSessionBodySchema
  .extend({
    kind: cardBlockKindSchema,
    config: z.unknown(),
    isEnabled: z.boolean().default(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (!schemas[value.kind].safeParse(value.config).success)
      context.addIssue({
        code: "custom",
        path: ["config"],
        message: "Invalid block configuration",
      });
  });
export const updateCardBlockBodySchema = blockSessionBodySchema
  .extend({
    config: z.unknown().optional(),
    isEnabled: z.boolean().optional(),
  })
  .strict();
export const reorderCardBlocksBodySchema = blockSessionBodySchema
  .extend({
    blockIds: z
      .array(z.string().uuid())
      .max(60)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Block IDs must be unique",
      ),
  })
  .strict();
export const createCardBlockSchema = cardIdentity
  .extend(createCardBlockBodySchema.shape)
  .strict()
  .superRefine((value, context) => {
    if (!schemas[value.kind].safeParse(value.config).success)
      context.addIssue({ code: "custom", path: ["config"], message: "Invalid block configuration" });
  });
export const updateCardBlockSchema = cardIdentity
  .extend({ blockId: z.string().uuid(), ...updateCardBlockBodySchema.shape })
  .strict();
export const deleteCardBlockSchema = cardIdentity
  .extend({ blockId: z.string().uuid(), ...blockSessionBodySchema.shape })
  .strict();
export const duplicateCardBlockSchema = deleteCardBlockSchema;
export const reorderCardBlocksSchema = cardIdentity
  .extend(reorderCardBlocksBodySchema.shape)
  .strict();
