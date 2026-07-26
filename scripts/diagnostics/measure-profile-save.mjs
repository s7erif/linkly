import { config } from "dotenv";
import { performance } from "node:perf_hooks";
import { encode } from "next-auth/jwt";
import pg from "pg";

config({ path: ".env.local" });
config();

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3100";
const cardId =
  process.argv[3] ?? "20b71e7d-75b2-479b-99f7-bfaba3a263ce";

if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL is required");

const database = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  application_name: "oi_profile_save_measurement",
});
await database.connect();

try {
  const profileResult = await database.query(
    `select
       profile."fullName",
       profile.headline,
       profile.company,
       profile.bio,
       profile.email,
       profile.phone,
       profile.website,
       profile.address,
       profile."countryCode",
       octet_length(asset."publicUrl")::integer as "avatarBytes",
       left(asset."publicUrl", 22) as "avatarPrefix"
     from "Card" card
     join "CardProfile" profile on profile."cardId" = card.id
     left join lateral (
       select media_asset."publicUrl"
       from "CardMedia" card_media
       join "MediaAsset" media_asset on media_asset.id = card_media."mediaAssetId"
       where card_media."cardId" = card.id
         and card_media.role = 'AVATAR'
       order by card_media."createdAt" desc
       limit 1
     ) asset on true
     where card.id = $1`,
    [cardId],
  );
  if (profileResult.rowCount !== 1) throw new Error(`Card ${cardId} not found`);

  const adminResult = await database.query(
    `select id, email, name
     from "AdminUser"
     where email = $1
       and "isActive" = true
       and "deletedAt" is null`,
    ["admin@oicards.local"],
  );
  if (adminResult.rowCount !== 1) throw new Error("Diagnostic admin not found");
  const admin = adminResult.rows[0];
  const sessionToken = await encode({
    secret:
      process.env.NEXTAUTH_SECRET ??
      "fallback_secret_for_development_only",
    token: {
      id: admin.id,
      sub: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });

  const row = profileResult.rows[0];
  const requestId = `profile-measure-${crypto.randomUUID()}`;
  const requestBody = JSON.stringify({
    sessionToken: "0".repeat(64),
    profile: {
      fullName: row.fullName,
      headline: row.headline,
      company: row.company,
      bio: row.bio,
      email: row.email,
      phone: row.phone,
      website: row.website,
      address: row.address,
      countryCode: row.countryCode,
    },
  });

  const startedAt = performance.now();
  const response = await fetch(
    `${baseUrl}/cards/${cardId}/profile?save=true`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: `next-auth.session-token=${sessionToken}`,
        "x-request-id": requestId,
      },
      body: requestBody,
    },
  );
  const responseText = await response.text();
  const finishedAt = performance.now();

  process.stdout.write(
    `${JSON.stringify(
      {
        requestId,
        status: response.status,
        p2028: responseText.includes("P2028"),
        wallMs: Number((finishedAt - startedAt).toFixed(3)),
        requestBytes: Buffer.byteLength(requestBody),
        responseBytes: Buffer.byteLength(responseText),
        avatarBytes: row.avatarBytes,
        avatarPrefix: row.avatarPrefix,
        response: JSON.parse(responseText),
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await database.end();
}
