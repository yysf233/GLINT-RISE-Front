import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseDetailPage } from "./CaseDetailPage";

describe("CaseDetailPage", () => {
  it("renders the dark prototype case detail layout with share and gallery actions", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-detail-layout="prototype-dark"');
    expect(html).toContain('data-testid="case-detail-visual-stack"');
    expect(html).toContain('data-testid="case-detail-meta-grid"');
    expect(html).toContain("分享当前案例");
    expect(html).toContain("进入视觉档案");
  });

  it("uses Chinese archival and meta labels", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("行业领域");
    expect(html).toContain("视觉档案 01 // 主视觉");
    expect(html).toContain("观看项目短片");
    expect(html).toContain("项目地点");
  });
});
