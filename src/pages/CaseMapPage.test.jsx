import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseMapPage } from "./CaseMapPage";

describe("CaseMapPage", () => {
  it("renders the dark prototype map layout with zoom controls and share action", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case-map"]}>
          <CaseMapPage />
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-map-layout="prototype-dark"');
    expect(html).toContain('data-testid="case-map-canvas"');
    expect(html).toContain("缩小图谱");
    expect(html).toContain("放大图谱");
    expect(html).toContain("分享页面");
  });

  it("uses Chinese map titles and note blocks", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case-map"]}>
          <CaseMapPage />
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("案例图谱页");
    expect(html).toContain("案例中心");
    expect(html).toContain("实时统计");
    expect(html).toContain("图谱说明");
  });
});
