"use server";

import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getNfcCardService } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";

export type NfcCardActionResult = { ok: boolean; message: string; count?: number };

async function requireAdmin() {
  const session = await getServerSession(authOptions as AuthOptions);
  if (!session?.user?.email) throw new Error("Administrator authentication is required.");
}

function failure(error: unknown): NfcCardActionResult {
  if (error instanceof z.ZodError) return { ok: false, message: error.issues[0]?.message ?? "Review the entered values." };
  if (error instanceof AppError) return { ok: false, message: error.message };
  return { ok: false, message: "Unable to update NFC card inventory. Please try again." };
}

export async function generateNfcCardsAction(input: { quantity: number }): Promise<NfcCardActionResult> {
  try {
    await requireAdmin();
    const count = await getNfcCardService().create(input);
    revalidatePath("/admin/cards");
    revalidatePath("/admin/subscription-activations");
    return { ok: true, count, message: `${count} NFC activation token${count === 1 ? "" : "s"} generated.` };
  } catch (error) { return failure(error); }
}

export async function setNfcCardStatusAction(id: string, status: "AVAILABLE" | "RESERVED" | "DISABLED" | "LOST" | "ARCHIVED"): Promise<NfcCardActionResult> {
  try {
    await requireAdmin();
    await getNfcCardService().setStatus(id, status);
    revalidatePath("/admin/cards");
    revalidatePath("/admin/subscription-activations");
    return { ok: true, message: `NFC card status changed to ${status.toLowerCase()}.` };
  } catch (error) { return failure(error); }
}

export async function deleteNfcCardAction(id: string): Promise<NfcCardActionResult> {
  try {
    await requireAdmin();
    await getNfcCardService().remove(id);
    revalidatePath("/admin/cards");
    revalidatePath("/admin/subscription-activations");
    return { ok: true, message: "NFC card removed from inventory." };
  } catch (error) { return failure(error); }
}
