import { describe, expect, it } from "vitest";

import {
  buildPayloadSchema,
  buildStatusSchema,
  createBuildSchema
} from "../../lib/validation/build-schema";

describe("createBuildSchema", () => {
  it("accepts valid payload and trims projectName", () => {
    const parsed = createBuildSchema.parse({
      projectName: "  demo-app  ",
      repositoryUrl: "https://github.com/acme/demo-app",
      preset: "web-app"
    });

    expect(parsed.projectName).toBe("demo-app");
  });

  it("rejects missing required fields", () => {
    const result = createBuildSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("projectName is required");
      expect(messages).toContain("repositoryUrl is required");
      expect(messages).toContain("preset is required");
    }
  });

  it("rejects too-short and too-long project names", () => {
    expect(
      createBuildSchema.safeParse({
        projectName: "a",
        repositoryUrl: "https://example.com/repo",
        preset: "worker"
      }).success
    ).toBe(false);

    expect(
      createBuildSchema.safeParse({
        projectName: "x".repeat(81),
        repositoryUrl: "https://example.com/repo",
        preset: "worker"
      }).success
    ).toBe(false);
  });

  it("rejects invalid repository URL and overlong URL", () => {
    expect(
      createBuildSchema.safeParse({
        projectName: "demo",
        repositoryUrl: "not-a-url",
        preset: "api-service"
      }).success
    ).toBe(false);

    expect(
      createBuildSchema.safeParse({
        projectName: "demo",
        repositoryUrl: `https://example.com/${"a".repeat(2100)}`,
        preset: "api-service"
      }).success
    ).toBe(false);
  });
});

describe("buildStatusSchema", () => {
  it("accepts known statuses and rejects unknown", () => {
    expect(buildStatusSchema.parse("queued")).toBe("queued");
    expect(buildStatusSchema.parse("running")).toBe("running");
    expect(buildStatusSchema.parse("success")).toBe("success");
    expect(buildStatusSchema.parse("failed")).toBe("failed");
    expect(buildStatusSchema.safeParse("done").success).toBe(false);
  });
});

describe("buildPayloadSchema", () => {
  it("accepts a valid build payload", () => {
    const now = new Date().toISOString();
    const result = buildPayloadSchema.safeParse({
      id: "bld_000001",
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "web-app",
      status: "running",
      progress: 33,
      createdAt: now,
      startedAt: now,
      completedAt: null,
      logs: [
        {
          id: "log_000001",
          buildId: "bld_000001",
          message: "hello",
          level: "info",
          createdAt: now
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid dates, out-of-range progress, and empty log message", () => {
    const result = buildPayloadSchema.safeParse({
      id: "bld_000001",
      projectName: "demo",
      repositoryUrl: "https://github.com/acme/demo",
      preset: "worker",
      status: "failed",
      progress: 101,
      createdAt: "not-date",
      startedAt: null,
      completedAt: null,
      logs: [
        {
          id: "log_1",
          buildId: "bld_000001",
          message: "",
          level: "error",
          createdAt: "not-date"
        }
      ]
    });

    expect(result.success).toBe(false);
  });
});
