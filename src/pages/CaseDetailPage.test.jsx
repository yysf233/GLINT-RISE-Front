import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseDetailPage } from "./CaseDetailPage";

describe("CaseDetailPage", () => {
  it("renders the desktop prototype case detail layout with showcase, aside, and film panel", () => {
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
    expect(html).toContain('data-testid="case-detail-header"');
    expect(html).toContain('data-testid="case-detail-showcase-grid"');
    expect(html).toContain('data-testid="case-detail-film-panel"');
    expect(html).toContain('data-testid="case-detail-meta-grid"');
  });

  it("uses Chinese archival labels while preserving share and archive entry points", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("分享当前案例");
    expect(html).toContain("进入视觉档案");
    expect(html).toContain("行业领域");
    expect(html).toContain("材质完整性");
    expect(html).toContain("观看项目短片");
  });
});
