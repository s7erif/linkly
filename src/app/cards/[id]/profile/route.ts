import { updateCardProfile } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { updateCardProfileSchema } from "@/validation/use-cases";
import { z } from "zod";
const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = updateCardProfileSchema.omit({ cardId: true });
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, body] = await Promise.all([
      parseRouteParams(context.params, paramsSchema),
      parseJsonBody(request, bodySchema),
    ]);
    return { data: await updateCardProfile.execute({ cardId: id, ...body }, await getWorkspaceAdminAuthorization()) };
  });
}
