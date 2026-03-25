import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { CaseMapPage } from "./CaseMapPage";

describe("CaseMapPage", () => {
  it("renders the map layout with zoom controls and share action", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <MemoryRouter initialEntries={["/case-map"]}>
          <CaseMapPage />
        </MemoryRouter>
      </NoticeProvider>,
    );

    expect(html).toContain('data-case-map-layout="map"');
    expect(html).toContain("缩小图谱");
    expect(html).toContain("放大图谱");
    expect(html).toContain("分享页面");
  });
});
