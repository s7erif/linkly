import { deleteCardButton, updateCardButton } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { updateCardButtonSchema } from "@/validation/card-builder";
import { z } from "zod";
const params = z.object({ id: z.string().uuid(), buttonId: z.string().uuid() });
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; buttonId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id, buttonId }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(
        request,
        updateCardButtonSchema.omit({ cardId: true, buttonId: true }),
      ),
    ]);
    return {
      data: await updateCardButton.execute({ cardId: id, buttonId, ...input }, await getWorkspaceAdminAuthorization()),
    };
  });
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; buttonId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const { id, buttonId } = await parseRouteParams(context.params, params);
    const body = await parseJsonBody(
      request,
      z.object({ sessionToken: z.string() }).strict(),
    );
    return {
      data: await deleteCardButton.execute({ cardId: id, buttonId, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
