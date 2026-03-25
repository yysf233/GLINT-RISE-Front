import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { SearchPage } from "./SearchPage";

describe("SearchPage", () => {
  it("renders the desktop prototype search shell with toolbar, sidebar, and result grid", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/search?keyword=Hub&category=all&tag=all"]}>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-search-layout="prototype-dark"');
    expect(html).toContain('data-testid="search-toolbar"');
    expect(html).toContain('data-testid="search-filter-sidebar"');
    expect(html).toContain('data-testid="search-results-grid"');
    expect(html).toContain("共找到");
  });

  it("uses Chinese search labels that match the desktop prototype rhythm", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/search?keyword=Hub&category=all&tag=all"]}>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(html).toContain("发现引擎");
    expect(html).toContain("搜索洞察、产品、案例");
    expect(html).toContain("行业分类");
    expect(html).toContain("细分标签");
    expect(html).toContain("最新");
    expect(html).toContain("热门");
  });
});
