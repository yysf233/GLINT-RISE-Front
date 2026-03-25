import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ProductsOverviewPage } from "./ProductsOverviewPage";

describe("ProductsOverviewPage", () => {
  it("renders the curated stitch overview layout without dropping the search entry", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products"]}>
        <ProductsOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-products-layout="curated"');
    expect(html).toContain("搜索产品名称、系列或功能标签");
    expect(html).toContain("清空条件");
  });
});
