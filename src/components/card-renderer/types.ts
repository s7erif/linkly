import type { AppearanceSettings } from "@/types/appearance";
import type { CardProfileDTO, CardBlockDTO } from "@/dto";

/** Preview zoom level */
export type PreviewZoom = 1 | 0.9 | 0.75 | 0.5 | "fit";

/** Data passed into the PreviewRenderer — pure data, no business logic. */
export interface PreviewData {
  profile: CardProfileDTO | null;
  buttons: ReadonlyArray<PreviewButton>;
  socialLinks: ReadonlyArray<PreviewSocialLink>;
  blocks?: readonly CardBlockDTO[];
}

export interface PreviewButton {
  id: string;
  label: string;
  url: string;
  type?: string;
  displayMode?: string;
  color?: string | null;
}

export interface PreviewSocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
}

/** Layout options for the renderer. */
export interface PreviewLayoutOptions {
  showHeader: boolean;
  showBio: boolean;
  showButtons: boolean;
  showSocialLinks: boolean;
  showFooter: boolean;
  /** Section render order — defaults to ["header","bio","buttons","socialLinks","footer"]. */
  sectionOrder?: readonly string[];
  alignment?: AppearanceSettings["layout"]["alignment"];
  width?: AppearanceSettings["layout"]["width"];
  spacing?: AppearanceSettings["layout"]["spacing"];
  position?: AppearanceSettings["layout"]["position"];
  container?: AppearanceSettings["layout"]["container"];
}

export const DEFAULT_LAYOUT: PreviewLayoutOptions = {
  showHeader: true,
  showBio: true,
  showButtons: true,
  showSocialLinks: true,
  showFooter: true,
};

/** Props for the preview renderer itself. */
export interface PreviewRendererProps {
  data: PreviewData;
  appearance?: AppearanceSettings | null;
  layout?: Partial<PreviewLayoutOptions>;
  avatarUrl?: string | null;
  className?: string;
}

export type CardRendererData = PreviewData;
export type CardRendererButton = PreviewButton;
export type CardRendererSocialLink = PreviewSocialLink;
export type CardRendererLayoutOptions = PreviewLayoutOptions;
export type CardRendererProps = PreviewRendererProps;
