export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "INTERNAL";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError("BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError("UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError("FORBIDDEN", message);
  }

  static notFound(message: string) {
    return new AppError("NOT_FOUND", message);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError("CONFLICT", message, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError("UNPROCESSABLE", message, details);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
