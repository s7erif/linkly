import { updateCardMetadata } from "@/lib/composition-root";
import { handlePublicCardMutationRoute, shouldReturnEditorForMutation } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { updateCardMetadataSchema } from "@/validation/card-builder";
import { z } from "zod";
const params = z.object({ id: z.string().uuid() });
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, updateCardMetadataSchema.omit({ cardId: true })),
    ]);
    return { data: await updateCardMetadata.execute({ cardId: id, ...input }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)) };
  });
}
