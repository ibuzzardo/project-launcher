import { fromUnknownError, notFound } from "@/lib/http/response";
import { getBuild, subscribeToBuild } from "@/lib/store/build-store";

interface BuildLogsRouteContext {
  params: {
    id: string;
  };
}

function ssePayload(event: string, data: unknown): Uint8Array {
  const content: string = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(content);
}

export async function GET(request: Request, context: BuildLogsRouteContext): Promise<Response> {
  try {
    const buildId: string = context.params.id;
    const build = getBuild(buildId);

    if (!build) {
      return notFound(`Build ${buildId} was not found`);
    }

    let closed = false;
    let unsubscribe: (() => void) | null = null;

    const stream = new ReadableStream<Uint8Array>({
      start(controller): void {
        const safeWrite = (event: string, payload: unknown): void => {
          if (closed) {
            return;
          }
          try {
            controller.enqueue(ssePayload(event, payload));
          } catch {
            cleanup();
          }
        };

        const cleanup = (): void => {
          if (closed) {
            return;
          }
          closed = true;
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          try {
            controller.close();
          } catch {
            // no-op when already closed
          }
        };

        safeWrite("snapshot", { build });

        unsubscribe = subscribeToBuild(buildId, (nextBuild, log): void => {
          safeWrite("build", nextBuild);
          if (log) {
            safeWrite("log", log);
          }
          if (nextBuild.status === "success" || nextBuild.status === "failed") {
            safeWrite("done", { id: nextBuild.id, status: nextBuild.status });
          }
        });

        request.signal.addEventListener("abort", () => {
          cleanup();
        });
      },
      cancel(): void {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        closed = true;
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (cause: unknown) {
    return fromUnknownError(cause);
  }
}
