import type { StorageProvider, StoragePutResult } from "@/types/providers";
import { getEnvironment } from "@/lib/env";
import { logger } from "@/lib/logger";

function maskKey(key: string): string {
  return key.slice(0, 12) + "...";
}

function sanitizeKey(key: string): string {
  return key.replace(/^\/+/, "").replace(/\.{2,}/g, "");
}

export class SupabaseStorageProvider implements StorageProvider {
  private readonly url: string;
  private readonly key: string;
  private readonly publicBucket: string;
  private readonly privateBucket: string | null;

  constructor(config = getEnvironment()) {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY || !config.SUPABASE_STORAGE_BUCKET) {
      throw new Error("Supabase Storage configuration is required (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET)");
    }
    this.url = config.SUPABASE_URL.replace(/\/$/, "");
    this.key = config.SUPABASE_SERVICE_ROLE_KEY;
    this.publicBucket = config.SUPABASE_STORAGE_BUCKET;
    this.privateBucket = config.SUPABASE_PRIVATE_STORAGE_BUCKET ?? null;

    logger.info("storage.provider.initialized", {
      endpoint: this.url,
      publicBucket: this.publicBucket,
      privateBucket: this.privateBucket ?? "(not configured — putPrivate will throw)",
      keyPrefix: maskKey(this.key),
    });
  }

  // ── Public bucket ──────────────────────────────────────────────

  async put(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoragePutResult> {
    const safe = sanitizeKey(input.key);

    logger.info("storage.upload.started", {
      bucket: this.publicBucket,
      visibility: "public",
      objectPath: safe,
      contentType: input.contentType,
      byteSize: input.body.byteLength,
    });

    await this.uploadToBucket(this.publicBucket, safe, input.body, input.contentType);

    logger.info("storage.upload.completed", {
      bucket: this.publicBucket,
      visibility: "public",
      objectPath: safe,
    });

    return {
      key: safe,
      url: `${this.url}/storage/v1/object/public/${this.publicBucket}/${safe}`,
    };
  }

  // ── Private bucket ─────────────────────────────────────────────

  async putPrivate(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoragePutResult> {
    if (!this.privateBucket) {
      throw new Error(
        "Private storage bucket is not configured. Set SUPABASE_PRIVATE_STORAGE_BUCKET to enable private uploads."
      );
    }

    const safe = sanitizeKey(input.key);

    logger.info("storage.upload.started", {
      bucket: this.privateBucket,
      visibility: "private",
      objectPath: safe,
      contentType: input.contentType,
      byteSize: input.body.byteLength,
    });

    await this.uploadToBucket(this.privateBucket, safe, input.body, input.contentType);

    // Generate a signed URL for immediate access. Store only the key
    // for long-term retrieval — call getSignedUrl() to get a fresh URL later.
    const signedUrl = await this.getSignedUrl(safe, 7 * 24 * 60 * 60); // 7 days

    logger.info("storage.upload.completed", {
      bucket: this.privateBucket,
      visibility: "private",
      objectPath: safe,
      hasSignedUrl: !!signedUrl,
    });

    return {
      key: safe,
      url: signedUrl, // ephemeral — stored in DB only for immediate consumption
    };
  }

  // ── Shared upload logic ────────────────────────────────────────

  private async uploadToBucket(
    bucket: string,
    key: string,
    body: Uint8Array,
    contentType: string,
  ): Promise<void> {
    const requestUrl = `${this.url}/storage/v1/object/${bucket}/${key}`;

    const headers = {
      Authorization: `Bearer ${this.key}`,
      apikey: this.key,
      "Content-Type": contentType,
      "x-upsert": "true",
    };

    console.log("=== SUPABASE UPLOAD REQUEST ===");
    console.log("URL:", requestUrl);
    console.log("Method: POST");
    console.log("Bucket:", bucket);
    console.log("Object path:", key);
    console.log("Headers:");
    console.log("  Authorization:", `Bearer ${this.key.slice(0, 25)}...`);
    console.log("  apikey:", `${this.key.slice(0, 25)}...`);
    console.log("  Content-Type:", contentType);
    console.log("  x-upsert: true");
    console.log("===============================");

    let response: Response;
    try {
      response = await fetch(requestUrl, {
        method: "POST",
        headers,
        body: Buffer.from(body),
      });
    } catch (err) {
      console.log("=== SUPABASE FETCH THREW ===");
      console.log(err);
      throw err;
    }

    console.log("=== SUPABASE UPLOAD RESPONSE ===");
    console.log("Status:", response.status, response.statusText);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    let bodyText = "";
    let bodyJson: unknown = null;
    try {
      bodyText = await response.text();
      bodyJson = JSON.parse(bodyText);
      console.log("Response JSON:", bodyJson);
    } catch {
      console.log("Response text:", bodyText);
    }
    console.log("================================");

    if (!response.ok) {
      logger.error("storage.upload.failed", undefined, {
        status: response.status,
        statusText: response.statusText,
        bucket,
        objectPath: key,
        requestUrl,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: bodyJson ?? bodyText,
      });

      const detail =
        bodyJson && typeof bodyJson === "object" && "message" in bodyJson
          ? String((bodyJson as Record<string, unknown>).message)
          : bodyText || response.statusText;
      throw new Error(`Supabase upload failed (${response.status}): ${detail}`);
    }
  }

  // ── Signed URL generation ──────────────────────────────────────

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string | undefined> {
    // Private assets live in the private bucket; fall back to public bucket
    // for backward compatibility with any existing assets.
    const bucket = this.privateBucket ?? this.publicBucket;
    const safe = sanitizeKey(key);

    const response = await fetch(
      `${this.url}/storage/v1/object/sign/${bucket}/${safe}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.key}`,
          apikey: this.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.error("storage.signedUrl.failed", undefined, {
        status: response.status,
        bucket,
        objectPath: safe,
        responseBody: body,
      });
      throw new Error(`Supabase signed URL failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { signedURL?: string };
    return data.signedURL ? `${this.url}/storage/v1${data.signedURL}` : undefined;
  }

  // ── Delete ─────────────────────────────────────────────────────

  async delete(key: string): Promise<void> {
    // Try both buckets — the asset could be in either.
    const safe = sanitizeKey(key);
    const buckets = [this.publicBucket];
    if (this.privateBucket) buckets.push(this.privateBucket);

    const results = await Promise.allSettled(
      buckets.map((bucket) =>
        fetch(`${this.url}/storage/v1/object/${bucket}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.key}`,
            apikey: this.key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes: [safe] }),
        }).then((response) => {
          if (!response.ok && response.status !== 404) {
            throw new Error(`Delete failed with status ${response.status}`);
          }
        }),
      ),
    );

    // Throw only if ALL deletion attempts failed
    const allFailed = results.every((r) => r.status === "rejected");
    if (allFailed) {
      const errors = results.map((r) =>
        r.status === "rejected" ? (r.reason as Error).message : "",
      );
      throw new Error(`Supabase delete failed for all buckets: ${errors.join("; ")}`);
    }
  }
}
