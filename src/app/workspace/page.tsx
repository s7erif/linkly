import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminWorkspace, getActivationService, readWorkspaceCard } from "@/lib/composition-root";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { WorkspacePageContent } from "@/components/workspace/workspace-page-content";

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

  // ── Auto-create first card when customer has none ───────────────
  if (cards.length === 0 && !slug) {
    try {
      const created = await service.createDigitalCardForSession(session!);
      redirect(`/workspace?slug=${encodeURIComponent(created.slug)}`);
    } catch {
      return <WorkspacePageContent cards={[]} />;
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

    console.log("[workspace/page] dto.buttons:", dto.buttons?.length ?? 0, "IDs:", dto.buttons?.map((b: { id: string }) => b.id));
    console.log("[workspace/page] dto.editorButtons:", dto.editorButtons?.length ?? 0, "IDs:", dto.editorButtons?.map((b: { id: string }) => b.id));
    console.log("[workspace/page] dto.socialLinks:", dto.socialLinks?.length ?? 0);
    console.log("[workspace/page] dto.editorSocialLinks:", dto.editorSocialLinks?.length ?? 0);

    return (
      <WorkspacePageContent
        key={slug}
        cards={cards}
        initialCard={dto}
        slug={slug}
        editorToken={opened.editorToken}
        editorExpiresAt={opened.editorExpiresAt.toISOString()}
      />
    );
  }

  // ── Multiple cards, no slug → show card selector ────────────────
  return <WorkspacePageContent key="picker" cards={cards} />;
}
