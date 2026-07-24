"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { buildProfileUrl, getBaseUrl } from "@/lib/public-links";
import { suggestCardSlugs, isSlugReserved } from "@/lib/slug-generator";
import type {
  CardProfileDTO,
  CardSectionDTO,
  CardSectionKind,
  PublicCardDTO,
  WorkspaceCardDTO,
} from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { PreviewPanel } from "@/components/PreviewPanel";
import { SharePanel } from "@/components/SharePanel";
import { appearancePresets, copyPreset } from "./presets";
import {
  changeWorkspaceSlug,
  createWorkspaceButton,
  createWorkspaceSocialLink,
  deleteWorkspaceButton,
  deleteWorkspaceSocialLink,
  establishWorkspaceSession,
  fetchWorkspaceCard,
  rememberAdminWorkspaceCard,
  reorderWorkspaceButtons,
  reorderWorkspaceSocialLinks,
  saveWorkspaceMetadata,
  saveWorkspaceSections,
  updateWorkspaceAppearance,
  updateWorkspaceButton,
  updateWorkspaceProfile,
  updateWorkspacePublication,
  updateWorkspaceSocialLink,
  validateWorkspaceSlug,
  WorkspaceSessionError,
} from "./workspace-session-client";
import styles from "./appearance-editor.module.css";
import { BlockEditor } from "./BlockEditor";

type PanelId =
  | "blocks"
  | "basic"
  | "contact"
  | "social"
  | "buttons"
  | "appearance"
  | "seo"
  | "visibility";
type SaveState = "saved" | "dirty" | "saving" | "error";
type SessionState = "checking" | "required" | "creating" | "ready" | "failed";
const panels: ReadonlyArray<{ id: PanelId; icon: string; label: string }> = [
  { id: "blocks", icon: "▦", label: "Content Blocks" },
  { id: "basic", icon: "◉", label: "Basic Information" },
  { id: "contact", icon: "☎", label: "Contact Information" },
  { id: "social", icon: "↗", label: "Social Links" },
  { id: "buttons", icon: "▰", label: "Action Buttons" },
  { id: "appearance", icon: "✦", label: "Appearance" },
  { id: "seo", icon: "⌕", label: "SEO" },
  { id: "visibility", icon: "◫", label: "Visibility & Order" },
];
const sectionNames: Record<CardSectionKind, string> = {
  PROFILE: "Basic information",
  ABOUT: "About",
  CONTACT: "Contact",
  BUTTONS: "Action buttons",
  SOCIAL_LINKS: "Social links",
};
const appearanceKey: Record<
  CardSectionKind,
  keyof AppearanceSettings["sections"]
> = {
  PROFILE: "profile",
  ABOUT: "bio",
  CONTACT: "contact",
  BUTTONS: "buttons",
  SOCIAL_LINKS: "socialLinks",
};
const defaultSections: readonly CardSectionDTO[] = (
  Object.keys(sectionNames) as CardSectionKind[]
).map((kind, position) => ({
  id: `default-${kind}`,
  kind,
  title: null,
  position,
  isVisible: true,
}));
const emptyProfile = (name: string): CardProfileDTO => ({
  fullName: name,
  headline: null,
  company: null,
  bio: null,
  email: null,
  phone: null,
  website: null,
  address: null,
  countryCode: null,
});
const title = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
function move<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  return next;
}
const stripButton = (button: {
  id: string;
  label: string;
  url: string;
  position: number;
  isVisible: boolean;
}) => ({
  id: button.id,
  label: button.label,
  url: button.url,
  position: button.position,
});
const stripSocial = (link: {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  position: number;
  isVisible: boolean;
}) => ({
  id: link.id,
  platform: link.platform,
  label: link.label,
  url: link.url,
  position: link.position,
});

