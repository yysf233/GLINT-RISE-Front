import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the dark public footer with Chinese links and copyright copy", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <Footer />
      </MemoryRouter>,
    );

    expect(html).toContain("隐私政策");
    expect(html).toContain("服务条款");
    expect(html).toContain("合规说明");
    expect(html).toContain("无障碍说明");
    expect(html).toContain("保留所有权利");
    expect(html).not.toContain("PRIVACY");
    expect(html).not.toContain("ALL RIGHTS RESERVED");
  });
});
