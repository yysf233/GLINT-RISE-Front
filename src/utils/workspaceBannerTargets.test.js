import { describe, expect, it } from "vitest";
import { replaceWorkspaceBannerTargetCover } from "./workspaceBannerTargets";

describe("workspaceBannerTargets", () => {
  it("keeps only one cover flag when replacing the cover item", () => {
    const result = replaceWorkspaceBannerTargetCover(
      [
        { id: "old-cover", title: "old-cover", isCover: true },
        { id: "secondary", title: "secondary", isCover: false },
      ],
      {
        id: "new-cover",
        title: "new-cover",
        isCover: true,
      },
    );

    expect(result).toEqual([
      { id: "old-cover", title: "old-cover", isCover: false },
      { id: "secondary", title: "secondary", isCover: false },
      { id: "new-cover", title: "new-cover", isCover: true },
    ]);
  });

  it("preserves existing fields when replacing a cover item with the same id", () => {
    const result = replaceWorkspaceBannerTargetCover(
      [
        {
          id: "keep-id",
          title: "original-title",
          target: "/products",
          schedule: { start: "2026-01-01" },
          isCover: false,
        },
      ],
      {
        id: "keep-id",
        title: "new-title",
        isCover: true,
      },
    );

    expect(result).toEqual([
      {
        id: "keep-id",
        title: "new-title",
        target: "/products",
        schedule: { start: "2026-01-01" },
        isCover: true,
      },
    ]);
  });
});
