import { describe, expect, it } from "vitest";
import { moveWorkspaceProjectTimelineItem } from "./workspaceProjectTimeline";

const sampleItems = [
  { id: "cover", label: "封面" },
  { id: "detail-a", label: "细节 A" },
  { id: "detail-b", label: "细节 B" },
  { id: "detail-c", label: "细节 C" },
];

describe("workspaceProjectTimeline", () => {
  it("moves an image up without changing the relative order of the other items", () => {
    const result = moveWorkspaceProjectTimelineItem(sampleItems, "detail-b", "up");

    expect(result.map((item) => item.id)).toEqual(["cover", "detail-b", "detail-a", "detail-c"]);
  });

  it("moves an image down without changing the relative order of the other items", () => {
    const result = moveWorkspaceProjectTimelineItem(sampleItems, "detail-a", "down");

    expect(result.map((item) => item.id)).toEqual(["cover", "detail-b", "detail-a", "detail-c"]);
  });
});
