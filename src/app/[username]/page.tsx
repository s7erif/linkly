import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DefaultTheme } from "@/components/themes/DefaultTheme";
import { readPublicCardForRender } from "@/features/public-card/public-card-cache.server";
import { NotFoundError } from "@/lib/errors";
import { buildProfileUrl } from "@/lib/public-links";

async function read(username: string) { const normalized = decodeURIComponent(username).replace(/^@/, ""); try { return await readPublicCardForRender(normalized); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; } }
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> { const card = await read((await params).username); return { title: card.seoTitle ?? card.profile?.fullName ?? card.name, description: card.seoDescription ?? card.profile?.bio ?? undefined, alternates: { canonical: buildProfileUrl(card.slug) } }; }
export default async function UsernameProfilePage({ params }: { params: Promise<{ username: string }> }) { const card = await read((await params).username); return <DefaultTheme card={card} appearance={card.appearance} />; }
