# DATABASE_SPEC.md

Version: 1.0

---

# Database Philosophy

- One Card = One Access Code
- One Card = One Public URL
- Themes are independent
- Analytics are separated
- Everything should be scalable

---

# Tables

---

## users

خاص بالأدمن فقط.

| Field      | Type          |
| ---------- | ------------- |
| id         | UUID          |
| name       | String        |
| email      | String        |
| password   | String        |
| role       | Admin / Staff |
| created_at | Timestamp     |

---

## customers

صاحب البطاقة.

| Field      | Type              |
| ---------- | ----------------- |
| id         | UUID              |
| full_name  | String            |
| phone      | String            |
| email      | String            |
| source     | NFC / Digital     |
| status     | Active / Disabled |
| created_at | Timestamp         |

---

## access_codes

الكود السري للدخول.

| Field        | Type                 |
| ------------ | -------------------- |
| id           | UUID                 |
| customer_id  | FK                   |
| code         | String               |
| expires_at   | Timestamp (Nullable) |
| is_active    | Boolean              |
| last_used_at | Timestamp            |
| created_at   | Timestamp            |

---

## cards

البطاقة نفسها.

| Field       | Type              |
| ----------- | ----------------- |
| id          | UUID              |
| customer_id | FK                |
| slug        | String            |
| theme_id    | FK                |
| title       | String            |
| job_title   | String            |
| company     | String            |
| bio         | Text              |
| avatar      | String            |
| cover       | String            |
| status      | Published / Draft |
| created_at  | Timestamp         |
| updated_at  | Timestamp         |

---

## themes

الثيمات.

| Field     | Type    |
| --------- | ------- |
| id        | UUID    |
| name      | String  |
| key       | String  |
| preview   | String  |
| is_active | Boolean |

---

## social_links

كل لينكات البطاقة.

| Field      | Type                                 |
| ---------- | ------------------------------------ |
| id         | UUID                                 |
| card_id    | FK                                   |
| type       | Facebook / WhatsApp / LinkedIn / ... |
| label      | String                               |
| url        | String                               |
| icon       | String                               |
| sort_order | Integer                              |
| is_visible | Boolean                              |

---

## buttons

الأزرار الرئيسية.

| Field   | Type                   |
| ------- | ---------------------- |
| id      | UUID                   |
| card_id | FK                     |
| type    | Call / Email / Website |
| value   | String                 |
| enabled | Boolean                |

---

## subscriptions

الاشتراكات.

| Field       | Type             |
| ----------- | ---------------- |
| id          | UUID             |
| customer_id | FK               |
| plan_id     | FK               |
| starts_at   | Timestamp        |
| expires_at  | Timestamp        |
| status      | Active / Expired |

---

## plans

خطط الاشتراك.

| Field        | Type    |
| ------------ | ------- |
| id           | UUID    |
| name         | String  |
| price        | Decimal |
| duration     | Integer |
| cards_limit  | Integer |
| analytics    | Boolean |
| custom_theme | Boolean |

---

## visits

كل زيارة.

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| card_id    | FK        |
| ip         | String    |
| country    | String    |
| city       | String    |
| device     | String    |
| browser    | String    |
| os         | String    |
| created_at | Timestamp |

---

## button_clicks

ضغطات الأزرار.

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| card_id    | FK        |
| button     | String    |
| created_at | Timestamp |

---

## social_clicks

ضغطات السوشيال.

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| card_id     | FK        |
| social_type | String    |
| created_at  | Timestamp |

---

## qr_scans

مرات مسح QR.

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| card_id    | FK        |
| created_at | Timestamp |

---

## saves

عدد حفظ جهة الاتصال.

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| card_id    | FK        |
| created_at | Timestamp |

---

## settings

إعدادات الموقع.

| Field         | Type    |
| ------------- | ------- |
| id            | UUID    |
| site_name     | String  |
| logo          | String  |
| favicon       | String  |
| contact_email | String  |
| maintenance   | Boolean |

