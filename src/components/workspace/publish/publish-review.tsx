"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, ExternalLink, Globe2, QrCode, Search, Send, UserRound } from "lucide-react";
import type { WorkspaceCardDTO } from "@/dto";
import { Button } from "@/design/components";
import { Avatar, Badge } from "@/components/ui";
import { buildProfileUrl, buildWorkspaceBuilderPath } from "@/lib/public-links";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { validateProfileFields, type ProfileFields } from "@/validation/fields";
import { InspectorCard } from "../shared";
import { PublicQRCode } from "./public-qr-code";
import { resolvePublishAction } from "./publish-state";
import { UsernameEditor, type UsernameEditorState } from "./username-editor";

type ApiEnvelope<T> = { success?: boolean; data?: T; error?: { message?: string }; message?: string };
type SerializedWorkspaceCard = Omit<WorkspaceCardDTO, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

function dateLabel(value: Date | string | null | undefined): string {
  if (!value) return "Not yet";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "Not yet" : date.toLocaleString();
}

function responseMessage(payload: ApiEnvelope<unknown>): string {
  return payload.error?.message ?? payload.message ?? "The publication request failed.";
}

function deserializeCard(card: SerializedWorkspaceCard): WorkspaceCardDTO {
  return {
    ...card,
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
    publishedAt: card.publishedAt ? new Date(card.publishedAt) : null,
  };
}

