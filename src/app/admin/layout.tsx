import { getServerSession } from "next-auth/next";
import type { AuthOptions } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { AdminShellBoundary } from "@/features/admin/AdminShellBoundary";
import { getPlatformBranding } from "@/lib/platform-branding";
import { CustomerManager } from "./customers/CustomerManager";
import { OrderDetailsController } from "./orders/OrderDetailsController";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, branding] = await Promise.all([getServerSession(authOptions as AuthOptions), getPlatformBranding()]);
  if (!session?.user) redirect("/admin/login?callbackUrl=/admin");

  return (
    <AdminShellBoundary adminName={session.user.name ?? session.user.email ?? "Administrator"} platformName={branding.name}>
      <CustomerManager>
        <OrderDetailsController>{children}</OrderDetailsController>
      </CustomerManager>
    </AdminShellBoundary>
  );
}
