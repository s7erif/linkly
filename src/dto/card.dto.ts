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
  themeId: string | null;
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
  appearance: AppearanceSettings;
  buttons: ReadonlyArray<{
    id: string;
    label: string;
    url: string;
    position: number;
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
}
export interface WorkspaceCardDTO extends PublicCardDTO {
  plan?: import("./subscription.dto").CustomerPlanSummaryDTO;
  editorButtons?: EditorCardDTO["buttons"];
  editorSocialLinks?: EditorCardDTO["socialLinks"];
  editorBlocks?: readonly CardBlockDTO[];
}
