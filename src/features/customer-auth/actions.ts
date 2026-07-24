"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getActivationService, registrationReadService } from "@/lib/composition-root";
import { getBaseUrl } from "@/lib/public-links";
import { getEnvironment } from "@/lib/env";
import { ResendEmailProvider } from "@/notifications/resend-email.provider";
import { secureSessionTokenGenerator } from "@/services/credential-security.service";

export type AuthResult = { ok: boolean; message: string; pending?: boolean; showWelcome?: boolean; fieldErrors?: Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword", string>> };
const attempts = new Map<string, { count: number; resetAt: number }>();
async function limited(scope: string, max = 8) {
  const h = await headers();
  const key = scope + ":" + (h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local");
  const now = Date.now(), current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return false; }
  current.count += 1;
  return current.count > max;
}
function setSession(token: string, expires: Date) { return cookies().then(store => store.set("oi_customer_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires })); }
export async function customerRegisterAction(form: FormData): Promise<AuthResult> {
  if (await limited("customer-register", 5)) return { ok: false, message: "Too many attempts. Try again later." };
  try {
    const result = await getActivationService().registerCustomer({ firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"), password: form.get("password"), confirmPassword: form.get("confirmPassword") });
    await setSession(result.token, result.expiresAt);
    return { ok: true, message: "Account created." };
  } catch (error) {
    if (error instanceof z.ZodError) { const fields = error.flatten().fieldErrors as Record<string, string[] | undefined>; return { ok: false, message: "Review the highlighted fields.", fieldErrors: { firstName: fields.firstName?.[0], lastName: fields.lastName?.[0], email: fields.email?.[0], password: fields.password?.[0], confirmPassword: fields.confirmPassword?.[0] } }; }
    const known = error as { code?: string; meta?: { target?: unknown } };
    if (known.code === "P2002" || (error instanceof Error && error.message.includes("account already exists"))) return { ok: false, message: "An account already exists for this email.", fieldErrors: { email: "Email already exists." } };
    return { ok: false, message: "Unable to create your account. Please try again." };
  }
}

export async function customerLoginAction(form: FormData): Promise<AuthResult> {
  if (await limited("customer-login")) return { ok: false, message: "Too many attempts. Try again later." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  try {
    const result = await getActivationService().loginCustomer({ email, password: form.get("password"), rememberMe: form.get("rememberMe") === "on" });
    await setSession(result.token, result.expiresAt);
    const showWelcome = (await cookies()).get("oi_welcome_seen")?.value !== "1";
    return { ok: true, message: "Signed in.", showWelcome };
  } catch {
    // Distinguish a pending (not-yet-approved) digital registration from a genuine auth failure.
    if (email && await registrationReadService.pendingRegistrationByEmail(email)) {
      return { ok: false, pending: true, message: "Your registration is currently under review. You will be able to sign in once an administrator approves your account." };
    }
    return { ok: false, message: "Email or password is incorrect." };
  }
}
export async function customerLogoutAction() {
  const store = await cookies(), token = store.get("oi_customer_session")?.value;
  if (token) await getActivationService().logout(token);
  store.delete("oi_customer_session");
  redirect("/");
}
export async function requestPasswordResetAction(form: FormData): Promise<AuthResult> {
  if (await limited("password-reset", 5)) return { ok: true, message: "If the account exists, a reset link will be sent." };
  try {
    const email = String(form.get("email") || "");
    const result = await getActivationService().requestPasswordReset({ email });
    if (result.created) {
      const environment = getEnvironment();
      const url = getBaseUrl() + "/customer/reset-password?token=" + encodeURIComponent(result.token);
      await new ResendEmailProvider(environment.RESEND_API_KEY).send({ from: environment.RESEND_FROM_EMAIL, to: result.email, subject: "Reset your password", text: "Reset your password: " + url, html: '<p>Use the secure link below to reset your password. It expires in one hour.</p><p><a href="' + url + '">Reset password</a></p>' }, { idempotencyKey: "customer-password-reset/" + await secureSessionTokenGenerator.hash(result.token).then(v => Buffer.from(v).toString("hex")) });
    }
  } catch { return { ok: false, message: "Unable to send the reset email right now. Please try again." }; }
  return { ok: true, message: "If the account exists, a reset link will be sent." };
}
export async function resetPasswordAction(form: FormData): Promise<AuthResult> {
  if (await limited("password-reset-confirm", 8)) return { ok: false, message: "Too many attempts. Try again later." };
  try {
    const ok = await getActivationService().resetCustomerPassword({ token: form.get("token"), password: form.get("password"), confirmPassword: form.get("confirmPassword") });
    return ok ? { ok: true, message: "Password updated. You can now sign in." } : { ok: false, message: "This reset link is invalid or expired." };
  } catch (error) {
    if (error instanceof z.ZodError) { const fields = error.flatten().fieldErrors as Record<string, string[] | undefined>; return { ok: false, message: "Review the highlighted fields.", fieldErrors: { password: fields.password?.[0], confirmPassword: fields.confirmPassword?.[0] } }; }
    return { ok: false, message: "Unable to reset password." };
  }
}
