import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { EntryPage } from "./EntryPage";

describe("EntryPage", () => {
  it("renders the public entry page with both visitor and login entry points", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <EntryPage />
      </MemoryRouter>,
    );

    expect(html).toContain("访客进入");
    expect(html).toContain("登录入口");
    expect(html).toContain("品牌体验已就绪");
  });
});
