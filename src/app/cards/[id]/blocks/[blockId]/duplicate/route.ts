import { duplicateCardBlock } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { cardBlockRouteParamsSchema, parseJsonBody, parseRouteParams } from "@/transport/http";
import { blockSessionBodySchema } from "@/validation/card-block";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; blockId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const { id, blockId } = await parseRouteParams(context.params, cardBlockRouteParamsSchema),
      body = await parseJsonBody(
        request,
        blockSessionBodySchema,
      );
    return {
      data: await duplicateCardBlock.execute({ cardId: id, blockId, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
