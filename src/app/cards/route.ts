import { createCard } from "@/lib/composition-root";
import { createCardRequestSchema, handleRoute, parseJsonBody } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => ({
    data: await createCard.execute(await parseJsonBody(request, createCardRequestSchema)),
    status: 201,
  }));
}
