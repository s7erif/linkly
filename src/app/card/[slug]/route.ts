import { readPublicCard } from "@/lib/composition-root";
import { handleRoute, parseRouteParams, publicCardParamsSchema, PUBLIC_CARD_CACHE_HEADERS } from "@/transport/http";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => {
    const { slug: rawSlug } = await context.params;
    const { slug } = parseRouteParams({ slug: rawSlug }, publicCardParamsSchema);
    return { data: await readPublicCard.execute({ slug }), headers: PUBLIC_CARD_CACHE_HEADERS };
  });
}
