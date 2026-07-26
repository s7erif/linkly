import "dotenv/config";
import { monitorEventLoopDelay, performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

const assetId =
  process.argv[2] ?? "c270543f-4652-470b-a091-86d56f5910e4";
const shortUrl = "https://example.com/avatar.png";

if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL is required");

function percentile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function fixed(value) {
  return value === null ? null : Number(value.toFixed(3));
}

async function measure(label) {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    application_name: `oi_media_transfer_${label}`,
  });
  await client.connect();

  const chunks = [];
  const stream = client.connection.stream;
  stream.on("data", (chunk) => {
    chunks.push({ at: performance.now(), bytes: chunk.length });
  });

  const eventLoop = monitorEventLoopDelay({ resolution: 1 });
  eventLoop.enable();
  await delay(25);

  const cpuStart = process.cpuUsage();
  const startedAt = performance.now();
  const result = await client.query(
    `select id, "publicUrl" from "MediaAsset" where id = $1`,
    [assetId],
  );
  const resolvedAt = performance.now();
  const cpu = process.cpuUsage(cpuStart);
  eventLoop.disable();
  await client.end();

  const gaps = chunks.slice(1).map((chunk, index) => chunk.at - chunks[index].at);
  const socketBytes = chunks.reduce((total, chunk) => total + chunk.bytes, 0);
  const firstAt = chunks[0]?.at ?? null;
  const lastAt = chunks.at(-1)?.at ?? null;
  const transferMs =
    firstAt === null || lastAt === null ? null : lastAt - firstAt;

  return {
    label,
    wallMs: fixed(resolvedAt - startedAt),
    valueBytes: Buffer.byteLength(result.rows[0].publicUrl),
    socketBytes,
    socketChunks: chunks.length,
    averageChunkBytes: fixed(socketBytes / chunks.length),
    submitToFirstByteMs:
      firstAt === null ? null : fixed(firstAt - startedAt),
    firstToLastByteMs: fixed(transferMs),
    lastByteToResolveMs:
      lastAt === null ? null : fixed(resolvedAt - lastAt),
    throughputBytesPerSecond:
      transferMs && transferMs > 0 ? fixed(socketBytes / (transferMs / 1000)) : null,
    interChunkGapMs: {
      average: fixed(
        gaps.length === 0
          ? null
          : gaps.reduce((total, gap) => total + gap, 0) / gaps.length,
      ),
      p50: fixed(percentile(gaps, 0.5)),
      p95: fixed(percentile(gaps, 0.95)),
      maximum: fixed(gaps.length === 0 ? null : Math.max(...gaps)),
      gapsOver100Ms: gaps.filter((gap) => gap > 100).length,
      gapsOver500Ms: gaps.filter((gap) => gap > 500).length,
    },
    processCpuMs: {
      user: fixed(cpu.user / 1000),
      system: fixed(cpu.system / 1000),
      total: fixed((cpu.user + cpu.system) / 1000),
    },
    eventLoopDelayMs: {
      mean: fixed(eventLoop.mean / 1e6),
      p95: fixed(eventLoop.percentile(95) / 1e6),
      maximum: fixed(eventLoop.max / 1e6),
    },
  };
}

const control = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  application_name: "oi_media_transfer_control",
});
await control.connect();

let original;
try {
  const before = await control.query(
    `select
       "publicUrl",
       octet_length("publicUrl") as bytes,
       md5("publicUrl") as md5,
       "updatedAt"
     from "MediaAsset"
     where id = $1`,
    [assetId],
  );
  original = before.rows[0];
  if (!original?.publicUrl?.startsWith("data:image/")) {
    throw new Error("Expected the original MediaAsset value to be an image data URL");
  }

  const base64 = await measure("base64");

  const changed = await control.query(
    `update "MediaAsset"
     set "publicUrl" = $1
     where id = $2
       and md5("publicUrl") = $3
     returning octet_length("publicUrl") as bytes, md5("publicUrl") as md5`,
    [shortUrl, assetId, original.md5],
  );
  if (changed.rowCount !== 1) throw new Error("Guarded short-URL update failed");

  const https = await measure("https");

  process.stdout.write(
    `${JSON.stringify({
      assetId,
      original: {
        bytes: Number(original.bytes),
        md5: original.md5,
        updatedAt: original.updatedAt,
      },
      temporary: changed.rows[0],
      base64,
      https,
    }, null, 2)}\n`,
  );
} finally {
  if (original) {
    await control.query(
      `update "MediaAsset"
       set "publicUrl" = $1,
           "updatedAt" = $2
       where id = $3
         and "publicUrl" = $4`,
      [original.publicUrl, original.updatedAt, assetId, shortUrl],
    );
  }

  const restored = await control.query(
    `select
       octet_length("publicUrl") as bytes,
       md5("publicUrl") as md5,
       "updatedAt"
     from "MediaAsset"
     where id = $1`,
    [assetId],
  );
  process.stdout.write(
    `${JSON.stringify({ restored: restored.rows[0] }, null, 2)}\n`,
  );
  await control.end();
}
