import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createBuild: vi.fn(),
  ok: vi.fn((data: unknown, status = 200) => Response.json({ ok: true, data }, { status })),
  fromZodError: vi.fn(() =>
    Response.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "Validation failed" } },
      { status: 400 }
    )
  ),
  fromUnknownError: vi.fn(() =>
    Response.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
      { status: 500 }
    )
  )
}));

vi.mock("@/lib/store/in-memory-project-store", () => ({
  projectStore: {
    createBuild: mocks.createBuild
  }
}));

vi.mock("@/lib/http/response", () => ({
  ok: mocks.ok,
  fromZodError: mocks.fromZodError,
  fromUnknownError: mocks.fromUnknownError
}));

import { POST } from "@/app/api/projects/route";

describe("POST /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a build with validated payload and returns 201", async () => {
    const build = { id: "build-1", status: "queued" };
    mocks.createBuild.mockReturnValue(build);

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        projectName: "My Project",
        repositoryUrl: "https://github.com/acme/repo",
        branch: "main"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(mocks.createBuild).toHaveBeenCalledWith({
      projectName: "My Project",
      repositoryUrl: "https://github.com/acme/repo",
      branch: "main"
    });
    expect(mocks.ok).toHaveBeenCalledWith(build, 201);
    expect(response.status).toBe(201);
    expect(payload).toEqual({ ok: true, data: build });
  });

  it("returns validation response for invalid body", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        projectName: " ",
        repositoryUrl: "not-a-url",
        branch: ""
      })
    });

    const response = await POST(request);

    expect(mocks.createBuild).not.toHaveBeenCalled();
    expect(mocks.fromZodError).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(400);
  });

  it("returns unknown error response when store throws", async () => {
    mocks.createBuild.mockImplementation(() => {
      throw new Error("store failure");
    });

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        projectName: "My Project",
        repositoryUrl: "https://github.com/acme/repo",
        branch: "main"
      })
    });

    const response = await POST(request);

    expect(mocks.fromUnknownError).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
  });
});
