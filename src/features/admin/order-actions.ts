"use server";

import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getOrderMutationUseCases, authorizeAdminAction } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";

export type AdminOrderActionResult =
  | { ok: true; message: string; issuedCodes?: ReadonlyArray<{ cardId: string; cardName: string; code: string }> }
  | { ok: false; message: string };

async function authorizeAdmin(): Promise<string | null> { const session=await getServerSession(authOptions as AuthOptions); return session?.user?.email??null; }

export async function approveOrderAction(orderId: string): Promise<AdminOrderActionResult> {
  const email=await authorizeAdmin(); if (!email) return { ok: false, message: "Administrator authentication is required." }; await authorizeAdminAction.execute(email,"ORDER_APPROVE");
  try {
    const result = await getOrderMutationUseCases().approveOrder.execute({ orderId });
    revalidatePath("/admin/orders");
    return {
      ok: true,
      message: "Order approved and cards issued.",
      issuedCodes: result.cards.map((card, index) => ({
        cardId: card.id,
        cardName: card.name,
        code: result.issuedAccessCodes[index].code,
      })),
    };
  } catch (error) {
    return { ok: false, message: error instanceof AppError ? error.message : "Unable to approve this order." };
  }
}

export async function cancelOrderAction(orderId: string): Promise<AdminOrderActionResult> {
  const email=await authorizeAdmin(); if (!email) return { ok: false, message: "Administrator authentication is required." }; await authorizeAdminAction.execute(email,"ORDER_APPROVE");
  try {
    await getOrderMutationUseCases().cancelOrder.execute({ orderId });
    revalidatePath("/admin/orders");
    return { ok: true, message: "Order cancelled." };
  } catch (error) {
    return { ok: false, message: error instanceof AppError ? error.message : "Unable to cancel this order." };
  }
}

export async function advanceOrderAction(orderId: string): Promise<AdminOrderActionResult> {
  const email=await authorizeAdmin(); if (!email) return { ok: false, message: "Administrator authentication is required." }; await authorizeAdminAction.execute(email,"ORDER_APPROVE");
  try {
    const order = await getOrderMutationUseCases().completeOrder.execute({ orderId });
    revalidatePath("/admin/orders");
    return { ok: true, message: `Fulfillment advanced to ${order.fulfillmentStatus.replaceAll("_", " ").toLowerCase()}.` };
  } catch (error) {
    return { ok: false, message: error instanceof AppError ? error.message : "Unable to advance fulfillment." };
  }
}
