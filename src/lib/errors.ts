export type ErrorDetails = Readonly<Record<string, unknown>>;

export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode = 500,
    readonly code = "INTERNAL_ERROR",
    readonly details?: ErrorDetails,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: ErrorDetails) { super(message, 400, "VALIDATION_ERROR", details); }
}
export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string) { super(id ? `${resource} was not found` : resource, 404, "NOT_FOUND", id ? { id } : undefined); }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") { super(message, 401, "UNAUTHORIZED"); }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") { super(message, 403, "FORBIDDEN"); }
}
export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) { super(message, 409, "CONFLICT", details); }
}
export class ConfigurationError extends AppError {
  constructor(message: string) { super(message, 500, "CONFIGURATION_ERROR"); }
}
