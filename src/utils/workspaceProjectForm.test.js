import { describe, expect, it } from "vitest";
import {
  buildWorkspaceProjectPayload,
  createWorkspaceProjectFormDefaults,
  mapWorkspaceProjectToForm,
} from "./workspaceProjectForm";

describe("workspaceProjectForm helpers", () => {
  it("builds default values from the current session user", () => {
    const defaults = createWorkspaceProjectFormDefaults({
      name: "Maya",
    });

    expect(defaults.owner).toBe("Maya");
    expect(defaults.status).toBe("draft");
    expect(defaults.timeline).toEqual([]);
    expect(defaults.relatedProducts).toEqual([]);
  });

  it("maps a project into editable form data", () => {
    const mapped = mapWorkspaceProjectToForm(
      {
        id: "wp-case-001",
        title: "北极星项目",
        status: "active",
        owner: "Maya",
        industry: "Retail",
        year: "2026",
        category: "Case Study",
        publicCaseId: "bosideng-aerospace",
        summary: "公开案例链路的对齐样本。",
        short: "旗舰案例上架对齐。",
        hero: "/hero.jpg",
        timeline: [
          { id: "t1", label: "启动", order: 1, description: "启动说明" },
        ],
        relatedProducts: [
          { id: "wp-lumina-arc", publicProductId: "lumina-arc" },
        ],
      },
      { name: "Fallback" },
    );

    expect(mapped.title).toBe("北极星项目");
    expect(mapped.owner).toBe("Maya");
    expect(mapped.timeline).toEqual([
      { id: "t1", label: "启动", order: 1, description: "启动说明" },
    ]);
    expect(mapped.relatedProducts).toEqual([
      { id: "wp-lumina-arc", publicProductId: "lumina-arc" },
    ]);
  });

  it("builds a normalized payload from form values", () => {
    const payload = buildWorkspaceProjectPayload({
      id: "wp-case-003",
      title: "星港体验计划",
      status: "active",
      owner: "Lydia",
      industry: "Retail",
      year: "2027",
      category: "Case Study",
      publicCaseId: "star-harbor",
      summary: "完整项目发布链路。",
      short: "短摘要",
      hero: "/star.jpg",
      timeline: [
        { id: "", label: "立项", order: 2, description: "说明" },
        { id: "x2", label: "交付", order: 5, description: "" },
        { id: "", label: "   ", order: 8, description: "应被过滤" },
      ],
      relatedProducts: [
        { id: "wp-smart-hub", publicProductId: "product-a" },
        { id: "", publicProductId: "lumina-arc" },
      ],
    });

    expect(payload.id).toBe("wp-case-003");
    expect(payload.title).toBe("星港体验计划");
    expect(payload.timeline).toEqual([
      { id: "timeline-1", label: "立项", order: 2, description: "说明" },
      { id: "x2", label: "交付", order: 5, description: "" },
    ]);
    expect(payload.relatedProducts).toEqual([
      { id: "wp-smart-hub", publicProductId: "product-a" },
      { id: "", publicProductId: "lumina-arc" },
    ]);
  });
});
