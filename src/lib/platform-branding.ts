import "server-only";

import { cache } from "react";
import { platformSettingsService } from "@/lib/composition-root";

export const getPlatformBranding = cache(async () => {
  const settings = await platformSettingsService.load();
  return {
    name: settings.general.platformName,
    description: settings.seo.metaDescription || "Create and share a premium digital business card.",
    title: settings.seo.metaTitle || settings.general.platformName,
  };
});
