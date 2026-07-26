import { deleteSocialLink, updateSocialLink } from "@/lib/composition-root";
import { handlePublicCardMutationRoute, shouldReturnEditorForMutation } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { z } from "zod";
const params = z.object({
  id: z.string().uuid(),
  socialLinkId: z.string().uuid(),
});
const patchBodySchema = z.object({
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
  platform: z.string().trim().min(1).max(40).optional(),
  label: z.string().trim().max(80).nullable().optional(),
  url: z.string().trim().min(1).max(2048).optional(),
  isVisible: z.boolean().optional(),
}).strict();
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; socialLinkId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id, socialLinkId }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, patchBodySchema),
    ]);
    return {
      data: await updateSocialLink.execute({
        cardId: id,
        socialLinkId,
        ...input,
      }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)),
    };
  });
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; socialLinkId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const { id, socialLinkId } = await parseRouteParams(context.params, params);
    const body = await parseJsonBody(
      request,
      z.object({ sessionToken: z.string() }).strict(),
    );
    return {
      data: await deleteSocialLink.execute({
        cardId: id,
        socialLinkId,
        ...body,
      }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)),
    };
  });
}
