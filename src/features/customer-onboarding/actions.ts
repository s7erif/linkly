"use server";

import { cookies } from "next/headers";
import { getActivationService } from "@/lib/composition-root";

export type CustomerOnboardingResult = {
  ok: boolean;
  message: string;
  cardId?: string;
  slug?: string;
  editorToken?: string;
  editorExpiresAt?: string;
};

function success(result: { cardId: string; slug: string; editorToken: string; editorExpiresAt: Date }): CustomerOnboardingResult {
  return {
    ok: true,
    message: "Your card is ready.",
    cardId: result.cardId,
    slug: result.slug,
    editorToken: result.editorToken,
    editorExpiresAt: result.editorExpiresAt.toISOString(),
  };
}

async function customerSession(): Promise<string | null> {
  return (await cookies()).get("oi_customer_session")?.value ?? null;
}

export async function createDigitalCardAction(): Promise<CustomerOnboardingResult> {
  try {
    const session = await customerSession();
    if (!session) return { ok: false, message: "Sign in to continue." };
    return success(await getActivationService().createDigitalCardForSession(session));
  } catch {
    return { ok: false, message: "Unable to create your digital link. Please try again." };
  }
}

export async function openCustomerCardAction(cardId: string): Promise<CustomerOnboardingResult> {
  console.log("[TRACE] entering openCustomerCardAction, cardId:", cardId);
  try {
    const session = await customerSession();
    console.log("[TRACE] customerSession returned:", session ? "present" : "null");
    if (!session) return { ok: false, message: "Sign in to continue." };
    const result = await getActivationService().openCardForSession(session, cardId);
    console.log("[TRACE] openCardForSession returned successfully");
    return success(result);
  } catch (error) {
    console.error("[TRACE] exception in openCustomerCardAction:", error);
    return { ok: false, message: "Unable to open this card. Please try again." };
  }
}
