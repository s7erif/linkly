import { z } from "zod";
import type { CardProfileDTO, PublicCardDTO, WorkspaceCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { loadAdminWorkspaceCard, loadWorkspaceCard } from "./actions";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;
const errorEnvelope = z.object({
  success: z.literal(false),
  error: z.object({ message: z.string() }),
});
const storedSession = z.object({
  token: z.string().regex(TOKEN_PATTERN),
  expiresAt: z.string().datetime(),
});
const storedCardId = z.string().uuid();

export class WorkspaceSessionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "WorkspaceSessionError";
  }
}
export const editorSessionKey = (cardId: string) => `editor-session:${cardId}`;
export const workspaceCardKey = (slug: string) => `workspace-card:${slug}`;
export const adminWorkspaceKey = (cardId: string) => `admin-workspace:${cardId}`;
export function rememberAdminWorkspaceCard(slug: string, cardId: string): void { rememberWorkspaceCard(slug, cardId); sessionStorage.setItem(adminWorkspaceKey(cardId), "true"); }
function isAdminWorkspace(cardId: string): boolean { return sessionStorage.getItem(adminWorkspaceKey(cardId)) === "true"; }
function parseStoredValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function getEditorSessionToken(cardId: string): string | null {
  const key = editorSessionKey(cardId),
    raw = sessionStorage.getItem(key);
  if (!raw) return null;
  const parsed = storedSession.safeParse(parseStoredValue(raw));
  if (!parsed.success || new Date(parsed.data.expiresAt) <= new Date()) {
    sessionStorage.removeItem(key);
    return null;
  }
  return parsed.data.token;
}
export function hasReusableEditorSession(cardId: string): boolean {
  return getEditorSessionToken(cardId) !== null;
}
export function clearEditorSession(cardId: string): void {
  sessionStorage.removeItem(editorSessionKey(cardId));
}
export function rememberWorkspaceCard(slug: string, cardId: string): void {
  sessionStorage.setItem(workspaceCardKey(slug), storedCardId.parse(cardId));
}
export function storeEditorSession(
  cardId: string,
  token: string,
  expiresAt: string,
  slug?: string,
): void {
  const value = storedSession.parse({ token, expiresAt });
  sessionStorage.setItem(editorSessionKey(cardId), JSON.stringify(value));
  if (slug) rememberWorkspaceCard(slug, cardId);
}
async function responseMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const parsed = errorEnvelope.safeParse(await response.json());
    return parsed.success ? parsed.data.error.message : fallback;
  } catch {
    return fallback;
  }
}
async function authenticatedUpdate(
  cardId: string,
  path: string,
  payload: Record<string, unknown>,
  method = "PUT",
): Promise<void> {
  const sessionToken = isAdminWorkspace(cardId)
    ? "0".repeat(64)
    : getEditorSessionToken(cardId);
  if (!sessionToken)
    throw new WorkspaceSessionError(
      "Your editor session is missing or expired.",
      401,
    );
  const response = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionToken, ...payload }),
  });
  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !isAdminWorkspace(cardId))
      clearEditorSession(cardId);
    throw new WorkspaceSessionError(
      await responseMessage(response, "Unable to save changes."),
      response.status,
    );
  }
}
export function updateWorkspaceProfile(
  cardId: string,
  profile: CardProfileDTO,
): Promise<void> {
  return authenticatedUpdate(cardId, `/cards/${cardId}/profile`, { profile });
}
export function updateWorkspaceAppearance(
  cardId: string,
  appearance: AppearanceSettings,
): Promise<void> {
  return authenticatedUpdate(cardId, `/cards/${cardId}/appearance`, {
    appearance,
  });
}
async function mutateWorkspaceCard(
  cardId: string,
  path: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<WorkspaceCardDTO> {
  await authenticatedUpdate(cardId, path, payload, method);
  if (isAdminWorkspace(cardId)) {
    const result = await loadAdminWorkspaceCard(cardId);
    if (!result.ok)
      throw new WorkspaceSessionError(result.message, result.status);
    return result.card;
  }
  const token = getEditorSessionToken(cardId);
  if (!token)
    throw new WorkspaceSessionError(
      "Your editor session is missing or expired.",
      401,
    );
  const result = await loadWorkspaceCard(cardId, token);
  if (!result.ok)
    throw new WorkspaceSessionError(result.message, result.status);
  return result.card;
}
export function saveWorkspaceSections(
  cardId: string,
  sections: ReadonlyArray<{
    kind: string;
    isVisible: boolean;
    title?: string | null;
  }>,
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/sections`, "PUT", {
    sections,
  });
}
export function createWorkspaceButton(
  cardId: string,
  input: { label: string; url: string; isVisible: boolean },
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/buttons`, "POST", input);
}
export function updateWorkspaceButton(
  cardId: string,
  buttonId: string,
  input: { label?: string; url?: string; isVisible?: boolean },
) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/buttons/${buttonId}`,
    "PATCH",
    input,
  );
}
export function deleteWorkspaceButton(cardId: string, buttonId: string) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/buttons/${buttonId}`,
    "DELETE",
    {},
  );
}
export function reorderWorkspaceButtons(
  cardId: string,
  buttonIds: readonly string[],
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/buttons`, "PUT", {
    buttonIds,
  });
}
export function createWorkspaceSocialLink(
  cardId: string,
  input: {
    platform: string;
    label: string | null;
    url: string;
    isVisible: boolean;
  },
) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/social-links`,
    "POST",
    input,
  );
}
export function updateWorkspaceSocialLink(
  cardId: string,
  socialLinkId: string,
  input: {
    platform?: string;
    label?: string | null;
    url?: string;
    isVisible?: boolean;
  },
) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/social-links/${socialLinkId}`,
    "PATCH",
    input,
  );
}
export function deleteWorkspaceSocialLink(
  cardId: string,
  socialLinkId: string,
) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/social-links/${socialLinkId}`,
    "DELETE",
    {},
  );
}
export function reorderWorkspaceSocialLinks(
  cardId: string,
  socialLinkIds: readonly string[],
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/social-links`, "PUT", {
    socialLinkIds,
  });
}
export function saveWorkspaceMetadata(
  cardId: string,
  input: {
    visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
    seoTitle: string | null;
    seoDescription: string | null;
  },
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/settings`, "PUT", input);
}
const slugAvailabilityEnvelope = z.object({
  success: z.literal(true),
  data: z.object({ slug: z.string(), available: z.boolean() }),
});
export async function validateWorkspaceSlug(
  cardId: string,
  slug: string,
): Promise<boolean> {
  const sessionToken = isAdminWorkspace(cardId) ? "0".repeat(64) : getEditorSessionToken(cardId);
  if (!sessionToken)
    throw new WorkspaceSessionError(
      "Your editor session is missing or expired.",
      401,
    );
  const response = await fetch(`/cards/${cardId}/slug`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionToken, slug }),
  });
  if (!response.ok)
    throw new WorkspaceSessionError(
      await responseMessage(response, "Unable to validate slug."),
      response.status,
    );
  return slugAvailabilityEnvelope.parse(await response.json()).data.available;
}
export async function changeWorkspaceSlug(
  cardId: string,
  oldSlug: string,
  slug: string,
): Promise<WorkspaceCardDTO> {
  const card = await mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/slug`,
    "PUT",
    { slug },
  );
  sessionStorage.removeItem(workspaceCardKey(oldSlug));
  rememberWorkspaceCard(slug, cardId);
  return card;
}
export function initializeWorkspaceBlocks(cardId: string) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/blocks/initialize`,
    "POST",
    {},
  );
}
export function createWorkspaceBlock(
  cardId: string,
  input: { kind: string; config: unknown; isEnabled: boolean },
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/blocks`, "POST", input);
}
export function updateWorkspaceBlock(
  cardId: string,
  blockId: string,
  input: { config?: unknown; isEnabled?: boolean },
) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/blocks/${blockId}`,
    "PATCH",
    input,
  );
}
export function deleteWorkspaceBlock(cardId: string, blockId: string) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/blocks/${blockId}`,
    "DELETE",
    {},
  );
}
export function duplicateWorkspaceBlock(cardId: string, blockId: string) {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/blocks/${blockId}/duplicate`,
    "POST",
    {},
  );
}
export function reorderWorkspaceBlocks(
  cardId: string,
  blockIds: readonly string[],
) {
  return mutateWorkspaceCard(cardId, `/cards/${cardId}/blocks`, "PUT", {
    blockIds,
  });
}

export function updateWorkspacePublication(
  cardId: string,
  action: "PUBLISH" | "UNPUBLISH" | "RESTORE",
): Promise<WorkspaceCardDTO> {
  return mutateWorkspaceCard(
    cardId,
    `/cards/${cardId}/publication`,
    "PUT",
    { action },
  );
}
