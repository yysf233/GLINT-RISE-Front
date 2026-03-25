import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { ProductDetailPage } from "./ProductDetailPage";

describe("ProductDetailPage", () => {
  it("renders the editorial stitch detail layout without dropping share actions", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-product-detail-layout="editorial"');
    expect(html).toContain("分享页面");
    expect(html).toContain("查看第 1 张产品图");
  });
});
