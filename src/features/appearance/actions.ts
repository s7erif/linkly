"use server";

import type { WorkspaceCardDTO } from "@/dto";
import { adminWorkspace } from "@/lib/composition-root";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { readWorkspaceCard } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";

type WorkspaceCardResult =
  | { ok: true; card: WorkspaceCardDTO }
  | { ok: false; status: number; message: string };
export async function loadWorkspaceCard(
  cardId: string,
  sessionToken: string,
): Promise<WorkspaceCardResult> {
  try {
    return {
      ok: true,
      card: await readWorkspaceCard.execute({ cardId, sessionToken }),
    };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof AppError ? error.statusCode : 500,
      message:
        error instanceof AppError
          ? error.message
          : "Unable to load Workspace card.",
    };
  }
}
export async function loadAdminWorkspaceCard(cardId: string): Promise<WorkspaceCardResult> {
  try {
    const authorization = await getWorkspaceAdminAuthorization();
    if (!authorization) return { ok: false, status: 401, message: "Administrator authentication is required." };
    return { ok: true, card: (await adminWorkspace.read(authorization.adminEmail, cardId)).card };
  } catch (error) {
    return { ok: false, status: error instanceof AppError ? error.statusCode : 500, message: error instanceof AppError ? error.message : "Unable to load Workspace card." };
  }
}
