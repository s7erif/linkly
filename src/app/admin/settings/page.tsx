import { AdminPage, AdminPageHeader } from "@/design/components";
import { platformSettingsService } from "@/lib/composition-root";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; tested?: string; error?: string }> }) {
  const [settings, query] = await Promise.all([platformSettingsService.load(), searchParams]);
  return <AdminPage><AdminPageHeader breadcrumbs={[{ id: "overview", label: "Overview", href: "/admin" }, { id: "settings", label: "Platform Settings", current: true }]} description="Manage global identity, communications, payments, uploads, security, SEO, and social presence." eyebrow="Configuration" title="Platform Settings"/><SettingsForm initial={settings} message={query.error ? { tone: "error", text: query.error } : query.tested ? { tone: "success", text: `Test email sent to ${query.tested}.` } : query.saved ? { tone: "success", text: "Platform settings saved." } : undefined}/></AdminPage>;
}
