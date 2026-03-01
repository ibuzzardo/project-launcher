import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("createProject", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the configured base URL and returns parsed JSON on success", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.test";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, data: { id: "build-1" } })
    } as unknown as Response);

    vi.stubGlobal("fetch", fetchMock);

    const { createProject } = await import("@/lib/api/client");
    const payload = {
      projectName: "project-a",
      repositoryUrl: "https://github.com/acme/repo",
      branch: "main"
    };

    const result = await createProject(payload);

    expect(fetchMock).toHaveBeenCalledWith("https://example.test/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    expect(result).toEqual({ ok: true, data: { id: "build-1" } });
  });

  it("uses an empty base URL when NEXT_PUBLIC_APP_URL is not set", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, data: { id: "build-2" } })
    } as unknown as Response);

    vi.stubGlobal("fetch", fetchMock);

    const { createProject } = await import("@/lib/api/client");

    await createProject({
      projectName: "project-b",
      repositoryUrl: "https://github.com/acme/repo",
      branch: "dev"
    });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/projects");
  });

  it("throws API failure message when response is not ok and payload matches failure shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Branch is required" }
        })
      } as unknown as Response)
    );

    const { createProject } = await import("@/lib/api/client");

    await expect(
      createProject({ projectName: "x", repositoryUrl: "https://x.dev", branch: "" })
    ).rejects.toThrow("Branch is required");
  });

  it("falls back to nested error.message when payload is non-standard", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: { message: "Request failed" } })
      } as unknown as Response)
    );

    const { createProject } = await import("@/lib/api/client");

    await expect(
      createProject({
        projectName: "x",
        repositoryUrl: "https://example.com/repo",
        branch: "main"
      })
    ).rejects.toThrow("Request failed");
  });

  it("throws unknown client error when payload has no usable message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({})
      } as unknown as Response)
    );

    const { createProject } = await import("@/lib/api/client");

    await expect(
      createProject({
        projectName: "x",
        repositoryUrl: "https://example.com/repo",
        branch: "main"
      })
    ).rejects.toThrow("Unknown client error");
  });

  it("normalizes non-Error throws to unknown client error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("network-down"));

    const { createProject } = await import("@/lib/api/client");

    await expect(
      createProject({
        projectName: "x",
        repositoryUrl: "https://example.com/repo",
        branch: "main"
      })
    ).rejects.toThrow("Unknown client error");
  });
});
