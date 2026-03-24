import { beforeEach, describe, expect, it } from "vitest";
import {
  bulkAddWorkspaceProductTags,
  createWorkspaceProduct,
  getWorkspaceProduct,
  importWorkspaceProducts,
  listWorkspaceProducts,
  previewWorkspaceProductImport,
  resetWorkspaceProductsStore,
  updateWorkspaceProduct,
} from "./mockWorkspaceProductsService";

const rawText = `
name: Arc Bench
category: space
status: draft
needsUpdate: yes
owner: Ivy
updatedAt: 2026-03-24T08:00:00.000Z
tags: bench, modular
retailPrice: 4120
internalCost: 2400
summary: Modular public installation
publicProductId: hot-02
hero: /arc-bench.jpg
progressSummary: Draft complete
supplierSummary: Supplier check pending
logs: 2026-03-21T08:00:00.000Z | seed | Drafted
`;

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

describe("mockWorkspaceProductsService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceProductsStore();
  });

  it("lists seeded products with summary data and honors hot price sorting", async () => {
    const result = await listWorkspaceProducts({ category: "hot", sort: "price-asc" });

    expect(result.items).toHaveLength(result.total);
    expect(result.summary.total).toBe(result.total);
    expect(result.items.map((item) => item.category)).toEqual(["hot", "hot", "hot", "hot", "hot", "hot"]);
    expect(result.items[0].retailPrice).toBeLessThanOrEqual(result.items[1].retailPrice);
  });

  it("creates updates and reads back a workspace product", async () => {
    const created = await createWorkspaceProduct({
      name: "Nova Shelf",
      category: "device",
      status: "active",
      needsUpdate: false,
      owner: "Maya",
      retailPrice: 1800,
      internalCost: 900,
      summary: "Shelving unit for rollout",
      publicProductId: "product-a",
      hero: "/nova.jpg",
      progressSummary: "Ready",
      supplierSummary: "Supplier confirmed",
      tags: ["shelf"],
    });

    expect(created.product.id).toMatch(/^workspace-product-/);

    const updated = await updateWorkspaceProduct(created.product.id, {
      status: "archived",
      needsUpdate: true,
      tags: ["shelf", "archive"],
    });

    expect(updated.product.status).toBe("archived");
    expect(updated.product.needsUpdate).toBe(true);
    expect(updated.product.tags).toEqual(["shelf", "archive"]);

    const loaded = await getWorkspaceProduct(created.product.id);
    expect(loaded.product.id).toBe(created.product.id);
    expect(loaded.product.status).toBe("archived");
  });

  it("bulk adds tags to multiple products and deduplicates them", async () => {
    const result = await bulkAddWorkspaceProductTags({
      ids: ["wp-lumina-arc", "wp-smart-hub"],
      tags: ["launch", "core", "launch"],
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0].tags).toContain("launch");
    expect(result.items[1].tags).toContain("core");
  });

  it("previews and imports workspace products from text", async () => {
    const preview = await previewWorkspaceProductImport(rawText);
    expect(preview.preview).toHaveLength(1);
    expect(preview.preview[0].product.name).toBe("Arc Bench");

    const imported = await importWorkspaceProducts(rawText);
    expect(imported.importedCount).toBe(1);
    expect(imported.items[0].name).toBe("Arc Bench");

    const stored = await listWorkspaceProducts({ keyword: "Arc Bench" });
    expect(stored.total).toBe(1);
  });

  it("rejects imports that contain no valid records", async () => {
    const imported = await importWorkspaceProducts("name: Broken Record");

    expect(imported).toEqual({
      error: {
        code: "INVALID_IMPORT_INPUT",
        message: "Import preview contains no valid records.",
      },
    });
  });

  it("restores seed data after reset", async () => {
    const before = await listWorkspaceProducts();
    await createWorkspaceProduct({
      name: "Temporary Entry",
      category: "device",
      status: "draft",
      needsUpdate: true,
      owner: "Temp",
    });

    const afterCreate = await listWorkspaceProducts();
    expect(afterCreate.total).toBe(before.total + 1);

    resetWorkspaceProductsStore();

    const afterReset = await listWorkspaceProducts();
    expect(afterReset.total).toBe(before.total);
  });
});
