import { deleteSocialLink, updateSocialLink } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { updateSocialLinkSchema } from "@/validation/card-builder";
import { z } from "zod";
const params = z.object({
  id: z.string().uuid(),
  socialLinkId: z.string().uuid(),
});
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; socialLinkId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id, socialLinkId }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(
        request,
        updateSocialLinkSchema.omit({ cardId: true, socialLinkId: true }),
      ),
    ]);
    return {
      data: await updateSocialLink.execute({
        cardId: id,
        socialLinkId,
        ...input,
      }, await getWorkspaceAdminAuthorization()),
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
      }, await getWorkspaceAdminAuthorization()),
    };
  });
}
