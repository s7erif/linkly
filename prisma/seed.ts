import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma-seed/client";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL (or DIRECT_URL) is required to seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const planFeatures = [
  ["MAX_CARDS", 1], ["GALLERY", null], ["VIDEO", null], ["ANALYTICS", null], ["SEO", null], ["CUSTOM_DOMAIN", null], ["NFC_SUPPORT", null],
] as const;
const websiteDefaults = { version: 1, status: "PUBLISHED", updatedAt: new Date(0).toISOString(), publishedAt: new Date(0).toISOString(), sections: { hero: { badge: "One card. Every connection.", title: "Your identity, beautifully shared.", description: "OI turns every introduction into a polished digital experience.", primaryCta: "Create New Card", secondaryCta: "Access Your Card", visible: true }, features: { title: "Everything important, one confident tap away.", items: [], visible: true }, howItWorks: { title: "From first tap to lasting connection.", steps: [], visible: true }, pricing: { title: "Plans that grow with you.", featuredPlanId: null, visible: true }, faq: { items: [], visible: true }, testimonials: { items: [], visible: true }, partners: { items: [], visible: true }, navigation: { items: [], visible: true }, footer: { description: "Digital identity, thoughtfully made.", socialLinks: [], visible: true }, seo: { siteTitle: "OI Cards", defaultDescription: "Digital identity, thoughtfully made.", keywords: [], canonicalUrl: null, robots: "index,follow", favicon: null } } };

async function main() {
  const db = prisma;
  {
    const role = await db.adminRole.upsert({ where: { key: "SUPER_ADMIN" }, update: { name: "Super Admin" }, create: { key: "SUPER_ADMIN", name: "Super Admin" } });
    const admin = await db.adminUser.upsert({ where: { email: "admin@oicards.local" }, update: { name: "Shop Admin", isActive: true, deletedAt: null }, create: { email: "admin@oicards.local", name: "Shop Admin", isActive: true } });
    await db.adminUserRole.upsert({ where: { adminUserId_roleId: { adminUserId: admin.id, roleId: role.id } }, update: {}, create: { adminUserId: admin.id, roleId: role.id } });

    const plans = [
      { key: "starter", name: "Starter", description: "A focused digital card for individuals.", monthlyMinor: 999, quarterlyMinor: 2699, yearlyMinor: 9999, features: [["MAX_CARDS", 1], ["SEO", null]] },
      { key: "professional", name: "Professional", description: "Advanced sharing and growth tools.", monthlyMinor: 1999, quarterlyMinor: 5399, yearlyMinor: 19999, features: [["MAX_CARDS", 3], ["GALLERY", null], ["ANALYTICS", null], ["SEO", null], ["NFC_SUPPORT", null]] },
      { key: "business", name: "Business", description: "Full platform capabilities for teams.", monthlyMinor: 3999, quarterlyMinor: 10799, yearlyMinor: 39999, features: planFeatures },
    ] as const;
    for (const [index, plan] of plans.entries()) {
      const saved = await db.plan.upsert({ where: { key: plan.key }, update: { name: plan.name, description: plan.description, priceMinor: plan.monthlyMinor, currency: "USD", intervalMonths: 1, monthlyMinor: plan.monthlyMinor, quarterlyMinor: plan.quarterlyMinor, yearlyMinor: plan.yearlyMinor, isActive: true, sortOrder: index }, create: { key: plan.key, name: plan.name, description: plan.description, priceMinor: plan.monthlyMinor, currency: "USD", intervalMonths: 1, monthlyMinor: plan.monthlyMinor, quarterlyMinor: plan.quarterlyMinor, yearlyMinor: plan.yearlyMinor, isActive: true, sortOrder: index } });
      for (const [key, limitValue] of plan.features) await db.planFeature.upsert({ where: { planId_key: { planId: saved.id, key } }, update: { enabled: true, limitValue }, create: { planId: saved.id, key, enabled: true, limitValue } });
    }
    for (const key of ["DRAFT", "PUBLISHED"]) { const existing = await db.setting.findFirst({ where: { scope: "WEBSITE", customerId: null, cardId: null, key }, select: { id: true } }); const value = { ...websiteDefaults, status: key }; if (existing) await db.setting.update({ where: { id: existing.id }, data: { value } }); else await db.setting.create({ data: { scope: "WEBSITE", key, value } }); }
    const settings = { siteName: "OI Cards", appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "", supportEmail: "support@oicards.local", maintenanceMode: false, registrationEnabled: true, publicWebsiteEnabled: true };
    for (const [key, value] of Object.entries(settings)) { const existing = await db.setting.findFirst({ where: { scope: "PLATFORM", customerId: null, cardId: null, key }, select: { id: true } }); if (existing) await db.setting.update({ where: { id: existing.id }, data: { value } }); else await db.setting.create({ data: { scope: "PLATFORM", key, value } }); }
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
