import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseSharePage } from "./CaseSharePage";

describe("CaseSharePage", () => {
  it("renders the share landing layout with detail and share ctas", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/share/case/quantum-security-protocol"]}>
          <Routes>
            <Route path="/share/case/:id" element={<CaseSharePage />} />
          </Routes>
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-share-layout="share"');
    expect(html).toContain("进入官网详情");
    expect(html).toContain("分享项目卡");
  });
});
