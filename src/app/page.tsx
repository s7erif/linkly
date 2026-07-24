import { redirect } from "next/navigation";
import styles from "@/features/marketing/marketing.module.css";
import { getPlatformBranding } from "@/lib/platform-branding";
import HeroSection from "@/features/marketing/HeroSection";
import Logos from "@/features/marketing/Logos";
import EverythingCards from "@/features/marketing/EverythingCards";
import FeatureGrid from "@/features/marketing/FeatureGrid";
import Timeline from "@/features/marketing/Timeline";
import CTASection from "@/features/marketing/CTASection";
import FooterSection from "@/features/marketing/FooterSection";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  if (slug) redirect(`/workspace?slug=${encodeURIComponent(slug)}`);
  const branding = await getPlatformBranding();

  return (
    <main className={styles.landing}>
      {/* Aurora ambient background — after Hero to not affect the locked sections */}
      <div className={styles.auroraBg} aria-hidden="true" />

      <HeroSection brandName={branding.name} />
      <Logos />
      <EverythingCards />
      <FeatureGrid />
      <Timeline />
      <CTASection />
      <FooterSection brandName={branding.name} />
    </main>
  );
}
