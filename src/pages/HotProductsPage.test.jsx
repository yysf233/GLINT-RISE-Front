import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HotProductsPage } from "./HotProductsPage";

describe("HotProductsPage", () => {
  it("renders the dark prototype hot products layout with the list entry and back action", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products/hot"]}>
        <HotProductsPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-hot-products-layout="prototype-dark"');
    expect(html).toContain('data-testid="hot-products-featured-rail"');
    expect(html).toContain("HOT PRODUCTS");
    expect(html).toContain("返回产品总览");
  });
});
