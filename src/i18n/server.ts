import { cookies } from "next/headers";

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export async function getCurrentLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
    
    if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale)) {
      return localeCookie as Locale;
    }
  } catch (error) {
    // Graceful fallback during static generation or if cookies are inaccessible
  }
  
  return DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
