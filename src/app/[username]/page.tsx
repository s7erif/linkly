import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardRenderer, toCardRendererProps } from "@/components/card-renderer";
import { readPublicCardForRender } from "@/features/public-card/public-card-cache.server";
import { NotFoundError } from "@/lib/errors";
import { buildProfileUrl } from "@/lib/public-links";
import { layout } from "@/components/card-renderer/design-system";

import { preconnect } from "react-dom";

async function read(username: string) { const normalized = decodeURIComponent(username).replace(/^@/, ""); try { return await readPublicCardForRender(normalized); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; } }
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> { const card = await read((await params).username); return { title: card.seoTitle ?? card.profile?.fullName ?? card.name, description: card.seoDescription ?? card.profile?.bio ?? undefined, alternates: { canonical: buildProfileUrl(card.slug) } }; }
export default async function UsernameProfilePage({ params }: { params: Promise<{ username: string }> }) { 
  const card = await read((await params).username); 
  
  if (card.avatarUrl) {
    try {
      preconnect(new URL(card.avatarUrl).origin);
    } catch {}
  }

  return (
    <main 
      className="profile-canvas min-h-[100dvh] flex flex-col items-center px-0 md:px-12 lg:px-16 w-full max-md:!p-0"
    >
      {/* Desktop Top Spacer - Flex grows to center, shrinks to 0 if overflow prevents top-clipping */}
      <div className="hidden md:block flex-1 shrink-0 min-h-[5vh]" />
      
      <div className="w-full max-md:flex-1 max-md:flex max-md:flex-col shrink-0">
        <CardRenderer {...toCardRendererProps(card)} />
      </div>
      
      {/* Desktop Bottom Spacer */}
      <div className="hidden md:block flex-1 shrink-0 min-h-[5vh]" />
    </main>
  ); }
