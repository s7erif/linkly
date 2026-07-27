"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { WorkspaceStore, WorkspaceSection, InspectorPanelId } from "@/types/workspace";

// ── Session persistence keys ──────────────────────────────────────────
const STORAGE_ZOOM = "workspace-v2:zoom";
const STORAGE_SECTION = "workspace-v2:activeSection";

function loadPersisted<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore quota */ }
}

/**
 * Workspace UI store — lightweight Zustand atom for shell-level UI state.
 *
 * Initial state always uses defaults so SSR and first client render are
 * identical (prevents hydration mismatches).  Persisted values are loaded
 * in a useEffect *after* hydration via the PersistenceHydrator below.
 */
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  // ── State (always defaults on first render — SSR-safe) ──────────────
  activeSection: "identity",
  collapsedSidebar: false,
  collapsedInspector: false,
  zoom: 1,
  selectedPanel: "properties",
  deviceType: "phone",
  canvasBackground: "white",
  mobileSidebarOpen: false,
  mobileInspectorOpen: false,

  // ── Actions ────────────────────────────────────────────────────────
  setActiveSection: (section: WorkspaceSection) => {
    persist(STORAGE_SECTION, section);
    set({ activeSection: section, mobileSidebarOpen: false, mobileInspectorOpen: true });
  },

  toggleSidebar: () =>
    set((s) => ({ collapsedSidebar: !s.collapsedSidebar })),

  toggleInspector: () =>
    set((s) => ({ collapsedInspector: !s.collapsedInspector })),

  setZoom: (zoom: number) => {
    const clamped = Math.min(2, Math.max(0.25, zoom));
    persist(STORAGE_ZOOM, clamped);
    set({ zoom: clamped });
  },

  setSelectedPanel: (panel: InspectorPanelId) =>
    set({ selectedPanel: panel, collapsedInspector: panel === null }),

  setDeviceType: (deviceType) => set({ deviceType }),
  setCanvasBackground: (canvasBackground) => set({ canvasBackground }),

  setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),
  setMobileInspectorOpen: (open: boolean) => set({ mobileInspectorOpen: open }),
}));

/**
 * Hydrates persisted UI preferences from sessionStorage AFTER the first
 * client render, so SSR and initial client HTML are identical.
 *
 * Mount this once near the root of the workspace tree.
 */
export function WorkspacePersistenceHydrator() {
  useEffect(() => {
    const zoom = loadPersisted<number>(STORAGE_ZOOM, 1);
    const section = loadPersisted<WorkspaceSection>(STORAGE_SECTION, "identity");
    useWorkspaceStore.setState({
      zoom: Math.min(2, Math.max(0.25, zoom)),
      activeSection: section,
    });
  }, []);
  return null;
}
