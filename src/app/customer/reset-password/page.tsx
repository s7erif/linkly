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
  return { title: dict.auth?.resetPassword?.title || "Reset password" };
}
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){
  const session=(await cookies()).get("oi_customer_session")?.value;
  if(session&&await getActivationService().accountForSession(session))redirect("/workspace");
  const {token=""}=await searchParams;
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
  return <CustomerAuthShell eyebrow={dict.auth?.resetPassword?.eyebrow || "Account recovery"} title={dict.auth?.resetPassword?.title || "Choose a new password"} description={dict.auth?.resetPassword?.subtitle || "Use a strong password you do not use elsewhere."}><CustomerAuthForm mode="reset" token={token}/></CustomerAuthShell>
}
