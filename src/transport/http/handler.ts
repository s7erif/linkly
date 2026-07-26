import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { runWithRequestContext } from "@/lib/request-context";
import type { ErrorEnvelope, RouteResult, SuccessEnvelope } from "./contracts";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
function requestIdFor(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && REQUEST_ID_PATTERN.test(supplied) ? supplied : crypto.randomUUID();
}
function responseHeaders(requestId: string, additions?: HeadersInit): Headers {
  const headers = new Headers(additions);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-request-id", requestId);
  return headers;
}
function errorResponse(error: unknown, requestId: string): Response {
  if (error instanceof AppError) {
    const body: ErrorEnvelope = { success: false, error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } };
    console.error("[handleRoute] AppError:", { code: error.code, message: error.message, statusCode: error.statusCode });
    return Response.json(body, { status: error.statusCode, headers: responseHeaders(requestId, { "cache-control": "no-store" }) });
  }
  console.error("[handleRoute] Unknown error:", {
    name: (error as any)?.name,
    message: error instanceof Error ? error.message : String(error),
    code: (error as any)?.code,
    meta: (error as any)?.meta,
  });
  const message = error instanceof Error ? error.message : "Internal server error";
  const body: ErrorEnvelope = { success: false, error: { code: "INTERNAL_ERROR", message } };
  return Response.json(body, { status: 500, headers: responseHeaders(requestId, { "cache-control": "no-store" }) });
}
export async function handleRoute<T>(request: Request, operation: (requestId: string) => Promise<RouteResult<T>>): Promise<Response> {
  const requestId = requestIdFor(request);
  const route = `${request.method} ${new URL(request.url).pathname}`;
  const startedAt = performance.now();
  const context = { requestId, method: request.method, path: new URL(request.url).pathname };
  logger.info("http.request.started", context);
  try {
    const result = await runWithRequestContext(requestId, route, () => operation(requestId));
    const body: SuccessEnvelope<T> = { success: true, data: result.data };
    const response = Response.json(body, { status: result.status ?? 200, headers: responseHeaders(requestId, result.headers) });
    logger.info("http.request.completed", { ...context, status: response.status, durationMs: Math.round(performance.now() - startedAt) });
    return response;
  } catch (error) {
    const response = errorResponse(error, requestId);
    if (response.status >= 500) logger.error("http.request.failed", error, { ...context, status: response.status, durationMs: Math.round(performance.now() - startedAt) });
    else logger.warn("http.request.rejected", { ...context, status: response.status, errorCode: error instanceof AppError ? error.code : "INTERNAL_ERROR", durationMs: Math.round(performance.now() - startedAt) });
    return response;
  }
}
