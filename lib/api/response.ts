export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiFailureResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export function isApiFailureResponse(value: unknown): value is ApiFailureResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as { ok?: unknown; error?: { code?: unknown; message?: unknown } };
  return (
    candidate.ok === false &&
    typeof candidate.error?.code === "string" &&
    typeof candidate.error?.message === "string"
  );
}
