import { createCustomer } from "@/lib/composition-root";
import { createCustomerRequestSchema, handleRoute, parseJsonBody } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => ({
    data: await createCustomer.execute(await parseJsonBody(request, createCustomerRequestSchema)),
    status: 201,
  }));
}