---

# Relationships

Customer

↓

Access Code

↓

Card

↓

Theme

↓

Social Links

↓

Buttons

↓

Analytics

---

# Future Tables

notifications

custom_domains

employees

teams

wallet_passes

google_reviews

store_orders

api_keys

audit_logs

media_library

templates

automation

---

# Important Rules

✔ Every customer owns one card.

✔ Every card owns one Access Code.

✔ Every card owns one Public URL.

✔ Every analytics record belongs to one card.

✔ Themes never store user data.

✔ Cards never store analytics.

✔ Analytics never modify cards.

✔ Access Codes are unique.

✔ Public URL is unique.

✔ Slug is unique.

✔ Store Database will be separated later.

## Sprint 1 Migration Baseline (2026-07-20)

The production Prisma schema is implemented with UUID identifiers for OI entities and exact mapped compatibility models for the prototype tables. Migration history now contains a legacy baseline, the existing Phase 2 migrations, the additive OI foundation migration, and a partial unique index enforcing one active access code per card. The deployed PostgreSQL schema has been checked for drift and matches the canonical Prisma schema.

## Sprint 10: Order Persistence

`Order` stores minimal intake and lifecycle state: a unique human-readable order number, customer contact snapshot, package, quantity, notes, order/payment/fulfillment statuses, optional fulfilled customer relation, and timestamps. `Order.customerId` is nullable until approval and uses `RESTRICT`; `Card.orderId` is nullable for legacy compatibility and uses `RESTRICT`. Both prevent deletion from erasing provenance. Existing cards remain valid.

Indexes support order-number uniqueness and operational queues by order status, payment status, fulfillment status, email, customer, and creation time. Migration `20260720080204_add_order_domain` is additive and was applied successfully.

## NotificationDelivery

`NotificationDelivery` records operational delivery state without storing message bodies, plaintext access codes, hashes, or provider credentials. It belongs to the originating Order, Customer, and Card using restrictive deletes so communication history cannot be silently orphaned. `status`, `attemptCount`, `lastAttemptAt`, `sentAt`, safe failure metadata, and the provider message identifier support operator visibility. A unique idempotency key and the `(cardId, channel, template)` constraint enforce one welcome delivery per issued card. Indexes support order history, customer history, and failed/pending delivery operations.

## Sprint 13 Card Builder Persistence

Card now has optional `seoTitle` and `seoDescription` columns. CardSection has unique card/kind and card/position constraints plus a `(cardId, isVisible, position)` read index. The additive migration creates the five canonical section records only for existing active cards that had no sections. New cards create those records with the Card aggregate. Button and social-link rows remain soft deletable and ordered by their existing position columns.

## Sprint 14 Block Persistence

`CardBlock` belongs to Card, has UUID identity, kind, position, enabled state, validated polymorphic configuration, timestamps, and soft deletion. Unique card/position and `(cardId, isEnabled, position)` indexes support deterministic reads. `CardBlockMedia` relationally associates ordered MediaAsset IDs with a block and uses restrictive media deletion. Block configuration uses JSON only for the type-specific value object; media ownership and references remain relational. Migration `20260720140000_add_card_blocks` is additive and does not rewrite legacy card data.


## Sprint 15 plan and subscription storage

Plan retains legacy price fields and adds optional monthly, quarterly, and yearly prices, description, and sort order. PlanFeature is unique by plan and key. Order plan references are nullable for legacy compatibility. Subscription stores billing interval and lifecycle timestamps. See migration 20260720150000_sprint15_admin_subscriptions.


## Sprint 16 Admin search indexes

Admin case-insensitive substring search uses PostgreSQL `pg_trgm` GIN indexes on Customer displayName/email/phone, Order orderNumber/customerName/email/company, and Card name/slug. Existing lifecycle, ownership, subscription, access-code, block-order, and slug indexes remain unchanged. Migration: `20260720160000_add_admin_search_indexes`.

