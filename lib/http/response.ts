import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError, isApiError } from "@/lib/errors/api-error";
import type { ApiErrorResponse, ApiSuccess } from "@/lib/types/build";

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function error(code: string, message: string, status: number, details?: Record<string, string[]>): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details
      }
    },
    { status }
  );
}

export function fromZodError(err: ZodError): NextResponse<ApiErrorResponse> {
  const flattened: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key: string = issue.path.join(".") || "body";
    if (!flattened[key]) {
      flattened[key] = [];
    }
    flattened[key].push(issue.message);
  }
  return error("VALIDATION_ERROR", "Invalid request body", 400, flattened);
}

export function fromUnknownError(cause: unknown): NextResponse<ApiErrorResponse> {
  if (isApiError(cause)) {
    return error(cause.code, cause.message, cause.status, cause.details);
  }
  if (cause instanceof SyntaxError) {
    return error("MALFORMED_JSON", "Malformed JSON request body", 400);
  }
  return error("INTERNAL_ERROR", "Internal server error", 500);
}

export function badRequest(message: string, details?: Record<string, string[]>): NextResponse<ApiErrorResponse> {
  return error("BAD_REQUEST", message, 400, details);
}

export function notFound(message: string): NextResponse<ApiErrorResponse> {
  return error("NOT_FOUND", message, 404);
}

export function internal(message = "Internal server error"): NextResponse<ApiErrorResponse> {
  return error("INTERNAL_ERROR", message, 500);
}

export function apiError(code: string, message: string, status: number, details?: Record<string, string[]>): ApiError {
  return new ApiError(code, message, status, details);
}
