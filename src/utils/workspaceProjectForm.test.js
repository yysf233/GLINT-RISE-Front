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
    expect(defaults.timelineYear).toBe("");
    expect(defaults.timelineQuarter).toBe("");
    expect(defaults.timelineOrder).toBe("");
    expect(defaults.timelineCardSide).toBe("above");
    expect(defaults.timelineAccent).toBe("normal");
    expect(defaults.timeline).toEqual([]);
    expect(defaults.relatedProducts).toEqual([]);
  });

  it("maps a project into editable form data", () => {
    const mapped = mapWorkspaceProjectToForm(
      {
        id: "wp-case-001",
        title: "North Star Program",
        status: "active",
        owner: "Maya",
        industry: "Retail",
        year: "2026",
        category: "Case Study",
        publicCaseId: "bosideng-aerospace",
        timelineYear: "2024",
        timelineQuarter: "Q3",
        timelineOrder: 202403,
        timelineCardSide: "below",
        timelineAccent: "featured",
        summary: "Public case alignment.",
        short: "Short summary.",
        hero: "/hero.jpg",
        timeline: [{ id: "t1", label: "Kickoff", order: 1, description: "Started" }],
        relatedProducts: [{ id: "wp-lumina-arc", publicProductId: "lumina-arc" }],
      },
      { name: "Fallback" },
    );

    expect(mapped.title).toBe("North Star Program");
    expect(mapped.owner).toBe("Maya");
    expect(mapped.timelineYear).toBe("2024");
    expect(mapped.timelineQuarter).toBe("Q3");
    expect(mapped.timelineOrder).toBe("202403");
    expect(mapped.timelineCardSide).toBe("below");
    expect(mapped.timelineAccent).toBe("featured");
    expect(mapped.timeline).toEqual([{ id: "t1", label: "Kickoff", order: 1, description: "Started" }]);
    expect(mapped.relatedProducts).toEqual([{ id: "wp-lumina-arc", publicProductId: "lumina-arc" }]);
  });

  it("builds a normalized payload from form values", () => {
    const payload = buildWorkspaceProjectPayload({
      id: "wp-case-003",
      title: "Star Harbor",
      status: "active",
      owner: "Lydia",
      industry: "Retail",
      year: "2027",
      category: "Case Study",
      publicCaseId: "star-harbor",
      timelineYear: "2024",
      timelineQuarter: "Q4",
      timelineOrder: "202404",
      timelineCardSide: "above",
      timelineAccent: "featured",
      summary: "Release pipeline.",
      short: "Short note",
      hero: "/star.jpg",
      timeline: [
        { id: "", label: "Initiation", order: 2, description: "Defined" },
        { id: "x2", label: "Delivery", order: 5, description: "" },
        { id: "", label: "   ", order: 8, description: "Filtered" },
      ],
      relatedProducts: [
        { id: "wp-smart-hub", publicProductId: "product-a" },
        { id: "", publicProductId: "lumina-arc" },
      ],
    });

    expect(payload.id).toBe("wp-case-003");
    expect(payload.title).toBe("Star Harbor");
    expect(payload.timelineYear).toBe("2024");
    expect(payload.timelineQuarter).toBe("Q4");
    expect(payload.timelineOrder).toBe(202404);
    expect(payload.timelineCardSide).toBe("above");
    expect(payload.timelineAccent).toBe("featured");
    expect(payload.timeline).toEqual([
      { id: "timeline-1", label: "Initiation", order: 2, description: "Defined" },
      { id: "x2", label: "Delivery", order: 5, description: "" },
    ]);
    expect(payload.relatedProducts).toEqual([
      { id: "wp-smart-hub", publicProductId: "product-a" },
      { id: "", publicProductId: "lumina-arc" },
    ]);
  });
});
