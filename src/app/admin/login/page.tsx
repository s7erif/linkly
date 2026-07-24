import LoginForm from "@/app/login/LoginForm";
import { getServerSession } from "next-auth/next";
import type { AuthOptions } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPlatformBranding } from "@/lib/platform-branding";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions as AuthOptions);
  if (session?.user) redirect("/admin");
  const branding = await getPlatformBranding();
  return <LoginForm platformName={branding.name} />;
}
