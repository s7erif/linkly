import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/features/customer-auth/CustomerAuthForm";
import { CustomerAuthShell } from "@/features/customer-auth/CustomerAuthShell";
import { getActivationService } from "@/lib/composition-root";
export const metadata={title:"Reset password"};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const session=(await cookies()).get("oi_customer_session")?.value;if(session&&await getActivationService().accountForSession(session))redirect("/workspace");const {token=""}=await searchParams;return <CustomerAuthShell eyebrow="Account recovery" title="Choose a new password" description="Use a strong password you do not use elsewhere."><CustomerAuthForm mode="reset" token={token}/></CustomerAuthShell>}
