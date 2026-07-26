"use client";

import { useEffect, useMemo, useState } from "react";
import type { CardProfileDTO, CardSectionDTO, PublicCardDTO, WorkspaceCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { rememberAdminWorkspaceCard, storeEditorSession } from "../workspace-session-client";

type SessionState = "checking" | "ready";

const defaultSections: readonly CardSectionDTO[] = (
  ["PROFILE", "ABOUT", "CONTACT", "BUTTONS", "SOCIAL_LINKS"] as const
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

const stripButton = (button: { id: string; label: string; url: string; position: number; isVisible: boolean }) => ({
  id: button.id, label: button.label, url: button.url, position: button.position,
});

const stripSocial = (link: { id: string; platform: string; label: string | null; url: string; position: number; isVisible: boolean }) => ({
  id: link.id, platform: link.platform, label: link.label, url: link.url, position: link.position,
});

export function useWorkspaceCard(
  initialCard: WorkspaceCardDTO | undefined,
  initialSlug: string,
  editorToken: string | undefined,
  editorExpiresAt: string | undefined,
) {
  // Initialize state from the server-provided initialCard on the VERY first
  // render so downstream consumers never see a "loading" skeleton flash.
  // sessionStorage writes remain deferred to useEffect (side-effect).
  const [card, setCard] = useState<WorkspaceCardDTO | null>(initialCard ?? null);
  const [appearance, setAppearance] = useState<AppearanceSettings | null>(
    initialCard?.appearance ?? null,
  );
  const [profile, setProfile] = useState<CardProfileDTO | null>(
    initialCard ? (initialCard.profile ?? emptyProfile(initialCard.name)) : null,
  );
  const [sections, setSections] = useState<readonly CardSectionDTO[]>(
    initialCard?.sections ?? defaultSections,
  );
  const [sessionState, setSessionState] = useState<SessionState>(
    initialCard ? "ready" : "checking",
  );

  const hydrate = (value: WorkspaceCardDTO) => {
    setCard(value);
    setAppearance(value.appearance);
    setProfile(value.profile ?? emptyProfile(value.name));
    setSections(value.sections ?? defaultSections);
    setSessionState("ready");
  };

  // sessionStorage side-effect — must stay in useEffect
  useEffect(() => {
    if (initialCard) {
      if (editorToken && editorExpiresAt) {
        storeEditorSession(initialCard.id, editorToken, editorExpiresAt, initialSlug);
      } else {
        rememberAdminWorkspaceCard(initialSlug, initialCard.id);
      }
    }
  }, [initialCard, initialSlug, editorToken, editorExpiresAt]);

  const editorButtons = useMemo(
    () => {
      const result = card?.editorButtons ??
        card?.buttons.map((b) => ({
          ...b,
          isVisible: true,
          type: "CUSTOM",
          displayMode: "BUTTON",
          color: null,
          openInNewTab: false,
          analyticsEnabled: false,
        })) ??
        [];
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.log("[useWorkspaceCard] card?.editorButtons:", card?.editorButtons?.map((b: { id: string }) => b.id));
        console.log("[useWorkspaceCard] card?.buttons:", card?.buttons?.map((b: { id: string }) => b.id));
        console.log("[useWorkspaceCard] editorButtons result:", result.map((b: { id: string }) => b.id));
      }
      return result;
    },
    [card],
  );
  const editorSocial = useMemo(
    () => card?.editorSocialLinks ?? card?.socialLinks.map((l) => ({ ...l, isVisible: true })) ?? [],
    [card],
  );
  const previewCard = useMemo<PublicCardDTO | null>(
    () => card && appearance && profile
      ? { ...card, profile, appearance, sections, buttons: editorButtons.filter((b) => b.isVisible).map(stripButton), socialLinks: editorSocial.filter((l) => l.isVisible).map(stripSocial) }
      : null,
    [card, appearance, profile, sections, editorButtons, editorSocial],
  );

  const replaceButtons = (buttons: WorkspaceCardDTO["editorButtons"]) => {
    if (card) setCard({ ...card, editorButtons: buttons });
  };
  const replaceSocial = (links: WorkspaceCardDTO["editorSocialLinks"]) => {
    if (card) setCard({ ...card, editorSocialLinks: links });
  };

  return { card, setCard, appearance, setAppearance, profile, setProfile, sections, setSections, sessionState, hydrate, previewCard, editorButtons, editorSocial, replaceButtons, replaceSocial };
}
