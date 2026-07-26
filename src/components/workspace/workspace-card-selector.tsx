"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  hasReusableEditorSession,
  storeEditorSession,
} from "@/features/appearance/workspace-session-client";
import {
  openCustomerCardAction,
  createDigitalCardAction,
  type CustomerOnboardingResult,
} from "@/features/customer-onboarding/actions";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import { cn } from "@/lib/utils";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { useCardEditorStore } from "@/store/use-card-editor-store";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface CardInfo {
  id: string;
  name: string;
  slug: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Top Navigation Header for Card Picker
// ═══════════════════════════════════════════════════════════════════════════

function CardPickerTopBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle ⌘K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 sticky top-0 z-30 pointer-events-none">
      <div className="pointer-events-auto w-full h-[72px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] px-5 sm:px-8 flex items-center justify-between gap-4 transition-all">
        {/* Left: Brand area */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-workspace-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-workspace-primary/20 shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Linkly
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-6 flex items-center justify-center">
          <div className="relative flex items-center w-full bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white border border-slate-200/60 focus-within:border-workspace-primary/50 rounded-full px-4 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-workspace-primary/20 shadow-inner">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cards..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-2.5 font-medium"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-xs">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right side spacer to keep search centered */}
        <div className="w-9 sm:w-28 shrink-0" />
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Hero Header
// ═══════════════════════════════════════════════════════════════════════════

function PickerHeader({
  cardCount,
  reduced,
}: {
  cardCount: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center space-y-5 max-w-2xl mx-auto my-8 sm:my-12 lg:my-16"
    >
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
          Continue Editing
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed text-balance">
          Pick a workspace to continue where you left off.
        </p>
      </div>

      {/* Glass badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-700 font-semibold tracking-wide">
          {cardCount} Active Card{cardCount !== 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Glass loading panel — shown when a card is being opened
// ═══════════════════════════════════════════════════════════════════════════

function GlassLoadingPanel({ cardName }: { cardName: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
    >
      <div className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08),0_4px_16px_rgba(109,93,246,0.06)] px-8 py-7 flex flex-col items-center gap-4 max-w-[300px] w-full">
        {/* Spinner */}
        <motion.div
          className="w-8 h-8 rounded-full border-[2.5px] border-workspace-primary/20 border-t-workspace-primary shadow-sm"
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-900">
            Opening {cardName}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please wait a moment
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Single card in the grid
// ═══════════════════════════════════════════════════════════════════════════

interface CardItemProps {
  card: CardInfo;
  isLoading: boolean;
  onClick: () => void;
  index: number;
  reduced: boolean;
  isAnyLoading: boolean;
}

function CardItem({
  card,
  isLoading,
  onClick,
  index,
  reduced,
  isAnyLoading,
}: CardItemProps) {
  const initials = card.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={
        reduced
          ? undefined
          : {
              opacity: isAnyLoading && !isLoading ? 0.35 : 1,
              scale: isAnyLoading && !isLoading ? 0.98 : 1,
              y: 0,
            }
      }
      whileHover={reduced || isLoading ? undefined : { y: -5, scale: 1.005 }}
      whileTap={reduced || isLoading ? undefined : { scale: 0.985 }}
      transition={{
        delay: 0.03 * index,
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full group"
    >
      <div
        onClick={isLoading ? undefined : onClick}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        onKeyDown={(e) => {
          if (!isLoading && (e.key === "Enter" || e.key === " ")) onClick();
        }}
        className={cn(
          "flex flex-col items-center justify-between gap-6 w-full h-full text-center p-7 lg:p-8 rounded-[28px] lg:rounded-[32px] cursor-pointer select-none relative overflow-hidden min-h-[220px]",
          "bg-white border border-slate-200/70",
          "shadow-[0_2px_8px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.03)]",
          "transition-all duration-180 ease-out",
          // Hover
          "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06),0_20px_48px_rgba(109,93,246,0.08)]",
          "hover:border-workspace-primary/30",
          // Loading / Active state
          isLoading && [
            "ring-2 ring-workspace-primary/40",
            "shadow-[0_0_40px_rgba(109,93,246,0.22)]",
            "border-workspace-primary/50",
            "-translate-y-1",
            "pointer-events-none",
          ],
        )}
      >
        {/* Top subtle highlight line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-80 pointer-events-none" />

        {/* Avatar area */}
        <div
          className={cn(
            "w-20 h-20 rounded-[22px] flex items-center justify-center shrink-0 transition-all duration-180 shadow-inner",
            isLoading
              ? "bg-workspace-primary/10 border border-workspace-primary/30 scale-105"
              : "bg-gradient-to-tr from-slate-100 via-indigo-50/50 to-purple-50/40 border border-slate-200/50 group-hover:scale-105 group-hover:border-workspace-primary/20 group-hover:from-indigo-50 group-hover:to-purple-50",
          )}
        >
          {isLoading ? (
            <motion.div
              className="w-7 h-7 rounded-full border-[2.5px] border-workspace-primary/20 border-t-workspace-primary"
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          ) : (
            <span className="text-xl font-bold text-workspace-primary tracking-tight">
              {initials}
            </span>
          )}
        </div>

        {/* Card info */}
        <div className="min-w-0 w-full flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "text-base font-bold truncate max-w-full tracking-tight transition-colors duration-150",
              isLoading
                ? "text-workspace-primary"
                : "text-slate-900 group-hover:text-workspace-primary",
            )}
          >
            {card.name}
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/70 border border-slate-200/40 text-xs font-medium text-slate-500 font-mono transition-colors duration-150 group-hover:bg-workspace-primary/5 group-hover:text-workspace-primary group-hover:border-workspace-primary/20 truncate max-w-full">
            {isLoading ? "Opening…" : `/${card.slug}`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Create-card placeholder
// ═══════════════════════════════════════════════════════════════════════════

interface CreatePlaceholderProps {
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
  reduced: boolean;
}

function CreatePlaceholder({
  pending,
  disabled,
  onClick,
  index,
  reduced,
}: CreatePlaceholderProps) {
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduced || disabled ? undefined : { y: -5, scale: 1.005 }}
      whileTap={reduced || disabled ? undefined : { scale: 0.985 }}
      transition={{
        delay: 0.03 * index,
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full group"
    >
      <div
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) onClick();
        }}
        className={cn(
          "flex flex-col items-center justify-between gap-6 w-full h-full text-center p-7 lg:p-8 rounded-[28px] lg:rounded-[32px] cursor-pointer select-none relative overflow-hidden min-h-[220px]",
          "border-2 border-dashed transition-all duration-180 ease-out",
          disabled
            ? "border-slate-200/40 opacity-40 pointer-events-none bg-slate-50/50"
            : "border-slate-200/80 hover:border-workspace-primary/40 bg-gradient-to-b from-white/70 via-slate-50/40 to-slate-100/50 hover:from-workspace-primary/[0.02] hover:to-workspace-primary/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,93,246,0.06)]",
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-[22px] flex items-center justify-center shrink-0 transition-all duration-180 shadow-sm",
            pending
              ? "bg-workspace-primary text-white scale-105"
              : "bg-slate-100/80 border border-slate-200/60 text-slate-400 group-hover:bg-workspace-primary/10 group-hover:text-workspace-primary group-hover:border-workspace-primary/30 group-hover:scale-105",
          )}
        >
          {pending ? (
            <motion.div
              className="w-7 h-7 rounded-full border-[2.5px] border-white/25 border-t-white"
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>

        <div className="min-w-0 w-full flex flex-col items-center">
          <div className="text-base font-bold text-slate-700 group-hover:text-workspace-primary transition-colors">
            {pending ? "Creating…" : "Create New Card"}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Start fresh
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Card selection view
// ═══════════════════════════════════════════════════════════════════════════

export function WorkspaceCardSelector({
  cards,
}: {
  cards: ReadonlyArray<CardInfo>;
}) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const [createPending, startCreateTransition] = useTransition();
  const [openingCardId, setOpeningCardId] = useState<string | null>(null);
  const [openingCardName, setOpeningCardName] = useState<string>("");
  const [error, setError] = useState("");
  const [pendingNavigate, setPendingNavigate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const saveState = useCardEditorStore((s) => s.saveState);

  const isBusy = createPending || openingCardId !== null;

  // Filter cards by search query
  const filteredCards = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Open existing card ────────────────────────────────────────────────

  const openCard = useCallback(
    async (cardId: string, slug: string, name: string) => {
      setError("");

      if (saveState === "dirty") {
        setPendingNavigate(slug);
        return;
      }

      // Fast path — navigate immediately
      if (hasReusableEditorSession(cardId)) {
        router.push(buildWorkspaceBuilderPath(slug));
        return;
      }

      setOpeningCardId(cardId);
      setOpeningCardName(name);

      try {
        const result: CustomerOnboardingResult =
          await openCustomerCardAction(cardId);
        if (
          !result.ok ||
          !result.cardId ||
          !result.slug ||
          !result.editorToken ||
          !result.editorExpiresAt
        ) {
          setError(result.message);
          setOpeningCardId(null);
          return;
        }
        storeEditorSession(
          result.cardId,
          result.editorToken,
          result.editorExpiresAt,
          result.slug,
        );
        router.push(buildWorkspaceBuilderPath(result.slug));
      } catch {
        setOpeningCardId(null);
      }
    },
    [router, saveState],
  );

  // ── Create new card ───────────────────────────────────────────────────

  const createCard = useCallback(() => {
    setError("");
    startCreateTransition(async () => {
      const result: CustomerOnboardingResult = await createDigitalCardAction();
      if (
        !result.ok ||
        !result.cardId ||
        !result.slug ||
        !result.editorToken ||
        !result.editorExpiresAt
      ) {
        setError(result.message);
        return;
      }
      storeEditorSession(
        result.cardId,
        result.editorToken,
        result.editorExpiresAt,
        result.slug,
      );
      router.push(buildWorkspaceBuilderPath(result.slug));
    });
  }, [router]);

  // ── Discard handler ───────────────────────────────────────────────────

  const handleConfirmDiscard = useCallback(() => {
    if (pendingNavigate) {
      const slug = pendingNavigate;
      setPendingNavigate(null);
      router.push(buildWorkspaceBuilderPath(slug));
    }
  }, [pendingNavigate, router]);

  const handleCancelDiscard = useCallback(() => {
    setPendingNavigate(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col">
      {/* Premium Top Navigation Bar */}
      <CardPickerTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 relative flex flex-col items-center justify-start w-full px-6 sm:px-10 lg:px-14 pb-16 lg:pb-24 transition-all duration-300",
          openingCardId && "backdrop-blur-sm",
        )}
      >
        <motion.div
          className="flex flex-col items-center text-center w-full max-w-[1400px]"
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Hero Section */}
          <PickerHeader cardCount={cards.length} reduced={reduced} />

          {/* Card grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mt-4">
            {filteredCards.map((card, i) => (
              <CardItem
                key={card.id}
                card={card}
                isLoading={openingCardId === card.id}
                onClick={() => openCard(card.id, card.slug, card.name)}
                index={i}
                reduced={reduced}
                isAnyLoading={openingCardId !== null}
              />
            ))}

            {searchQuery === "" && (
              <CreatePlaceholder
                pending={createPending}
                disabled={isBusy}
                onClick={createCard}
                index={cards.length}
                reduced={reduced}
              />
            )}
          </div>

          {/* Empty search state */}
          {filteredCards.length === 0 && searchQuery !== "" && (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-medium text-slate-500">
                No cards matching &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-workspace-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium mt-6" role="alert">
              {error}
            </p>
          )}
        </motion.div>

        {/* Glass loading panel */}
        {openingCardId && <GlassLoadingPanel cardName={openingCardName} />}
      </main>

      {/* Unsaved changes dialog */}
      {pendingNavigate && (
        <UnsavedChangesDialog
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      )}
    </div>
  );
}
