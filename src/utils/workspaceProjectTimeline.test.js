import { describe, expect, it } from "vitest";
import { reorderWorkspaceProjectTimeline } from "./workspaceProjectTimeline";

describe("workspaceProjectTimeline", () => {
  it("moves a node and keeps stable order for others", () => {
    const nodes = [
      { id: "n1", label: "start" },
      { id: "n2", label: "mid" },
      { id: "n3", label: "end" },
    ];

    const result = reorderWorkspaceProjectTimeline(nodes, 0, 2);

    expect(result.map((node) => node.id)).toEqual(["n2", "n3", "n1"]);
  });

  it("ignores invalid indices and returns original order", () => {
    const nodes = [
      { id: "n1", label: "start" },
      { id: "n2", label: "mid" },
    ];

    const result = reorderWorkspaceProjectTimeline(nodes, -1, 9);

    expect(result.map((node) => node.id)).toEqual(["n1", "n2"]);
  });
});
