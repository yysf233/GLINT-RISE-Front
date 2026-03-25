import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { ProductDetailPage } from "./ProductDetailPage";

describe("ProductDetailPage", () => {
  it("renders the desktop prototype product-detail layout with gallery, spec panel, and ecosystem block", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-product-detail-layout="prototype-dark"');
    expect(html).toContain('data-testid="product-detail-gallery-grid"');
    expect(html).toContain('data-testid="product-detail-spec-panel"');
    expect(html).toContain('data-testid="product-detail-ecosystem-panel"');
    expect(html).toContain('data-testid="product-detail-meta-grid"');
  });

  it("uses Chinese product-detail labels matching the prototype rhythm", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("返回热门产品");
    expect(html).toContain("分享当前产品");
    expect(html).toContain("展陈系列");
    expect(html).toContain("参数规格");
    expect(html).toContain("生态联动");
    expect(html).toContain("返回产品总览");
  });
});
