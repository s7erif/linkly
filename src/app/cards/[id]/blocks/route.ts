import { createCardBlock, reorderCardBlocks } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { cardRouteParamsSchema, parseJsonBody, parseRouteParams } from "@/transport/http";
import {
  createCardBlockBodySchema,
  reorderCardBlocksBodySchema,
} from "@/validation/card-block";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, body] = await Promise.all([
      parseRouteParams(context.params, cardRouteParamsSchema),
      parseJsonBody(request, createCardBlockBodySchema),
    ]);
    return { data: await createCardBlock.execute({ cardId: id, ...body }, await getWorkspaceAdminAuthorization()) };
  });
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, body] = await Promise.all([
      parseRouteParams(context.params, cardRouteParamsSchema),
      parseJsonBody(request, reorderCardBlocksBodySchema),
    ]);
    return { data: await reorderCardBlocks.execute({ cardId: id, ...body }, await getWorkspaceAdminAuthorization()) };
  });
}
