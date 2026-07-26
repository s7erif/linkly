"use client";

import { memo, useMemo } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { validateProfileFields, type ProfileFields, type ProfileFieldKey } from "@/validation/fields";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { Divider } from "@/components/ui/divider";

// ═══════════════════════════════════════════════════════════════════════════
// Individual field editors — read/write Zustand store, show validation
// errors and dirty indicators. Reuses the SAME Zod schemas as the server.
// ═══════════════════════════════════════════════════════════════════════════

export const DisplayNameEditor = memo(function DisplayNameEditor() {
  const value = useCardEditorStore((s) => s.profile?.fullName ?? "");
  const setField = useCardEditorStore((s) => s.setProfileField);
  const errors = useValidationErrors();

  return (
    <Input
      label="Name"
      value={value}
      onChange={(e) => setField("fullName", e.target.value)}
      placeholder="Full name"
      error={errors.fullName}
    />
  );
});

export const HeadlineEditor = memo(function HeadlineEditor() {
  const value = useCardEditorStore((s) => s.profile?.headline ?? "");
  const setField = useCardEditorStore((s) => s.setProfileField);
  const errors = useValidationErrors();

  return (
    <Input
      label="Role"
      value={value}
      onChange={(e) => setField("headline", e.target.value || null)}
      placeholder="Executive Creative Director"
      error={errors.headline}
    />
  );
});

export const CompanyEditor = memo(function CompanyEditor() {
  const value = useCardEditorStore((s) => s.profile?.company ?? "");
  const setField = useCardEditorStore((s) => s.setProfileField);
  const errors = useValidationErrors();

  return (
    <Input
      label="Company"
      value={value}
      onChange={(e) => setField("company", e.target.value || null)}
      placeholder="Company name"
      error={errors.company}
    />
  );
});

export const BioEditor = memo(function BioEditor() {
  const value = useCardEditorStore((s) => s.profile?.bio ?? "");
  const setField = useCardEditorStore((s) => s.setProfileField);
  const errors = useValidationErrors();

  return (
    <TextArea
      label="Narrative"
      value={value}
      onChange={(e) => setField("bio", e.target.value || null)}
      placeholder="Tell your story…"
      autoResize
      rows={4}
      error={errors.bio}
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Validation — reuses the same Zod schema as the server (validateProfileFields)
// ═══════════════════════════════════════════════════════════════════════════

type FieldErrors = Partial<Record<ProfileFieldKey, string>>;

function useValidationErrors(): FieldErrors {
  const profile = useCardEditorStore((s) => s.profile);
  const isHydrated = useCardEditorStore((s) => s.isHydrated);

  return useMemo(() => {
    if (!isHydrated || !profile) return {};
    // Only validate after hydration, not during initial render
    const errors = validateProfileFields(profile as ProfileFields);
    return errors ?? {};
  }, [profile, isHydrated]);
}

import { ProfilePhotoUploader } from "./profile-photo-uploader";

// ═══════════════════════════════════════════════════════════════════════════
// Save error banner
// ═══════════════════════════════════════════════════════════════════════════

function SaveErrorBanner() {
  const saveState = useCardEditorStore((s) => s.saveState);
  const saveMessage = useCardEditorStore((s) => s.saveMessage);
  const saveCard = useCardEditorStore((s) => s.saveCard);

  if (saveState !== "error") return null;

  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-red-700">Save Failed</p>
        <p className="text-xs text-red-600 mt-0.5">{saveMessage || "Unable to save changes."}</p>
      </div>
      <button
        type="button"
        onClick={() => saveCard()}
        className="text-xs font-bold text-red-600 hover:text-red-700 underline shrink-0"
      >
        Retry
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Save success indicator
// ═══════════════════════════════════════════════════════════════════════════

function SaveSuccessIndicator() {
  const saveState = useCardEditorStore((s) => s.saveState);

  if (saveState !== "saved") return null;

  return (
    <div className="flex items-center gap-2 text-emerald-600">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Identity section — composes all editors
// ═══════════════════════════════════════════════════════════════════════════

export function IdentityEditorSection() {
  const isHydrated = useCardEditorStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-4 w-24 bg-workspace-outline/20 rounded" />
        <div className="space-y-5">
          <div className="h-20 bg-workspace-outline/10 rounded-2xl" />
          <div className="h-20 bg-workspace-outline/10 rounded-2xl" />
          <div className="h-20 bg-workspace-outline/10 rounded-2xl" />
          <div className="h-32 bg-workspace-outline/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="studio-stamp">Profile Essence</span>
          <SaveSuccessIndicator />
        </div>
        <p className="text-sm text-workspace-text-secondary leading-relaxed">
          Your digital persona, refined for a premium presence.
        </p>
      </div>

      <Divider variant="subtle" />

      {/* Save error with retry */}
      <SaveErrorBanner />

      {/* Photo */}
      <InspectorCard title="Profile Photo">
        <ProfilePhotoUploader />
      </InspectorCard>

      {/* Identity fields */}
      <InspectorCard title="Brand Details">
        <div className="space-y-5">
          <DisplayNameEditor />
          <HeadlineEditor />
          <CompanyEditor />
          <BioEditor />
        </div>
      </InspectorCard>
    </>
  );
}
