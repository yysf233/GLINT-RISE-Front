import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminFormSection } from "./AdminFormSection";

describe("AdminFormSection", () => {
  it("wraps content in a form by default", () => {
    const html = renderToStaticMarkup(
      <AdminFormSection title="test">
        <div>field</div>
      </AdminFormSection>,
    );

    expect(html).toContain("<form");
  });

  it("allows rendering without a form wrapper", () => {
    const html = renderToStaticMarkup(
      <AdminFormSection title="test" useForm={false}>
        <div>field</div>
      </AdminFormSection>,
    );

    expect(html).not.toContain("<form");
  });
});
