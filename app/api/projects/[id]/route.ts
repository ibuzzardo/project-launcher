import { NextResponse } from "next/server";

import { createErrorResponse } from "@/lib/server/error-response";
import { inMemoryProjectStore } from "@/lib/store/in-memory-project-store";
import type { ApiProjectResponse } from "@/lib/types/project";
import { projectIdSchema } from "@/lib/validation/project-schemas";

interface RouteContext {
  params: { id: string };
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse<ApiProjectResponse>> {
  try {
    const parsed = projectIdSchema.safeParse(context.params);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue): string => issue.message);
      return createErrorResponse(400, "VALIDATION_ERROR", "Invalid project id", details) as NextResponse<ApiProjectResponse>;
    }

    const build = inMemoryProjectStore.getBuild(parsed.data.id);
    if (!build) {
      return createErrorResponse(404, "NOT_FOUND", "Build not found") as NextResponse<ApiProjectResponse>;
    }

    return NextResponse.json({ data: build });
  } catch {
    return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected error while loading build") as NextResponse<ApiProjectResponse>;
  }
}
