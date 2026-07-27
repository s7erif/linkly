import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/features/customer-auth/CustomerAuthForm";
import { CustomerAuthShell } from "@/features/customer-auth/CustomerAuthShell";
import { getCurrentLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivationService } from "@/lib/composition-root";
export async function generateMetadata() {
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
  return { title: dict.auth?.forgotPassword?.title || "Forgot password" };
}
export default async function Page(){
  const session=(await cookies()).get("oi_customer_session")?.value;
  if(session&&await getActivationService().accountForSession(session))redirect("/workspace");
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
  return <CustomerAuthShell eyebrow={dict.auth?.forgotPassword?.eyebrow || "Customer Workspace"} title={dict.auth?.forgotPassword?.title || "Reset your password"} description={dict.auth?.forgotPassword?.subtitle || "Enter your email and we will send a secure reset link."}><CustomerAuthForm mode="forgot"/></CustomerAuthShell>
}
