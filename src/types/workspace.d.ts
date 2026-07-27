// Workspace V2 — UI state and navigation types
// No business state lives here; this models the editor shell only.

/** Top-level editor sections (navigation tabs). */
export type WorkspaceSection = "identity" | "design" | "links" | "content" | "publish";

/** Which inspector panel is currently open (or null if closed). */
export type InspectorPanelId = "properties" | "settings" | null;

export type DeviceType = "phone" | "tablet" | "desktop";
export type CanvasBackground = "white" | "dark" | "grid" | "dots" | "neutral";

/** UI-only state shape persisted in the workspace store. */
export interface WorkspaceUIState {
  activeSection: WorkspaceSection;
  collapsedSidebar: boolean;
  collapsedInspector: boolean;
  zoom: number; // 0.25 – 2.0, step 0.25
  selectedPanel: InspectorPanelId;
  deviceType: DeviceType;
  canvasBackground: CanvasBackground;
  /** Mobile: sidebar drawer open state (false on desktop) */
  mobileSidebarOpen: boolean;
  /** Mobile: inspector sheet open state (false on desktop) */
  mobileInspectorOpen: boolean;
}

/** Actions available on the workspace store. */
export interface WorkspaceUIActions {
  setActiveSection: (section: WorkspaceSection) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  setZoom: (zoom: number) => void;
  setSelectedPanel: (panel: InspectorPanelId) => void;
  setDeviceType: (device: DeviceType) => void;
  setCanvasBackground: (bg: CanvasBackground) => void;
  /** Mobile: open/close sidebar drawer */
  setMobileSidebarOpen: (open: boolean) => void;
  /** Mobile: open/close inspector sheet */
  setMobileInspectorOpen: (open: boolean) => void;
}

export type WorkspaceStore = WorkspaceUIState & WorkspaceUIActions;

/** Navigation item descriptor. */
export interface NavItem {
  id: WorkspaceSection;
  label: string;
  icon: string; // lucide-react icon name
  shortcut?: string;
}
