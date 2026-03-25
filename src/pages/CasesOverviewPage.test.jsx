import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { CasesOverviewPage } from "./CasesOverviewPage";

describe("CasesOverviewPage", () => {
  it("renders the dark prototype cases overview with timeline and map entry points", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/cases"]}>
        <CasesOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-case-layout="prototype-dark"');
    expect(html).toContain('data-testid="cases-feature-grid"');
    expect(html).toContain("进入时间轴");
    expect(html).toContain("进入图谱");
  });

  it("uses Chinese case overview headings and ctas", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/cases"]}>
        <CasesOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain("案例总览");
    expect(html).toContain("精选案例矩阵");
    expect(html).toContain("查看案例");
    expect(html).toContain("案例导航");
  });
});
