import { updateCardAppearance } from "@/lib/composition-root";
import { appearanceSettingsSchema } from "@/validation/appearance";
import { handleRoute, parseJsonBody, parseRouteParams } from "@/transport/http";
import { z } from "zod";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({ sessionToken: z.string(), appearance: appearanceSettingsSchema }).strict();
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  return handleRoute(request, async () => {
    const [{ id }, body] = await Promise.all([parseRouteParams(context.params, paramsSchema), parseJsonBody(request, bodySchema)]);
    return { data: await updateCardAppearance.execute({ cardId: id, ...body }) };
  });
}
