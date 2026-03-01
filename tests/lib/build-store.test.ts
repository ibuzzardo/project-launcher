import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendLog,
  createBuild,
  getBuild,
  listBuilds,
  subscribeToBuild,
  updateBuildStatus
} from "../../lib/store/build-store";

declare global {
  // eslint-disable-next-line no-var
  var __projectLauncherStore: unknown;
}

describe("build store", () => {
  beforeEach(() => {
    delete globalThis.__projectLauncherStore;
    vi.restoreAllMocks();
  });

  it("creates builds with deterministic IDs and initial queued state", () => {
    const a = createBuild({
      projectName: "A",
      repositoryUrl: "https://example.com/a",
      preset: "web-app"
    });
    const b = createBuild({
      projectName: "B",
      repositoryUrl: "https://example.com/b",
      preset: "api-service"
    });

    expect(a.id).toBe("bld_000001");
    expect(b.id).toBe("bld_000002");
    expect(a.status).toBe("queued");
    expect(a.progress).toBe(0);
    expect(a.startedAt).toBeNull();
    expect(a.completedAt).toBeNull();
    expect(a.logs).toEqual([]);
  });

  it("lists builds newest-first by createdAt", () => {
    const a = createBuild({
      projectName: "A",
      repositoryUrl: "https://example.com/a",
      preset: "web-app"
    });
    const b = createBuild({
      projectName: "B",
      repositoryUrl: "https://example.com/b",
      preset: "worker"
    });

    const fetchedA = getBuild(a.id)!;
    const fetchedB = getBuild(b.id)!;
    fetchedA.createdAt = "2020-01-01T00:00:00.000Z";
    fetchedB.createdAt = "2030-01-01T00:00:00.000Z";

    expect(listBuilds().map((x) => x.id)).toEqual([b.id, a.id]);
  });

  it("returns null for unknown build id", () => {
    expect(getBuild("missing")).toBeNull();
    expect(updateBuildStatus("missing", "running", 50)).toBeNull();
    expect(appendLog("missing", "line", "info")).toBeNull();
  });

  it("clamps progress and sets running/success timestamps", () => {
    const b = createBuild({
      projectName: "A",
      repositoryUrl: "https://example.com/a",
      preset: "web-app"
    });

    const running = updateBuildStatus(b.id, "running", -10);
    expect(running?.progress).toBe(0);
    expect(running?.startedAt).not.toBeNull();
    expect(running?.completedAt).toBeNull();

    const success = updateBuildStatus(b.id, "success", 999);
    expect(success?.progress).toBe(100);
    expect(success?.completedAt).not.toBeNull();
  });

  it("appendLog adds deterministic log entries", () => {
    const b = createBuild({
      projectName: "A",
      repositoryUrl: "https://example.com/a",
      preset: "web-app"
    });

    const l1 = appendLog(b.id, "first", "info");
    const l2 = appendLog(b.id, "second", "warn");

    expect(l1?.id).toBe("log_000001");
    expect(l2?.id).toBe("log_000002");

    const fetched = getBuild(b.id)!;
    expect(fetched.logs).toHaveLength(2);
    expect(fetched.logs[0].message).toBe("first");
    expect(fetched.logs[1].level).toBe("warn");
  });

  it("subscriber receives build and log updates and unsubscribe stops notifications", () => {
    const b = createBuild({
      projectName: "A",
      repositoryUrl: "https://example.com/a",
      preset: "web-app"
    });

    const callback = vi.fn();
    const unsubscribe = subscribeToBuild(b.id, callback);

    updateBuildStatus(b.id, "running", 25);
    appendLog(b.id, "hello", "info");
    expect(callback).toHaveBeenCalled();

    const callsBefore = callback.mock.calls.length;
    unsubscribe();
    appendLog(b.id, "after unsubscribe", "info");
    expect(callback.mock.calls.length).toBe(callsBefore);
  });
});
