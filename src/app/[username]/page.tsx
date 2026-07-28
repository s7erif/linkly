import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardRenderer, toCardRendererProps } from "@/components/card-renderer";
import { readPublicCardForRender } from "@/features/public-card/public-card-cache.server";
import { NotFoundError } from "@/lib/errors";
import { buildProfileUrl } from "@/lib/public-links";
import { preconnect } from "react-dom";

async function read(username: string) {
  const normalized = decodeURIComponent(username).replace(/^@/, "");
  try {
    return await readPublicCardForRender(normalized);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const card = await read((await params).username);
  return {
    title: card.seoTitle ?? card.profile?.fullName ?? card.name,
    description: card.seoDescription ?? card.profile?.bio ?? undefined,
    alternates: { canonical: buildProfileUrl(card.slug) },
  };
}

export default async function UsernameProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const card = await read((await params).username);

  if (card.avatarUrl) {
    try {
      preconnect(new URL(card.avatarUrl).origin);
    } catch {}
  }

  const primaryColor = card.appearance?.colors?.primary ?? "#3b82f6";

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center w-full overflow-hidden max-md:p-0">
      
      {/* ── Linktree Desktop Layout CSS Injection ── */}
      <style>{`
        @media (min-width: 1024px) {
          /* 1. Make CardRenderer full bleed, acting as the page background */
          .desktop-linktree-wrapper {
            max-width: none !important;
            width: 100% !important;
            min-height: 100dvh !important;
          }
          .desktop-linktree-wrapper > div {
            border-radius: 0 !important;
            box-shadow: none !important;
            min-height: 100dvh !important;
            /* Ensure the inner animated div also spans full height */
            display: flex;
            flex-direction: column;
          }

          /* 2. Add subtle ambient radial glow behind the avatar */
          .desktop-linktree-wrapper .profile-avatar-container {
             position: relative;
          }
          .desktop-linktree-wrapper .profile-avatar-container::before {
             content: "";
             position: absolute;
             top: 50%; left: 50%;
             transform: translate(-50%, -50%);
             width: 250px; height: 250px;
             background: radial-gradient(circle, ${primaryColor} 0%, transparent 70%);
             opacity: 0.25;
             filter: blur(25px);
             z-index: -1;
             pointer-events: none;
             border-radius: 50%;
          }

          /* 3. Increase vertical spacing between sections */
          .desktop-linktree-wrapper header {
             margin-top: 3rem !important;
          }
          .desktop-linktree-wrapper nav {
             margin-top: 2rem !important;
             gap: 1.25rem !important;
          }
          .desktop-linktree-wrapper footer {
             margin-top: 4rem !important;
          }

          /* 4. Make buttons slightly larger */
          .desktop-linktree-wrapper a,
          .desktop-linktree-wrapper button {
             /* Target the buttons inside links renderer */
          }
          /* We specifically target the anchor/button tags inside the nav that look like buttons */
          .desktop-linktree-wrapper nav > div > a,
          .desktop-linktree-wrapper nav > div > button {
             min-height: 56px !important;
             border-radius: 18px !important;
          }

          /* 5. Soft blurred gradient behind the page 
             We apply this to the pseudo-element of the ProfileCard to overlay on the background 
          */
          .desktop-linktree-wrapper > div::before {
             content: "";
             position: fixed;
             top: 0; left: 0; right: 0; bottom: 0;
             pointer-events: none;
             background: radial-gradient(ellipse at top, ${primaryColor}15 0%, transparent 60%);
             z-index: 0;
          }
        }
      `}</style>

      {/* 
        On mobile: Full width, exactly matching original layout.
        On desktop: The wrapper css makes it full-bleed, centering the inner constrained content exactly like Linktree.
      */}
      <div className="w-full max-md:flex-1 max-md:flex max-md:flex-col shrink-0">
        <CardRenderer {...toCardRendererProps(card)} className="desktop-linktree-wrapper" />
      </div>
    </main>
  );
}
