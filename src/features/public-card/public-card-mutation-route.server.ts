import type { RouteResult } from "@/transport/http";
import { handleRoute } from "@/transport/http";
import {
  invalidateAllPublicCards,
  invalidatePublicCard,
} from "./public-card-cache.server";

export function shouldReturnEditorForMutation(request: Request): boolean {
  return new URL(request.url).searchParams.get("save") !== "true";
}

/** Transport policy for successful card writes; application use cases stay cache-agnostic. */
export function handlePublicCardMutationRoute<T extends { slug: string }>(
  request: Request,
  operation: (requestId: string) => Promise<RouteResult<T>>,
): Promise<Response> {
  return handleRoute(request, async (requestId) => {
    const result = await operation(requestId);
    const pathname = new URL(request.url).pathname;
    if (request.method === "PUT" && pathname.endsWith("/slug")) {
      invalidateAllPublicCards();
    } else {
      invalidatePublicCard(result.data.slug);
    }
    return result;
  });
}
