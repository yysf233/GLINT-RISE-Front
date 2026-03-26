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
    expect(html).not.toContain('data-testid="page-shell-root"');
  });

  it("shows the required product fields for size, material, stock, custom, tooling, and packaging", () => {
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
    expect(html).toContain("星穹七号处理器");
    expect(html).toContain("产品尺寸");
    expect(html).toContain("材质");
    expect(html).toContain("现采形式");
    expect(html).toContain("对外起订量");
    expect(html).toContain("对外工期");
    expect(html).toContain("阶梯报价（参考价）");
    expect(html).toContain("产品可定制范围");
    expect(html).toContain("定制形式");
    expect(html).toContain("模具费对外报价（参考价）");
    expect(html).toContain("模具对外工期（参考工期）");
    expect(html).toContain("标配包装样式");
  });
});
