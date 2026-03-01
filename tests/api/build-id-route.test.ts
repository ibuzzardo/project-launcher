import { beforeEach, describe, expect, it, vi } from "vitest";

import * as store from "../../lib/store/build-store";
import { GET } from "../../app/api/builds/[id]/route";

declare global {
  // eslint-disable-next-line no-var
  var __projectLauncherStore: unknown;
}

describe("/api/builds/[id] route", () => {
  beforeEach(() => {
    delete globalThis.__projectLauncherStore;
    vi.restoreAllMocks();
  });

  it("returns 404 when build is missing", async () => {
    const res = await GET(new Request("http://localhost"), { params: { id: "missing" } });
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "NOT_FOUND", message: "Build missing was not found" }
    });
  });

  it("returns build when found", async () => {
    const build = store.createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "web-app"
    });

    const res = await GET(new Request("http://localhost"), { params: { id: build.id } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.build.id).toBe(build.id);
  });

  it("maps unexpected exceptions to INTERNAL_ERROR", async () => {
    vi.spyOn(store, "getBuild").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const res = await GET(new Request("http://localhost"), { params: { id: "x" } });
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "INTERNAL_ERROR" }
    });
  });
});
