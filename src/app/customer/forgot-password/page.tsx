import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/features/customer-auth/CustomerAuthForm";
import { CustomerAuthShell } from "@/features/customer-auth/CustomerAuthShell";
import { getActivationService } from "@/lib/composition-root";
export const metadata={title:"Forgot password"};
export default async function Page(){const session=(await cookies()).get("oi_customer_session")?.value;if(session&&await getActivationService().accountForSession(session))redirect("/workspace");return <CustomerAuthShell eyebrow="Customer Workspace" title="Reset your password" description="Enter your email and we will send a secure reset link."><CustomerAuthForm mode="forgot"/></CustomerAuthShell>}
