"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "./server";

interface I18nContextProps {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLanguage: (newLocale: Locale) => void;
  t: (key: string, namespace?: string) => string;
}

const I18nContext = createContext<I18nContextProps | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
  dictionary: any;
}

export function I18nProvider({ children, initialLocale, dictionary }: I18nProviderProps) {
  const router = useRouter();
  
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";

  const setLanguage = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;
    
    // Set cookie for SSR
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Set localStorage as requested
    localStorage.setItem("NEXT_LOCALE", newLocale);
    
    // Optimistically update client state
    setLocaleState(newLocale);
    
    // Tell Next.js router to refresh server components
    router.refresh();
  }, [locale, router]);

  // Sync with localStorage on mount if cookie wasn't set but localStorage was
  useEffect(() => {
    const savedLocale = localStorage.getItem("NEXT_LOCALE") as Locale;
    if (savedLocale && ["en", "ar"].includes(savedLocale) && savedLocale !== initialLocale) {
      document.cookie = `NEXT_LOCALE=${savedLocale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    }
  }, [initialLocale, router]);

  const t = useCallback((key: string, namespace?: string) => {
    let current = dictionary;
    
    if (namespace) {
      current = current[namespace];
      if (!current) {
        console.warn(`[i18n] Namespace '${namespace}' not found.`);
        return key;
      }
    }
    
    const keys = key.split(".");
    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`[i18n] Key '${key}' not found${namespace ? ` in namespace '${namespace}'` : ''}.`);
        return key;
      }
      current = current[k];
    }
    
    return current as string;
  }, [dictionary]);

  const value = useMemo(() => ({
    locale,
    dir,
    setLanguage,
    t
  }), [locale, dir, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used within an I18nProvider");
  }
  return context;
}
