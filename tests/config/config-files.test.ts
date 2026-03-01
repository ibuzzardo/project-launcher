import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import nextConfig from "../../next.config.mjs";
import tailwindConfig from "../../tailwind.config";

const root = path.resolve(__dirname, "../..");

describe("repository config files", () => {
  it("package.json has expected scripts and dependency baselines", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(pkg.scripts).toMatchObject({
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "vitest run"
    });

    expect(pkg.dependencies.next).toBe("14.2.24");
    expect(pkg.dependencies.react).toBe("18.3.1");
    expect(pkg.devDependencies.vitest).toBeDefined();
  });

  it("tsconfig.json enforces strict typing and path alias", () => {
    const tsconfig = JSON.parse(fs.readFileSync(path.join(root, "tsconfig.json"), "utf8")) as {
      compilerOptions: {
        strict: boolean;
        noImplicitAny: boolean;
        moduleResolution: string;
        paths: Record<string, string[]>;
      };
    };

    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitAny).toBe(true);
    expect(tsconfig.compilerOptions.moduleResolution).toBe("bundler");
    expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["./*"]);
  });

  it("next config enables strict mode", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it("postcss config enables tailwind and autoprefixer", async () => {
    const mod = await import("../../postcss.config.js");
    const config = (mod.default ?? mod) as { plugins: Record<string, unknown> };

    expect(config.plugins).toHaveProperty("tailwindcss");
    expect(config.plugins).toHaveProperty("autoprefixer");
  });

  it("tailwind config contains expected app content paths and theme extensions", () => {
    expect(tailwindConfig.darkMode).toEqual(["class"]);
    expect(tailwindConfig.content).toEqual([
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./lib/**/*.{ts,tsx}"
    ]);

    expect(tailwindConfig.theme?.screens).toMatchObject({ xs: "320px", md: "768px", xl: "1280px" });
    expect(tailwindConfig.theme?.extend?.colors).toMatchObject({
      primary: "#0369A1",
      destructive: "#DC2626"
    });
    expect(tailwindConfig.theme?.extend?.animation).toMatchObject({
      "gradient-shift": "gradient-shift 10s ease infinite"
    });
  });

  it(".env.example documents NEXT_PUBLIC_APP_URL", () => {
    const env = fs.readFileSync(path.join(root, ".env.example"), "utf8");
    expect(env).toContain("NEXT_PUBLIC_APP_URL=http://localhost:3000");
  });

  it("globals.css contains key glass utility classes", () => {
    const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
    expect(css).toContain(".glass-card");
    expect(css).toContain(".glass-panel");
    expect(css).toContain(".log-stream-panel");
    expect(css).toContain("@tailwind utilities");
  });
});
