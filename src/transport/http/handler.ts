import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
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
    const publicServerError = error.statusCode >= 500;
    const body: ErrorEnvelope = { success: false, error: { code: publicServerError ? "INTERNAL_ERROR" : error.code, message: publicServerError ? "Internal server error" : error.message, ...(!publicServerError && error.details ? { details: error.details } : {}) } };
    return Response.json(body, { status: error.statusCode, headers: responseHeaders(requestId, { "cache-control": "no-store" }) });
  }
  const body: ErrorEnvelope = { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } };
  return Response.json(body, { status: 500, headers: responseHeaders(requestId, { "cache-control": "no-store" }) });
}
export async function handleRoute<T>(request: Request, operation: (requestId: string) => Promise<RouteResult<T>>): Promise<Response> {
  const requestId = requestIdFor(request);
  const startedAt = performance.now();
  const context = { requestId, method: request.method, path: new URL(request.url).pathname };
  logger.info("http.request.started", context);
  try {
    const result = await operation(requestId);
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
