import { describe, expect, it } from "vitest";
import { buildPublicCaseTimelineModel, derivePublicTimelineOrder } from "./publicCaseTimeline";

describe("publicCaseTimeline", () => {
  it("derives timeline order from explicit order or year and quarter fallback", () => {
    expect(
      derivePublicTimelineOrder({
        timelineOrder: 202404,
        timelineYear: "2024",
        timelineQuarter: "Q1",
      }),
    ).toBe(202404);

    expect(
      derivePublicTimelineOrder({
        timelineYear: "2023",
        timelineQuarter: "Q2",
      }),
    ).toBe(202302);

    expect(
      derivePublicTimelineOrder({
        timelineYear: "",
        timelineQuarter: "",
      }),
    ).toBe(0);
  });

  it("builds quarter ticks continuously and positions cards from published projects only", () => {
    const model = buildPublicCaseTimelineModel([
      {
        id: "p-3",
        title: "Neural Nexus",
        status: "active",
        publicCaseId: "enterprise-data-synergy",
        timelineYear: "2024",
        timelineQuarter: "Q3",
        timelineOrder: 202403,
        timelineCardSide: "above",
        timelineAccent: "featured",
        summary: "AI program",
        category: "AI Infrastructure",
        industry: "Technology",
      },
      {
        id: "p-1",
        title: "Monolith HQ",
        status: "active",
        publicCaseId: "bosideng-aerospace",
        timelineYear: "2023",
        timelineQuarter: "Q1",
        timelineOrder: 202301,
        timelineCardSide: "below",
        timelineAccent: "normal",
        summary: "Architecture project",
        category: "Architectural",
        industry: "Culture",
      },
      {
        id: "p-2",
        title: "Quarter Without Link",
        status: "active",
        publicCaseId: "",
        timelineYear: "2023",
        timelineQuarter: "Q1",
        timelineOrder: 202301,
        timelineCardSide: "",
        timelineAccent: "featured",
        summary: "No link project",
        category: "Internal",
        industry: "Technology",
      },
      {
        id: "draft-1",
        title: "Draft Ignored",
        status: "draft",
        publicCaseId: "ignored",
        timelineYear: "2024",
        timelineQuarter: "Q4",
        timelineOrder: 202404,
      },
    ]);

    expect(model.ticks.map((tick) => tick.order)).toEqual([
      202301,
      202302,
      202303,
      202304,
      202401,
      202402,
      202403,
    ]);
    expect(model.years.map((year) => year.year)).toEqual(["2023", "2024"]);
    expect(model.cards).toHaveLength(3);
    expect(model.cards[0].id).toBe("p-1");
    expect(model.cards[0].disabled).toBe(false);
    expect(model.cards[1].id).toBe("p-2");
    expect(model.cards[1].disabled).toBe(true);
    expect(model.cards[1].side).toBe("above");
    expect(model.cards[2].id).toBe("p-3");
  });
});
