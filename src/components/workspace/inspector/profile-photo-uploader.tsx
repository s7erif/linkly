"use client";

import { useCallback, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { getEditorSessionToken } from "@/features/appearance/workspace-session-client";
import { cn } from "@/lib/utils";

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhotoUploader() {
  const reduced = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const profile = useCardEditorStore((s) => s.profile);
  const cardId = useCardEditorStore((s) => s.cardId);
  const currentAvatar = useCardEditorStore((s) => s.media.avatarUrl);
  const setAvatarUrl = useCardEditorStore((s) => s.setAvatarUrl);

  const [uploadState, setUploadState] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragging, setIsDragging] = useState(false);

  const fallback = (profile?.fullName ?? "U").slice(0, 2).toUpperCase();

  const uploadFile = useCallback(async (file: File) => {
    if (!cardId) {
      setUploadState({ isUploading: false, progress: 0, error: "Card not found" });
      return;
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: "Only JPG, PNG, and WEBP files are supported",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: "File size exceeds 5MB limit",
      });
      return;
    }

    setUploadState({ isUploading: true, progress: 0, error: null });

    try {
      const sessionToken = getEditorSessionToken(cardId);
      if (!sessionToken) throw new Error("No active session");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("cardId", cardId);
      formData.append("sessionToken", sessionToken);
      formData.append("role", "AVATAR");

      const response = await fetch("/api/cards/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json();
        // handleRoute envelope: { success: false, error: { code, message } }
        const msg = errorBody?.error?.message ?? errorBody?.message ?? "Upload failed";
        throw new Error(msg);
      }

      const envelope = await response.json();
      // handleRoute envelope: { success: true, data: { mediaAssetId, publicUrl } }
      const { publicUrl } = envelope?.data ?? envelope;

      // Store avatar URL in the media domain — never on the profile object
      setAvatarUrl(publicUrl ?? null);

      setUploadState({ isUploading: false, progress: 100, error: null });

      // Clear success message after delay
      setTimeout(() => {
        setUploadState({ isUploading: false, progress: 0, error: null });
      }, 2000);
    } catch (err) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, [cardId, setAvatarUrl]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    setAvatarUrl(null);
    setUploadState({ isUploading: false, progress: 0, error: null });
  }, [setAvatarUrl]);

  const handleClick = () => {
    if (!uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Upload Area */}
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative w-28 h-28 mx-auto cursor-pointer transition-all duration-300",
          isDragging && "scale-105"
        )}
      >
        {/* Hover Gradient */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-workspace-primary to-workspace-primary/60 opacity-0 transition-all duration-300",
            "group-hover:opacity-20 scale-110"
          )}
        />

        {/* Main Container */}
        <div
          className={cn(
            "w-full h-full rounded-full border-2 border-dashed flex items-center justify-center bg-workspace-surface-dim overflow-hidden relative shadow-inner",
            "transition-all duration-300",
            isDragging
              ? "border-workspace-primary bg-workspace-primary/10"
              : "border-workspace-outline/30 group-hover:border-workspace-primary/40"
          )}
        >
          {/* Loading Overlay */}
          {uploadState.isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded-full border-2 border-workspace-primary/30 border-t-workspace-primary"
                animate={reduced ? {} : { rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </div>
          )}

          {/* Content */}
          <div className="relative">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={fallback}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-workspace-primary uppercase select-none">
                {fallback}
              </div>
            )}

            {/* Upload Icon Overlay */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200",
                "group-hover:opacity-100",
                uploadState.isUploading && "opacity-0"
              )}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="sr-only"
          disabled={uploadState.isUploading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {currentAvatar && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploadState.isUploading}
            className="text-xs text-workspace-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      {/* Status Messages */}
      {uploadState.error && (
        <p className="text-xs text-red-500 text-center" role="alert">
          {uploadState.error}
        </p>
      )}

      {uploadState.progress === 100 && !uploadState.error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-emerald-600 text-center"
        >
          Photo updated successfully
        </motion.p>
      )}

      {/* Helper Text */}
      {!uploadState.error && uploadState.progress === 0 && (
        <p className="text-[10px] text-workspace-text-muted text-center max-w-[150px]">
          JPG, PNG, or WEBP. Max 5MB.
        </p>
      )}
    </div>
  );
}
