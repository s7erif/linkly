export type LogContext = Readonly<Record<string, unknown>>;
export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
}
const SECRET_KEY = /(authorization|cookie|password|secret|token|code|hash)/i;
function sanitize(value: unknown): unknown {
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? "[REDACTED]" : item]));
}
function write(level: string, message: string, context?: LogContext, error?: unknown): void {
  const record = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...((sanitize(context) as Record<string, unknown> | undefined) ?? {}), ...(error ? { error: sanitize(error) } : {}) });
  level === "error" ? console.error(record) : level === "warn" ? console.warn(record) : console.log(record);
}
export const logger: Logger = {
  debug: (message, context) => write("debug", message, context),
  info: (message, context) => write("info", message, context),
  warn: (message, context) => write("warn", message, context),
  error: (message, error, context) => write("error", message, context, error),
};
