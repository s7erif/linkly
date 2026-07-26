"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { cn } from "@/lib/utils";
import { CardSelector } from "../inspector/card-selector";
import type { WorkspaceSection, NavItem } from "@/types/workspace";

const NAV_ITEMS: NavItem[] = [
  { id: "identity", label: "Identity", icon: "Fingerprint" },
  { id: "design", label: "Design", icon: "Palette" },
  { id: "links", label: "Links", icon: "Link" },
  { id: "content", label: "Content", icon: "FileText" },
  { id: "publish", label: "Publish", icon: "Send" },
];

// Minimal inline SVG icons to avoid depending on lucide-react for nav
// (keeps sidebar render independent of icon library choice)
const NavIcon: Record<string, React.ReactNode> = {
  Fingerprint: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.34-.7 3.36-.7 1.18-2.3 1.82-2.3 2.64 0 .67.4 1 1 1s1.17-.33 1.58-.83C10.17 17.47 11 16 11 12a1 1 0 0 1 2 0c0 4.5 1 5.5 1.67 6.17.67.67 1.33.83 1.83.83s1-.33 1-1c0-.82-1.6-1.46-2.3-2.64-.6-1.02-.7-2.34-.7-3.36a2 2 0 0 0-2-2z"/>
      <path d="M7 12a5 5 0 0 1 10 0c0 2 1 4 2.5 5.5"/>
      <path d="M4 12a8 8 0 0 1 16 0c0 1.5.5 3 2 4.5"/>
    </svg>
  ),
  Palette: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2a5 5 0 0 0 0 20"/>
    </svg>
  ),
  Link: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  FileText: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
};

export interface WorkspaceSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Optional user avatar URL */
  userAvatar?: string | null;
  /** Optional user display name */
  userName?: string;
  /** Optional plan label */
  userPlan?: string;
}

export const WorkspaceSidebar = forwardRef<HTMLElement, WorkspaceSidebarProps>(
  ({ userAvatar, userName = "User", userPlan = "Pro", className, ...props }, ref) => {
    const router = useRouter();
    const activeSection = useWorkspaceStore((s) => s.activeSection);
    const setActiveSection = useWorkspaceStore((s) => s.setActiveSection);
    const collapsed = useWorkspaceStore((s) => s.collapsedSidebar);
    const slug = useCardEditorStore((s) => s.slug);
    const cards = useCardEditorStore((s) => s.availableCards);
    const saveState = useCardEditorStore((s) => s.saveState);

    // Show breadcrumb only when editing a card (slug exists)
    const showBreadcrumb = slug !== "";

    const handleNav = (section: WorkspaceSection) => {
      setActiveSection(section);
    };

    const handleBackToCards = () => {
      // Check for unsaved changes before navigating
      if (saveState === "dirty") {
        // Show confirmation - for now just navigate, could add dialog here
        if (!confirm("You have unsaved changes. Leave anyway?")) {
          return;
        }
      }
      router.push("/workspace");
    };

    return (
      <aside
        ref={ref}
        className={cn(
          "flex flex-col h-full bg-white/70 backdrop-blur-2xl border-r border-slate-200/40 z-20 shrink-0 transition-all duration-300 ease-out",
          collapsed ? "w-[72px]" : "w-[260px]",
          className,
        )}
        {...props}
      >
        {/* Brand header */}
        <div className={cn("px-6 pt-10 pb-8", collapsed && "px-4 pt-6 pb-6")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-workspace-primary flex items-center justify-center text-white shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[17px] font-bold tracking-tight text-workspace-primary">
                  Linkly
                </span>
                <span className="text-[11px] text-workspace-text-muted font-medium">
                  Digital Identity Studio
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb - shown only when editing a card */}
        {showBreadcrumb && !collapsed && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleBackToCards}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-workspace-text-muted hover:text-workspace-primary hover:bg-workspace-surface-dim transition-all group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="text-xs font-medium">All Cards</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-fast group",
                  isActive
                    ? "bg-workspace-primary-muted/60 text-workspace-primary font-semibold shadow-sm"
                    : "text-workspace-text-secondary font-medium hover:bg-workspace-surface-dim hover:text-workspace-primary",
                )}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-workspace-primary" : "text-workspace-text-muted group-hover:text-workspace-primary",
                )}>
                  {NavIcon[item.icon]}
                </span>
                {!collapsed && (
                  <>
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1 h-4 bg-workspace-primary rounded-full" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Card selector (visible when user has multiple cards) */}
        <CardSelector />

        {/* Bottom user section */}
        <div className={cn("px-6 py-8 mt-auto border-t border-workspace-outline/20", collapsed && "px-4")}>
          {!collapsed ? (
            <div className="bg-workspace-surface-dim p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-workspace-primary-muted flex items-center justify-center text-workspace-primary font-semibold text-sm overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-workspace-text-primary leading-tight truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-workspace-text-muted">{userPlan} Plan Active</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2 bg-white text-workspace-text-secondary border border-workspace-outline/30 rounded-xl text-[11px] font-semibold hover:shadow-sm transition-all active:scale-95"
              >
                Settings
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-workspace-primary-muted flex items-center justify-center text-workspace-primary font-semibold text-xs overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  },
);

WorkspaceSidebar.displayName = "WorkspaceSidebar";
