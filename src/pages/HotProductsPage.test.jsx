import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HotProductsPage } from "./HotProductsPage";

describe("HotProductsPage", () => {
  it("renders the curated hot products layout with the list entry and back action", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/products/hot"]}>
        <HotProductsPage />
      </MemoryRouter>,
    );

    expect(html).toContain("热门精选");
    expect(html).toContain("热门清单");
    expect(html).toContain("返回产品总览");
  });
});
