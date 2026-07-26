import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "@/services/local-storage.provider";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function provider() {
  const rootDirectory = await mkdtemp(path.join(tmpdir(), "oi-uploads-"));
  directories.push(rootDirectory);
  return {
    rootDirectory,
    storage: new LocalStorageProvider({
      rootDirectory,
      publicPath: "/uploads",
    }),
  };
}

describe("LocalStorageProvider", () => {
  it("writes bytes to disk and returns only a lightweight uploads URL", async () => {
    const { rootDirectory, storage } = await provider();
    const body = new Uint8Array([137, 80, 78, 71]);

    const result = await storage.put({
      key: "media/11111111-1111-4111-8111-111111111111/avatar.png",
      body,
      contentType: "image/png",
    });

    expect(result).toEqual({
      key: "media/11111111-1111-4111-8111-111111111111/avatar.png",
      url: "/uploads/media/11111111-1111-4111-8111-111111111111/avatar.png",
    });
    expect(result.url).not.toContain("base64");
    expect(
      await readFile(
        path.join(
          rootDirectory,
          "media/11111111-1111-4111-8111-111111111111/avatar.png",
        ),
      ),
    ).toEqual(Buffer.from(body));
  });

  it("deletes persisted files and treats a missing file as already deleted", async () => {
    const { rootDirectory, storage } = await provider();
    const key = "media/workspace/avatar.webp";
    await storage.put({
      key,
      body: new Uint8Array([1, 2, 3]),
      contentType: "image/webp",
    });

    await storage.delete(key);
    await expect(
      access(path.join(rootDirectory, "media/workspace/avatar.webp")),
    ).rejects.toMatchObject({ code: "ENOENT" });
    await expect(storage.delete(key)).resolves.toBeUndefined();
  });

  it("rejects path traversal instead of writing outside the upload root", async () => {
    const { storage } = await provider();

    await expect(
      storage.put({
        key: "../avatar.png",
        body: new Uint8Array([1]),
        contentType: "image/png",
      }),
    ).rejects.toThrow("unsafe path segment");
  });
});
