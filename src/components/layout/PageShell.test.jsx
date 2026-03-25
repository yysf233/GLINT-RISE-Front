import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { PageShell } from "./PageShell";

describe("PageShell", () => {
  it("scopes public theme vars at the public shell root and keeps motion hooks", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/home"]}>
        <PageShell>
          <div>content</div>
        </PageShell>
      </MemoryRouter>,
    );

    expect(html).toContain('data-public-theme="glint-rise-public"');
    expect(html).toContain('data-testid="page-shell-main"');
    expect(html).toContain('data-page-motion="enabled"');
    expect(html).toContain("--color-background-canvas:");
    expect(html).toContain("--font-body:");
  });
});
