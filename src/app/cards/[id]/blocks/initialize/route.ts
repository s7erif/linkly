import { initializeCardBlocks } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { cardRouteParamsSchema, parseJsonBody, parseRouteParams } from "@/transport/http";
import { blockSessionBodySchema } from "@/validation/card-block";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const { id } = await parseRouteParams(context.params, cardRouteParamsSchema),
      body = await parseJsonBody(
        request,
        blockSessionBodySchema,
      );
    return {
      data: await initializeCardBlocks.execute({ cardId: id, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
