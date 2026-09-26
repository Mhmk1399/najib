export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function badRequest(message: string, details?: unknown): never {
  throw new ApiError(400, message, details);
}

export function unauthorized(message = "Unauthorized.", details?: unknown): never {
  throw new ApiError(401, message, details);
}

export function forbidden(message = "Forbidden.", details?: unknown): never {
  throw new ApiError(403, message, details);
}

export function notFound(message = "Not found.", details?: unknown): never {
  throw new ApiError(404, message, details);
}

export function conflict(message = "Conflict.", details?: unknown): never {
  throw new ApiError(409, message, details);
}
