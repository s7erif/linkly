"use server";

import { cookies } from "next/headers";
import { getActivationService } from "@/lib/composition-root";
import { prisma } from "@/lib/database/prisma";

export interface OAuthProvisionResult {
  customerId: string;
  workspaceId: string;
  isNew: boolean;
}

/**
 * Provision a customer account from a verified Google OAuth profile.
 * - Existing account with matching email → link OAuth identity (keep password)
 * - No account → create Customer + Workspace + CustomerAccount (no password) + OAuth link
 */
export async function provisionGoogleCustomer(
  profile: { email: string; name: string; image?: string | null },
): Promise<OAuthProvisionResult> {
  const email = profile.email.toLowerCase().trim();
  const displayName = profile.name?.trim() || email.split("@")[0];

  return prisma.$transaction(async (tx) => {
    // Check for existing account
    const existing = await tx.customerAccount.findUnique({
      where: { email },
      select: { id: true, customerId: true, customer: { select: { workspaceId: true } } },
    });

    if (existing) {
      // Link OAuth to existing account
      await tx.customerOAuthAccount.upsert({
        where: { provider_providerAccountId: { provider: "google", providerAccountId: email } },
        create: { accountId: existing.id, provider: "google", providerAccountId: email },
        update: {},
      });
      return { customerId: existing.customerId, workspaceId: existing.customer.workspaceId, isNew: false };
    }

    // Create new customer with OAuth
    const workspace = await tx.workspace.create({ data: {}, select: { id: true } });
    const customer = await tx.customer.create({
      data: { workspaceId: workspace.id, displayName, email },
      select: { id: true },
    });
    const account = await tx.customerAccount.create({
      data: { customerId: customer.id, email },
      select: { id: true },
    });
    await tx.workspaceMembership.create({
      data: { workspaceId: workspace.id, accountId: account.id, role: "OWNER", status: "ACTIVE" },
    });
    await tx.customerOAuthAccount.create({
      data: { accountId: account.id, provider: "google", providerAccountId: email },
    });
    await tx.workspace.update({ where: { id: workspace.id }, data: { customerId: customer.id } });

    // Create a customer session so user is authenticated after redirect
    const token = crypto.randomUUID();
    const { createHash } = await import("node:crypto");
    const hash = createHash("sha256").update(token).digest();
    await tx.customerSession.create({
      data: { accountId: account.id, tokenHash: new Uint8Array(hash), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    const store = await cookies();
    store.set("oi_customer_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { customerId: customer.id, workspaceId: workspace.id, isNew: true };
  });
}
