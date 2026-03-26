import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the dark prototype homepage structure with apple-style hero and product carousels", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-home-layout="prototype-dark"');
    expect(html).toContain('data-testid="home-hero-orb"');
    expect(html).toContain('data-testid="home-hero-carousel"');
    expect(html).toContain('data-testid="home-hero-carousel-track"');
    expect(html).toContain('data-testid="home-case-spotlight"');
    expect(html).toContain('data-testid="home-product-carousel"');
    expect(html).toContain('data-testid="home-product-carousel-track"');
    expect(html).toContain('data-testid="home-brand-story-grid"');
    expect(html).toContain('data-testid="home-hero-banner-title"');
    expect(html).toContain('data-testid="home-hero-banner-target"');
    expect(html).toContain('data-carousel-style="apple-product"');
  });

  it("uses Chinese call-to-action and section copy on the homepage", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(html).toContain("搜索洞察、产品、案例");
    expect(html).toContain("查看专题");
    expect(html).toContain("浏览更多");
    expect(html).toContain("查看完整产品库");
    expect(html).toContain("企业愿景");
  });
});
