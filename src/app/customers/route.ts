import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AppError, UnauthorizedError } from "@/lib/errors";
import { handleRoute } from "@/transport/http";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session?.user) throw new UnauthorizedError("Administrator authentication is required");
    throw new AppError("Customers are created only after successful NFC product activation.", 409, "ACTIVATION_REQUIRED");
  });
}
