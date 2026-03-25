import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { TopNav } from "./TopNav";

describe("TopNav", () => {
  it("keeps desktop search hooks and exposes the dark home nav appearance marker", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <TopNav />
      </MemoryRouter>,
    );

    expect(html).toContain('data-nav-appearance="dark-prototype"');
    expect(html).toContain('data-testid="top-nav-search-form"');
    expect(html).toContain('data-testid="top-nav-search-input"');
    expect(html).toContain('data-testid="top-nav-search-submit"');
  });

  it("renders Chinese navigation and action labels on the homepage shell", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <TopNav />
      </MemoryRouter>,
    );

    expect(html).toContain("首页");
    expect(html).toContain("产品");
    expect(html).toContain("案例总览");
    expect(html).toContain("项目时间轴");
    expect(html).toContain("登录");
    expect(html).toContain("控制台");
    expect(html).not.toContain("SOLUTIONS");
    expect(html).not.toContain("CONSOLE");
  });
});
