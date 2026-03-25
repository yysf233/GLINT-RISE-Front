import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseDetailPage } from "./CaseDetailPage";

describe("CaseDetailPage", () => {
  it("renders the editorial case detail layout with share and gallery actions", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/case/:id" element={<CaseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-detail-layout="editorial"');
    expect(html).toContain("分享当前案例");
    expect(html).toContain("查看辅助图片");
  });
});
