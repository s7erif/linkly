import { legacyCardService } from "@/lib/composition-root";
import { notFound } from "next/navigation";
import { normalizeCard } from "@/components/card-renderer/adapters/card.adapter";
import { PublicCardPage } from "@/components/public-card";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ hash: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const hash = resolvedParams.hash;

  const card = await legacyCardService.getByHash(hash);

  if (!card) {
    return {
      title: "Card Not Found",
    };
  }

  const title = `${card.name}'s Digital Business Card`;
  const description = card.bio || card.title || "Digital Business Card created with OI Cards";
  const images = card.avatar ? [card.avatar] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function CardPage({ params }: Props) {
  const resolvedParams = await params;
  const { hash } = resolvedParams;

  const card = await legacyCardService.getByHash(hash);

  if (!card) {
    notFound();
  }

  console.log("[page.tsx] card from prisma templateId:", card.templateId);

  const normalizedCard = normalizeCard(card);
  
  console.log("[page.tsx] normalizedCard templateId:", normalizedCard.templateId);

  return <PublicCardPage card={normalizedCard} />;
}
