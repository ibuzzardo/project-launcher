import { describe, expect, it } from "vitest";

import { isApiFailureResponse } from "@/lib/api/response";

describe("isApiFailureResponse", () => {
  it("returns true for a valid failure response", () => {
    expect(
      isApiFailureResponse({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: { field: ["Required"] }
        }
      })
    ).toBe(true);
  });

  it("returns false for null, primitives, and arrays", () => {
    expect(isApiFailureResponse(null)).toBe(false);
    expect(isApiFailureResponse(undefined)).toBe(false);
    expect(isApiFailureResponse("x")).toBe(false);
    expect(isApiFailureResponse(1)).toBe(false);
    expect(isApiFailureResponse([])).toBe(false);
  });

  it("returns false when ok is not false", () => {
    expect(
      isApiFailureResponse({ ok: true, error: { code: "X", message: "no" } })
    ).toBe(false);
  });

  it("returns false when error.code is missing or not a string", () => {
    expect(isApiFailureResponse({ ok: false, error: { message: "msg" } })).toBe(false);
    expect(
      isApiFailureResponse({ ok: false, error: { code: 123, message: "msg" } })
    ).toBe(false);
  });

  it("returns false when error.message is missing or not a string", () => {
    expect(isApiFailureResponse({ ok: false, error: { code: "ERR" } })).toBe(false);
    expect(
      isApiFailureResponse({ ok: false, error: { code: "ERR", message: {} } })
    ).toBe(false);
  });
});
