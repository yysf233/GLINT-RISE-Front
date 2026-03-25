import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { SearchPage } from "./SearchPage";

describe("SearchPage", () => {
  it("renders the dark prototype search layout while preserving keyword and filter summary", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/search?keyword=Hub&category=all&tag=all"]}>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-search-layout="prototype-dark"');
    expect(html).toContain('data-testid="search-filter-panel"');
    expect(html).toContain('data-testid="search-results-grid"');
    expect(html).toContain("共找到");
    expect(html).toContain("搜索洞察、产品、案例");
  });
});
