import { describe, expect, it } from "vitest";
import { previewWorkspaceSupplierImport } from "./workspaceSupplierImport";

describe("workspaceSupplierImport", () => {
  it("previews pipe-delimited supplier imports and auto-rates records", () => {
    const result = previewWorkspaceSupplierImport(
      "Nova Factory||Strategic retail launch|3600|12-18天|高|retail, flagship|内部员工|false|Mina|13800000010|mina@nova.test|88|12|Precision metal shop|wp-lumina-arc|Primary strategic factory",
    );

    expect(result.warnings).toEqual([]);
    expect(result.preview[0].supplier).toMatchObject({
      name: "Nova Factory",
      rating: "A",
      owner: "内部员工",
      leadTimeBand: "12-18天",
      tags: ["retail", "flagship"],
      relatedProductIds: ["wp-lumina-arc"],
    });
  });

  it("reports invalid supplier import rows", () => {
    const result = previewWorkspaceSupplierImport("Broken Supplier||||||||||||||||");

    expect(result.preview[0].supplier).toBeNull();
    expect(result.warnings[0]).toContain("Record 1");
  });
});
