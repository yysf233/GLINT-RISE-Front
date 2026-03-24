import { describe, expect, it } from "vitest";
import { replaceWorkspaceBannerTargetCover } from "./workspaceBannerTargets";

describe("workspaceBannerTargets", () => {
  it("keeps only one cover flag when replacing the cover item", () => {
    const result = replaceWorkspaceBannerTargetCover(
      [
        { id: "old-cover", title: "旧封面", isCover: true },
        { id: "secondary", title: "次图", isCover: false },
      ],
      {
        id: "new-cover",
        title: "新封面",
        isCover: true,
      },
    );

    expect(result).toEqual([
      { id: "old-cover", title: "旧封面", isCover: false },
      { id: "secondary", title: "次图", isCover: false },
      { id: "new-cover", title: "新封面", isCover: true },
    ]);
  });
});
