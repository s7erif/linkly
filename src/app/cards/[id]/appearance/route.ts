import { updateCardAppearance } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { appearanceSettingsSchema } from "@/validation/appearance";
import { parseJsonBody, parseRouteParams } from "@/transport/http";
import { z } from "zod";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z
  .object({ sessionToken: z.string(), appearance: appearanceSettingsSchema })
  .strict();
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handlePublicCardMutationRoute(request, async () => {
    const [{ id }, body] = await Promise.all([
      parseRouteParams(context.params, paramsSchema),
      parseJsonBody(request, bodySchema),
    ]);
    return {
      data: await updateCardAppearance.execute({ cardId: id, ...body }, await getWorkspaceAdminAuthorization()),
    };
  });
}
