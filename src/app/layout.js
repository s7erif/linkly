import { Inter, Outfit, Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "@/design/ThemeProvider";
import Script from "next/script";
import { themeBootstrapScript } from "@/design/ThemeScript";
import { getPlatformBranding } from "@/lib/platform-branding";
import config from "@/lib/config";
import { getCurrentLocale, getDirection } from "@/i18n/server";
import { I18nProvider } from "@/i18n/context";
import { getDictionary } from "@/i18n/dictionaries";

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

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata() {
  const branding = await getPlatformBranding();
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);

  // We fallback to english branding if not translated, but for marketing seo:
  const title = locale === "ar" ? `الرئيسية | ${branding.name}` : branding.title;
  const description = locale === "ar" ? dict.hero?.subtitle || branding.description : branding.description;

  return {
    title: { default: title, template: "%s | " + branding.name },
    description: description,
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/en",
        "ar-AE": "/ar",
      },
    },
  };
}

export default async function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";
  const branding = await getPlatformBranding();
  const locale = await getCurrentLocale();
  const dir = getDirection(locale);
  const dictionary = await getDictionary(locale);

  // Determine which font class to apply based on locale
  const fontClass = locale === "ar" 
    ? `${alexandria.variable} ${alexandria.className}` 
    : `${inter.variable} ${inter.className} ${outfit.variable}`;

  return (
    <html lang={locale} dir={dir} className="w-full" data-theme={theme} data-oi-theme="light" suppressHydrationWarning>
      <body className={`${fontClass} min-h-dvh w-full flex flex-col antialiased bg-bg-page text-primary-text font-sans`}>
        <Script id="oi-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <ThemeProvider>
          <I18nProvider initialLocale={locale} dictionary={dictionary}>
            <Providers>
              <Navbar platformName={branding.name} />
              <div className="flex-1 flex flex-col">
                {children}
              </div>
            </Providers>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
