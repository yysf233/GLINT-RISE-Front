import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { CaseTimelinePage } from "./CaseTimelinePage";

describe("CaseTimelinePage", () => {
  it("renders the timeline layout with zoom controls intact", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <CaseTimelinePage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-case-timeline-layout="timeline"');
    expect(html).toContain("缩小图谱");
    expect(html).toContain("放大图谱");
    expect(html).toContain("重置图谱缩放");
  });
});
