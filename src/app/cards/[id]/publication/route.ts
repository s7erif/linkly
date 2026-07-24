import { updateCardPublication } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import {
  cardRouteParamsSchema,
  parseJsonBody,
  parseRouteParams,
} from "@/transport/http";
import { cardPublicationBodySchema } from "@/validation/publication";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, body] = await Promise.all([
      parseRouteParams(context.params, cardRouteParamsSchema),
      parseJsonBody(request, cardPublicationBodySchema),
    ]);
    return {
      data: await updateCardPublication.execute(
        { cardId: id, ...body },
        await getWorkspaceAdminAuthorization(),
      ),
    };
  });
}
