import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import type { PublicCardDTO } from "@/dto";
import { readPublicCard } from "@/lib/composition-root";

const PUBLIC_CARDS_TAG = "public-cards";
const PUBLIC_CARD_REVALIDATE_SECONDS = 60 * 60;
const slugTag = (slug: string) => `public-card:${slug}`;

function readCachedPublicCard(slug: string): Promise<PublicCardDTO> {
  return unstable_cache(
    () => readPublicCard.execute({ slug }),
    ["public-card-v1", slug],
    {
      revalidate: PUBLIC_CARD_REVALIDATE_SECONDS,
      tags: [PUBLIC_CARDS_TAG, slugTag(slug)],
    },
  )();
}

export const readPublicCardForRender = cache(readCachedPublicCard);

export function invalidatePublicCard(slug: string): void {
  revalidateTag(slugTag(slug), { expire: 0 });
}

export function invalidateAllPublicCards(): void {
  revalidateTag(PUBLIC_CARDS_TAG, { expire: 0 });
}
