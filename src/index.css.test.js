import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("index.css", () => {
  it("keeps a stable global scroll gutter and hides the page scrollbar chrome", () => {
    const cssPath = path.resolve(process.cwd(), "src/index.css");
    const css = fs.readFileSync(cssPath, "utf8");

    expect(css).toContain("scrollbar-gutter: stable both-edges;");
    expect(css).toContain("overflow-y: scroll;");
    expect(css).toContain("scrollbar-width: none;");
    expect(css).toContain("::-webkit-scrollbar");
  });
});
