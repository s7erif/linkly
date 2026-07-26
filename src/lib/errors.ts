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
export class InvalidAccessCodeError extends UnauthorizedError {
  constructor() { super("Access code is invalid, expired, or revoked"); }
}
export class InitialAccessCodeExistsError extends ConflictError {
  constructor(cardId: string) { super("An access code already exists for this card", { cardId }); }
}

export class InvalidOrderTransitionError extends ConflictError {
  constructor(from: string, to: string) { super(`Order cannot transition from ${from} to ${to}`, { from, to }); }
}

// ── Customer authentication errors ──────────────────────────────────────

/** No CustomerAccount row exists for this email. */
export class AccountNotFoundError extends AppError {
  constructor() { super("No account found for this email.", 401, "ACCOUNT_NOT_FOUND"); }
}

/** Account row exists but passwordHash / passwordSalt are null — account was never provisioned. */
export class AccountNotProvisionedError extends AppError {
  constructor() { super("Account has not been fully provisioned.", 401, "ACCOUNT_NOT_PROVISIONED"); }
}

/** Account exists but has no active workspace membership. */
export class AccountNotActivatedError extends AppError {
  constructor() { super("Account has not been activated.", 401, "ACCOUNT_NOT_ACTIVATED"); }
}

/** Account exists but the supplied password does not match. */
export class InvalidPasswordError extends AppError {
  constructor() { super("Email or password is incorrect.", 401, "INVALID_PASSWORD"); }
}
