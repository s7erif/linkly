export const CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  MAX_FIELD_LENGTHS: {
    NAME: 100,
    TITLE: 100,
    COMPANY: 100,
    BIO: 500,
    EMAIL: 255,
    PHONE: 50,
    WEBSITE: 255,
    ADDRESS: 255,
    URL: 2000,
    PLATFORM: 50,
  },
  SUPPORTED_SOCIAL_PLATFORMS: [
    "facebook",
    "instagram",
    "linkedin",
    "github",
    "youtube",
    "tiktok",
    "telegram",
    "snapchat",
    "x",
    "twitter",
    "dribbble",
    "behance"
  ] as const,
};

export type SocialPlatform = typeof CONSTANTS.SUPPORTED_SOCIAL_PLATFORMS[number];
