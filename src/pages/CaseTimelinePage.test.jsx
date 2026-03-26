import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { CaseTimelinePage } from "./CaseTimelinePage";

describe("CaseTimelinePage", () => {
  it("renders the horizontal timeline canvas with drag and zoom markers", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <CaseTimelinePage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-case-timeline-layout="horizontal-canvas"');
    expect(html).toContain('data-page-shell-mode="viewport-locked"');
    expect(html).toContain('data-testid="case-timeline-canvas"');
    expect(html).toContain('data-testid="case-timeline-viewport"');
    expect(html).toContain('data-testid="case-timeline-track"');
    expect(html).toContain('data-testid="case-timeline-year-tick-0"');
    expect(html).toContain('data-testid="case-timeline-quarter-tick-0"');
    expect(html).toContain('data-testid="case-timeline-card-0"');
    expect(html).toContain('data-testid="case-timeline-zoom-out"');
    expect(html).toContain('data-testid="case-timeline-zoom-in"');
    expect(html).toContain('data-testid="case-timeline-zoom-reset"');
    expect(html).not.toContain("<footer");
  });

  it("uses Chinese page labels for the timeline toolbar", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <CaseTimelinePage />
      </MemoryRouter>,
    );

    expect(html).toContain("案例时间轴");
    expect(html).toContain("时间轴");
    expect(html).toContain("归档");
    expect(html).toContain("洞察");
    expect(html).toContain("分享时间轴");
  });
});
