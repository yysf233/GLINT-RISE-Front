import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { EntryPage } from "./EntryPage";

describe("EntryPage", () => {
  it("renders the desktop prototype entry page with brand hero, actions, and footer rail", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <EntryPage />
      </MemoryRouter>,
    );

    expect(html).toContain('data-entry-layout="prototype-dark"');
    expect(html).toContain('data-testid="entry-hero"');
    expect(html).toContain('data-testid="entry-actions"');
    expect(html).toContain('data-testid="entry-footer"');
  });

  it("uses Chinese entry labels and footer copy", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <EntryPage />
      </MemoryRouter>,
    );

    expect(html).toContain("品牌入口");
    expect(html).toContain("访客进入");
    expect(html).toContain("登录入口");
    expect(html).toContain("私域档案入口");
    expect(html).toContain("隐私政策");
    expect(html).toContain("使用条款");
    expect(html).toContain("合规说明");
    expect(html).toContain("保留所有权利");
  });
});
