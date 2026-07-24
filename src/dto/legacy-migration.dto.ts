export interface LegacyMigrationSourceDTO {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  name: string;
  title: string;
  company: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bio: string | null;
  avatar: string | null;
  backgroundImage: string | null;
  socialLinksJson: string;
  templateId: string;
  urlHash: string;
  slug: string;
  createTime: Date;
  updateTime: Date;
  normalizedLinks: ReadonlyArray<{
    platform: string;
    url: string;
    position: number;
  }>;
}
export interface LegacyMigrationFailureDTO {
  legacyId: string;
  slug: string;
  issues: readonly string[];
}
export interface LegacyMigrationReportDTO {
  scanned: number;
  migrated: ReadonlyArray<{ legacyId: string; cardId: string; slug: string }>;
  skipped: ReadonlyArray<{ legacyId: string; slug: string; reason: string }>;
  validationFailures: ReadonlyArray<LegacyMigrationFailureDTO>;
}
