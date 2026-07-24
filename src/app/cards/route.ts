import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import { handleRoute } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session?.user) throw new UnauthorizedError("Administrator authentication is required");
    throw new ConflictError("Cards must be created by approving an order");
  });
}
