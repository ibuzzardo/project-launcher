import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";

describe("buttonVariants", () => {
  it("provides default and ghost variant classes", () => {
    expect(buttonVariants()).toContain("bg-sky-600");
    expect(buttonVariants({ variant: "ghost" })).toContain("bg-transparent");
  });
});

describe("Button component", () => {
  it("renders merged classes and attributes", () => {
    const html = renderToStaticMarkup(
      <Button variant="ghost" className="extra-class" disabled>
        Launch
      </Button>
    );

    expect(html).toContain("extra-class");
    expect(html).toContain("disabled");
    expect(html).toContain("Launch");
  });
});

describe("Input component", () => {
  it("renders base styles and forwards props", () => {
    const html = renderToStaticMarkup(
      <Input className="my-input" placeholder="Project" defaultValue="demo" aria-label="Project" />
    );

    expect(html).toContain("my-input");
    expect(html).toContain("placeholder=\"Project\"");
    expect(html).toContain("value=\"demo\"");
    expect(html).toContain("aria-label=\"Project\"");
  });
});

describe("Card component", () => {
  it("renders children and merges className", () => {
    const html = renderToStaticMarkup(<Card className="custom-card">Content</Card>);
    expect(html).toContain("custom-card");
    expect(html).toContain("Content");
    expect(html).toContain("rounded-2xl");
  });
});

describe("Progress component", () => {
  it("clamps below 0 to 0%", () => {
    const html = renderToStaticMarkup(<Progress value={-10} />);
    expect(html).toContain("width:0%");
  });

  it("clamps above 100 to 100%", () => {
    const html = renderToStaticMarkup(<Progress value={1000} className="progress-x" />);
    expect(html).toContain("width:100%");
    expect(html).toContain("progress-x");
  });

  it("uses exact in-range value", () => {
    const html = renderToStaticMarkup(<Progress value={42} />);
    expect(html).toContain("width:42%");
  });
});
