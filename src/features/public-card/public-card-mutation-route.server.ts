import type { RouteResult } from "@/transport/http";
import { handleRoute } from "@/transport/http";
import {
  invalidateAllPublicCards,
  invalidatePublicCard,
} from "./public-card-cache.server";

function hasSlug(value: unknown): value is { slug: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "slug" in value &&
    typeof value.slug === "string"
  );
}

/** Transport policy for successful card writes; application use cases stay cache-agnostic. */
export function handlePublicCardMutationRoute<T>(
  request: Request,
  operation: (requestId: string) => Promise<RouteResult<T>>,
): Promise<Response> {
  return handleRoute(request, async (requestId) => {
    const result = await operation(requestId);
    const pathname = new URL(request.url).pathname;
    if (request.method === "PUT" && pathname.endsWith("/slug")) {
      invalidateAllPublicCards();
    } else if (hasSlug(result.data)) {
      invalidatePublicCard(result.data.slug);
    }
    return result;
  });
}
