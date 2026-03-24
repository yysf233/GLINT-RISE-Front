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

  it("creates and updates a project with timeline and related products", async () => {
    const created = await createWorkspaceProject({
      title: "Nova Project",
      status: "draft",
      owner: "Maya",
      industry: "Retail",
      year: "2026",
      publicCaseId: "nova-project",
      timeline: [
        { id: "t1", label: "Kickoff", order: 1 },
        { id: "t2", label: "Delivery", order: 2 },
      ],
      relatedProducts: [
        { id: "wp-1", publicProductId: "product-a" },
      ],
    });

    expect(created.project.id).toMatch(/^workspace-project-/);
    expect(created.project.timeline).toHaveLength(2);

    const updated = await updateWorkspaceProject(created.project.id, {
      status: "active",
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

    const loaded = await getWorkspaceProject(created.project.id);
    expect(loaded.project.id).toBe(created.project.id);
  });
});
