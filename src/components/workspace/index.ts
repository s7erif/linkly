export {
  WorkspaceSidebar,
  WorkspaceToolbar,
  WorkspaceInspector,
  WorkspaceCanvas,
  WorkspaceLayout,
  WorkspaceProvider,
  useWorkspace,
} from "./shell";

export type {
  WorkspaceSidebarProps,
  WorkspaceToolbarProps,
  WorkspaceInspectorProps,
  WorkspaceCanvasProps,
  WorkspaceLayoutProps,
  WorkspaceProviderProps,
  WorkspaceStore,
} from "./shell";

export { InspectorCard } from "./shared";
export type { InspectorCardProps } from "./shared";

export { WorkspaceShell, type WorkspaceShellProps } from "./workspace-shell";
export { CardEditorProvider, type CardEditorProviderProps } from "./card-editor-provider";
export { WorkspacePageContent, type WorkspacePageContentProps } from "./workspace-page-content";
export { WorkspaceCardSelector } from "./workspace-card-selector";
export { EmptyWorkspace } from "./empty-workspace";
export { IdentityEditorSection } from "./inspector/identity-editor";
export { DesignStudioSection } from "./inspector/design-studio";
export { CardSelector } from "./inspector/card-selector";
export { useWorkspaceKeyboard } from "./use-workspace-keyboard";
export { SaveAnnouncer } from "./save-announcer";

// ── Card Editor Store (re-export for inspector / preview consumers) ──────
export { useCardEditorStore } from "@/store/use-card-editor-store";
export type { CardEditorState, CardEditorActions, CardEditorStore, EditorButton, EditorSocialLink } from "@/store/use-card-editor-store";

// ── Preview Rendering Engine ────────────────────────────────────────────
export {
  ThemeContext,
  ThemeProvider,
  useTheme,
  resolveTokens,
  DEFAULT_THEME_TOKENS,
  PreviewRenderer,
  PreviewSync,
  EmptyPreview,
  LoadingPreview,
  ThemeLoadingSkeleton,
  ImagePlaceholder,
  ProfileAvatar,
  ProfileHeader,
  ProfileBio,
  SocialIcons,
  FooterActions,
  ProfileCard,
} from "./preview";

export type {
  ThemeProviderProps,
  ThemeTokens,
  PreviewZoom,
  PreviewData,
  PreviewButton,
  PreviewSocialLink,
  PreviewLayoutOptions,
  PreviewRendererProps,
  PreviewSyncProps,
  ImagePlaceholderProps,
  ProfileAvatarProps,
  ProfileHeaderProps,
  ProfileBioProps,
  SocialIconsProps,
  SocialLink,
  FooterActionsProps,
  ProfileCardProps,
} from "./preview";
