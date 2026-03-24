import { describe, expect, it } from "vitest";
import { getAdminNavGroups } from "./adminNavConfig";

const flattenItems = (groups) => groups.flatMap((group) => group.items);

describe("adminNavConfig", () => {
  it("returns workspace groups for employee", () => {
    const groups = getAdminNavGroups("employee");
    const labels = groups.map((group) => group.label);
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(labels).toEqual(["工作台", "商品与项目", "采购与导出", "系统管理"]);
    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).toContain("产品管理");
    expect(itemLabels).toContain("项目管理");
    expect(itemLabels).toContain("轮播与推荐");
    expect(itemLabels).toContain("供应商管理");
    expect(itemLabels).toContain("询报价流程");
    expect(itemLabels).toContain("导出中心");
  });

  it("returns workspace groups for director", () => {
    const groups = getAdminNavGroups("director");
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).toContain("产品管理");
    expect(itemLabels).toContain("项目管理");
    expect(itemLabels).toContain("询报价流程");
    expect(itemLabels).toContain("导出中心");
  });

  it("hides business procurement modules from developer", () => {
    const groups = getAdminNavGroups("developer");
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).toContain("内容管理");
    expect(itemLabels).not.toContain("产品管理");
    expect(itemLabels).not.toContain("供应商管理");
    expect(itemLabels).not.toContain("询报价流程");
    expect(itemLabels).not.toContain("导出中心");
  });

  it("keeps only unfinished settings routes as placeholders", () => {
    const groups = getAdminNavGroups("employee");
    const placeholderPaths = flattenItems(groups)
      .filter((item) => item.isPlaceholder)
      .map((item) => item.to);

    expect(placeholderPaths).toContain("/workspace/settings/users");
    expect(placeholderPaths).toContain("/workspace/settings/logs");
    expect(placeholderPaths).not.toContain("/workspace/settings/content");
    expect(placeholderPaths).not.toContain("/workspace/suppliers");
    expect(placeholderPaths).not.toContain("/workspace/quotes");
    expect(placeholderPaths).not.toContain("/workspace/exports");
  });
});
