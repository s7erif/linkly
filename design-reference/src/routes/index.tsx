import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Logos } from "@/components/landing/Logos";
import { EverythingCards } from "@/components/landing/EverythingCards";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Timeline } from "@/components/landing/Timeline";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tappy — One Tap. Endless Connections." },
      { name: "description", content: "Create your digital identity once. Share it anywhere with a single tap. NFC-powered digital business cards, portfolios, and profiles." },
      { property: "og:title", content: "Tappy — One Tap. Endless Connections." },
      { property: "og:description", content: "Create your digital identity once. Share it anywhere with a single tap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-clip aurora-bg">
      {/* Additional glassy reflections */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[720px] bg-[radial-gradient(60%_50%_at_75%_35%,rgba(180,190,255,0.35),transparent_70%)]" />
      <Nav />
      <Hero />
      <Logos />
      <EverythingCards />
      <FeatureGrid />
      <Timeline />
      <CTA />
      <Footer />
    </div>
  );
}