export function AppearanceEditor({ slug: initialSlug, initialCard, adminBanner }: { slug: string; initialCard?: WorkspaceCardDTO; adminBanner?: ReactNode }) {
  const [slug, setSlug] = useState(initialSlug),
    [slugDraft, setSlugDraft] = useState(initialSlug);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [card, setCard] = useState<WorkspaceCardDTO | null>(null),
    [appearance, setAppearance] = useState<AppearanceSettings | null>(null),
    [profile, setProfile] = useState<CardProfileDTO | null>(null),
    [sections, setSections] =
      useState<readonly CardSectionDTO[]>(defaultSections);
  const [openPanel, setOpenPanel] = useState<PanelId>("basic"),
    [saveState, setSaveState] = useState<SaveState>("saved"),
    [message, setMessage] = useState(""),
    [sessionState, setSessionState] = useState<SessionState>("checking"),
    [accessCode, setAccessCode] = useState(""),
    [sessionMessage, setSessionMessage] = useState("");
  const [publicationBusy, setPublicationBusy] = useState(false),
    [publicationMessage, setPublicationMessage] = useState("");
  const [newButton, setNewButton] = useState({
      label: "",
      url: "https://",
      isVisible: true,
    }),
    [newSocial, setNewSocial] = useState({
      platform: "LinkedIn",
      label: "",
      url: "https://",
      isVisible: true,
    });
  const [draggedSection, setDraggedSection] = useState<CardSectionKind | null>(
    null,
  );
  const [showGenerateLink, setShowGenerateLink] = useState(false),
    [suggestions, setSuggestions] = useState<string[]>([]),
    [suggestionIndex, setSuggestionIndex] = useState(0),
    [copied, setCopied] = useState(false),
    [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const isChecking = slugStatus === "checking";
  const hydrate = (value: WorkspaceCardDTO) => {
    setCard(value);
    setAppearance(value.appearance);
    setProfile(value.profile ?? emptyProfile(value.name));
    setSections(value.sections ?? defaultSections);
    setSlug(value.slug);
    setSlugDraft(value.slug);
    setSessionState("ready");
    setSessionMessage("");
    if (value.status !== "PUBLISHED") setPublishedSlug(null);
  };
  useEffect(() => {
    if (initialCard) {
      rememberAdminWorkspaceCard(initialSlug, initialCard.id);
      hydrate(initialCard);
      return;
    }
    fetchWorkspaceCard(initialSlug)
      .then(hydrate)
      .catch((error) => {
        if (
          error instanceof WorkspaceSessionError &&
          (error.status === 401 || error.status === 403)
        ) {
          setSessionState("required");
          setSessionMessage(error.message);
          return;
        }
        setSessionState("failed");
        setMessage(
          error instanceof Error ? error.message : "Unable to load workspace",
        );
      });
  }, [initialSlug, initialCard]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);
  useEffect(() => {
    const id = card?.id;
    if (!id || !slugDraft || slugDraft === slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugDraft)) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const handle = setTimeout(() => {
      validateWorkspaceSlug(id, slugDraft)
        .then((available) => setSlugStatus(available ? "available" : "taken"))
        .catch(() => setSlugStatus("idle"));
    }, 350);
    return () => clearTimeout(handle);
  }, [slugDraft, slug, card]);
  const markDirty = () => {
    setSaveState("dirty");
    setMessage("");
  };
  const knownSuffixes = useMemo(() => ["-business","-office","-work","-events","-store","-company","-2","-3","-4"], []);
  const deriveBaseSlug = useCallback(() => {
    for (const s of knownSuffixes) {
      if (slug.endsWith(s)) return slug.slice(0, -s.length);
    }
    return slug;
  }, [slug, knownSuffixes]);
  const generateSuggestions = useCallback(() => {
    const base = deriveBaseSlug();
    const list = suggestCardSlugs(base, new Set([slug]));
    setSuggestions(list.length ? list : [slug]);
    setSuggestionIndex(0);
    // Auto-select first suggestion if it differs from current slug
    if (list.length > 0 && list[0] !== slugDraft) {
      setSlugDraft(list[0]);
    }
  }, [deriveBaseSlug, slug, slugDraft]);
  const cycleSuggestion = useCallback(() => {
    if (!suggestions.length || isChecking) return;
    const next = (suggestionIndex + 1) % suggestions.length;
    setSuggestionIndex(next);
    const candidate = suggestions[next];
    if (candidate) {
      setSlugDraft(candidate);
      markDirty();
    }
  }, [suggestions, suggestionIndex, isChecking]);
  const openGenerateLink = useCallback(() => {
    generateSuggestions();
    setShowGenerateLink(true);
    setTimeout(() => slugInputRef.current?.focus(), 100);
  }, [generateSuggestions]);
  const closeGenerateLink = useCallback(() => {
    setShowGenerateLink(false);
    setCopied(false);
  }, []);
  const handleGenerateKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); closeGenerateLink(); }
  }, [closeGenerateLink]);
  const copyPublicLink = useCallback(async () => {
    const url = buildProfileUrl(slugDraft);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard unavailable */ }
  }, [slugDraft]);
  const patch = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K],
  ) => {
    setAppearance((current) =>
      current ? { ...current, [key]: value } : current,
    );
    markDirty();
  };
  const profilePatch = (key: keyof CardProfileDTO, value: string) => {
    setProfile((current) =>
      current ? { ...current, [key]: value || null } : current,
    );
    markDirty();
  };
  const choosePreset = (id: string) => {
    const preset = appearancePresets.find((item) => item.id === id);
    if (preset) {
      setAppearance(copyPreset(preset));
      markDirty();
    }
  };
  const editorButtons = useMemo(
    () =>
      card?.editorButtons ??
      card?.buttons.map((button) => ({ ...button, isVisible: true })) ??
      [],
    [card],
  );
  const editorSocial = useMemo(
    () =>
      card?.editorSocialLinks ??
      card?.socialLinks.map((link) => ({ ...link, isVisible: true })) ??
      [],
    [card],
  );
  const previewCard = useMemo<PublicCardDTO | null>(
    () =>
      card && appearance && profile
        ? {
            ...card,
            profile,
            appearance,
            sections,
            buttons: editorButtons
              .filter((item) => item.isVisible)
              .map(stripButton),
            socialLinks: editorSocial
              .filter((item) => item.isVisible)
              .map(stripSocial),
          }
        : null,
    [card, appearance, profile, sections, editorButtons, editorSocial],
  );
  const replaceButtons = (buttons: WorkspaceCardDTO["editorButtons"]) => {
    if (card) setCard({ ...card, editorButtons: buttons });
  };
  const replaceSocial = (links: WorkspaceCardDTO["editorSocialLinks"]) => {
    if (card) setCard({ ...card, editorSocialLinks: links });
  };
  async function refresh(value: Promise<WorkspaceCardDTO>) {
    setMessage("");
    try {
      const refreshed = await value;
      setCard(refreshed);
      setSections(refreshed.sections ?? sections);
      if (saveState !== "dirty") setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save changes",
      );
    }
  }
  async function save() {
    if (
      !card ||
      !appearance ||
      !profile ||
      saveState === "saving" ||
      sessionState !== "ready"
    )
      return;
    setSaveState("saving");
    setMessage("");
    try {
      if (slugDraft !== slug) {
        if (slugStatus === "taken" || !(await validateWorkspaceSlug(card.id, slugDraft)))
          throw new Error("This username is already taken.");
        await changeWorkspaceSlug(card.id, slug, slugDraft);
      }
      await updateWorkspaceProfile(card.id, profile);
      await updateWorkspaceAppearance(card.id, appearance);
      await saveWorkspaceSections(
        card.id,
        sections.map((section) => ({
          kind: section.kind,
          isVisible: section.isVisible,
          title: section.title,
        })),
      );
      await saveWorkspaceMetadata(card.id, {
        visibility: card.visibility,
        seoTitle: card.seoTitle ?? null,
        seoDescription: card.seoDescription ?? null,
      });
      for (const button of editorButtons)
        await updateWorkspaceButton(card.id, button.id, {
          label: button.label,
          url: button.url,
          isVisible: button.isVisible,
        });
      for (const link of editorSocial)
        await updateWorkspaceSocialLink(card.id, link.id, {
          platform: link.platform,
          label: link.label,
          url: link.url,
          isVisible: link.isVisible,
        });
      const nextSlug = slugDraft;
      if (nextSlug !== slug)
        window.history.replaceState(
          null,
          "",
          `/workspace?slug=${encodeURIComponent(nextSlug)}`,
        );
      hydrate(await fetchWorkspaceCard(nextSlug));
      setSaveState("saved");
    } catch (error) {
      if (
        error instanceof WorkspaceSessionError &&
        (error.status === 401 || error.status === 403)
      ) {
        setSessionState("required");
        setSessionMessage(error.message);
      }
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save changes",
      );
    }
  }
  async function changePublication(action: "PUBLISH" | "UNPUBLISH" | "RESTORE") {
    if (!card || publicationBusy || saveState !== "saved") return;
    setPublicationBusy(true);
    setPublicationMessage("");
    try {
      const result = await updateWorkspacePublication(card.id, action);
      if (action === "PUBLISH" && showGenerateLink) {
        setPublishedSlug(slugDraft);
        setShowGenerateLink(false);
      }
      hydrate(result);
    } catch (error) {
      setPublicationMessage(error instanceof Error ? error.message : "Unable to update publication status");
    } finally {
      setPublicationBusy(false);
    }
  }
  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessCode.trim() || sessionState === "creating") return;
    setSessionState("creating");
    setSessionMessage("");
    try {
      hydrate(await establishWorkspaceSession(initialSlug, accessCode));
      setAccessCode("");
    } catch (error) {
      setSessionState("failed");
      setSessionMessage(
        error instanceof Error
          ? error.message
          : "Unable to establish an editor session.",
      );
    }
  }
  async function addButton() {
    if (!card || !newButton.label.trim()) return;
    await refresh(createWorkspaceButton(card.id, newButton));
    setNewButton({ label: "", url: "https://", isVisible: true });
  }
  async function addSocial() {
    if (!card || !newSocial.platform.trim()) return;
    await refresh(
      createWorkspaceSocialLink(card.id, {
        ...newSocial,
        label: newSocial.label || null,
      }),
    );
    setNewSocial({
      platform: "LinkedIn",
      label: "",
      url: "https://",
      isVisible: true,
    });
  }
  function dropSection(target: CardSectionKind) {
    if (!draggedSection || draggedSection === target) return;
    const from = sections.findIndex((item) => item.kind === draggedSection),
      to = sections.findIndex((item) => item.kind === target);
    setSections(
      move(sections, from, to).map((item, position) => ({ ...item, position })),
    );
    setDraggedSection(null);
    markDirty();
  }
  if (
    (!card || !appearance || !profile) &&
    (sessionState === "required" ||
      sessionState === "failed" ||
      sessionState === "creating")
  )
    return (
      <main className={styles.sessionGate}>
        <form className={styles.sessionCard} onSubmit={unlock}>
          <span className={styles.sessionIcon}>⌁</span>
          <p className={styles.eyebrow}>Secure editor access</p>
          <h1>Unlock this Workspace</h1>
          <p>Enter the access code issued for this card.</p>
          <label>
            <span>Access code</span>
            <input
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              autoComplete="one-time-code"
              disabled={sessionState === "creating"}
              required
              autoFocus
            />
          </label>
          {sessionMessage && (
            <p className={styles.sessionError} role="alert">
              {sessionMessage}
            </p>
          )}
          <button disabled={!accessCode.trim() || sessionState === "creating"}>
            {sessionState === "creating"
              ? "Creating secure session…"
              : "Continue to editor"}
          </button>
        </form>
      </main>
    );
  if (!card || !appearance || !profile || !previewCard)
    return (
      <main className={styles.loading} aria-busy>
        <div className={styles.spinner} />
        <p>{message || "Preparing your workspace…"}</p>
      </main>
    );
  const activeCard = card;
  const subscription=activeCard.plan?.subscription;
  const subscriptionExpired=subscription?.status==="EXPIRED"||(subscription?.expiresAt?new Date(subscription.expiresAt).getTime()<=Date.now():false);
  const subscriptionLocked=!adminBanner&&Boolean(subscription)&&subscription?.status!=="ACTIVE"||!adminBanner&&subscriptionExpired;
  const daysRemaining=subscription?.expiresAt?Math.max(0,Math.ceil((new Date(subscription.expiresAt).getTime()-Date.now())/86_400_000)):null;
  const activeAppearance = appearance;
  const activeProfile = profile;
  const input = (
    key: keyof CardProfileDTO,
    label: string,
    type = "text",
    extra: Record<string, string> = {},
  ) => (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        {...extra}
        type={type}
        value={activeProfile[key] ?? ""}
        onChange={(event) => profilePatch(key, event.target.value)}
      />
    </label>
  );
  const itemDrop = async (
    kind: "button" | "social",
    from: number,
    to: number,
  ) => {
    if (from === to) return;
    if (kind === "button") {
      const next = move(editorButtons, from, to).map((item, position) => ({
        ...item,
        position,
      }));
      replaceButtons(next);
      await refresh(
        reorderWorkspaceButtons(
          activeCard.id,
          next.map((item) => item.id),
        ),
      );
    } else {
      const next = move(editorSocial, from, to).map((item, position) => ({
        ...item,
        position,
      }));
      replaceSocial(next);
      await refresh(
        reorderWorkspaceSocialLinks(
          activeCard.id,
          next.map((item) => item.id),
        ),
      );
    }
  };
  function content(id: PanelId) {
    if (id === "blocks")
      return <BlockEditor card={activeCard} onChange={setCard} />;
    if (id === "basic")
      return (
        <div className={styles.sectionBody}>
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>
              {activeProfile.fullName.slice(0, 1).toUpperCase() || "O"}
            </div>
            <div>
              <strong>Profile identity</strong>
              <p>Changes appear in preview instantly.</p>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            {input("fullName", "Full name")}
            {input("headline", "Headline")}
            {input("company", "Company")}
            <label className={`${styles.field} ${styles.stackField}`}>
              <span>About</span>
              <textarea
                rows={5}
                value={activeProfile.bio ?? ""}
                onChange={(event) => profilePatch("bio", event.target.value)}
              />
            </label>
          </div>
        </div>
      );
    if (id === "contact")
      return (
        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            {input("email", "Email", "email")}
            {input("phone", "Phone", "tel", { pattern: "[+0-9 ()\\-.]{7,40}" })}
            {input("website", "Website", "url")}
            {input("address", "Address")}
            {input("countryCode", "Country code", "text", { maxLength: "2" })}
          </div>
        </div>
      );
    if (id === "social")
      return (
        <div className={styles.sectionBody}>
          <div className={styles.collectionHeader}>
            <div>
              <h3>Social links</h3>
              <p>Drag rows or use arrows to reorder.</p>
            </div>
            <span>{editorSocial.length}</span>
          </div>
          <div className={styles.itemList}>
            {editorSocial.map((link, index) => (
              <div
                className={styles.editItem}
                draggable
                key={link.id}
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", String(index))
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) =>
                  void itemDrop(
                    "social",
                    Number(event.dataTransfer.getData("text/plain")),
                    index,
                  )
                }
              >
                <span className={styles.dragHandle}>⋮⋮</span>
                <span className={styles.orderButtons}>
                  <button
                    type="button"
                    aria-label="Move social link up"
                    disabled={index === 0}
                    onClick={() => void itemDrop("social", index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move social link down"
                    disabled={index === editorSocial.length - 1}
                    onClick={() => void itemDrop("social", index, index + 1)}
                  >
                    ↓
                  </button>
                </span>
                <input
                  aria-label="Platform"
                  value={link.platform}
                  onChange={(event) => {
                    replaceSocial(
                      editorSocial.map((item) =>
                        item.id === link.id
                          ? { ...item, platform: event.target.value }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                />
                <input
                  aria-label="Label"
                  placeholder="Label"
                  value={link.label ?? ""}
                  onChange={(event) => {
                    replaceSocial(
                      editorSocial.map((item) =>
                        item.id === link.id
                          ? { ...item, label: event.target.value || null }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                />
                <input
                  aria-label="URL"
                  type="url"
                  value={link.url}
                  onChange={(event) => {
                    replaceSocial(
                      editorSocial.map((item) =>
                        item.id === link.id
                          ? { ...item, url: event.target.value }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                />
                <label className={styles.iconToggle}>
                  <input
                    type="checkbox"
                    checked={link.isVisible}
                    onChange={(event) => {
                      replaceSocial(
                        editorSocial.map((item) =>
                          item.id === link.id
                            ? { ...item, isVisible: event.target.checked }
                            : item,
                        ),
                      );
                      markDirty();
                    }}
                  />
                  Visible
                </label>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() =>
                    void refresh(
                      deleteWorkspaceSocialLink(activeCard.id, link.id),
                    )
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow}>
            <input
              aria-label="New platform"
              value={newSocial.platform}
              onChange={(event) =>
                setNewSocial({ ...newSocial, platform: event.target.value })
              }
            />
            <input
              aria-label="New label"
              placeholder="Label"
              value={newSocial.label}
              onChange={(event) =>
                setNewSocial({ ...newSocial, label: event.target.value })
              }
            />
            <input
              aria-label="New social URL"
              type="url"
              value={newSocial.url}
              onChange={(event) =>
                setNewSocial({ ...newSocial, url: event.target.value })
              }
            />
            <button type="button" onClick={() => void addSocial()}>
              Add link
            </button>
          </div>
        </div>
      );
    if (id === "buttons")
      return (
        <div className={styles.sectionBody}>
          <div className={styles.collectionHeader}>
            <div>
              <h3>CTA buttons</h3>
              <p>
                Call, WhatsApp, email, website, booking, or custom destinations.
              </p>
            </div>
            <span>{editorButtons.length}</span>
          </div>
          <div className={styles.itemList}>
            {editorButtons.map((button, index) => (
              <div
                className={styles.editItem}
                draggable
                key={button.id}
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", String(index))
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) =>
                  void itemDrop(
                    "button",
                    Number(event.dataTransfer.getData("text/plain")),
                    index,
                  )
                }
              >
                <span className={styles.dragHandle}>⋮⋮</span>
                <span className={styles.orderButtons}>
                  <button
                    type="button"
                    aria-label="Move button up"
                    disabled={index === 0}
                    onClick={() => void itemDrop("button", index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move button down"
                    disabled={index === editorButtons.length - 1}
                    onClick={() => void itemDrop("button", index, index + 1)}
                  >
                    ↓
                  </button>
                </span>
                <input
                  aria-label="Button label"
                  value={button.label}
                  onChange={(event) => {
                    replaceButtons(
                      editorButtons.map((item) =>
                        item.id === button.id
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                />
                <input
                  aria-label="Button URL"
                  value={button.url}
                  onChange={(event) => {
                    replaceButtons(
                      editorButtons.map((item) =>
                        item.id === button.id
                          ? { ...item, url: event.target.value }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                />
                <label className={styles.iconToggle}>
                  <input
                    type="checkbox"
                    checked={button.isVisible}
                    onChange={(event) => {
                      replaceButtons(
                        editorButtons.map((item) =>
                          item.id === button.id
                            ? { ...item, isVisible: event.target.checked }
                            : item,
                        ),
                      );
                      markDirty();
                    }}
                  />
                  Visible
                </label>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() =>
                    void refresh(
                      deleteWorkspaceButton(activeCard.id, button.id),
                    )
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow}>
            <input
              aria-label="New button label"
              placeholder="Book Appointment"
              value={newButton.label}
              onChange={(event) =>
                setNewButton({ ...newButton, label: event.target.value })
              }
            />
            <input
              aria-label="New button URL"
              placeholder="https://…"
              value={newButton.url}
              onChange={(event) =>
                setNewButton({ ...newButton, url: event.target.value })
              }
            />
            <button type="button" onClick={() => void addButton()}>
              Add button
            </button>
          </div>
        </div>
      );
    if (id === "appearance")
      return (
        <div className={styles.sectionBody}>
          <label className={`${styles.field} ${styles.presetSelect}`}>
            <span>Color preset</span>
            <select
              defaultValue=""
              onChange={(event) => choosePreset(event.target.value)}
            >
              <option value="" disabled>
                Choose preset
              </option>
              {appearancePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.presetGrid}>
            {appearancePresets.map((preset) => (
              <button
                type="button"
                className={styles.presetCard}
                key={preset.id}
                onClick={() => choosePreset(preset.id)}
              >
                <span
                  className={styles.presetPreview}
                  style={{
                    background:
                      preset.settings.background.style === "GRADIENT"
                        ? `linear-gradient(135deg,${preset.settings.background.gradientFrom},${preset.settings.background.gradientTo})`
                        : preset.settings.background.color,
                  }}
                />
                <strong>{preset.name}</strong>
                <small>{preset.description}</small>
              </button>
            ))}
          </div>
          <div className={styles.tokenGroup}>
            <h3>Custom colors</h3>
            {(["primary", "accent", "text", "mutedText"] as const).map(
              (key) => (
                <label className={styles.colorToken} key={key}>
                  <span>{title(key)}</span>
                  <span className={styles.colorValue}>
                    <input
                      type="color"
                      value={activeAppearance.colors[key]}
                      onChange={(event) =>
                        patch("colors", {
                          ...activeAppearance.colors,
                          [key]: event.target.value,
                        })
                      }
                    />
                    <code>{activeAppearance.colors[key]}</code>
                  </span>
                </label>
              ),
            )}
          </div>
          <div className={styles.tokenGroup}>
            <h3>Background</h3>
            <div className={styles.segmented}>
              {(["SOLID", "GRADIENT"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeAppearance.background.style === value
                      ? styles.segmentActive
                      : ""
                  }
                  onClick={() =>
                    patch("background", {
                      ...activeAppearance.background,
                      style: value,
                    })
                  }
                >
                  {title(value.toLowerCase())}
                </button>
              ))}
            </div>
            {(["color", "gradientFrom", "gradientTo"] as const).map((key) => (
              <label className={styles.colorToken} key={key}>
                <span>{title(key)}</span>
                <span className={styles.colorValue}>
                  <input
                    type="color"
                    value={activeAppearance.background[key]}
                    onChange={(event) =>
                      patch("background", {
                        ...activeAppearance.background,
                        [key]: event.target.value,
                      })
                    }
                  />
                  <code>{activeAppearance.background[key]}</code>
                </span>
              </label>
            ))}
          </div>
          <div className={styles.tokenGroup}>
            <h3>Typography</h3>
            <div className={styles.segmented}>
              {(["SYSTEM", "SANS", "SERIF"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeAppearance.typography === value
                      ? styles.segmentActive
                      : ""
                  }
                  onClick={() => patch("typography", value)}
                >
                  {title(value.toLowerCase())}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.tokenGroup}>
            <h3>Buttons</h3>
            <div className={styles.segmented}>
              {(["SOLID", "OUTLINE", "SOFT"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeAppearance.buttonStyle === value
                      ? styles.segmentActive
                      : ""
                  }
                  onClick={() => patch("buttonStyle", value)}
                >
                  {title(value.toLowerCase())}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.tokenGroup}>
            <h3>Card</h3>
            <label className={styles.rangeField}>
              <span>
                Radius <b>{activeAppearance.borderRadius}px</b>
              </span>
              <input
                type="range"
                min="0"
                max="32"
                value={activeAppearance.borderRadius}
                onChange={(event) =>
                  patch("borderRadius", Number(event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Shadow</span>
              <select
                value={activeAppearance.shadow}
                onChange={(event) =>
                  patch(
                    "shadow",
                    event.target.value as AppearanceSettings["shadow"],
                  )
                }
              >
                {(["NONE", "SMALL", "MEDIUM", "LARGE"] as const).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
          </div>
        </div>
      );
    if (id === "seo")
      return (
        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <label className={`${styles.field} ${styles.stackField}`}>
              <span>
                SEO title <small>{(activeCard.seoTitle ?? "").length}/70</small>
              </span>
              <input
                maxLength={70}
                value={activeCard.seoTitle ?? ""}
                onChange={(event) => {
                  setCard({
                    ...activeCard,
                    seoTitle: event.target.value || null,
                  });
                  markDirty();
                }}
              />
            </label>
            <label className={`${styles.field} ${styles.stackField}`}>
              <span>
                Description{" "}
                <small>{(activeCard.seoDescription ?? "").length}/180</small>
              </span>
              <textarea
                rows={4}
                maxLength={180}
                value={activeCard.seoDescription ?? ""}
                onChange={(event) => {
                  setCard({
                    ...activeCard,
                    seoDescription: event.target.value || null,
                  });
                  markDirty();
                }}
              />
            </label>
            <label className={`${styles.field} ${styles.stackField}`}>
              <span>Public slug</span>
              <input
                value={slugDraft}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                onChange={(event) => {
                  setSlugDraft(event.target.value.toLowerCase());
                  markDirty();
                }}
              />
              <small className={styles.hint}>{buildProfileUrl(slugDraft)}</small>
              {slugStatus === "checking" && <small className={styles.hint}>Checking availability…</small>}
              {slugStatus === "taken" && <small className={styles.hint} style={{ color: "#b42318" }}>This username is already taken.</small>}
              {slugStatus === "available" && slugDraft !== slug && <small className={styles.hint} style={{ color: "#29804b" }}>This username is available.</small>}
            </label>
          </div>
        </div>
      );
    return (
      <div className={styles.sectionBody}>
        <div className={styles.fieldGroup}>
          <label className={styles.field}>
            <span>Card visibility</span>
            <select
              value={activeCard.visibility}
              onChange={(event) => {
                setCard({
                  ...activeCard,
                  visibility: event.target
                    .value as WorkspaceCardDTO["visibility"],
                });
                markDirty();
              }}
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </label>
        </div>
        <div className={styles.tokenGroup}>
          <h3>Section visibility & order</h3>
          <p className={styles.note}>
            Drag sections into the order visitors should see.
          </p>
          <div className={styles.sectionOrder}>
            {sections.map((section) => (
              <div
                className={styles.orderItem}
                draggable
                key={section.kind}
                onDragStart={() => setDraggedSection(section.kind)}
                onDragOver={(event: DragEvent) => event.preventDefault()}
                onDrop={() => dropSection(section.kind)}
              >
                <span className={styles.dragHandle}>⋮⋮</span>
                <span className={styles.orderButtons}>
                  <button
                    type="button"
                    aria-label="Move section up"
                    disabled={section.position === 0}
                    onClick={() => {
                      setSections(
                        move(
                          sections,
                          section.position,
                          section.position - 1,
                        ).map((item, position) => ({ ...item, position })),
                      );
                      markDirty();
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move section down"
                    disabled={section.position === sections.length - 1}
                    onClick={() => {
                      setSections(
                        move(
                          sections,
                          section.position,
                          section.position + 1,
                        ).map((item, position) => ({ ...item, position })),
                      );
                      markDirty();
                    }}
                  >
                    ↓
                  </button>
                </span>
                <strong>{sectionNames[section.kind]}</strong>
                <label className={styles.iconToggle}>
                  <input
                    type="checkbox"
                    checked={section.isVisible}
                    onChange={(event) => {
                      const visible = event.target.checked;
                      setSections(
                        sections.map((item) =>
                          item.kind === section.kind
                            ? { ...item, isVisible: visible }
                            : item,
                        ),
                      );
                      setAppearance({
                        ...activeAppearance,
                        sections: {
                          ...activeAppearance.sections,
                          [appearanceKey[section.kind]]: visible,
                        },
                      });
                      markDirty();
                    }}
                  />
                  Show
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <main className={styles.workspace}>
      {adminBanner && <div className={styles.adminBannerSlot}>{adminBanner}</div>}
      {activeCard.plan && subscription && (
        <div className={styles.subscriptionBanner} role="status" aria-live="polite">
          <span className={styles.eyebrow}>Subscription</span>
          <strong>{subscriptionExpired ? "Subscription expired" : subscription.status === "ACTIVE" ? "Subscription active" : "Subscription inactive"}</strong>
          <span>{subscription.expiresAt ? `Expires ${new Date(subscription.expiresAt).toLocaleDateString()} · ${daysRemaining} days remaining` : "Contact support to activate your subscription."}</span>
          {subscriptionLocked && <span>Renew your subscription to restore Workspace management actions. Your public profile remains available. <Link href="mailto:support@oicards.com">Contact support</Link></span>}
        </div>
      )}
      <form
        className={styles.controls}
        onSubmit={(event) => {
          event.preventDefault();
          if (event.currentTarget.reportValidity()) void save();
        }}
      >
        <header className={styles.editorHeader}>
          <div>
            <p className={styles.eyebrow}>Visual Card Builder</p>
            <h1>{activeProfile.fullName || activeCard.name}</h1>
          </div>
          <div className={styles.publicationActions}>
            <div>
              <span className={[styles.liveBadge, activeCard.status === "PUBLISHED" && activeCard.visibility === "PUBLIC" ? "" : styles.draftLiveBadge].join(" ")}>
                <i /> {activeCard.status === "PUBLISHED" ? "Published" : activeCard.status === "ARCHIVED" ? "Archived" : "Draft"}
              </span>
              {activeCard.status === "PUBLISHED" && activeCard.publishedAt && (
                <small>Published {new Date(activeCard.publishedAt).toLocaleDateString()}</small>
              )}
              <small>{saveState !== "saved" ? "Save changes before changing publication." : ""}</small>
              {publicationMessage && <small className={styles.publicationError}>{publicationMessage}</small>}
            </div>
            {["DRAFT", "UNPUBLISHED"].includes(activeCard.status) && !showGenerateLink && (
              <button type="button" onClick={openGenerateLink}>
                Generate Link
              </button>
            )}
            {["DRAFT", "UNPUBLISHED"].includes(activeCard.status) && (
              <button type="button" disabled={subscriptionLocked || publicationBusy || isChecking || saveState !== "saved"} onClick={() => void changePublication("PUBLISH")}>
                {publicationBusy ? "Publishing…" : "Publish"}
              </button>
            )}
            {activeCard.status === "PUBLISHED" && (
              <button type="button" disabled={subscriptionLocked || publicationBusy || saveState !== "saved"} onClick={() => void changePublication("UNPUBLISH")}>
                {publicationBusy ? "Unpublishing…" : "Unpublish"}
              </button>
            )}
            {activeCard.status === "ARCHIVED" && (
              <button type="button" disabled={subscriptionLocked || publicationBusy || saveState !== "saved"} onClick={() => void changePublication("RESTORE")}>
                {publicationBusy ? "Restoring…" : "Restore"}
              </button>
            )}
          </div>
        </header>
        <AnimatePresence>
          {showGenerateLink && (
            <motion.div
              className={styles.generatePanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
              onKeyDown={handleGenerateKeyDown}
              role="region"
              aria-label="Generate Public Link"
            >
              <div className={styles.generatePanelInner}>
                <div className={styles.generatePanelFields}>
                  <label className={styles.stackField} htmlFor="gen-slug-input">
                    <span>Public Link</span>
                    <div className={styles.slugInputRow}>
                      <span className={styles.slugPrefix} aria-hidden="true">{getBaseUrl()}/@</span>
                      <input
                        id="gen-slug-input"
                        ref={slugInputRef}
                        value={slugDraft}
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        onChange={(event) => {
                          setSlugDraft(event.target.value.toLowerCase());
                          markDirty();
                        }}
                        placeholder="your-slug"
                        aria-label="Public link slug"
                        aria-describedby="gen-slug-status"
                      />
                    </div>
                  </label>
                  <motion.div
                    className={styles.slugStatus}
                    id="gen-slug-status"
                    role="status"
                    aria-live="polite"
                    key={slugStatus + slugDraft}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {(() => {
                      const v = slugDraft.trim();
                      if (!v) return <span className={styles.slugHint}>Enter a public link for your card.</span>;
                      if (v.length < 3) return <span className={styles.slugStatusRow}><i className={styles.slugStatusWarn}>⚠</i> Too short — at least 3 characters.</span>;
                      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) return <span className={styles.slugStatusRow}><i className={styles.slugStatusWarn}>⚠</i> Invalid characters — lowercase letters, numbers and hyphens only.</span>;
                      if (isSlugReserved(v)) return <span className={styles.slugStatusRow}><i className={styles.slugStatusWarn}>⚠</i> Reserved word — this name is not available.</span>;
                      if (slugStatus === "checking") return <span className={styles.slugStatusRow}><i className={styles.slugCheckingIcon} /> Checking availability…</span>;
                      if (slugStatus === "taken") return <span className={styles.slugStatusRow}><i className={styles.slugStatusWarn}>⚠</i> Already taken — try another one.</span>;
                      if (slugStatus === "available" && v !== slug) return <span className={styles.slugStatusRow}><i className={styles.slugStatusOk}>✓</i> Available</span>;
                      if (v === slug) return <span className={styles.slugHint}>This is your current public link.</span>;
                      return null;
                    })()}
                  </motion.div>
                </div>
                <div className={styles.generateActions}>
                  <button
                    type="button"
                    className={styles.generateAnother}
                    onClick={cycleSuggestion}
                    disabled={isChecking}
                    aria-label="Generate another suggestion"
                  >
                    Generate Another
                  </button>
                  <button
                    type="button"
                    className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                    onClick={copyPublicLink}
                    aria-label={copied ? "Public link copied" : "Copy public link"}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {publishedSlug && activeCard.status === "PUBLISHED" && (
            <motion.div
              className={styles.generatePanel}
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
              role="status"
              aria-label="Card published"
            >
              <div className={styles.generatePanelInner}>
                <div className={styles.generatePanelFields}>
                  <span className={styles.publishSuccess}>✓ Published</span>
                  <div className={styles.slugInputRow}>
                    <span className={styles.slugPrefix} aria-hidden="true">{getBaseUrl()}/@</span>
                    <input value={publishedSlug} readOnly aria-label="Published public link" />
                  </div>
                </div>
                <div className={styles.generateActions}>
                  <button
                    type="button"
                    className={styles.generateAnother}
                    onClick={() => {
                      navigator.clipboard.writeText(buildProfileUrl(publishedSlug)).catch(() => {});
                    }}
                    aria-label="Copy published link"
                  >
                    Copy Link
                  </button>
                  <Link href={buildProfileUrl(publishedSlug)} target="_blank" className={styles.generateAnother} aria-label="Open public profile">
                    Open ↗
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={styles.accordion}>
          {panels.map((panel) => {
            const expanded = openPanel === panel.id;
            return (
              <section
                className={`${styles.accordionCard} ${expanded ? styles.expanded : ""}`}
                key={panel.id}
              >
                <button
                  className={styles.accordionTrigger}
                  type="button"
                  onClick={() => setOpenPanel(panel.id)}
                  aria-expanded={expanded}
                >
                  <span className={styles.sectionIcon}>{panel.icon}</span>
                  <span>{panel.label}</span>
                  <i>⌄</i>
                </button>
                <div
                  className={styles.accordionContent}
                  inert={!expanded ? true : undefined}
                >
                  {expanded && content(panel.id)}
                </div>
              </section>
            );
          })}
        </div>
        <div className={styles.saveBar}>
          <div className={styles.saveStatus}>
            <span className={styles[saveState]} />
            <div>
              <strong>
                {saveState === "saved"
                  ? "Saved"
                  : saveState === "saving"
                    ? "Saving…"
                    : saveState === "error"
                      ? "Save failed"
                      : "Unsaved changes"}
              </strong>
              {message && <small>{message}</small>}
            </div>
          </div>
          {(saveState === "dirty" || saveState === "error") && (
            <button type="submit" disabled={subscriptionLocked}>Save Changes</button>
          )}
        </div>
      </form>
      <PreviewPanel card={previewCard} appearance={appearance} />
      <SharePanel slug={slug} status={activeCard.status} visibility={activeCard.visibility} />
    </main>
  );
}

export const MemoizedAppearanceEditor = memo(AppearanceEditor);
