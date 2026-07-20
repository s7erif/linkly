import type { CardStatus, CardVisibility } from "@/types";
import type { AppearanceSettings } from "@/types/appearance";

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
  profile: CardProfileDTO | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface PublicCardDTO extends Omit<CardDTO, "customerId" | "accessVersion"> {
  appearance: AppearanceSettings;
  buttons: ReadonlyArray<{ id: string; label: string; url: string; position: number }>;
  socialLinks: ReadonlyArray<{ id: string; platform: string; label: string | null; url: string; position: number }>;
}
export interface EditorCardDTO extends CardDTO {
  themeConfig: unknown;
  buttons: ReadonlyArray<{ id: string; label: string; url: string; position: number; isVisible: boolean }>;
  socialLinks: ReadonlyArray<{ id: string; platform: string; label: string | null; url: string; position: number; isVisible: boolean }>;
}
