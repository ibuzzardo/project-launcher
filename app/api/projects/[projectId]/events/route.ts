import { fromUnknownError, notFound } from "@/lib/http/response";
import { buildEventToMessage, createSseStream, SSE_HEADERS } from "@/lib/server/sse";
import { projectStore } from "@/lib/store/in-memory-project-store";

interface EventsRouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(
  request: Request,
  context: EventsRouteContext
): Promise<Response> {
  try {
    const projectId = context.params.projectId?.trim();
    if (!projectId) {
      return notFound("Build was not found");
    }

    const build = projectStore.getBuild(projectId);
    if (!build) {
      return notFound(`Build '${projectId}' was not found`);
    }

    const stream = createSseStream({
      request,
      onStart(send): () => void {
        send({ event: "snapshot", id: build.updatedAt, data: build });
        const unsubscribe = projectStore.subscribe(projectId, (event): void => {
          send(buildEventToMessage(event));
        });
        return (): void => {
          unsubscribe();
        };
      }
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error: unknown) {
    return fromUnknownError(error);
  }
}
