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
    expect(html).toContain('data-testid="product-detail-capability-strip"');
    expect(html).toContain('data-testid="product-detail-spec-grid"');
    expect(html).toContain('data-testid="product-detail-supply-grid"');
    expect(html).toContain('data-testid="product-detail-packaging-panel"');
    expect(html).toContain('data-testid="product-detail-support-grid"');
    expect(html).not.toContain('data-testid="page-shell-root"');
  });

  it("uses Chinese industrial labels and seeded Chinese product content", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/product/lumina-arc"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("返回产品矩阵");
    expect(html).toContain("立即配置");
    expect(html).toContain("下载资料");
    expect(html).toContain("商品参数");
    expect(html).toContain("模具信息");
    expect(html).toContain("包装形式");
    expect(html).toContain("企业支持");
    expect(html).toContain("星穹七号处理器");
  });
});
