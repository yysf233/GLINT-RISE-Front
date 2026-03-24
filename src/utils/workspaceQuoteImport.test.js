import { describe, expect, it } from "vitest";
import { getWorkspaceQuoteImportTemplate, previewWorkspaceQuoteImport } from "./workspaceQuoteImport";

describe("workspaceQuoteImport", () => {
  it("returns the pipe-delimited import template", () => {
    expect(getWorkspaceQuoteImportTemplate()).toContain(
      "需求名称|关键词|数量|目标交期|目标价格带|是否定制|备注",
    );
  });

  it("parses valid quote requirement rows", () => {
    const result = previewWorkspaceQuoteImport(
      [
        "智能中控升级|smart hub,device|120|18|中|否|门店设备升级",
        "旗舰灯箱定制|lumina,lighting|80|25|高|是|重点项目",
      ].join("\n"),
    );

    expect(result.warnings).toEqual([]);
    expect(result.preview).toHaveLength(2);
    expect(result.preview[0].requirement).toMatchObject({
      name: "智能中控升级",
      keywords: ["smart hub", "device"],
      quantity: 120,
      targetLeadDays: 18,
      targetPriceBand: "中",
      isCustom: false,
      notes: "门店设备升级",
    });
    expect(result.preview[1].requirement).toMatchObject({
      name: "旗舰灯箱定制",
      keywords: ["lumina", "lighting"],
      quantity: 80,
      targetLeadDays: 25,
      targetPriceBand: "高",
      isCustom: true,
      notes: "重点项目",
    });
  });

  it("reports row warnings for invalid records", () => {
    const result = previewWorkspaceQuoteImport("字段缺失|lumina||25|高|是|备注");

    expect(result.preview).toHaveLength(1);
    expect(result.preview[0].requirement).toBeNull();
    expect(result.warnings[0]).toContain("Record 1");
    expect(result.warnings[0]).toContain("quantity");
  });
});
