import { NextResponse } from "next/server";

import { createErrorResponse } from "@/lib/server/error-response";
import { inMemoryProjectStore } from "@/lib/store/in-memory-project-store";
import type { ApiProjectResponse } from "@/lib/types/project";
import { createProjectSchema } from "@/lib/validation/project-schemas";

export async function POST(request: Request): Promise<NextResponse<ApiProjectResponse>> {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON") as NextResponse<ApiProjectResponse>;
    }

    const parsed = createProjectSchema.safeParse(rawBody);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue): string => issue.message);
      return createErrorResponse(400, "VALIDATION_ERROR", "Invalid project launch request", details) as NextResponse<ApiProjectResponse>;
    }

    const build = inMemoryProjectStore.createBuild(parsed.data);
    return NextResponse.json({ data: build }, { status: 201 });
  } catch {
    return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected error while creating project") as NextResponse<ApiProjectResponse>;
  }
}
