"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardEditorStore, type EditorButton } from "@/store/use-card-editor-store";
import {
  LINK_REGISTRY,
  LINK_BY_TYPE,
  LINK_CATEGORIES,
  isValidLinkType,
  type LinkTypeId,
  type LinkTypeDefinition,
  type LinkCategory,
} from "@/features/links/link-registry";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Brand Meta & Subtitles
// ═══════════════════════════════════════════════════════════════════════════

interface PlatformMeta {
  color: string;
  bgColor: string;
  subtitle: string;
}

const PLATFORM_META: Record<string, PlatformMeta> = {
  WEBSITE: { color: "#4F46E5", bgColor: "#EEF2FF", subtitle: "Personal Site" },
  INSTAGRAM: { color: "#E4405F", bgColor: "#FDF2F8", subtitle: "Photos • Reels" },
  FACEBOOK: { color: "#1877F2", bgColor: "#EFF6FF", subtitle: "Social • Page" },
  THREADS: { color: "#000000", bgColor: "#F8FAFC", subtitle: "Posts • Updates" },
  X: { color: "#0F172A", bgColor: "#F8FAFC", subtitle: "Posts • News" },
  TIKTOK: { color: "#000000", bgColor: "#F1F5F9", subtitle: "Short Videos" },
  YOUTUBE: { color: "#FF0000", bgColor: "#FEF2F2", subtitle: "Videos • Shorts" },
  LINKEDIN: { color: "#0A66C2", bgColor: "#EFF6FF", subtitle: "Network • Jobs" },
  GITHUB: { color: "#24292E", bgColor: "#F8FAFC", subtitle: "Code • Repos" },
  DISCORD: { color: "#5865F2", bgColor: "#EEF2FF", subtitle: "Community Chat" },
  TELEGRAM: { color: "#26A5E4", bgColor: "#F0F9FF", subtitle: "Direct Chat" },
  WHATSAPP: { color: "#25D366", bgColor: "#F0FDF4", subtitle: "Instant Messaging" },
  SPOTIFY: { color: "#1DB954", bgColor: "#F0FDF4", subtitle: "Music • Podcasts" },
  SOUNDCLOUD: { color: "#FF5500", bgColor: "#FFF7ED", subtitle: "Audio • Tracks" },
  PINTEREST: { color: "#E60023", bgColor: "#FEF2F2", subtitle: "Pins • Visuals" },
  SNAPCHAT: { color: "#D97706", bgColor: "#FEF3C7", subtitle: "Snaps • Stories" },
  REDDIT: { color: "#FF4500", bgColor: "#FFF7ED", subtitle: "Communities" },
  MEDIUM: { color: "#000000", bgColor: "#F8FAFC", subtitle: "Articles • Blog" },
  SUBSTACK: { color: "#FF6719", bgColor: "#FFF7ED", subtitle: "Newsletter" },
  CALENDLY: { color: "#006BFF", bgColor: "#EFF6FF", subtitle: "Book Meetings" },
  PAYPAL: { color: "#003087", bgColor: "#EFF6FF", subtitle: "Send Payment" },
  STRIPE: { color: "#635BFF", bgColor: "#EEF2FF", subtitle: "Checkout Link" },
  EMAIL: { color: "#EA4335", bgColor: "#FEF2F2", subtitle: "Send Email" },
  PHONE: { color: "#16A34A", bgColor: "#F0FDF4", subtitle: "Call Direct" },
  CUSTOM: { color: "#64748B", bgColor: "#F8FAFC", subtitle: "Custom URL" },
};

import { getPlatformIcon } from "@/features/links/platform-icons";

function PlatformIcon({ type, className }: { type: string; className?: string }) {
  return getPlatformIcon(type, { className, size: 20 });
}

// ═══════════════════════════════════════════════════════════════════════════
// Validation Helper
// ═══════════════════════════════════════════════════════════════════════════

interface FieldErrors {
  label?: string;
  url?: string;
}

