import { describe, expect, it } from "vitest";
import {
  buildWorkspaceProductPayload,
  createWorkspaceProductFormDefaults,
  mapWorkspaceProductImportPreview,
  mapWorkspaceProductToForm,
  parseWorkspaceProductTags,
} from "./workspaceProductForm";

describe("workspaceProductForm helpers", () => {
  it("parses tag input into a clean array", () => {
    expect(parseWorkspaceProductTags(" atlas, beam , , core ")).toEqual(["atlas", "beam", "core"]);
  });

  it("builds default form values using the session user", () => {
    const defaults = createWorkspaceProductFormDefaults({
      name: "Tara",
      team: "Ops",
    });

    expect(defaults.owner).toBe("Tara");
    expect(defaults.ownerTeam).toBe("Ops");
    expect(defaults.status).toBe("draft");
    expect(defaults.category).toBe("flagship");
  });

  it("maps product values into editable form data", () => {
    const mapped = mapWorkspaceProductToForm(
      {
        id: "wp-001",
        name: "Smart Hub",
        shortName: "Hub",
        category: "device",
        status: "active",
        owner: "Lydia",
        ownerTeam: "Ops",
        retailPrice: 3200,
        internalCost: 2100,
        tags: ["核心", "新品"],
        displayTag: "智能设备 / V2.0",
        summary: "summary",
        publicMeta: [
          { label: "材质", value: "阳极黑钛" },
          { label: "版本", value: "V2.0" },
        ],
        progressSummary: "progress",
        supplierSummary: "supplier",
        hero: "/hero.jpg",
        needsUpdate: false,
      },
      { name: "Fallback", team: "Fallback" },
    );

    expect(mapped.name).toBe("Smart Hub");
    expect(mapped.shortName).toBe("Hub");
    expect(mapped.retailPrice).toBe("3200");
    expect(mapped.internalCost).toBe("2100");
    expect(mapped.tagsText).toBe("核心, 新品");
    expect(mapped.displayTag).toBe("智能设备 / V2.0");
    expect(mapped.publicMetaText).toBe("材质: 阳极黑钛\n版本: V2.0");
    expect(mapped.hero).toBe("/hero.jpg");
    expect(mapped.needsUpdate).toBe(false);
  });

  it("builds a payload from form values", () => {
    const payload = buildWorkspaceProductPayload({
      id: "atlas-beam",
      name: "Atlas Beam",
      shortName: "Atlas",
      category: "flagship",
      status: "draft",
      owner: "Tara",
      ownerTeam: "Ops",
      publicProductId: "atlas-beam",
      retailPrice: "3200",
      internalCost: "2100",
      tagsText: "atlas, beam",
      displayTag: "可持续科技 / 旗舰系列",
      publicMetaText: "材质: 阳极黑钛\n连接: 统一空间控制",
      summary: "summary",
      progressSummary: "progress",
      supplierSummary: "supplier",
      hero: "/atlas.jpg",
      needsUpdate: true,
    });

    expect(payload.id).toBe("atlas-beam");
    expect(payload.shortName).toBe("Atlas");
    expect(payload.tags).toEqual(["atlas", "beam"]);
    expect(payload.displayTag).toBe("可持续科技 / 旗舰系列");
    expect(payload.publicMeta).toEqual([
      { label: "材质", value: "阳极黑钛" },
      { label: "连接", value: "统一空间控制" },
    ]);
    expect(payload.retailPrice).toBe(3200);
    expect(payload.internalCost).toBe(2100);
  });

  it("maps import preview records into list-friendly items", () => {
    const items = mapWorkspaceProductImportPreview([
      {
        id: "wp-01",
        name: "Aurora",
        status: "draft",
        owner: "Mina",
        category: "space",
        tags: ["star"],
        summary: "summary",
      },
    ]);

    expect(items).toEqual([
      {
        id: "wp-01",
        name: "Aurora",
        status: "draft",
        owner: "Mina",
        category: "space",
        tags: ["star"],
        summary: "summary",
      },
    ]);
  });
});
