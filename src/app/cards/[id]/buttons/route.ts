import { createCardButton, reorderCardButtons } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import {
  createCardButtonSchema,
  reorderCardButtonsSchema,
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
      parseJsonBody(request, createCardButtonSchema.omit({ cardId: true })),
    ]);
    return { data: await createCardButton.execute({ cardId: id, ...input }, await getWorkspaceAdminAuthorization()) };
  });
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, input] = await Promise.all([
      parseRouteParams(context.params, params),
      parseJsonBody(request, reorderCardButtonsSchema.omit({ cardId: true })),
    ]);
    return { data: await reorderCardButtons.execute({ cardId: id, ...input }, await getWorkspaceAdminAuthorization()) };
  });
}
