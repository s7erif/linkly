# Legacy BusinessCard Migration Report

Date: 2026-07-20
Status: Complete

## Summary

- Active legacy records scanned: 1
- Records migrated on initial execution: 1
- Records skipped on initial execution: 0
- Validation failures: 0
- Permanent mappings verified: 1
- Idempotency verification: PASS — the second execution migrated 0 and skipped the existing mapping as `Already migrated`

## Records Migrated

| Legacy ID | Legacy hash | Slug | OI Card ID | Result |
|---|---|---|---|---|
| `cmrri1y400001dbtvg6mx1dkr` | `yir7cy2v` | `john-doe` | `0a089f8f-da5d-40e0-bbed-64265d2e7cc7` | Migrated |

## Records Skipped

No records were skipped during the initial migration.

The idempotency verification pass skipped the migrated `john-doe` record because its permanent `LegacyIdentifier` already existed. No duplicate Customer, Card, Profile, SocialLink, or CardButton rows were created.

## Mapping Summary

- Customer: created from the legacy card owner-facing name, email, and phone.
- Card: preserved `slug`, name, creation timestamp, and update timestamp; active legacy state became `PUBLISHED` and `PUBLIC`.
- Profile: mapped full name, title to headline, company, biography, email, phone, website, and address.
- Appearance: populated with the validated default `AppearanceSettings` contract.
- Social links: parsed the legacy JSON map and created 3 ordered links: GitHub, LinkedIn, and Twitter. The normalized legacy link table was empty.
- Buttons: derived 4 ordered contact actions: Call, Email, Website, and Directions.
- Legacy identity: stored `legacyId` and `urlHash` as a permanent `LegacyIdentifier` using system `prototype` and entity type `BUSINESS_CARD`.
- Timestamps: legacy `createTime` and `updateTime` were preserved on the OI card; `publishedAt` uses the legacy creation time.

## Validation Failures

None.

## Verification

Database verification confirms:

- 1 active legacy BusinessCard record.
- 1 corresponding permanent legacy mapping.
- Card `john-doe` is `PUBLISHED`, `PUBLIC`, and not soft-deleted.
- Profile exists and contains the expected legacy fields.
- Appearance configuration is present and valid.
- 3 social links and 4 buttons exist.
- `GET /card/john-doe` returned HTTP 200 with a `PublicCardDTO` during post-migration verification.
- Therefore `/c/john-doe` can load the migrated card through the unchanged public-read architecture.

Project verification passes architecture enforcement, strict TypeScript, all 16 tests, ESLint with zero errors, Prisma generation, and the production Next.js build. The 42 reported lint warnings are pre-existing generated/legacy warnings.

## Implementation Notes

The migration service reads active legacy records outside the write transaction, then processes every valid record through `UnitOfWork`. Inside the transaction it checks the permanent legacy identifier before creating the complete aggregate. The public repository and `ReadPublicCard` use case were not modified.
