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
  return { title: dict.auth?.login?.title || "Sign in" };
}
export default async function Page(){
  const session=(await cookies()).get("oi_customer_session")?.value;
  if(session&&await getActivationService().accountForSession(session))redirect("/workspace");
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
  return <CustomerAuthShell eyebrow={dict.auth?.login?.eyebrow || "Customer Workspace"} title={dict.auth?.login?.title || "Welcome back"} description={dict.auth?.login?.subtitle || "Access your Workspace and cards."}><CustomerAuthForm mode="login"/></CustomerAuthShell>
}
