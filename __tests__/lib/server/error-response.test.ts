import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  json: vi.fn((payload: unknown, init?: ResponseInit) => ({ payload, init }))
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.json
  }
}));

import { createErrorResponse } from "@/lib/server/error-response";

describe("createErrorResponse", () => {
  it("creates an error response without details", () => {
    const result = createErrorResponse(404, "NOT_FOUND", "Missing");

    expect(mocks.json).toHaveBeenCalledWith(
      {
        ok: false,
        error: { code: "NOT_FOUND", message: "Missing" }
      },
      { status: 404 }
    );
    expect(result).toEqual({
      payload: {
        ok: false,
        error: { code: "NOT_FOUND", message: "Missing" }
      },
      init: { status: 404 }
    });
  });

  it("includes details when provided", () => {
    const details = { projectName: ["Required"] };
    createErrorResponse(400, "VALIDATION_ERROR", "Invalid input", details);

    expect(mocks.json).toHaveBeenCalledWith(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details
        }
      },
      { status: 400 }
    );
  });
});
