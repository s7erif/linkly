import { getAccessCodeUseCases } from "@/lib/composition-root";
import { createEditorSessionRequestSchema, handleRoute, parseJsonBody } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => ({
    data: await getAccessCodeUseCases().createEditorSession.execute(await parseJsonBody(request, createEditorSessionRequestSchema)),
    status: 201,
  }));
}
