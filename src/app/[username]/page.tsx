import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardRenderer, toCardRendererProps } from "@/components/card-renderer";
import { readPublicCardForRender } from "@/features/public-card/public-card-cache.server";
import { NotFoundError } from "@/lib/errors";
import { buildProfileUrl } from "@/lib/public-links";

async function read(username: string) { const normalized = decodeURIComponent(username).replace(/^@/, ""); try { return await readPublicCardForRender(normalized); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; } }
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> { const card = await read((await params).username); return { title: card.seoTitle ?? card.profile?.fullName ?? card.name, description: card.seoDescription ?? card.profile?.bio ?? undefined, alternates: { canonical: buildProfileUrl(card.slug) } }; }
export default async function UsernameProfilePage({ params }: { params: Promise<{ username: string }> }) { const card = await read((await params).username); return (
    <div className="profile-canvas min-h-dvh flex flex-col items-center px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-16 lg:py-16">
      <div className="my-auto w-full">
        <CardRenderer {...toCardRendererProps(card)} />
      </div>
    </div>
  ); }
