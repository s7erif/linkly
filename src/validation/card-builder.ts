import { z } from "zod";
import { slugSchema, uuidSchema } from "./common";

const sessionToken = z.string().regex(/^[0-9a-f]{64}$/);
const authorized = z.object({ cardId: uuidSchema, sessionToken });
const destination = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:", "mailto:", "tel:", "sms:"].includes(
        url.protocol,
      );
    } catch {
      return false;
    }
  }, "Enter a valid web, email, telephone, or SMS URL");
const uniqueIds = (value: readonly string[]) =>
  new Set(value).size === value.length;
export const cardSectionKindSchema = z.enum([
  "PROFILE",
  "ABOUT",
  "CONTACT",
  "BUTTONS",
  "SOCIAL_LINKS",
]);
export const updateCardSectionsSchema = authorized
  .extend({
    sections: z
      .array(
        z
          .object({
            kind: cardSectionKindSchema,
            isVisible: z.boolean(),
            title: z.string().trim().max(80).nullable().optional(),
          })
          .strict(),
      )
      .length(5)
      .refine(
        (items) => new Set(items.map((item) => item.kind)).size === 5,
        "Each card section must appear exactly once",
      ),
  })
  .strict();
export const createCardButtonSchema = authorized
  .extend({
    id: uuidSchema,
    label: z.string().trim().min(1).max(80),
    url: destination,
    type: z.string().trim().max(40).default("CUSTOM"),
    displayMode: z.enum(["BUTTON", "ICON"]).default("BUTTON"),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().default(null),
    isVisible: z.boolean().default(true),
    openInNewTab: z.boolean().default(false),
    analyticsEnabled: z.boolean().default(false),
  })
  .strict();
export const updateCardButtonSchema = authorized
  .extend({
    buttonId: uuidSchema,
    label: z.string().trim().min(1).max(80).optional(),
    url: destination.optional(),
    type: z.string().trim().max(40).optional(),
    displayMode: z.enum(["BUTTON", "ICON"]).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
    isVisible: z.boolean().optional(),
    openInNewTab: z.boolean().optional(),
    analyticsEnabled: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.label !== undefined ||
      value.url !== undefined ||
      value.type !== undefined ||
      value.displayMode !== undefined ||
      value.color !== undefined ||
      value.isVisible !== undefined ||
      value.openInNewTab !== undefined ||
      value.analyticsEnabled !== undefined,
    "Provide a button change",
  );
export const deleteCardButtonSchema = authorized
  .extend({ buttonId: uuidSchema })
  .strict();
export const reorderCardButtonsSchema = authorized
  .extend({
    buttonIds: z
      .array(uuidSchema)
      .max(30)
      .refine(uniqueIds, "Button IDs must be unique"),
  })
  .strict();
export const createSocialLinkSchema = authorized
  .extend({
    id: uuidSchema,
    platform: z.string().trim().min(1).max(40),
    label: z.string().trim().max(80).nullable().optional(),
    url: destination,
    isVisible: z.boolean().default(true),
  })
  .strict();
export const updateSocialLinkSchema = authorized
  .extend({
    socialLinkId: uuidSchema,
    platform: z.string().trim().min(1).max(40).optional(),
    label: z.string().trim().max(80).nullable().optional(),
    url: destination.optional(),
    isVisible: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.platform !== undefined ||
      value.label !== undefined ||
      value.url !== undefined ||
      value.isVisible !== undefined,
    "Provide a social-link change",
  );
export const deleteSocialLinkSchema = authorized
  .extend({ socialLinkId: uuidSchema })
  .strict();
export const reorderSocialLinksSchema = authorized
  .extend({
    socialLinkIds: z
      .array(uuidSchema)
      .max(30)
      .refine(uniqueIds, "Social-link IDs must be unique"),
  })
  .strict();
export const changeCardSlugSchema = authorized
  .extend({ slug: slugSchema })
  .strict();
export const validateCardSlugSchema = z
  .object({ cardId: uuidSchema, sessionToken, slug: slugSchema })
  .strict();
export const updateCardMetadataSchema = authorized
  .extend({
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
    seoTitle: z.string().trim().max(70).nullable(),
    seoDescription: z.string().trim().max(180).nullable(),
  })
  .strict();

export type UpdateCardSectionsInput = z.input<typeof updateCardSectionsSchema>;
export type CreateCardButtonInput = z.input<typeof createCardButtonSchema>;
export type UpdateCardButtonInput = z.input<typeof updateCardButtonSchema>;
export type DeleteCardButtonInput = z.input<typeof deleteCardButtonSchema>;
export type ReorderCardButtonsInput = z.input<typeof reorderCardButtonsSchema>;
export type CreateSocialLinkInput = z.input<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.input<typeof updateSocialLinkSchema>;
export type DeleteSocialLinkInput = z.input<typeof deleteSocialLinkSchema>;
export type ReorderSocialLinksInput = z.input<typeof reorderSocialLinksSchema>;
export type ChangeCardSlugInput = z.input<typeof changeCardSlugSchema>;
export type ValidateCardSlugInput = z.input<typeof validateCardSlugSchema>;
export type UpdateCardMetadataInput = z.input<typeof updateCardMetadataSchema>;
