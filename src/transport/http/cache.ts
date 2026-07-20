export const PUBLIC_CARD_CACHE_HEADERS = {
  "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
  "cdn-cache-control": "public, max-age=300, stale-while-revalidate=86400",
  "cloudflare-cdn-cache-control": "public, max-age=300, stale-while-revalidate=86400",
} as const;
