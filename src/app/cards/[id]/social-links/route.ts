import { createSocialLink, reorderSocialLinks } from "@/lib/composition-root";
import { handlePublicCardMutationRoute, shouldReturnEditorForMutation } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import {
  createSocialLinkSchema,
  reorderSocialLinksSchema,
} from "@/validation/card-builder";
import { z } from "zod";
const params = z.object({ id: z.string().uuid() });
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, createSocialLinkSchema.omit({ cardId: true })),
    ]);
    return { data: await createSocialLink.execute({ cardId: id, ...input }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)) };
  });
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, reorderSocialLinksSchema.omit({ cardId: true })),
    ]);
    return { data: await reorderSocialLinks.execute({ cardId: id, ...input }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)) };
  });
}
