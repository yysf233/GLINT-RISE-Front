import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HotProductsPage } from "./HotProductsPage";

describe("HotProductsPage", () => {
  it("renders the desktop prototype hot products layout with editorial header and uniform grid", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products/hot"]}>
        <HotProductsPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-hot-products-layout="prototype-dark"');
    expect(html).toContain('data-testid="hot-products-editorial-header"');
    expect(html).toContain('data-testid="hot-products-grid"');
    expect(html).toContain("返回产品总览");
  });

  it("uses Chinese hot-product labels matching the prototype actions", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products/hot"]}>
        <HotProductsPage />
      </MemoryRouter>,
    );

    expect(html).toContain("精选推荐");
    expect(html).toContain("热门产品推荐");
    expect(html).toContain("筛选产品");
    expect(html).toContain("查看产品");
  });
});
