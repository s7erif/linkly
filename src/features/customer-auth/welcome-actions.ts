"use server";

import { cookies } from "next/headers";

/**
 * Mark the welcome screen as seen so future customer logins go straight to the Workspace.
 * Must be called from a Server Action (not during Server Component rendering)
 * because Next.js 16 only allows cookie mutations in Server Actions and Route Handlers.
 */
export async function markWelcomeSeen() {
  const store = await cookies();
  store.set("oi_welcome_seen", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
