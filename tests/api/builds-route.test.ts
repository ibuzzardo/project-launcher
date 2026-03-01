import { beforeEach, describe, expect, it, vi } from "vitest";

import * as simulator from "../../lib/build-simulator";
import * as store from "../../lib/store/build-store";
import { GET, POST } from "../../app/api/builds/route";

declare global {
  // eslint-disable-next-line no-var
  var __projectLauncherStore: unknown;
}

describe("/api/builds route", () => {
  beforeEach(() => {
    delete globalThis.__projectLauncherStore;
    vi.restoreAllMocks();
  });

  it("GET returns builds list", async () => {
    store.createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "web-app"
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.builds).toHaveLength(1);
  });

  it("GET maps unknown errors to INTERNAL_ERROR", async () => {
    vi.spyOn(store, "listBuilds").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const res = await GET();
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "INTERNAL_ERROR" }
    });
  });

  it("POST creates build, starts simulation, returns 201", async () => {
    const startSpy = vi.spyOn(simulator, "startBuildSimulation").mockImplementation(() => undefined);

    const req = {
      json: async () => ({
        projectName: "demo-app",
        repositoryUrl: "https://github.com/acme/demo-app",
        preset: "worker"
      })
    } as never;

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.build.id).toBe("bld_000001");
    expect(startSpy).toHaveBeenCalledWith("bld_000001");
  });

  it("POST returns MALFORMED_JSON when request parsing fails", async () => {
    const req = {
      json: async () => {
        throw new SyntaxError("Invalid JSON");
      }
    } as never;

    const res = await POST(req);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "MALFORMED_JSON" }
    });
  });

  it("POST returns VALIDATION_ERROR for invalid payload", async () => {
    const req = {
      json: async () => ({
        projectName: "x",
        repositoryUrl: "bad-url",
        preset: "unknown"
      })
    } as never;

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(json.error.details)).toContain("projectName");
    expect(Object.keys(json.error.details)).toContain("repositoryUrl");
    expect(Object.keys(json.error.details)).toContain("preset");
  });
});