export function PublishReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const card = useCardEditorStore((state) => state.card);
  const cardId = useCardEditorStore((state) => state.cardId);
  const currentUsername = useCardEditorStore((state) => state.slug);
  const editorToken = useCardEditorStore((state) => state.editorToken);
  const profile = useCardEditorStore((state) => state.profile);
  const avatarUrl = useCardEditorStore((state) => state.media.avatarUrl);
  const saveState = useCardEditorStore((state) => state.saveState);
  const saveMessage = useCardEditorStore((state) => state.saveMessage);
  const saveCard = useCardEditorStore((state) => state.saveCard);
  const applySlug = useCardEditorStore((state) => state.applySlug);
  const applyServerCard = useCardEditorStore((state) => state.applyServerCard);
  const [username, setUsername] = useState(currentUsername);
  const [usernameState, setUsernameState] = useState<UsernameEditorState>({ available: true, checking: false, current: true, valid: true });
  const [operation, setOperation] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [operationMessage, setOperationMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const publicUrl = buildProfileUrl(username || currentUsername);
  const validationErrors = useMemo(
    () => profile ? validateProfileFields(profile as ProfileFields) : { fullName: "A profile name is required." },
    [profile],
  );
  const hasValidationErrors = Boolean(validationErrors && Object.keys(validationErrors).length);
  const usernameReady = usernameState.valid && usernameState.available && usernameState.current && username === currentUsername;
  const action = resolvePublishAction({
    status: card?.status ?? "DRAFT",
    saveState,
    usernameReady,
    hasValidationErrors,
    operationPending: operation === "pending",
  });

  const handleUsernameState = useCallback((next: UsernameEditorState) => {
    setUsernameState(next);
    setOperation("idle");
    setOperationMessage("");
  }, []);

  if (!card || !cardId || !profile) {
    return <div className="h-40 animate-pulse rounded-2xl bg-workspace-surface-dim" aria-label="Loading publication review" />;
  }

  const sessionToken = editorToken ?? "0".repeat(64);
  const published = card.status === "PUBLISHED";
  const title = card.seoTitle ?? profile.fullName ?? card.name;
  const description = card.seoDescription ?? profile.bio ?? "No public description yet.";

  const usernameSaved = (next: string) => {
    applySlug(next);
    setUsername(next);
    setUsernameState({ available: true, checking: false, current: true, valid: true });
    if (searchParams.has("adminCardId")) router.refresh();
    else router.replace(buildWorkspaceBuilderPath(next));
  };

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const performAction = async () => {
    if (action.disabled) return;
    setOperation("pending");
    setOperationMessage("");
    try {
      if (action.kind === "UPDATE") {
        await saveCard();
        const next = useCardEditorStore.getState();
        if (next.saveState !== "saved") throw new Error(next.saveMessage || "Some changes could not be saved.");
        setOperation("success");
        setOperationMessage("Your latest saved changes are live.");
        return;
      }
      const response = await fetch(`/cards/${cardId}/publication`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, action: "PUBLISH" }),
      });
      const payload = (await response.json()) as ApiEnvelope<SerializedWorkspaceCard>;
      if (!response.ok || !payload.data) throw new Error(responseMessage(payload));
      applyServerCard(deserializeCard(payload.data));
      setOperation("success");
      setOperationMessage("Published successfully. Your public card is now live.");
    } catch (error) {
      setOperation("error");
      setOperationMessage(error instanceof Error ? error.message : "The publication request failed.");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="studio-stamp">Final review</span>
          <Badge variant={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-workspace-text-secondary">Confirm the identity, destination, and search preview visitors will see.</p>
      </div>

      <InspectorCard defaultExpanded icon={<UserRound size={18} />} title="Username" description="Your canonical public identity.">
        <UsernameEditor
          cardId={cardId}
          currentUsername={currentUsername}
          key={currentUsername}
          onChange={(next) => {
            setUsername(next);
            setOperation("idle");
          }}
          onSaved={usernameSaved}
          onStateChange={handleUsernameState}
          sessionToken={sessionToken}
          value={username}
        />
      </InspectorCard>

      <InspectorCard defaultExpanded icon={<Globe2 size={18} />} title="Public URL" summary={<span className="break-all">{publicUrl}</span>}>
        <div className="space-y-3">
          <code className="block break-all rounded-xl border border-workspace-outline/30 bg-workspace-surface-dim p-3 text-xs text-workspace-text-secondary">{publicUrl}</code>
          <div className="grid grid-cols-2 gap-2">
            <Button leftIcon={copied ? <Check /> : <Copy />} onClick={() => void copyPublicUrl()} size="xs" variant="secondary">{copied ? "Copied" : "Copy"}</Button>
            <Button leftIcon={<ExternalLink />} onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")} size="xs" variant="ghost">Open</Button>
          </div>
        </div>
      </InspectorCard>

      <InspectorCard defaultExpanded icon={<QrCode size={18} />} title="QR Code" description="Always points to the canonical public URL.">
        <PublicQRCode fileName={`${username || currentUsername}-card-qr`} value={publicUrl} />
      </InspectorCard>

      <InspectorCard defaultExpanded icon={<Send size={18} />} title="Publication status">
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-workspace-surface-dim p-3"><dt className="text-workspace-text-muted">Status</dt><dd className="mt-1 font-semibold text-workspace-text-primary">{published ? "Published" : "Draft"}</dd></div>
          <div className="rounded-xl bg-workspace-surface-dim p-3"><dt className="text-workspace-text-muted">Unsaved changes</dt><dd className="mt-1 font-semibold text-workspace-text-primary">{saveState === "saved" ? "None" : saveState === "saving" ? "Saving" : saveState === "error" ? "Save error" : "Pending"}</dd></div>
          <div className="col-span-2 rounded-xl bg-workspace-surface-dim p-3"><dt className="text-workspace-text-muted">Last published</dt><dd className="mt-1 font-semibold text-workspace-text-primary">{dateLabel(card.publishedAt)}</dd></div>
          <div className="col-span-2 rounded-xl bg-workspace-surface-dim p-3"><dt className="text-workspace-text-muted">Last updated</dt><dd className="mt-1 font-semibold text-workspace-text-primary">{dateLabel(card.updatedAt)}</dd></div>
        </dl>
      </InspectorCard>

      <InspectorCard defaultExpanded icon={<Search size={18} />} title="SEO preview" description="Uses the same title and description fallbacks as the public profile.">
        <article className="rounded-2xl border border-workspace-outline/30 bg-white p-4 shadow-sm" aria-label="Search result preview">
          <div className="mb-3 flex items-center gap-3">
            <Avatar alt="Public card avatar" fallback={profile.fullName} size="md" src={avatarUrl} />
            <div className="min-w-0"><p className="truncate text-xs font-semibold text-workspace-text-primary">{profile.fullName}</p><p className="truncate text-[11px] text-workspace-text-muted">{profile.headline || profile.company || "Digital business card"}</p></div>
          </div>
          <p className="truncate text-xs text-emerald-700">{publicUrl}</p>
          <h3 className="mt-1 text-base font-semibold text-blue-700">{title}</h3>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-workspace-text-secondary">{description}</p>
        </article>
      </InspectorCard>

      <div className="rounded-[20px] border border-workspace-primary/20 bg-workspace-primary-muted/30 p-5 shadow-sm">
        <Button disabled={action.disabled} fullWidth loading={operation === "pending"} loadingLabel={action.label} onClick={() => void performAction()} size="lg">{action.label}</Button>
        {saveState === "error" && saveMessage ? <p className="mt-3 text-xs text-red-600" role="alert">{saveMessage}</p> : null}
        {operationMessage ? <p className={`mt-3 text-xs ${operation === "error" ? "text-red-600" : "text-emerald-700"}`} role={operation === "error" ? "alert" : "status"}>{operationMessage}</p> : null}
      </div>
    </>
  );
}
