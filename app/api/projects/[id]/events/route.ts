import { NextResponse } from "next/server";

import { createErrorResponse } from "@/lib/server/error-response";
import { buildEventToMessage, createSseStream, SSE_HEADERS } from "@/lib/server/sse";
import { inMemoryProjectStore } from "@/lib/store/in-memory-project-store";
import { projectIdSchema } from "@/lib/validation/project-schemas";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  try {
    const parsed = projectIdSchema.safeParse(context.params);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue): string => issue.message);
      return createErrorResponse(400, "VALIDATION_ERROR", "Invalid project id", details);
    }

    const build = inMemoryProjectStore.getBuild(parsed.data.id);
    if (!build) {
      return createErrorResponse(404, "NOT_FOUND", "Build not found");
    }

    const stream = createSseStream({
      request,
      onStart(send): () => void {
        send({ event: "build.updated", id: build.updatedAt, data: build });

        const unsubscribe = inMemoryProjectStore.subscribe(parsed.data.id, (event): void => {
          send(buildEventToMessage(event));
        });

        return (): void => {
          unsubscribe();
        };
      }
    });

    return new NextResponse(stream, { headers: SSE_HEADERS });
  } catch {
    return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected error while opening event stream");
  }
}
