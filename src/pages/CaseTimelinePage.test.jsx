import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { CaseTimelinePage } from "./CaseTimelinePage";

describe("CaseTimelinePage", () => {
  it("renders the dark prototype timeline layout with zoom controls intact", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <CaseTimelinePage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-case-timeline-layout="prototype-dark"');
    expect(html).toContain('data-testid="case-timeline-rail"');
    expect(html).toContain("缩小图谱");
    expect(html).toContain("放大图谱");
    expect(html).toContain("重置图谱缩放");
  });

  it("uses Chinese timeline headings and navigation labels", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <CaseTimelinePage />
      </MemoryRouter>,
    );

    expect(html).toContain("案例时间轴");
    expect(html).toContain("查看案例总览");
    expect(html).toContain("进入案例图谱");
    expect(html).toContain("时间轴视图");
    expect(html).toContain("桌面 / 移动");
  });
});
