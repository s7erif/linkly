import type { CardStatus } from "@/types";
import type { CardEditorState } from "@/store/use-card-editor-store";

export interface PublishReadiness {
  status: CardStatus;
  saveState: CardEditorState["saveState"];
  usernameReady: boolean;
  hasValidationErrors: boolean;
  operationPending: boolean;
}

export interface PublishActionState {
  disabled: boolean;
  kind: "PUBLISH" | "UPDATE" | "NONE";
  label: string;
}

export function resolvePublishAction(input: PublishReadiness): PublishActionState {
  if (input.operationPending) {
    return {
      disabled: true,
      kind: input.status === "PUBLISHED" ? "UPDATE" : "PUBLISH",
      label: input.status === "PUBLISHED" ? "Updating live card..." : "Publishing...",
    };
  }
  if (!input.usernameReady) {
    return { disabled: true, kind: "NONE", label: "Save username first" };
  }
  if (input.hasValidationErrors) {
    return { disabled: true, kind: "NONE", label: "Fix validation errors" };
  }
  if (input.saveState === "saving") {
    return { disabled: true, kind: "NONE", label: "Saving changes..." };
  }
  if (input.saveState === "error") {
    return { disabled: true, kind: "NONE", label: "Resolve save error" };
  }
  if (input.status === "PUBLISHED") {
    return input.saveState === "dirty"
      ? { disabled: false, kind: "UPDATE", label: "Update Live Card" }
      : { disabled: true, kind: "NONE", label: "No unpublished changes" };
  }
  if (input.status === "DRAFT" || input.status === "UNPUBLISHED") {
    return input.saveState === "saved"
      ? { disabled: false, kind: "PUBLISH", label: "Publish" }
      : { disabled: true, kind: "NONE", label: "Waiting for autosave" };
  }
  return { disabled: true, kind: "NONE", label: "Restore before publishing" };
}
