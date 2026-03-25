import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the editorial stitch home hero without dropping existing banner hooks", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-home-layout="editorial"');
    expect(html).toContain('data-testid="home-hero-banner-title"');
    expect(html).toContain('data-testid="home-hero-banner-target"');
    expect(html).toContain("搜索产品名称、系列或功能标签");
  });
});
