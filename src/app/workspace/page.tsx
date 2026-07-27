import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminWorkspace, getActivationService, readWorkspaceCard } from "@/lib/composition-root";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { WorkspacePageContent } from "@/components/workspace/workspace-page-content";
import { prisma } from "@/lib/database/prisma";
import type { AccountCenterData } from "@/types/account-center";

/**
 * Build enriched account-center data for the customer session.
 * Queries subscription, workspace membership, and account metadata
 * to populate the premium account center panel.
 */
async function buildAccountCenterData(
  account: { id: string; customerId: string; displayName?: string; email: string; workspace: { id: string } | null },
  cardCount: number,
): Promise<AccountCenterData> {
  console.log("[TRACE:buildAccountCenterData] ENTERED");
  console.log("[TRACE:buildAccountCenterData] account.id:", account.id);
  console.log("[TRACE:buildAccountCenterData] account.customerId:", account.customerId);
  console.log("[TRACE:buildAccountCenterData] account.displayName:", account.displayName);
  console.log("[TRACE:buildAccountCenterData] account.email:", account.email);
  console.log("[TRACE:buildAccountCenterData] account.workspace:", account.workspace);
  console.log("[TRACE:buildAccountCenterData] cardCount:", cardCount);

  const sub = await prisma.subscription.findFirst({
    where: { customerId: account.customerId },
    include: { plan: true, planPrice: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("[TRACE:buildAccountCenterData] subscription query result:", sub ? { id: sub.id, status: sub.status, planName: sub.plan?.name, planPriceCadence: sub.planPrice?.cadence } : null);

  const membership = account.workspace
    ? await prisma.workspaceMembership.findFirst({
        where: { workspaceId: account.workspace.id, accountId: account.id },
      })
    : null;
  console.log("[TRACE:buildAccountCenterData] membership query result:", membership ? { role: membership.role, status: membership.status } : null);

  const customerAccount = await prisma.customerAccount.findUnique({
    where: { customerId: account.customerId },
    select: { createdAt: true },
  });
  console.log("[TRACE:buildAccountCenterData] customerAccount query result:", customerAccount ? { createdAt: customerAccount.createdAt?.toISOString() } : null);

  // Parse plan limits for card cap from JSON
  const planLimits = (sub?.plan?.limits ?? {}) as Record<string, unknown>;
  const cardsLimit =
    typeof planLimits.maxCards === "number" ? planLimits.maxCards : null;

  // Detect lifetime plan via planPrice cadence
  const isLifetime = sub?.planPrice?.cadence === "LIFETIME";

  const result: AccountCenterData = {
    user: {
      displayName: account.displayName ?? "User",
      email: account.email,
      avatarUrl: null,
    },
    subscription: sub
      ? {
          planName: sub.plan?.name ?? "Unknown Plan",
          status: sub.status as AccountCenterData["subscription"] extends infer S
            ? S extends { status: infer T } ? T : never
            : never,
          billingInterval: sub.billingInterval as AccountCenterData["subscription"] extends infer S
            ? S extends { billingInterval: infer T } ? T : never
            : never,
          startsAt: sub.startsAt?.toISOString() ?? null,
          expiresAt: sub.expiresAt?.toISOString() ?? null,
          renewedAt: sub.renewedAt?.toISOString() ?? null,
          isLifetime,
        }
      : null,
    usage: {
      cardsUsed: cardCount,
      cardsLimit,
    },
    workspace: account.workspace
      ? {
          name: account.displayName
            ? `${account.displayName}'s Workspace`
            : "My Workspace",
          id: account.workspace.id,
          role: (membership?.role ?? "MEMBER") as AccountCenterData["workspace"] extends infer W
            ? W extends { role: infer R } ? R : never
            : never,
        }
      : null,
    account: {
      customerId: account.customerId,
      createdAt: customerAccount?.createdAt?.toISOString() ?? new Date().toISOString(),
      lastLoginAt: null,
    },
  };

  console.log("[TRACE:buildAccountCenterData] FINAL RESULT:", JSON.stringify(result, null, 2));
  return result;
}

/**
 * Workspace V2 — Server-side page.
 *
 * Reuses the EXACT same business logic as the legacy page (page.legacy.tsx):
 * - Admin workspace mode (adminCardId query param)
 * - Customer session handling
 * - Auto-create first card
 * - Card builder entry via slug
 *
 * Delegates all UI rendering to WorkspacePageContent (client component).
 */
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; adminCardId?: string }>;
}) {
  const { slug, adminCardId } = await searchParams;

  // ── Admin workspace ──────────────────────────────────────────────
  if (adminCardId) {
    const authorization = await getWorkspaceAdminAuthorization();
    if (!authorization) notFound();
    const data = await adminWorkspace.read(authorization.adminEmail, adminCardId);

    return (
      <WorkspacePageContent
        key={data.card.slug}
        cards={[{ id: data.card.id, name: data.card.name, slug: data.card.slug }]}
        initialCard={data.card}
        slug={data.card.slug}
      />
    );
  }

  // ── Customer session ─────────────────────────────────────────────
  const store = await cookies();
  const session = store.get("oi_customer_session")?.value;
  const service = getActivationService();
  const account = session ? await service.accountForSession(session) : null;
  if (!account?.workspace) redirect("/login");

  const cards = (account.workspace.cards ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  // Enrich account data for the premium account center panel
  const accountData = await buildAccountCenterData(account, cards.length);

  // ── Auto-create first card when customer has none ───────────────
  if (cards.length === 0 && !slug) {
    try {
      const created = await service.createDigitalCardForSession(session!);
      redirect(`/workspace?slug=${encodeURIComponent(created.slug)}`);
    } catch {
      return (
        <WorkspacePageContent cards={[]} accountData={accountData} />
      );
    }
  }

  // ── Direct card-builder entry (slug present) ─────────────────────
  if (slug) {
    const card = cards.find((c) => c.slug === slug);
    if (!card) notFound();

    const opened = await service.openCardForSession(session!, card.id);
    const dto = await readWorkspaceCard.execute({
      cardId: card.id,
      sessionToken: opened.editorToken,
    });

    return (
      <WorkspacePageContent
        key={slug}
        cards={cards}
        initialCard={dto}
        slug={slug}
        editorToken={opened.editorToken}
        editorExpiresAt={opened.editorExpiresAt.toISOString()}
        accountData={accountData}
      />
    );
  }

  // ── Multiple cards, no slug → show card selector ────────────────
  return (
    <WorkspacePageContent key="picker" cards={cards} accountData={accountData} />
  );
}
