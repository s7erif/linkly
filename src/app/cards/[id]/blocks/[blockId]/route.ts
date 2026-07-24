import { deleteCardBlock, updateCardBlock } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { cardBlockRouteParamsSchema, parseJsonBody, parseRouteParams } from "@/transport/http";
import { blockSessionBodySchema, updateCardBlockBodySchema } from "@/validation/card-block";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; blockId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id, blockId }, body] = await Promise.all([
      parseRouteParams(context.params, cardBlockRouteParamsSchema),
      parseJsonBody(request, updateCardBlockBodySchema),
    ]);
    return {
      data: await updateCardBlock.execute({ cardId: id, blockId, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
export async function DELETE(
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
      data: await deleteCardBlock.execute({ cardId: id, blockId, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
