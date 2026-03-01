import { describe, expect, it } from "vitest";

import { cn } from "../../lib/utils";

describe("cn", () => {
  it("combines truthy class values", () => {
    expect(cn("a", "b", false && "c", undefined, null)).toBe("a b");
  });

  it("tailwind-merge resolves conflicting utility classes", () => {
    expect(cn("px-2", "px-4", "text-sm", "text-lg")).toBe("px-4 text-lg");
  });

  it("supports arrays and objects from clsx input", () => {
    expect(cn(["rounded", "border"], { hidden: false, block: true })).toBe("rounded border block");
  });
});
