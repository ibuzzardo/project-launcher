import type { BuildEvent } from "@/lib/types/project";

const encoder = new TextEncoder();

export const SSE_HEADERS: HeadersInit = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive"
};

export interface SseMessage {
  event: string;
  data: unknown;
  id?: string;
}

export interface CreateSseStreamOptions {
  request: Request;
  heartbeatMs?: number;
  onStart: (send: (message: SseMessage) => void, close: () => void) => void | (() => void);
}

export function toSseMessage(message: SseMessage): string {
  const chunks: string[] = [];
  if (message.id) {
    chunks.push(`id: ${message.id}`);
  }
  chunks.push(`event: ${message.event}`);
  chunks.push(`data: ${JSON.stringify(message.data)}`);
  chunks.push("\n");
  return chunks.join("\n");
}

export function createSseStream(options: CreateSseStreamOptions): ReadableStream<Uint8Array> {
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let teardown: (() => void) | undefined;
  let abortHandler: (() => void) | undefined;
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;

  const cleanup = (): void => {
    if (closed) {
      return;
    }
    closed = true;

    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }

    if (abortHandler) {
      options.request.signal.removeEventListener("abort", abortHandler);
      abortHandler = undefined;
    }

    if (teardown) {
      teardown();
      teardown = undefined;
    }
  };

  const close = (): void => {
    cleanup();
    if (controllerRef) {
      try {
        controllerRef.close();
      } catch {
        // Stream may already be closed.
      }
    }
  };

  return new ReadableStream<Uint8Array>({
    start(controller): void {
      controllerRef = controller;

      const send = (message: SseMessage): void => {
        if (closed) {
          return;
        }
        controller.enqueue(encoder.encode(toSseMessage(message)));
      };

      try {
        teardown = options.onStart(send, close) ?? undefined;

        heartbeat = setInterval((): void => {
          send({ event: "heartbeat", data: { ts: Date.now() } });
        }, options.heartbeatMs ?? 15000);

        abortHandler = (): void => {
          close();
        };

        if (options.request.signal.aborted) {
          close();
        } else {
          options.request.signal.addEventListener("abort", abortHandler, { once: true });
        }
      } catch {
        close();
      }
    },
    cancel(): void {
      // Critical fix: explicitly release heartbeat + teardown + abort listener.
      close();
    }
  });
}

export function buildEventToMessage(event: BuildEvent): SseMessage {
  return {
    event: event.type,
    id: event.payload.updatedAt,
    data: event.payload
  };
}
