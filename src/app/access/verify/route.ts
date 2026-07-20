import { getAccessCodeUseCases } from "@/lib/composition-root";
import { handleRoute, parseJsonBody, verifyAccessCodeRequestSchema } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => ({
    data: await getAccessCodeUseCases().verifyAccessCode.execute(await parseJsonBody(request, verifyAccessCodeRequestSchema)),
  }));
}
