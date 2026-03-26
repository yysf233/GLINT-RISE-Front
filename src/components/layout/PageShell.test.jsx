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

  it("supports a viewport-locked shell without footer chrome", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/case-timeline"]}>
        <PageShell lockViewport hideFooter>
          <div>content</div>
        </PageShell>
      </MemoryRouter>,
    );

    expect(html).toContain('data-page-shell-mode="viewport-locked"');
    expect(html).toContain('class="h-[100dvh] overflow-hidden text-[var(--color-text-primary)]"');
    expect(html).toContain('data-testid="page-shell-main"');
    expect(html).toContain('class="px-[var(--space-page-x)] pt-[var(--space-page-top)] h-[100dvh] overflow-hidden"');
    expect(html).not.toContain("<footer");
  });
});
