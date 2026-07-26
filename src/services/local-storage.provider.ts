import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "@/types/providers";

export interface LocalStorageProviderOptions {
  rootDirectory?: string;
  publicPath?: string;
}

function safeStorageKey(key: string): string {
  const segments = key.split("/");
  if (
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[A-Za-z0-9._-]+$/.test(segment),
    )
  ) {
    throw new Error("Storage key contains an unsafe path segment");
  }
  return segments.join("/");
}

export class LocalStorageProvider implements StorageProvider {
  private readonly rootDirectory: string;
  private readonly publicPath: string;

  constructor(options: LocalStorageProviderOptions = {}) {
    this.rootDirectory =
      options.rootDirectory ?? path.join(process.cwd(), "public", "uploads");
    this.publicPath =
      "/" + (options.publicPath ?? "/uploads").replace(/^\/+|\/+$/g, "");
  }

  async put(input: {
    key: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<{ key: string; url: string }> {
    const key = safeStorageKey(input.key);
    const filePath = path.join(this.rootDirectory, ...key.split("/"));
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);
    return {
      key,
      url:
        this.publicPath +
        "/" +
        key
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/"),
    };
  }

  async delete(key: string): Promise<void> {
    const safeKey = safeStorageKey(key);
    const filePath = path.join(this.rootDirectory, ...safeKey.split("/"));
    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}
