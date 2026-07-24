export type CardBlockKind =
  | "HERO"
  | "ABOUT"
  | "CONTACT"
  | "SOCIAL_LINKS"
  | "CTA_BUTTONS"
  | "GALLERY"
  | "VIDEO"
  | "FAQ"
  | "LOCATION_MAP"
  | "DIVIDER"
  | "RICH_TEXT";
export type CardBlockConfig = {
  title?: string | null;
  subtitle?: string | null;
  showAvatar?: boolean;
  mediaId?: string | null;
  heading?: string | null;
  body?: string | null;
  mediaIds?: readonly string[];
  columns?: 2 | 3;
  url?: string | null;
  caption?: string | null;
  items?: ReadonlyArray<{ id: string; question: string; answer: string }>;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number;
  style?: "SOLID" | "DASHED" | "DOTTED";
  content?: string;
};
export interface CardBlockDTO {
  id: string;
  kind: CardBlockKind;
  position: number;
  isEnabled: boolean;
  config: CardBlockConfig;
  mediaIds: readonly string[];
}
export interface EditorCardBlockDTO {
  id: string;
  kind: string;
  position: number;
  isEnabled: boolean;
  config: unknown;
  mediaIds: readonly string[];
}
