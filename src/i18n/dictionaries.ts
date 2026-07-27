import type { Locale } from "./server";

const dictionaries = {
  en: () => import("./locales/en").then((module) => module.default),
  ar: () => import("./locales/ar").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
