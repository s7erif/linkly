import { deleteCardButton, updateCardButton } from "@/lib/composition-root";
import { handlePublicCardMutationRoute, shouldReturnEditorForMutation } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { z } from "zod";
const params = z.object({ id: z.string().uuid(), buttonId: z.string().uuid() });
// Body schema for PATCH — same as updateCardButtonSchema but without
// cardId/buttonId (those come from the URL).  Built separately so Zod v4
// does not reject .omit() on a schema containing .refine().
const patchBodySchema = z.object({
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
  label: z.string().trim().min(1).max(80).optional(),
  url: z.string().trim().min(1).max(2048).optional(),
  type: z.string().trim().max(40).optional(),
  displayMode: z.enum(["BUTTON", "ICON"]).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  isVisible: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
}).strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; buttonId: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id, buttonId }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, patchBodySchema),
    ]);
    return {
      data: await updateCardButton.execute({ cardId: id, buttonId, ...input }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)),
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
      data: await deleteCardButton.execute({ cardId: id, buttonId, ...body }, await getWorkspaceAdminAuthorization(), shouldReturnEditorForMutation(request)),
    };
  });
}
