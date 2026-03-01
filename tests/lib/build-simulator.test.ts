import { beforeEach, describe, expect, it, vi } from "vitest";

import { startBuildSimulation, stopBuildSimulation } from "../../lib/build-simulator";
import { createBuild, getBuild } from "../../lib/store/build-store";

declare global {
  // eslint-disable-next-line no-var
  var __projectLauncherStore: unknown;
}

describe("build simulator", () => {
  beforeEach(() => {
    delete globalThis.__projectLauncherStore;
    vi.useFakeTimers();
  });

  it("does nothing for unknown build id", () => {
    expect(() => startBuildSimulation("missing")).not.toThrow();
  });

  it("drives build through deterministic lifecycle and logs", () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "web-app"
    });

    startBuildSimulation(build.id);
    vi.advanceTimersByTime(4100);

    const finalBuild = getBuild(build.id)!;
    expect(finalBuild.status).toBe("success");
    expect(finalBuild.progress).toBe(100);
    expect(finalBuild.startedAt).not.toBeNull();
    expect(finalBuild.completedAt).not.toBeNull();
    expect(finalBuild.logs.map((l) => l.message)).toEqual([
      "Initializing build environment",
      "Installing dependencies",
      "Running quality checks",
      "Preparing deployment artifact",
      "Build finished successfully"
    ]);
  });

  it("stopBuildSimulation cancels pending jobs", () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "worker"
    });

    startBuildSimulation(build.id);
    stopBuildSimulation(build.id);
    vi.advanceTimersByTime(5000);

    const current = getBuild(build.id)!;
    expect(current.status).toBe("queued");
    expect(current.logs).toHaveLength(0);
  });

  it("restarting simulation replaces old timers", () => {
    const build = createBuild({
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "api-service"
    });

    startBuildSimulation(build.id);
    vi.advanceTimersByTime(1200);
    const mid = getBuild(build.id)!;
    expect(mid.progress).toBeGreaterThan(0);

    startBuildSimulation(build.id);
    vi.advanceTimersByTime(4100);

    const finalBuild = getBuild(build.id)!;
    expect(finalBuild.status).toBe("success");
    expect(finalBuild.progress).toBe(100);
  });
});
