import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActivationService, customerSubscriptionReadService } from "@/lib/composition-root";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import { WelcomeActions } from "./WelcomeActions";
import styles from "./welcome.module.css";

export const metadata = { title: "Welcome to your Workspace" };

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const store = await cookies();
  const session = store.get("oi_customer_session")?.value;
  const service = getActivationService();
  const account = session ? await service.accountForSession(session) : null;
  if (!account?.workspace) redirect("/login");

  const displayName = account.displayName?.trim() || "there";
  const subscription = account.customerId
    ? await customerSubscriptionReadService.activeForCustomer(account.customerId)
    : null;
  const plan = subscription?.plan ?? null;

  const firstCardSlug = account.workspace.cards?.[0]?.slug;
  const startHref = firstCardSlug ? buildWorkspaceBuilderPath(firstCardSlug) : "/workspace";

  const formatDate = (value: Date | null | undefined) =>
    value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  const intervalLabel = subscription?.billingInterval
    ? subscription.billingInterval.charAt(0) + subscription.billingInterval.slice(1).toLowerCase()
    : null;
  const planPrice =
    plan && subscription
      ? subscription.billingInterval === "YEARLY"
        ? plan.yearlyMinor ?? plan.monthlyMinor
        : plan.monthlyMinor
      : null;
  const formattedPrice =
    planPrice != null && plan
      ? new Intl.NumberFormat("en", { style: "currency", currency: plan.currency }).format(planPrice / 100)
      : null;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.approved}><span /> Account approved</span>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Welcome</p>
          <h1>Welcome, {displayName}!</h1>
          <p>
            Your account has been approved and your Workspace is ready. Choose your public username, build your card,
            and share it with the world.
          </p>
        </header>

        {plan && (
          <section className={styles.subscription}>
            <h2 className={styles.sectionTitle}>Your subscription</h2>
            <div className={styles.planRow}>
              <span className={styles.planName}>{plan.name}</span>
              {formattedPrice && intervalLabel ? (
                <span className={styles.planPrice}>{formattedPrice} / {intervalLabel.toLowerCase()}</span>
              ) : null}
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue}>{subscription?.status ?? "—"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Billing</span>
                <span className={styles.metaValue}>{intervalLabel ?? "—"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Renewed</span>
                <span className={styles.metaValue}>{formatDate(subscription?.renewedAt ?? subscription?.currentPeriodStart)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{subscription?.expiresAt ? "Expires" : "Next renewal"}</span>
                <span className={styles.metaValue}>{formatDate(subscription?.expiresAt ?? subscription?.currentPeriodEnd)}</span>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className={styles.sectionTitle}>Get started</h2>
          <ul className={styles.checklist}>
            <li><i>1</i> Choose your public username and profile link</li>
            <li><i>2</i> Add your photo, title, and contact details</li>
            <li><i>3</i> Add your social links and action buttons</li>
            <li><i>4</i> Publish your card and share it everywhere</li>
          </ul>
        </section>

        <div className={styles.actions}>
          <WelcomeActions startHref={startHref} workspaceHref="/workspace" />
        </div>
        <p className={styles.note}>This welcome screen is shown only once. You can access your Workspace anytime from the dashboard.</p>
      </div>
    </main>
  );
}
