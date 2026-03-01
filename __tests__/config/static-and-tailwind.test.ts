import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import tailwindcssAnimate from "tailwindcss-animate";

import config from "../../tailwind.config";

describe("tailwind.config.ts", () => {
  it("uses class-based dark mode and expected content globs", () => {
    expect(config.darkMode).toEqual(["class"]);
    expect(config.content).toEqual([
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./lib/**/*.{ts,tsx}"
    ]);
  });

  it("defines expected color tokens, typography, and radius", () => {
    const extend = config.theme?.extend;

    expect(extend?.colors).toMatchObject({
      background: "var(--background)",
      foreground: "var(--foreground)",
      primary: "#2563EB",
      secondary: "#0F766E",
      muted: "#E2E8F0",
      accent: "#D97706",
      destructive: "#DC2626",
      "chart-1": "#2563EB",
      "chart-2": "#0F766E",
      "chart-3": "#7C3AED",
      "chart-4": "#D97706"
    });

    expect(extend?.borderRadius).toEqual({
      xl: "12px",
      lg: "10px",
      md: "8px"
    });

    expect(extend?.fontFamily?.sans).toEqual([
      "var(--font-manrope)",
      "Manrope",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ]);
  });

  it("defines custom keyframes/animations and registers animate plugin", () => {
    const extend = config.theme?.extend;

    expect(extend?.keyframes).toHaveProperty("fade-in-up");
    expect(extend?.keyframes).toHaveProperty("glass-shimmer");
    expect(extend?.keyframes).toHaveProperty("pulse-soft");
    expect(extend?.keyframes).toHaveProperty("zoom-in-95");
    expect(extend?.keyframes).toHaveProperty("zoom-out-95");

    expect(extend?.animation).toMatchObject({
      "fade-in-up": "fade-in-up 300ms ease-out",
      "glass-shimmer": "glass-shimmer 2.5s linear infinite",
      "pulse-soft": "pulse-soft 1.5s ease-in-out infinite",
      "zoom-in-95": "zoom-in-95 200ms ease-out",
      "zoom-out-95": "zoom-out-95 200ms ease-in"
    });

    expect(config.plugins).toContain(tailwindcssAnimate);
  });
});

describe("static project files", () => {
  const root = process.cwd();

  it(".gitignore covers dependencies, build artifacts, env files, and test outputs", () => {
    const gitignore = readFileSync(path.join(root, ".gitignore"), "utf8");

    expect(gitignore).toContain("node_modules");
    expect(gitignore).toContain(".next");
    expect(gitignore).toContain("out");
    expect(gitignore).toContain("build");
    expect(gitignore).toContain("coverage");
    expect(gitignore).toContain(".nyc_output");
    expect(gitignore).toContain(".env");
    expect(gitignore).toContain(".env.local");
    expect(gitignore).toContain(".env.test.local");
    expect(gitignore).toContain(".DS_Store");
    expect(gitignore).toContain("*.tsbuildinfo");
  });

  it(".env.example provides local NEXT_PUBLIC_APP_URL", () => {
    const envExample = readFileSync(path.join(root, ".env.example"), "utf8").trim();
    expect(envExample).toBe("NEXT_PUBLIC_APP_URL=http://localhost:3000");
  });

  it("globals.css includes root theme tokens and custom utility classes", () => {
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");

    expect(css).toContain("--background: #F8FAFC;");
    expect(css).toContain("--foreground: #0F172A;");
    expect(css).toContain("--primary: #2563EB;");
    expect(css).toContain("--secondary: #0F766E;");
    expect(css).toContain("--accent: #D97706;");
    expect(css).toContain("--destructive: #DC2626;");

    expect(css).toContain(".glass-surface");
    expect(css).toContain(".glass-header");
    expect(css).toContain(".glass-highlight");
    expect(css).toContain("@apply bg-background text-foreground;");
  });
});
