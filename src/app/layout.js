import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "@/design/ThemeProvider";
import Script from "next/script";
import { themeBootstrapScript } from "@/design/ThemeScript";
import { getPlatformBranding } from "@/lib/platform-branding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata() {
  const branding = await getPlatformBranding();
  return { title: { default: branding.title, template: "%s | " + branding.name }, description: branding.description };
}

import config from "@/lib/config";

export default async function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";
  const branding = await getPlatformBranding();

  return (
    <html lang="en" className="w-full" data-theme={theme} data-oi-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} ${outfit.variable} min-h-dvh w-full flex flex-col antialiased bg-bg-page text-primary-text font-sans`}>
        <Script id="oi-theme-init" strategy="beforeInteractive">{themeBootstrapScript}</Script>
        <ThemeProvider>
          <Providers>
            <Navbar platformName={branding.name} />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
