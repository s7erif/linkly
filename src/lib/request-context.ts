import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  /** 8-char hex prefix of the request ID for log correlation. */
  shortId: string;
  /** HTTP method + path for log identification. */
  route: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Set the current request context. Called once per request in handleRoute. */
export function runWithRequestContext<T>(
  requestId: string,
  route: string,
  fn: () => Promise<T>,
): Promise<T> {
  const shortId = requestId.replace(/-/g, "").slice(0, 8);
  return storage.run({ shortId, route }, fn);
}

/** Returns "[route][shortId]" for log correlation, or "[?]" outside a request. */
export function requestTag(): string {
  const ctx = storage.getStore();
  if (!ctx) return "[?]";
  return `[${ctx.route}][${ctx.shortId}]`;
}
