import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../app/api/builds/[id]/logs/route";
import { appendLog, createBuild, updateBuildStatus } from "../../lib/store/build-store";

declare global {
  // eslint-disable-next-line no-var
  var __projectLauncherStore: unknown;
}

async function readChunk(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> {
  const result = await reader.read();
  if (result.done || !result.value) {
    return "";
  }
  return new TextDecoder().decode(result.value);
}

describe("/api/builds/[id]/logs route", () => {
  beforeEach(() => {
    delete globalThis.__projectLauncherStore;
    vi.restoreAllMocks();
  });

  it("returns 404 for unknown build", async () => {
    const req = new Request("http://localhost/api/builds/missing/logs");
    const res = await GET(req, { params: { id: "missing" } });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "NOT_FOUND" }
    });
  });

  it("returns SSE headers and sends initial snapshot", async () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "web-app"
    });

    const req = new Request("http://localhost/api/builds/id/logs");
    const res = await GET(req, { params: { id: build.id } });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
    expect(res.headers.get("X-Accel-Buffering")).toBe("no");

    const reader = res.body!.getReader();
    const first = await readChunk(reader);
    expect(first).toContain("event: snapshot");
    expect(first).toContain(`\"id\":\"${build.id}\"`);
  });

  it("emits build/log/done events from store updates", async () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "worker"
    });

    const req = new Request("http://localhost/api/builds/id/logs");
    const res = await GET(req, { params: { id: build.id } });
    const reader = res.body!.getReader();

    await readChunk(reader); // snapshot

    updateBuildStatus(build.id, "running", 50);
    appendLog(build.id, "halfway", "info");
    updateBuildStatus(build.id, "success", 100);

    const chunks = [await readChunk(reader), await readChunk(reader), await readChunk(reader), await readChunk(reader)]
      .join("\n");

    expect(chunks).toContain("event: build");
    expect(chunks).toContain("event: log");
    expect(chunks).toContain("event: done");
    expect(chunks).toContain("\"status\":\"success\"");
  });

  it("supports request abort cleanup", async () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "api-service"
    });

    const controller = new AbortController();
    const req = new Request("http://localhost/api/builds/id/logs", { signal: controller.signal });
    const res = await GET(req, { params: { id: build.id } });
    const reader = res.body!.getReader();

    await readChunk(reader); // snapshot
    controller.abort();

    const done = await reader.read();
    expect(done.done).toBe(true);
  });
});
