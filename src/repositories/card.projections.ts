import type { Prisma } from "@/generated/prisma/client";

export const cardProfileSelect = {
  fullName: true,
  headline: true,
  company: true,
  bio: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  countryCode: true,
} satisfies Prisma.CardProfileSelect;

export const cardBaseSelect = {
  id: true,
  customerId: true,
  slug: true,
  name: true,
  status: true,
  visibility: true,
  publishedAt: true,
  accessVersion: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
  profile: { select: cardProfileSelect },
} satisfies Prisma.CardSelect;

const sectionsSelect = {
  where: { deletedAt: null },
  orderBy: { position: "asc" as const },
  select: {
    id: true,
    kind: true,
    title: true,
    position: true,
    isVisible: true,
  },
} satisfies Prisma.Card$sectionsArgs;

const blocksSelect = {
  where: { deletedAt: null },
  orderBy: { position: "asc" as const },
  select: {
    id: true,
    kind: true,
    position: true,
    isEnabled: true,
    config: true,
    media: {
      orderBy: { position: "asc" as const },
      select: { mediaAssetId: true },
    },
  },
} satisfies Prisma.Card$blocksArgs;

const editorButtonsSelect = {
  where: { deletedAt: null },
  orderBy: { position: "asc" as const },
  select: {
    id: true,
    label: true,
    url: true,
    position: true,
    isVisible: true,
    type: true,
    displayMode: true,
    color: true,
    openInNewTab: true,
    analyticsEnabled: true,
  },
} satisfies Prisma.Card$buttonsArgs;

const editorSocialLinksSelect = {
  where: { deletedAt: null },
  orderBy: { position: "asc" as const },
  select: {
    id: true,
    platform: true,
    label: true,
    url: true,
    position: true,
    isVisible: true,
  },
} satisfies Prisma.Card$socialLinksArgs;

const avatarSelect = {
  where: { role: "AVATAR" },
  orderBy: { createdAt: "desc" as const },
  take: 1,
  select: {
    mediaAsset: { select: { publicUrl: true } },
  },
} satisfies Prisma.Card$mediaArgs;

/** Full state required to hydrate the workspace and preview contracts. */
export const workspaceCardSelect = {
  ...cardBaseSelect,
  themeConfig: true,
  sections: sectionsSelect,
  blocks: blocksSelect,
  buttons: editorButtonsSelect,
  socialLinks: editorSocialLinksSelect,
  media: avatarSelect,
} satisfies Prisma.CardSelect;

/** Copy source: all editable state, but no avatar payload because duplication does not copy it. */
export const duplicateCardSelect = {
  ...cardBaseSelect,
  themeConfig: true,
  sections: sectionsSelect,
  blocks: blocksSelect,
  buttons: editorButtonsSelect,
  socialLinks: editorSocialLinksSelect,
} satisfies Prisma.CardSelect;

/** Identity/state needed by autosave authorization and scalar mutations. */
export const autosaveCardSelect = {
  id: true,
  slug: true,
  status: true,
} satisfies Prisma.CardSelect;

/** Publication transition validation requires only the current lifecycle state. */
export const publishCardSelect = {
  status: true,
} satisfies Prisma.CardSelect;

/** Mutation validation state; excludes profile, theme, avatar and unrelated card scalars. */
export const builderCardSelect = {
  ...autosaveCardSelect,
  sections: sectionsSelect,
  blocks: blocksSelect,
  buttons: {
    where: { deletedAt: null },
    orderBy: { position: "asc" as const },
    select: { id: true },
  },
  socialLinks: {
    where: { deletedAt: null },
    orderBy: { position: "asc" as const },
    select: { id: true },
  },
} satisfies Prisma.CardSelect;

/** Public render state: no ownership/access fields and no hidden action rows. */
export const publicCardSelect = {
  id: true,
  slug: true,
  name: true,
  status: true,
  visibility: true,
  publishedAt: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
  profile: { select: cardProfileSelect },
  themeConfig: true,
  sections: sectionsSelect,
  blocks: blocksSelect,
  buttons: {
    ...editorButtonsSelect,
    where: { deletedAt: null, isVisible: true },
  },
  socialLinks: {
    ...editorSocialLinksSelect,
    where: { deletedAt: null, isVisible: true },
  },
  media: avatarSelect,
} satisfies Prisma.CardSelect;

export type CardRow = Prisma.CardGetPayload<{ select: typeof cardBaseSelect }>;
export type WorkspaceCardRow = Prisma.CardGetPayload<{
  select: typeof workspaceCardSelect;
}>;
export type DuplicateCardRow = Prisma.CardGetPayload<{
  select: typeof duplicateCardSelect;
}>;
export type AutosaveCardRow = Prisma.CardGetPayload<{
  select: typeof autosaveCardSelect;
}>;
export type PublishCardRow = Prisma.CardGetPayload<{
  select: typeof publishCardSelect;
}>;
export type BuilderCardRow = Prisma.CardGetPayload<{
  select: typeof builderCardSelect;
}>;
export type PublicCardRow = Prisma.CardGetPayload<{
  select: typeof publicCardSelect;
}>;
