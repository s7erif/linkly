import type { StorageProvider } from "@/types/providers";
import { getEnvironment } from "@/lib/env";
import { logger } from "@/lib/logger";

function maskKey(key: string): string {
  return key.slice(0, 12) + "...";
}

export class SupabaseStorageProvider implements StorageProvider {
  private readonly url: string;
  private readonly key: string;
  private readonly bucket: string;

  constructor(config = getEnvironment()) {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY || !config.SUPABASE_STORAGE_BUCKET) {
      throw new Error("Supabase Storage configuration is required");
    }
    this.url = config.SUPABASE_URL.replace(/\/$/, "");
    this.key = config.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = config.SUPABASE_STORAGE_BUCKET;
    logger.info("storage.provider.initialized", {
      endpoint: this.url,
      bucket: this.bucket,
      keyPrefix: maskKey(this.key),
    });
  }

  async put(input: { key: string; body: Uint8Array; contentType: string }) {
    const safe = input.key.replace(/^\/+/, "").replace(/\.{2,}/g, "");
    const requestUrl = `${this.url}/storage/v1/object/${this.bucket}/${safe}`;

    logger.info("storage.upload.started", {
      bucket: this.bucket,
      objectPath: safe,
      contentType: input.contentType,
      byteSize: input.body.byteLength,
      requestUrl,
    });

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        apikey: this.key,
        "Content-Type": input.contentType,
      },
      body: Buffer.from(input.body),
    });

    if (!response.ok) {
      let bodyText = "";
      let bodyJson: unknown = null;
      try {
        bodyText = await response.text();
        bodyJson = JSON.parse(bodyText);
      } catch {
        // body is not JSON — keep the raw text
      }

      logger.error("storage.upload.failed", undefined, {
        status: response.status,
        statusText: response.statusText,
        bucket: this.bucket,
        objectPath: safe,
        requestUrl,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: bodyJson ?? bodyText,
      });

      const detail = bodyJson && typeof bodyJson === "object" && "message" in bodyJson
        ? String((bodyJson as Record<string, unknown>).message)
        : bodyText || response.statusText;
      throw new Error(`Supabase upload failed (${response.status}): ${detail}`);
    }

    logger.info("storage.upload.completed", {
      bucket: this.bucket,
      objectPath: safe,
    });

    return {
      key: safe,
      url: `${this.url}/storage/v1/object/public/${this.bucket}/${safe}`,
    };
  }

  async delete(key: string) {
    const safe = key.replace(/^\/+/, "").replace(/\.{2,}/g, "");
    const response = await fetch(`${this.url}/storage/v1/object/${this.bucket}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.key}`,
        apikey: this.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [safe] }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Supabase delete failed (${response.status}): ${body}`);
    }
  }

  async signedUrl(key: string, expiresIn = 3600) {
    const safe = key.replace(/^\/+/, "").replace(/\.{2,}/g, "");
    const response = await fetch(`${this.url}/storage/v1/object/sign/${this.bucket}/${safe}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        apikey: this.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Supabase signed URL failed (${response.status}): ${body}`);
    }
    const data = (await response.json()) as { signedURL?: string };
    return data.signedURL ? `${this.url}/storage/v1${data.signedURL}` : undefined;
  }
}
