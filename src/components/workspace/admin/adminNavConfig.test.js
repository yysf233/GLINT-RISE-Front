import { describe, expect, it } from "vitest";
import { getAdminNavGroups } from "./adminNavConfig";

const flattenItems = (groups) => groups.flatMap((group) => group.items);

describe("adminNavConfig", () => {
  it("returns wave 1 groups for employee", () => {
    const groups = getAdminNavGroups("employee");
    const labels = groups.map((group) => group.label);
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(labels).toEqual(["工作台", "商品与项目", "采购与导出", "系统管理"]);
    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).toContain("产品管理");
    expect(itemLabels).toContain("项目管理");
    expect(itemLabels).toContain("轮播与推荐");
  });

  it("returns wave 1 groups for director", () => {
    const groups = getAdminNavGroups("director");
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).toContain("产品管理");
    expect(itemLabels).toContain("项目管理");
    expect(itemLabels).toContain("轮播与推荐");
  });

  it("hides wave 1 business modules from developer", () => {
    const groups = getAdminNavGroups("developer");
    const itemLabels = flattenItems(groups).map((item) => item.label);

    expect(itemLabels).toContain("仪表盘");
    expect(itemLabels).not.toContain("产品管理");
    expect(itemLabels).not.toContain("项目管理");
    expect(itemLabels).not.toContain("轮播与推荐");
  });

  it("marks later-wave routes as placeholders", () => {
    const groups = getAdminNavGroups("employee");
    const allItems = flattenItems(groups);
    const placeholderItems = allItems.filter((item) => item.isPlaceholder);
    const placeholderPaths = placeholderItems.map((item) => item.to);

    expect(placeholderPaths).toContain("/workspace/suppliers");
    expect(placeholderPaths).toContain("/workspace/quotes");
    expect(placeholderPaths).toContain("/workspace/exports");
    expect(placeholderPaths).toContain("/workspace/settings/users");
    expect(placeholderPaths).toContain("/workspace/settings/logs");
  });
});
