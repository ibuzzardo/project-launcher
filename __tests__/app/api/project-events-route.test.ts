import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBuild: vi.fn(),
  subscribe: vi.fn(),
  notFound: vi.fn((message: string) =>
    Response.json({ ok: false, error: { code: "NOT_FOUND", message } }, { status: 404 })
  ),
  fromUnknownError: vi.fn(() =>
    Response.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
      { status: 500 }
    )
  ),
  createSseStream: vi.fn(() => new ReadableStream()),
  buildEventToMessage: vi.fn((event: unknown) => ({ event: "build-update", data: event })),
  SSE_HEADERS: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  } as HeadersInit
}));

vi.mock("@/lib/store/in-memory-project-store", () => ({
  projectStore: {
    getBuild: mocks.getBuild,
    subscribe: mocks.subscribe
  }
}));

vi.mock("@/lib/http/response", () => ({
  notFound: mocks.notFound,
  fromUnknownError: mocks.fromUnknownError
}));

vi.mock("@/lib/server/sse", () => ({
  createSseStream: mocks.createSseStream,
  buildEventToMessage: mocks.buildEventToMessage,
  SSE_HEADERS: mocks.SSE_HEADERS
}));

import { GET } from "@/app/api/projects/[projectId]/events/route";

describe("GET /api/projects/[projectId]/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not found when project id is blank", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "  " }
    });

    expect(mocks.notFound).toHaveBeenCalledWith("Build was not found");
    expect(mocks.getBuild).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
  });

  it("returns not found when build does not exist", async () => {
    mocks.getBuild.mockReturnValue(undefined);

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "build-404" }
    });

    expect(mocks.getBuild).toHaveBeenCalledWith("build-404");
    expect(mocks.notFound).toHaveBeenCalledWith("Build 'build-404' was not found");
    expect(response.status).toBe(404);
  });

  it("creates SSE stream, sends initial snapshot, and wires subscription cleanup", async () => {
    const build = { id: "build-1", updatedAt: "1700000000", status: "running", logs: [] };
    let eventHandler: ((event: unknown) => void) | undefined;
    const unsubscribe = vi.fn();

    mocks.getBuild.mockReturnValue(build);
    mocks.subscribe.mockImplementation((_projectId: string, cb: (event: unknown) => void) => {
      eventHandler = cb;
      return unsubscribe;
    });

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "  build-1  " }
    });

    expect(mocks.getBuild).toHaveBeenCalledWith("build-1");
    expect(mocks.createSseStream).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");

    const config = mocks.createSseStream.mock.calls[0][0] as {
      onStart: (send: (message: unknown) => void) => () => void;
    };
    const send = vi.fn();

    const cleanup = config.onStart(send);

    expect(send).toHaveBeenCalledWith({
      event: "snapshot",
      id: build.updatedAt,
      data: build
    });
    expect(mocks.subscribe).toHaveBeenCalledWith("build-1", expect.any(Function));

    const updateEvent = { type: "status", payload: { status: "success" } };
    eventHandler?.(updateEvent);

    expect(mocks.buildEventToMessage).toHaveBeenCalledWith(updateEvent);
    expect(send).toHaveBeenLastCalledWith({ event: "build-update", data: updateEvent });

    cleanup();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("returns unknown error response when an exception occurs", async () => {
    mocks.getBuild.mockImplementation(() => {
      throw new Error("store crashed");
    });

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "build-1" }
    });

    expect(mocks.fromUnknownError).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
  });
});
