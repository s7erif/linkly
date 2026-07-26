"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./theme/theme-provider";
import { useTheme } from "./theme/use-theme"; // still used by ProfileCard etc internally
import {
  ProfileCard,
  ProfileAvatar,
  ProfileHeader,
  ProfileBio,
  SocialIcons,
  FooterActions,
} from "./profile";
import { LinksRenderer } from "./links";
import type {
  PreviewData,
  CardRendererProps,
  PreviewLayoutOptions,
} from "./types";
import { DEFAULT_LAYOUT } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Inner renderer (consumes ThemeContext)
// ═══════════════════════════════════════════════════════════════════════════

interface InnerProps {
  data: PreviewData;
  avatarUrl?: string | null;
  layout: PreviewLayoutOptions;
}

function InnerRenderer({ data, avatarUrl, layout }: InnerProps) {
  const theme = useTheme();
  const { profile, buttons, socialLinks, blocks } = data;
  const fallback = (profile?.fullName ?? "U").slice(0, 2).toUpperCase();

  // Resolve a block by kind from the blocks array — used when a section
  // order entry matches a block kind (e.g. "GALLERY", "DIVIDER").
  const blockByKind = (kind: string) => blocks?.find((b) => b.kind === kind && b.isEnabled);

  // ════════════════════════════════════════════════════════════════════
  // Render a single section by kind.  Adding a new section means adding
  // one case here — no other file changes needed.
  // ════════════════════════════════════════════════════════════════════
  function renderSection(kind: string) {
    // ── Core profile sections ──────────────────────────────────────
    switch (kind) {
      case "header":
        return layout.showHeader && profile ? (
          <ProfileHeader key="header" fullName={profile.fullName} headline={profile.headline} company={profile.company} />
        ) : null;
      case "bio":
        return layout.showBio && profile?.bio ? (
          <ProfileBio key="bio" text={profile.bio} />
        ) : null;
      case "buttons":
        return layout.showButtons && buttons.length > 0 ? (
          <LinksRenderer key="buttons" buttons={buttons} />
        ) : null;
      case "socialLinks":
        return layout.showSocialLinks ? (
          <SocialIcons key="socialLinks" links={socialLinks} />
        ) : null;
      case "footer":
        return layout.showFooter ? (
          <FooterActions key="footer" />
        ) : null;
    }

    // ── Content block kinds (GALLERY, VIDEO, FAQ, LOCATION_MAP,
    //     DIVIDER, RICH_TEXT) — data comes from the blocks array. ──
    const block = blockByKind(kind);
    if (!block) return null;

    switch (kind) {
      case "DIVIDER":
        return (
          <hr
            key="divider"
            style={{
              border: "none",
              borderTop: `${({ SOLID: "1.5px solid", DASHED: "1.5px dashed", DOTTED: "1.5px dotted" } as Record<string, string>)[block.config.style ?? "SOLID"] ?? "1.5px solid"} ${theme.colors.outline}`,
              margin: "1rem 0",
            }}
          />
        );
      case "RICH_TEXT": {
        const text = block.config.content;
        if (!text) return null;
        return (
          <div key="rich-text" className="w-full text-left" style={{ fontSize: theme.typography.bodySize, color: theme.colors.text, lineHeight: 1.75 }}>
            {block.config.heading && <h3 className="font-semibold mb-2" style={{ fontSize: theme.typography.headingSize }}>{block.config.heading}</h3>}
            <div>{text}</div>
          </div>
        );
      }
      case "FAQ": {
        const items = block.config.items as Array<{ id: string; question: string; answer: string }> | undefined;
        if (!items?.length) return null;
        return (
          <div key="faq" className="w-full text-left space-y-2">
            {block.config.heading && <h3 className="font-semibold" style={{ fontSize: theme.typography.headingSize, color: theme.colors.text }}>{block.config.heading}</h3>}
            {items.map((item) => (
              <details key={item.id} style={{ borderBottom: `1px solid ${theme.colors.outline}`, padding: "0.5rem 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: theme.typography.bodySize, color: theme.colors.text }}>{item.question}</summary>
                <p style={{ marginTop: "0.5rem", fontSize: theme.typography.bodySize, color: theme.colors.mutedText }}>{item.answer}</p>
              </details>
            ))}
          </div>
        );
      }
      case "GALLERY": {
        const cols = (block.config.columns as number) ?? 3;
        const count = block.mediaIds?.length ?? 0;
        return (
          <div key="gallery" className="w-full">
            {block.config.heading && <h3 className="font-semibold mb-3" style={{ fontSize: theme.typography.headingSize, color: theme.colors.text }}>{block.config.heading}</h3>}
            {count > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0.5rem" }}>
                {Array.from({ length: count }, (_, i) => (
                  <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold" style={{ background: `${theme.colors.primary}12`, color: theme.colors.mutedText, borderRadius: theme.shape.radius }}>
                    Image
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: theme.colors.mutedText }}>Add images via the Media Library.</p>
            )}
          </div>
        );
      }
      case "VIDEO":
        return (
          <div key="video" className="w-full">
            {block.config.heading && <h3 className="font-semibold mb-3" style={{ fontSize: theme.typography.headingSize, color: theme.colors.text }}>{block.config.heading}</h3>}
            {block.config.url ? (
              <video controls preload="metadata" src={block.config.url as string} className="w-full rounded-lg" style={{ borderRadius: theme.shape.radius }} />
            ) : (
              <div className="aspect-video rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}12`, color: theme.colors.mutedText, borderRadius: theme.shape.radius }}>
                <span className="text-xs font-semibold">Video URL not set</span>
              </div>
            )}
            {block.config.caption && <p className="text-xs mt-2" style={{ color: theme.colors.mutedText }}>{block.config.caption as string}</p>}
          </div>
        );
      case "LOCATION_MAP": {
        const address = (block.config.address as string) ?? "";
        return (
          <div key="location" className="w-full">
            {block.config.heading && <h3 className="font-semibold mb-3" style={{ fontSize: theme.typography.headingSize, color: theme.colors.text }}>{block.config.heading}</h3>}
            <div className="aspect-video rounded-lg flex items-center justify-center mb-2" style={{ background: `${theme.colors.primary}12`, borderRadius: theme.shape.radius }}>
              <span className="text-2xl">⌖</span>
            </div>
            {address ? (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: theme.colors.primary }}>
                {address}
              </a>
            ) : (
              <p className="text-xs" style={{ color: theme.colors.mutedText }}>No address set.</p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  }

  const sectionOrder = layout.sectionOrder ?? ["header", "bio", "buttons", "socialLinks", "footer"];
  const layoutAlign = layout.alignment ?? "CENTER";
  const layoutWidth = layout.width ?? "MEDIUM";
  const layoutSpacing = layout.spacing ?? "COMFORTABLE";

  const alignClass = layoutAlign === "LEFT" ? "text-left items-start" : layoutAlign === "RIGHT" ? "text-right items-end" : "text-center items-center";
  const widthClass = layoutWidth === "NARROW" ? "max-w-[280px]" : layoutWidth === "WIDE" ? "max-w-[440px]" : layoutWidth === "FULL" ? "max-w-full" : "max-w-[360px]";
  const spacing = layoutSpacing === "COMPACT" ? "0.75rem" : layoutSpacing === "SPACIOUS" ? "2.5rem" : "1.5rem";

  return (
    <ProfileCard className="w-full overflow-hidden relative">
      <div
        className="absolute top-0 left-0 right-0 h-[320px] pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% -10%, ${theme.colors.primary}08 0%, transparent 80%)`,
        }}
      />

      <motion.div
        key={`preview-${profile?.fullName ?? "empty"}-${buttons.length}`}
        initial={{ opacity: 0.92, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative flex flex-col w-full pt-12 pb-12 px-6 box-border z-10"
        style={{ alignItems: layoutAlign === "LEFT" ? "flex-start" : layoutAlign === "RIGHT" ? "flex-end" : "center", padding: theme.spacing.section ? `48px 24px 48px 24px` : undefined }}
      >
        <div className={`flex flex-col w-full mb-8 mt-2 ${widthClass} mx-auto ${alignClass}`}>
          {/* Avatar */}
          <ProfileAvatar src={avatarUrl} fallback={fallback} size="lg" />

          {/* Typography Group (Unified Composition) */}
          <div className="mt-5 flex flex-col items-center w-full">
            {layout.showHeader && profile && (
              <ProfileHeader
                fullName={profile.fullName}
                headline={profile.headline}
                company={profile.company}
                address={profile.address}
              />
            )}

            {/* Bio */}
            {layout.showBio && profile?.bio && (
              <div className="mt-3 w-full">
                <ProfileBio text={profile.bio} />
              </div>
            )}
          </div>
        </div>

        {/* Continuous Flow Spacer (No flexible gap) */}
        <div className="h-6 w-full pointer-events-none shrink-0" />

        {/* 3. Action Sections */}
        <div className={`flex flex-col w-full mb-2 ${widthClass} mx-auto`} style={{ alignItems: layoutAlign === "LEFT" ? "flex-start" : layoutAlign === "RIGHT" ? "flex-end" : "center", gap: spacing }}>
          {sectionOrder
            .filter((kind) => kind !== "header" && kind !== "bio")
            .map((kind) => renderSection(kind))}
        </div>
      </motion.div>
    </ProfileCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Canonical renderer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PreviewRenderer — the single rendering engine for every preview surface.
 *
 * Workspace Live Preview, Public Profile, Mobile Preview, Share Page,
 * NFC Preview, and future embed widgets all render through this component.
 *
 * Responsibilities:
 *  - Receive profile data + theme + layout options
 *  - Render profile consistently using theme tokens
 *  - No API calls, no business logic
 */
export function CardRenderer({
  data,
  appearance,
  layout: layoutOverride,
  avatarUrl,
  className,
}: CardRendererProps) {
  const layout = useMemo<PreviewLayoutOptions>(
    () => ({ ...DEFAULT_LAYOUT, ...layoutOverride }),
    [layoutOverride],
  );

  return (
    <ThemeProvider appearance={appearance}>
      <div className={cn("w-full max-w-[90vw] sm:max-w-[480px] md:max-w-[500px] lg:max-w-[540px] mx-auto", className)}>
        <InnerRenderer data={data} avatarUrl={avatarUrl} layout={layout} />
      </div>
    </ThemeProvider>
  );
}

/** @deprecated Use CardRenderer. Kept as a source-compatible alias. */
export const PreviewRenderer = CardRenderer;
