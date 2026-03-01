import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: vi.fn(() => ({ variable: "--font-manrope-mock" }))
}));

vi.mock("@/components/project-launcher/launch-form", () => ({
  LaunchForm: () => React.createElement("div", { "data-testid": "launch-form" }, "LaunchForm")
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", { "data-testid": "card" }, children)
}));

import RootLayout, { metadata } from "@/app/layout";
import HomePage from "@/app/page";

describe("app/layout.tsx", () => {
  it("exports expected metadata", () => {
    expect(metadata).toEqual({
      title: "Project Launcher",
      description: "Launch builds instantly and monitor them in real time."
    });
  });

  it("renders html/body shell with expected classes and children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div id="child">Hello</div>
      </RootLayout>
    );

    expect(html).toContain('<html lang="en"');
    expect(html).toContain("--font-manrope-mock");
    expect(html).toContain("min-h-screen");
    expect(html).toContain("bg-background");
    expect(html).toContain("text-foreground");
    expect(html).toContain("font-sans");
    expect(html).toContain("antialiased");
    expect(html).toContain('<div id="child">Hello</div>');
  });
});

describe("app/page.tsx", () => {
  it("renders landing content, launch form, and feature cards", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Project Launcher" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Launch builds instantly and monitor them in real time.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("launch-form")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { level: 2, name: "Realtime Build Tracking" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Validated API Flows" })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("card")).toHaveLength(2);
  });
});
