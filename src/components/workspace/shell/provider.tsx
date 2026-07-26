"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import type { WorkspaceStore } from "@/types/workspace";

/**
 * Optional React Context wrapper around the Zustand store.
 *
 * Use this when you need to inject the store into the tree for testing or
 * scoped instances. The default export from use-workspace-store.ts is the
 * global singleton, which is sufficient for the single-workspace use case.
 */

const WorkspaceContext = createContext<typeof useWorkspaceStore | null>(null);

export interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  return (
    <WorkspaceContext.Provider value={useWorkspaceStore}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to get the workspace store from context.
 * Falls back to the global singleton if no provider is in the tree.
 */
export function useWorkspace(): typeof useWorkspaceStore {
  const ctx = useContext(WorkspaceContext);
  return ctx ?? useWorkspaceStore;
}

/** Re-export store type for convenience */
export type { WorkspaceStore };
