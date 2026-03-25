import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseMapPage } from "./CaseMapPage";

describe("CaseMapPage", () => {
  it("renders the desktop prototype case-map layout with toolbar, canvas, and floating stats", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case-map"]}>
          <CaseMapPage />
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-map-layout="prototype-dark"');
    expect(html).toContain('data-testid="case-map-toolbar"');
    expect(html).toContain('data-testid="case-map-canvas"');
    expect(html).toContain('data-testid="case-map-node-focus"');
    expect(html).toContain('data-testid="case-map-live-stats"');
  });

  it("uses Chinese case-map labels matching the prototype controls", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case-map"]}>
          <CaseMapPage />
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain("案例生态图谱");
    expect(html).toContain("搜索案例节点");
    expect(html).toContain("分享洞察");
    expect(html).toContain("案例中心");
    expect(html).toContain("实时统计");
    expect(html).toContain("缩小图谱");
    expect(html).toContain("放大图谱");
  });
});
