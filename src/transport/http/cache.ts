export const PUBLIC_CARD_CACHE_HEADERS = {
  "cache-control": "public, max-age=0, must-revalidate",
  "cdn-cache-control": "no-store",
  "cloudflare-cdn-cache-control": "no-store",
} as const;
