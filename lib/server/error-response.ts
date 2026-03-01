import { NextResponse } from "next/server";

import type { ApiErrorResponse } from "@/lib/types/build";

export function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details ? { details } : {})
      }
    },
    { status }
  );
}
