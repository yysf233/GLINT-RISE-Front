import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { SearchPage } from "./SearchPage";

describe("SearchPage", () => {
  it("renders the search layout while preserving keyword and filter summary", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/search?keyword=Hub&category=all&tag=all"]}>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(html).toContain("产品搜索");
    expect(html).toContain("共找到");
    expect(html).toContain("搜索产品名称、系列或功能标签");
  });
});