function validateLink(data: { label: string; url: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.label.trim()) errors.label = "Title is required";
  if (!data.url.trim()) {
    errors.url = "URL is required";
  } else {
    try {
      new URL(data.url.startsWith("http") || data.url.startsWith("mailto:") || data.url.startsWith("tel:") ? data.url : `https://${data.url}`);
    } catch {
      errors.url = "Enter a valid URL";
    }
  }
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// PlatformPicker — Section 3: Bento/Linktree Style Platform Picker
// ═══════════════════════════════════════════════════════════════════════════

interface PlatformPickerProps {
  onSelect: (def: LinkTypeDefinition) => void;
  onCancel: () => void;
}

function PlatformPicker({ onSelect, onCancel }: PlatformPickerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return LINK_REGISTRY;
    const q = search.toLowerCase();
    return LINK_REGISTRY.filter((d) => d.label.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<LinkCategory, LinkTypeDefinition[]>();
    for (const cat of LINK_CATEGORIES) map.set(cat, []);
    for (const def of filtered) map.get(def.category)!.push(def);
    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xl shadow-slate-200/50 space-y-4 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Add Link
          </h3>
          <p className="text-xs text-slate-500">
            Select a platform card to add to your profile
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search platforms..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:outline-none focus:border-indigo-500 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all shadow-xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="max-h-[340px] overflow-y-auto space-y-4 pr-1 workspace-scrollbar">
        {grouped.map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-1">
              {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {items.map((def) => {
                const meta = PLATFORM_META[def.id] ?? PLATFORM_META.CUSTOM;
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => onSelect(def)}
                    className="flex flex-col p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-indigo-500/40 hover:bg-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/40 transition-all duration-150 text-left group active:scale-[0.98]"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-2 transition-transform group-hover:scale-105 border border-slate-100"
                      style={{ background: meta.bgColor }}
                    >
                      <PlatformIcon type={def.id} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {def.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {meta.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LinkConfigurationForm — Section 4: Minimal Configuration Form
// ═══════════════════════════════════════════════════════════════════════════

interface LinkFormData {
  type: LinkTypeId;
  label: string;
  url: string;
  displayMode: string;
  color: string | null;
  isVisible: boolean;
  openInNewTab: boolean;
  analyticsEnabled: boolean;
}

function LinkConfigurationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: LinkFormData;
  onSave: (data: LinkFormData) => void;
  onCancel: () => void;
}) {
  const def = LINK_BY_TYPE[initial.type] ?? LINK_BY_TYPE.CUSTOM;
  const meta = PLATFORM_META[initial.type] ?? PLATFORM_META.CUSTOM;

  const [label, setLabel] = useState(initial.label);
  const [url, setUrl] = useState(initial.url);
  const [displayMode, setDisplayMode] = useState(initial.displayMode);
  const [color, setColor] = useState<string | null>(initial.color);
  const [isVisible, setIsVisible] = useState(initial.isVisible);
  const [openInNewTab, setOpenInNewTab] = useState(initial.openInNewTab);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(initial.analyticsEnabled);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    let fullUrl = url.trim();
    if (fullUrl && def.urlPrefix && !fullUrl.startsWith("http") && !fullUrl.startsWith("mailto:") && !fullUrl.startsWith("tel:")) {
      fullUrl = `${def.urlPrefix}${fullUrl.replace(/^@/, "")}`;
    }

    const ve = validateLink({ label, url: fullUrl });
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;
    onSave({ type: initial.type, label: label.trim(), url: fullUrl, displayMode, color, isVisible, openInNewTab, analyticsEnabled });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800"
          style={{ background: meta.bgColor }}
        >
          <PlatformIcon type={initial.type} className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Configure {def.label}
          </h4>
          <p className="text-xs text-slate-400">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Button Title
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setErrors((p) => ({ ...p, label: undefined })); }}
            placeholder={def.label}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-xs font-semibold text-slate-900 dark:text-white"
            autoFocus
          />
          {errors.label && <p className="text-[10px] text-red-500 mt-1">{errors.label}</p>}
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            URL or Username
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            placeholder={def.urlPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-900 dark:text-white"
          />
          {errors.url && <p className="text-[10px] text-red-500 mt-1">{errors.url}</p>}
        </div>

        {/* Display Mode Segmented Control */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
            Display As
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setDisplayMode("BUTTON")}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 relative cursor-pointer select-none",
                displayMode === "BUTTON" || !displayMode || displayMode === ""
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="12" rx="3" />
                </svg>
                <span>Button</span>
              </div>
              <span className="text-[9px] font-normal text-slate-400 mt-0.5">Full-width button</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode("ICON")}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 relative cursor-pointer select-none",
                displayMode === "ICON"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <span>Icon</span>
              </div>
              <span className="text-[9px] font-normal text-slate-400 mt-0.5">Standalone icon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={!label.trim() || !url.trim()}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          Save Link
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LinkRow — Section 2: Premium Link List Card
// ═══════════════════════════════════════════════════════════════════════════

function LinkRow({
  button,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  index,
  total,
}: {
  button: EditorButton;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  index: number;
  total: number;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const type = isValidLinkType(button.type) ? (button.type as LinkTypeId) : "CUSTOM";
  const def = LINK_BY_TYPE[type] ?? LINK_BY_TYPE.CUSTOM;
  const meta = PLATFORM_META[type] ?? PLATFORM_META.CUSTOM;

  const shortUrl = button.url.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "bg-white dark:bg-slate-900 border rounded-2xl p-3.5 shadow-2xs hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-150 ease-out group relative flex items-center justify-between gap-3 select-none",
        button.isVisible
          ? "border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
          : "border-slate-100 dark:border-slate-800/40 opacity-60",
      )}
    >
      {/* Left: Platform Icon + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-2xs"
          style={{ background: meta.bgColor }}
        >
          <PlatformIcon type={type} className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              "text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate",
              !button.isVisible && "line-through text-slate-400 dark:text-slate-500",
            )}
          >
            {button.label}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[200px] mt-0.5">
            {shortUrl || def.urlPlaceholder}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Display Badge (Button / Icon) */}
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/60">
          {button.displayMode === "ICON" ? "Icon" : "Button"}
        </span>

        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={() => onToggle(button.id)}
          className={cn(
            "w-9 h-5 rounded-full p-0.5 transition-colors duration-150 relative focus:outline-none cursor-pointer",
            button.isVisible
              ? "bg-indigo-600 dark:bg-indigo-500"
              : "bg-slate-200 dark:bg-slate-700",
          )}
          title={button.isVisible ? "Visible on profile" : "Hidden from profile"}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out",
              button.isVisible ? "translate-x-4" : "translate-x-0",
            )}
          />
        </button>

        {/* Drag Handle */}
        <div className="flex items-center gap-1 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <button
            type="button"
            onClick={() => onMoveUp(button.id)}
            disabled={index === 0}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-all cursor-grab active:cursor-grabbing"
            title="Move up"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Three Dots Context Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(button.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(button.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(button.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LinksEditor — Main Component
// ═══════════════════════════════════════════════════════════════════════════

type ManagerMode =
  | { kind: "list" }
  | { kind: "add-platform" }
  | { kind: "add-config"; def: LinkTypeDefinition }
  | { kind: "edit"; buttonId: string };

export function LinksEditor() {
  const editorButtons = useCardEditorStore((s) => s.editorButtons);
  const setEditorButtons = useCardEditorStore((s) => s.setEditorButtons);
  const addButton = useCardEditorStore((s) => s.addButton);
  const updateButton = useCardEditorStore((s) => s.updateButton);
  const removeButton = useCardEditorStore((s) => s.removeButton);

  const [mode, setMode] = useState<ManagerMode>({ kind: "list" });

  const buttonsRef = useRef(editorButtons);
  useEffect(() => { buttonsRef.current = editorButtons; }, [editorButtons]);

  // Keyboard shortcut (Escape to cancel picker)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode.kind !== "list") {
        setMode({ kind: "list" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode.kind]);

  // Actions
  const handleToggle = useCallback((id: string) => {
    const b = buttonsRef.current.find((x) => x.id === id);
    if (b) updateButton(id, { isVisible: !b.isVisible });
  }, [updateButton]);

  const handleDelete = useCallback((id: string) => {
    removeButton(id);
  }, [removeButton]);

  const handleDuplicate = useCallback((id: string) => {
    const b = buttonsRef.current.find((x) => x.id === id);
    if (!b) return;
    addButton({
      ...b,
      id: crypto.randomUUID(),
      position: buttonsRef.current.length,
    });
  }, [addButton]);

  const handleMoveUp = useCallback((id: string) => {
    const arr = [...buttonsRef.current];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx <= 0) return;
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setEditorButtons(arr.map((x, i) => ({ ...x, position: i })));
  }, [setEditorButtons]);

  const handleMoveDown = useCallback((id: string) => {
    const arr = [...buttonsRef.current];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx < 0 || idx >= arr.length - 1) return;
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setEditorButtons(arr.map((x, i) => ({ ...x, position: i })));
  }, [setEditorButtons]);

  const handleAddSave = useCallback((data: LinkFormData) => {
    addButton({
      id: crypto.randomUUID(),
      type: data.type,
      label: data.label,
      url: data.url,
      position: buttonsRef.current.length,
      isVisible: data.isVisible,
      displayMode: data.displayMode,
      color: data.color,
      openInNewTab: data.openInNewTab,
      analyticsEnabled: data.analyticsEnabled,
    });
    setMode({ kind: "list" });
  }, [addButton]);

  const handleEditSave = useCallback((data: LinkFormData & { id: string }) => {
    updateButton(data.id, {
      label: data.label,
      url: data.url,
      type: data.type,
      displayMode: data.displayMode,
      color: data.color,
      isVisible: data.isVisible,
      openInNewTab: data.openInNewTab,
      analyticsEnabled: data.analyticsEnabled,
    });
    setMode({ kind: "list" });
  }, [updateButton]);

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* SECTION 1: Header */}
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
            EDITOR MODE
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Links Manager
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage the links shown on your profile.
          </p>
        </div>

        {/* Counter & Action CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/60">
            {editorButtons.length} {editorButtons.length === 1 ? "Link" : "Links"}
          </span>

          {mode.kind === "list" && (
            <button
              type="button"
              onClick={() => setMode({ kind: "add-platform" })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Add Link
            </button>
          )}
        </div>
      </div>

      {/* SECTION 3 & 4: Platform Picker & Config Forms */}
      <AnimatePresence mode="wait">
        {mode.kind === "add-platform" && (
          <PlatformPicker
            key="picker"
            onSelect={(def) => setMode({ kind: "add-config", def })}
            onCancel={() => setMode({ kind: "list" })}
          />
        )}

        {mode.kind === "add-config" && (
          <LinkConfigurationForm
            key="add-config"
            initial={{
              type: mode.def.id,
              label: mode.def.label,
              url: "",
              displayMode: "BUTTON",
              color: null,
              isVisible: true,
              openInNewTab: false,
              analyticsEnabled: false,
            }}
            onSave={handleAddSave}
            onCancel={() => setMode({ kind: "list" })}
          />
        )}

        {mode.kind === "edit" && (() => {
          const b = editorButtons.find((x) => x.id === mode.buttonId);
          if (!b) return null;
          const type = isValidLinkType(b.type) ? (b.type as LinkTypeId) : "CUSTOM";
          return (
            <LinkConfigurationForm
              key="edit-config"
              initial={{
                type,
                label: b.label,
                url: b.url,
                displayMode: b.displayMode ?? "BUTTON",
                color: b.color ?? null,
                isVisible: b.isVisible,
                openInNewTab: b.openInNewTab,
                analyticsEnabled: b.analyticsEnabled,
              }}
              onSave={(data) => handleEditSave({ ...data, id: b.id })}
              onCancel={() => setMode({ kind: "list" })}
            />
          );
        })()}
      </AnimatePresence>

      {/* SECTION 2: Link List */}
      {mode.kind === "list" && (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {editorButtons.map((b, i) => (
              <LinkRow
                key={b.id}
                button={b}
                onToggle={handleToggle}
                onEdit={(id) => setMode({ kind: "edit", buttonId: id })}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                index={i}
                total={editorButtons.length}
              />
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {editorButtons.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs border border-indigo-100 dark:border-indigo-900/40">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Links Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-[260px] mx-auto mt-1">
                  Start building your digital identity by adding your first link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode({ kind: "add-platform" })}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                + Add Your First Link
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}


