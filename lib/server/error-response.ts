import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/lib/types/project";

export function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: string[]
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {})
      }
    },
    { status }
  );
}
