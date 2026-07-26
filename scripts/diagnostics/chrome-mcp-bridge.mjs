import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const allowedSecretNames = new Set(["ADMIN_USERNAME", "ADMIN_PASSWORD"]);

function resolveSecretReferences(value) {
  if (Array.isArray(value)) return value.map(resolveSecretReferences);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        resolveSecretReferences(entry),
      ]),
    );
  }
  if (typeof value !== "string" || !value.startsWith("$ENV:")) return value;

  const name = value.slice("$ENV:".length);
  if (!allowedSecretNames.has(name)) {
    throw new Error(`Environment reference is not allowed: ${name}`);
  }
  const secret = process.env[name];
  if (!secret) throw new Error(`Required environment value is missing: ${name}`);
  return secret;
}

const server = spawn(
  "npx",
  [
    "-y",
    "chrome-devtools-mcp@latest",
    "--headless",
    "--executablePath",
    "/snap/bin/chromium",
    "--chromeArg=--no-sandbox",
    "--isolated",
    "--viewport",
    "1440x900",
    "--no-performance-crux",
  ],
  { stdio: ["pipe", "pipe", "pipe"] },
);

let nextId = 1;
let stdoutBuffer = "";
const pending = new Map();

function send(message) {
  server.stdin.write(`${JSON.stringify(message)}\n`);
}

function request(method, params = {}) {
  const id = nextId++;
  send({ jsonrpc: "2.0", id, method, params });

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

server.stdout.setEncoding("utf8");
server.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk;

  while (stdoutBuffer.includes("\n")) {
    const newline = stdoutBuffer.indexOf("\n");
    const line = stdoutBuffer.slice(0, newline).trim();
    stdoutBuffer = stdoutBuffer.slice(newline + 1);
    if (!line) continue;

    const message = JSON.parse(line);
    if (message.method === "roots/list" && message.id !== undefined) {
      send({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          roots: [
            {
              uri: "file:///home/sherif/Pictures/ai-business-card-main",
              name: "ai-business-card-main",
            },
          ],
        },
      });
      continue;
    }

    if (message.id === undefined) continue;
    const waiter = pending.get(message.id);
    if (!waiter) continue;
    pending.delete(message.id);

    if (message.error) {
      waiter.reject(new Error(JSON.stringify(message.error)));
    } else {
      waiter.resolve(message.result);
    }
  }
});

server.stderr.setEncoding("utf8");
server.stderr.on("data", (chunk) => {
  process.stderr.write(`[chrome-mcp] ${chunk}`);
});

server.on("exit", (code, signal) => {
  process.stderr.write(
    `[chrome-mcp] exited code=${String(code)} signal=${String(signal)}\n`,
  );
  process.exitCode = code ?? 1;
});

const initialized = await request("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: { roots: { listChanged: false } },
  clientInfo: { name: "oi-cards-performance-profiler", version: "1.0.0" },
});
send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
process.stdout.write(
  `${JSON.stringify({
    ready: true,
    protocolVersion: initialized.protocolVersion,
    serverInfo: initialized.serverInfo,
  })}\n`,
);

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (!line.trim()) continue;

  try {
    const command = resolveSecretReferences(JSON.parse(line));
    if (command.exit) {
      server.kill("SIGTERM");
      break;
    }

    const result = command.tool
      ? await request("tools/call", {
          name: command.tool,
          arguments: command.arguments ?? {},
        })
      : await request(command.method, command.params ?? {});
    process.stdout.write(`${JSON.stringify({ ok: true, result })}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
  }
}
