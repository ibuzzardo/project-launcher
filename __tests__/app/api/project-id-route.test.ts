import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBuild: vi.fn(),
  badRequest: vi.fn((message: string, details?: Record<string, string[]>) =>
    Response.json(
      {
        ok: false,
        error: { code: "BAD_REQUEST", message, ...(details ? { details } : {}) }
      },
      { status: 400 }
    )
  ),
  notFound: vi.fn((message: string) =>
    Response.json({ ok: false, error: { code: "NOT_FOUND", message } }, { status: 404 })
  ),
  ok: vi.fn((data: unknown) => Response.json({ ok: true, data }, { status: 200 })),
  fromUnknownError: vi.fn(() =>
    Response.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
      { status: 500 }
    )
  )
}));

vi.mock("@/lib/store/in-memory-project-store", () => ({
  projectStore: {
    getBuild: mocks.getBuild
  }
}));

vi.mock("@/lib/http/response", () => ({
  badRequest: mocks.badRequest,
  notFound: mocks.notFound,
  ok: mocks.ok,
  fromUnknownError: mocks.fromUnknownError
}));

import { GET } from "@/app/api/projects/[projectId]/route";

describe("GET /api/projects/[projectId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bad request when project id is blank", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "   " }
    });

    expect(mocks.badRequest).toHaveBeenCalledWith("Project id is required", {
      projectId: ["Project id is required"]
    });
    expect(mocks.getBuild).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });

  it("returns not found when build does not exist", async () => {
    mocks.getBuild.mockReturnValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "build-404" }
    });

    expect(mocks.getBuild).toHaveBeenCalledWith("build-404");
    expect(mocks.notFound).toHaveBeenCalledWith("Build 'build-404' was not found");
    expect(response.status).toBe(404);
  });

  it("returns build when found", async () => {
    const build = { id: "build-1", status: "running" };
    mocks.getBuild.mockReturnValue(build);

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "  build-1  " }
    });
    const payload = await response.json();

    expect(mocks.getBuild).toHaveBeenCalledWith("build-1");
    expect(mocks.ok).toHaveBeenCalledWith(build);
    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: build });
  });

  it("returns unknown error response when store access throws", async () => {
    mocks.getBuild.mockImplementation(() => {
      throw new Error("db failure");
    });

    const response = await GET(new Request("http://localhost"), {
      params: { projectId: "build-1" }
    });

    expect(mocks.fromUnknownError).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
  });
});
