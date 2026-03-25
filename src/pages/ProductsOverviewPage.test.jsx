import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ProductsOverviewPage } from "./ProductsOverviewPage";

describe("ProductsOverviewPage", () => {
  it("renders the dark prototype overview layout without dropping the filter/search entry", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products"]}>
        <ProductsOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-products-layout="prototype-dark"');
    expect(html).toContain('data-testid="products-hero-showcase"');
    expect(html).toContain('data-testid="products-filter-grid"');
    expect(html).toContain("搜索洞察、产品、案例");
  });
});
