import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError, isApiError } from "../../lib/errors/api-error";
import {
  apiError,
  badRequest,
  error,
  fromUnknownError,
  fromZodError,
  internal,
  notFound,
  ok
} from "../../lib/http/response";

describe("ApiError", () => {
  it("captures code, message, status, details", () => {
    const err = new ApiError("X", "boom", 418, { f: ["bad"] });
    expect(err.message).toBe("boom");
    expect(err.code).toBe("X");
    expect(err.status).toBe(418);
    expect(err.details).toEqual({ f: ["bad"] });
  });

  it("isApiError narrows only ApiError instances", () => {
    expect(isApiError(new ApiError("A", "b", 400))).toBe(true);
    expect(isApiError(new Error("no"))).toBe(false);
    expect(isApiError({ code: "A", status: 400 })).toBe(false);
  });

  it("apiError factory returns ApiError", () => {
    const err = apiError("E", "msg", 401);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("E");
    expect(err.status).toBe(401);
  });
});

describe("response helpers", () => {
  it("ok wraps payload as ApiSuccess with status", async () => {
    const res = ok({ value: 1 }, 201);
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ ok: true, data: { value: 1 } });
  });

  it("error creates structured ApiErrorResponse", async () => {
    const res = error("BAD", "bad req", 400, { name: ["required"] });
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "BAD",
        message: "bad req",
        details: { name: ["required"] }
      }
    });
  });

  it("fromZodError flattens issues by path", async () => {
    const schema = z.object({
      projectName: z.string().min(2),
      body: z.object({
        repositoryUrl: z.string().url()
      })
    });

    const parsed = schema.safeParse({ projectName: "x", body: { repositoryUrl: "bad" } });
    expect(parsed.success).toBe(false);

    const res = fromZodError(parsed.error);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details).toHaveProperty("projectName");
    expect(json.error.details).toHaveProperty("body.repositoryUrl");
  });

  it("fromUnknownError maps ApiError, SyntaxError, and generic errors", async () => {
    const apiRes = fromUnknownError(new ApiError("NOPE", "x", 409, { a: ["b"] }));
    expect(apiRes.status).toBe(409);
    await expect(apiRes.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "NOPE", message: "x", details: { a: ["b"] } }
    });

    const parseRes = fromUnknownError(new SyntaxError("bad json"));
    expect(parseRes.status).toBe(400);
    await expect(parseRes.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "MALFORMED_JSON" }
    });

    const genericRes = fromUnknownError(new Error("boom"));
    expect(genericRes.status).toBe(500);
    await expect(genericRes.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "INTERNAL_ERROR" }
    });
  });

  it("badRequest, notFound, internal use expected status and codes", async () => {
    const bad = badRequest("invalid", { field: ["x"] });
    expect(bad.status).toBe(400);
    await expect(bad.json()).resolves.toMatchObject({ error: { code: "BAD_REQUEST" } });

    const miss = notFound("missing");
    expect(miss.status).toBe(404);
    await expect(miss.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });

    const i = internal();
    expect(i.status).toBe(500);
    await expect(i.json()).resolves.toMatchObject({ error: { code: "INTERNAL_ERROR" } });
  });
});
