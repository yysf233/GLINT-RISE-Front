import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminSortableMediaList } from "./AdminSortableMediaList";

describe("AdminSortableMediaList", () => {
  it("exposes accessible labels for move and remove actions", () => {
    const html = renderToStaticMarkup(
      <AdminSortableMediaList
        items={[
          { id: "m1", title: "media", thumbnail: "https://example.com/1.png" },
        ]}
      />,
    );

    expect(html).toContain('aria-label="上移"');
    expect(html).toContain('aria-label="下移"');
    expect(html).toContain('aria-label="移除"');
  });
});
