import { type ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

/**
 * Workspace V2 Layout — wraps every page under /workspace in the
 * 3-column editor shell (sidebar | canvas | inspector).
 *
 * page.tsx renders Workspace V2 canvas content into the center slot.
 * Legacy business logic is preserved in page.legacy.tsx for incremental
 * feature migration in later phases.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
