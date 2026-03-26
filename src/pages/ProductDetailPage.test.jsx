import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { ProductDetailPage } from "./ProductDetailPage";

describe("ProductDetailPage", () => {
  it("renders the unified industrial Chinese product-detail layout", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-product-detail-layout="industrial-cn"');
    expect(html).toContain('data-testid="product-detail-shell"');
    expect(html).toContain('data-testid="product-detail-sidebar"');
    expect(html).toContain('data-testid="product-detail-hero"');
    expect(html).toContain('data-testid="product-detail-basics-grid"');
    expect(html).toContain('data-testid="product-detail-pricing-grid"');
    expect(html).toContain('data-testid="product-detail-tooling-panel"');
    expect(html).toContain('data-testid="product-detail-packaging-panel"');
    expect(html).toContain('data-testid="product-detail-carousel-rail"');
    expect(html).toContain('data-product-carousel-style="apple-like"');
    expect(html).not.toContain('data-testid="page-shell-root"');
  });

  it("removes the extra header chrome and keeps the required product fields", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("\u8fd4\u56de\u4ea7\u54c1\u77e9\u9635");
    expect(html).not.toContain("\u5149\u901f\u4e0a\u5347\u5de5\u4e1a\u76ee\u5f55");
    expect(html).not.toContain("\u89e3\u51b3\u65b9\u6848");
    expect(html).not.toContain("\u6280\u672f\u652f\u6301");
    expect(html).toContain("\u661f\u7a79\u4e03\u53f7\u5904\u7406\u5668");
    expect(html).toContain("\u4ea7\u54c1\u5c3a\u5bf8");
    expect(html).toContain("\u6750\u8d28");
    expect(html).toContain("\u73b0\u91c7\u5f62\u5f0f");
    expect(html).toContain("\u5bf9\u5916\u8d77\u8ba2\u91cf");
    expect(html).toContain("\u5bf9\u5916\u5de5\u671f");
    expect(html).toContain("\u9636\u68af\u62a5\u4ef7\uff08\u53c2\u8003\u4ef7\uff09");
    expect(html).toContain("\u4ea7\u54c1\u53ef\u5b9a\u5236\u8303\u56f4");
    expect(html).toContain("\u5b9a\u5236\u5f62\u5f0f");
    expect(html).toContain("\u6a21\u5177\u8d39\u5bf9\u5916\u62a5\u4ef7\uff08\u53c2\u8003\u4ef7\uff09");
    expect(html).toContain("\u6a21\u5177\u5bf9\u5916\u5de5\u671f\uff08\u53c2\u8003\u5de5\u671f\uff09");
    expect(html).toContain("\u6807\u914d\u5305\u88c5\u6837\u5f0f");
  });
});
