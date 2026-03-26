import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseDetailPage } from "./CaseDetailPage";

describe("CaseDetailPage", () => {
  it("renders the unified industrial Chinese case-detail layout", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-detail-layout="industrial-cn"');
    expect(html).toContain('data-testid="case-detail-shell"');
    expect(html).toContain('data-testid="case-detail-sidebar"');
    expect(html).toContain('data-testid="case-detail-hero"');
    expect(html).toContain('data-testid="case-detail-summary-grid"');
    expect(html).toContain('data-testid="case-detail-stage-grid"');
    expect(html).toContain('data-testid="case-detail-deliverables"');
    expect(html).toContain('data-testid="case-detail-results-grid"');
    expect(html).toContain('data-testid="case-detail-support-grid"');
    expect(html).not.toContain('data-testid="page-shell-root"');
  });

  it("uses Chinese case architecture labels and seeded Chinese case content", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("返回案例矩阵");
    expect(html).toContain("项目概览");
    expect(html).toContain("服务范围");
    expect(html).toContain("执行节点");
    expect(html).toContain("交付成果");
    expect(html).toContain("结果数据");
    expect(html).toContain("量子安防网络");
  });
});
