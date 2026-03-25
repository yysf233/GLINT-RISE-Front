import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductSharePage } from "./ProductSharePage";

describe("ProductSharePage", () => {
  it("renders the dark prototype share landing page with detail cta intact", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/share/product/lumina-arc"]}>
        <Routes>
          <Route path="/share/product/:id" element={<ProductSharePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain('data-product-share-layout="prototype-dark"');
    expect(html).toContain("产品分享页");
    expect(html).toContain("进入官网详情");
    expect(html).toContain("分享产品卡");
  });
});
