import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders the category selector as a single custom chevron control", () => {
    const html = renderToStaticMarkup(
      <SearchBar
        value=""
        setValue={vi.fn()}
        category="全部产品"
        setCategory={vi.fn()}
        onSubmit={vi.fn()}
        options={["全部产品", "旗舰产品"]}
        variant="dark"
        placeholder="搜索洞察、产品、案例..."
      />,
    );

    expect(html).toContain('data-testid="search-bar-category-shell"');
    expect(html).toContain('data-testid="search-bar-category-select"');
    expect(html).toContain("appearance-none");
    expect(html).toContain("搜索范围");
  });
});
