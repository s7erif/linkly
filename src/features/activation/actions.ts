"use server";
import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { getActivationService } from "@/lib/composition-root";
import { generateAccountUsername } from "@/lib/slug-generator";
import type { ActivationService } from "@/services/activation.service";

type ActivationField = "firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword";
export type CustomerActivationResult = { ok: boolean; message: string; fieldErrors?: Partial<Record<ActivationField, string>>; cardId?: string; slug?: string; editorToken?: string; editorExpiresAt?: string };
const activationAttempts = new Map<string, { count: number; resetAt: number }>();
async function activationLimited() { const h = await headers(), key = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local", now = Date.now(), current = activationAttempts.get(key); if (!current || current.resetAt <= now) { activationAttempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return false; } current.count += 1; return current.count > 12; }

/**
 * Activation never asks for a username. The public profile slug is generated
 * server-side as a placeholder; the customer chooses their real public username
 * later inside the Workspace builder. Format satisfies the activation username schema.
 */
function autoSlug(base: string): string {
  const clean = base.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 18).replace(/-$/g, "") || "card";
  return `${clean}-${randomBytes(3).toString("hex")}`;
}

type IssuedActivation = Awaited<ReturnType<ActivationService["registerAndActivate"]>>;
async function success(result: IssuedActivation): Promise<CustomerActivationResult> { (await cookies()).set("oi_customer_session", result.customerToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: result.customerExpiresAt }); return { ok: true, message: "Your NFC card is activated.", cardId: result.cardId, slug: result.slug, editorToken: result.editorToken, editorExpiresAt: result.editorExpiresAt.toISOString() }; }

function failure(error: unknown): CustomerActivationResult {
  if (error instanceof z.ZodError) {
    const fields = error.flatten().fieldErrors as Record<string, string[] | undefined>;
    return { ok: false, message: "Review the highlighted fields and try again.", fieldErrors: { firstName: fields.firstName?.[0], lastName: fields.lastName?.[0], email: fields.email?.[0], phone: fields.phone?.[0], password: fields.password?.[0], confirmPassword: fields.confirmPassword?.[0] } };
  }
  const known = error as { code?: unknown; meta?: { target?: unknown } };
  if (known?.code === "P2002") {
    const target = Array.isArray(known.meta?.target) ? known.meta.target.join(" ").toLowerCase() : String(known.meta?.target ?? "").toLowerCase();
    if (target.includes("email")) return { ok: false, message: "Use another email address.", fieldErrors: { email: "Email already exists." } };
    if (target.includes("slug")) return { ok: false, message: "That profile name is taken. Try a different combination." };
    return { ok: false, message: "That activation could not be completed. Please try again." };
  }
  if (error instanceof Error && error.message.includes("account already exists")) return { ok: false, message: "Use another email address or sign in.", fieldErrors: { email: "Email already exists." } };
  if (error instanceof Error && ["NFC card is unavailable", "Email or password is incorrect", "NFC card or customer session is invalid", "Sign in to continue."].includes(error.message)) return { ok: false, message: error.message };
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function registerAndActivateAction(input: { activationToken: string; firstName: string; lastName: string; email: string; phone: string; password: string; confirmPassword: string }): Promise<CustomerActivationResult> { if (await activationLimited()) return { ok: false, message: "Too many activation attempts. Try again later." }; try { return success(await getActivationService().registerAndActivate({ ...input, username: generateAccountUsername(`${input.firstName} ${input.lastName}`) })); } catch (error) { return failure(error); } }
export async function loginAndActivateAction(input: { activationToken: string; email: string; password: string; rememberMe?: boolean }): Promise<CustomerActivationResult> { if (await activationLimited()) return { ok: false, message: "Too many activation attempts. Try again later." }; try { return success(await getActivationService().loginAndActivate({ ...input, username: autoSlug(input.email) })); } catch (error) { return failure(error); } }
export async function continueActivationAction(activationToken: string): Promise<CustomerActivationResult> { try { const session = (await cookies()).get("oi_customer_session")?.value; if (!session) return { ok: false, message: "Sign in to continue." }; return success(await getActivationService().activateAuthenticated(activationToken, autoSlug("card"), session)); } catch (error) { return failure(error); } }
