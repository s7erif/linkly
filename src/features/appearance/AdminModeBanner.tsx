import Link from "next/link";
import type { AdminWorkspaceDTO } from "@/use-cases/admin-workspace";
import { IssueCardPanel } from "@/features/admin/IssueCardPanel";
import { manageCardAction } from "@/features/admin/card-actions";
import { subscriptionAction } from "@/features/admin/subscription-actions";
import styles from "./admin-mode-banner.module.css";
import { buildProfileUrl } from "@/lib/public-links";

export function AdminModeBanner({ data, nfcCards = [] }: { data: AdminWorkspaceDTO; nfcCards?: readonly { activationToken: string; activationUrl: string; publicProfileUrl: string; status: string }[] }) {
  const subscription = data.plan.subscription;
  return (
    <aside className={styles.banner} aria-label="Administrator editing mode">
      <div className={styles.identity}>
        <strong>ADMIN MODE</strong>
        <span>Customer {data.customerId}</span>
        <span>Card {data.card.name}</span>
        <span>Plan {subscription?.plan.name ?? "None"}</span>
        <span>Status {data.card.status}</span>
        {nfcCards.map((card) => <span key={card.activationToken}>NFC {card.activationToken} · {card.status} · <a href={card.activationUrl}>Activation URL</a> · <a href={card.publicProfileUrl}>Profile URL</a></span>)}
      </div>
      <div className={styles.actions}>
        <Link href={buildProfileUrl(data.card.slug)} target="_blank">Open Public Card</Link>
        <details>
          <summary>Generate New Access Code</summary>
          <IssueCardPanel cardId={data.card.id} cardName={data.card.name} />
        </details>
        {subscription && (
          <form action={subscriptionAction}>
            <input type="hidden" name="id" value={subscription.id} />
            <button name="action" value="SUSPEND">Suspend Subscription</button>
          </form>
        )}
        <form action={manageCardAction} className={styles.transfer}>
          <input type="hidden" name="cardId" value={data.card.id} />
          <input name="customerId" aria-label="New customer ID" placeholder="New customer ID" required />
          <button name="action" value="TRANSFER">Transfer Ownership</button>
        </form>
        <form action={manageCardAction}>
          <input type="hidden" name="cardId" value={data.card.id} />
          <button className={styles.danger} name="action" value="DELETE">Delete Card</button>
        </form>
      </div>
    </aside>
  );
}
