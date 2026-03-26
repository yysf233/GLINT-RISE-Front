import { beforeEach, describe, expect, it } from "vitest";
import {
  createWorkspaceProject,
  getWorkspaceProject,
  listWorkspaceProjects,
  resetWorkspaceProjectsStore,
  updateWorkspaceProject,
} from "./mockWorkspaceProjectsService";

const createLocalStorage = () => {
  const storage = new Map();
  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(String(key), String(value));
    },
    removeItem(key) {
      storage.delete(String(key));
    },
    clear() {
      storage.clear();
    },
  };
};

describe("mockWorkspaceProjectsService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceProjectsStore();
  });

  it("lists seeded projects", async () => {
    const result = await listWorkspaceProjects();
    expect(result.total).toBeGreaterThan(0);
    expect(result.items).toHaveLength(result.total);
  });

  it("creates and updates a project with timeline placement metadata", async () => {
    const created = await createWorkspaceProject({
      title: "Nova Project",
      status: "draft",
      owner: "Maya",
      industry: "Retail",
      year: "2026",
      publicCaseId: "nova-project",
      timelineYear: "2024",
      timelineQuarter: "Q2",
      timelineOrder: 202402,
      timelineCardSide: "above",
      timelineAccent: "normal",
      timeline: [
        { id: "t1", label: "Kickoff", order: 1 },
        { id: "t2", label: "Delivery", order: 2 },
      ],
      relatedProducts: [{ id: "wp-1", publicProductId: "product-a" }],
    });

    expect(created.project.id).toMatch(/^workspace-project-/);
    expect(created.project.timeline).toHaveLength(2);
    expect(created.project.timelineYear).toBe("2024");
    expect(created.project.timelineQuarter).toBe("Q2");
    expect(created.project.timelineOrder).toBe(202402);
    expect(created.project.timelineCardSide).toBe("above");
    expect(created.project.timelineAccent).toBe("normal");

    const updated = await updateWorkspaceProject(created.project.id, {
      status: "active",
      timelineYear: "2024",
      timelineQuarter: "Q4",
      timelineOrder: 202404,
      timelineCardSide: "below",
      timelineAccent: "featured",
      timeline: [
        { id: "t2", label: "Delivery", order: 1 },
        { id: "t1", label: "Kickoff", order: 2 },
      ],
      relatedProducts: [
        { id: "wp-1", publicProductId: "product-a" },
        { id: "wp-2", publicProductId: "product-b" },
      ],
    });

    expect(updated.project.status).toBe("active");
    expect(updated.project.timeline[0].id).toBe("t2");
    expect(updated.project.relatedProducts).toHaveLength(2);
    expect(updated.project.timelineYear).toBe("2024");
    expect(updated.project.timelineQuarter).toBe("Q4");
    expect(updated.project.timelineOrder).toBe(202404);
    expect(updated.project.timelineCardSide).toBe("below");
    expect(updated.project.timelineAccent).toBe("featured");

    const loaded = await getWorkspaceProject(created.project.id);
    expect(loaded.project.id).toBe(created.project.id);
    expect(loaded.project.timelineOrder).toBe(202404);
  });
});
