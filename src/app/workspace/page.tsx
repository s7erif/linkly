import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppearanceEditor } from "@/features/appearance/AppearanceEditor";
import { AdminModeBanner } from "@/features/appearance/AdminModeBanner";
import { WorkspaceCardLauncher, WorkspaceWelcome } from "@/features/customer-onboarding/CustomerOnboarding";
import { adminWorkspace, getActivationService, getNfcCardService } from "@/lib/composition-root";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { buildProfileUrl } from "@/lib/public-links";
import { Container } from "@/design/primitives";
import styles from "./workspace.module.css";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; adminCardId?: string }>;
}) {
  const { slug, adminCardId } = await searchParams;
  if (adminCardId) {
    const authorization = await getWorkspaceAdminAuthorization();
    if (!authorization) notFound();
    const data = await adminWorkspace.read(authorization.adminEmail, adminCardId);
    const nfcCards = await getNfcCardService().list({ search: data.card.slug, page: 1, pageSize: 100, sortDirection: "desc" });
    return (
      <AppearanceEditor
        slug={data.card.slug}
        initialCard={data.card}
        adminBanner={<AdminModeBanner data={data} nfcCards={nfcCards.items.map((card) => ({ activationToken: card.activationToken, activationUrl: getNfcCardService().activationUrl(card.activationToken), publicProfileUrl: buildProfileUrl(data.card.slug), status: card.status }))} />}
      />
    );
  }

  if (slug) return <AppearanceEditor slug={slug} />;

  const session = (await cookies()).get("oi_customer_session")?.value;
  const account = session ? await getActivationService().accountForSession(session) : null;
  if (!account?.workspace) redirect("/login");

  const cards = account.workspace.cards ?? [];
  const displayName = account.displayName?.trim() || "Customer";

  return (
    <main className={styles.page}>
      <Container className={styles.container} size="lg">
        {cards.length
          ? <WorkspaceCardLauncher cards={cards} />
          : <WorkspaceWelcome displayName={displayName} />}
      </Container>
    </main>
  );
}