## NFC architecture history

Migrations `20260721140000_nfc_card_inventory`, `20260721150000_activation_driven_architecture`, and `20260721180000_permanent_nfc_architecture` describe superseded intermediate models and remain in migration history only. Their HMAC link, Activation entity, batch, public-identifier, support-code, and event structures are not current application contracts. Migration `20260722090000_short_activation_token` replaces those structures with the canonical short-token model below.

## Short NFC activation inventory

`NfcCard.activationToken` is an immutable uppercase alphanumeric value with a database unique index and a maximum length of 10 characters. It is the only public and support identifier for a physical card. The NFC chip stores `/a/{activationToken}` and never needs to be rewritten when a Workspace username changes.

An `NfcCard` has nullable Customer and Workspace relationships so inventory can exist before activation and multiple physical cards can belong to one Workspace. Multiple cards per Workspace are an intentional supported capability, so `workspaceId` remains indexed but non-unique. Its lifecycle is Available, Reserved, Activated, Disabled, Lost, or Archived. Successful activation sets both relationships and `activatedAt` atomically. The model intentionally has no batch, public identifier, separate activation code, digital-card foreign key, visit counters, or activation-event tables.

Migration: `20260722090000_short_activation_token`.

## MediaAsset public URL storage (2026-07-26)

`MediaAsset.publicUrl` stores a public locator, not file bytes. Supabase Storage
uploads store their HTTPS public URL. The local development fallback writes files
under `public/uploads/<storageKey>` and stores the corresponding `/uploads/...`
path. Existing `data:image/...;base64,...` rows remain valid and readable so the
change requires no data rewrite or database migration.

## Platform Settings document (2026-07-22)

Global platform configuration is stored in the existing `Setting` entity under scope `PLATFORM` and key `CONFIG`. The JSON value is versioned and validated by the Platform Settings service. It contains General, Contact, Email, Payment, Upload, Security, SEO, and Social sections. Provider credentials remain environment-owned and are never persisted in this document. No schema migration is required.


## Plans Management (Sprint 2)

Plan is the canonical plan record. key is the public slug, sortOrder is unique, isPopular is transactionally exclusive, badge is optional display copy, limits stores configurable typed limits, and archivedAt provides non-destructive archival. PlanFeature remains the normalized dynamic feature list. Archived plans are excluded from active plan reads.

## Sprint 3.3 Manual subscription lifecycle

Subscription adds canonical startsAt, expiresAt, activatedAt, renewedAt, expiredAt, cancelledAt/canceledAt compatibility, and suspendedAt timestamps. SubscriptionReminder is the idempotent delivery ledger for expiration and renewal email events. Tenant and financial history use restrictive foreign keys; expiration never deletes business resources. Migration: 20260724120000_manual_subscription_lifecycle.

## Sprint 2 Unified Digital Registration

Digital customer registration is unified at `/create-card` (account + plan + payment in one flow). The plaintext password is never persisted. At submission the password is scrypt-hashed (`hashPassword`, same parameters as `ActivationService`) and the hash + salt are stored on the pending `Order` via two additive nullable columns: `accountPasswordHash` and `accountPasswordSalt` (both `Bytes?`). These columns are intentionally excluded from `OrderDTO` and the order read mapping; they are read only through `OrderReadRepository.findAccountCredentials(orderId)` during approval.

Admin approval reuses the existing `ApproveOrder` unit-of-work transaction. After the `Customer` is created, if the order carries credentials, `CustomerWriteRepository.provisionAccount` creates the `CustomerAccount` (email + stored hash) and an OWNER/ACTIVE `WorkspaceMembership` against the customer's workspace, all inside the same transaction. This makes the approved digital customer able to sign in through the existing `/customer/login` path (account→workspace resolves through the membership). NFC activation, access-code users, and product activation are unchanged. Migration: `20260726090000_order_account_credentials` (additive, applied successfully).

