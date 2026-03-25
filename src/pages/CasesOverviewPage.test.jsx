import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { CasesOverviewPage } from "./CasesOverviewPage";
import { cases } from "../data/siteContent";

describe("CasesOverviewPage", () => {
  it("renders the dark prototype overview layout with the editorial hero and bento grid", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/cases"]}>
        <CasesOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-case-layout="prototype-dark"');
    expect(html).toContain('data-testid="cases-editorial-hero"');
    expect(html).toContain('data-testid="cases-bento-grid"');
    expect(html).toContain('data-testid="cases-footer-note"');
  });

  it("keeps the required Chinese labels and dynamic case data visible", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/cases"]}>
        <CasesOverviewPage />
      </MemoryRouter>,
    );

    expect(html).toContain("精选案例矩阵");
    expect(html).toContain("案例总览");
    expect(html).toContain("进入案例时间轴");
    expect(html).toContain("进入案例图谱");
    expect(html).toContain("查看案例");
    expect(html).toContain(cases[0].title);
    expect(html).toContain(cases[1].title);
  });
});
