export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, string[]>;

  public constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
