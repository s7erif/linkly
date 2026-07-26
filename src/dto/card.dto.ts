import type { CardStatus, CardVisibility } from "@/types";
import type { AppearanceSettings } from "@/types/appearance";
import type { CardBlockDTO, EditorCardBlockDTO } from "./card-block.dto";

export interface CardProfileDTO {
  fullName: string;
  headline: string | null;
  company: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  countryCode: string | null;
  avatarUrl?: string | null;
}
export type CardSectionKind =
  "PROFILE" | "ABOUT" | "CONTACT" | "BUTTONS" | "SOCIAL_LINKS";
export interface CardSectionDTO {
  id: string;
  kind: CardSectionKind;
  title: string | null;
  position: number;
  isVisible: boolean;
}
export interface CardDTO {
  id: string;
  customerId: string;
  slug: string;
  name: string;
  status: CardStatus;
  visibility: CardVisibility;
  publishedAt: Date | null;
  accessVersion: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  profile: CardProfileDTO | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface PublicCardDTO extends Omit<
  CardDTO,
  "customerId" | "accessVersion"
> {
  /** Resolved public avatar media URL. */
  avatarUrl?: string | null;
  appearance: AppearanceSettings;
  buttons: ReadonlyArray<{
    id: string;
    label: string;
    url: string;
    position: number;
    type?: string;
    displayMode?: string;
    color?: string | null;
  }>;
  socialLinks: ReadonlyArray<{
    id: string;
    platform: string;
    label: string | null;
    url: string;
    position: number;
  }>;
  sections?: readonly CardSectionDTO[];
  blocks?: readonly CardBlockDTO[];
}
export interface EditorCardDTO extends CardDTO {
  themeConfig: unknown;
  buttons: ReadonlyArray<{
    id: string;
    label: string;
    url: string;
    position: number;
    isVisible: boolean;
    type: string;
    displayMode: string;
    color: string | null;
    openInNewTab: boolean;
    analyticsEnabled: boolean;
  }>;
  socialLinks: ReadonlyArray<{
    id: string;
    platform: string;
    label: string | null;
    url: string;
    position: number;
    isVisible: boolean;
  }>;
  sections?: readonly CardSectionDTO[];
  blocks?: readonly EditorCardBlockDTO[];
  /** Avatar media URL — resolved from CardMedia (role: AVATAR). */
  avatarUrl?: string | null;
}
export interface WorkspaceCardDTO extends PublicCardDTO {
  avatarUrl?: string | null;
  plan?: import("./subscription.dto").CustomerPlanSummaryDTO;
  editorButtons?: EditorCardDTO["buttons"];
  editorSocialLinks?: EditorCardDTO["socialLinks"];
  editorBlocks?: readonly CardBlockDTO[];
}
