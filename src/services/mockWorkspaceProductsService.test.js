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
      shortName: "Shelf",
      category: "device",
      status: "active",
      needsUpdate: false,
      owner: "Maya",
      displayTag: "空间模块 / 陈列系列",
      retailPrice: 1800,
      internalCost: 900,
      summary: "Shelving unit for rollout",
      publicProductId: "product-a",
      hero: "/nova.jpg",
      publicMeta: [{ label: "材质", value: "碳钢" }],
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
    expect(updated.product.shortName).toBe("Shelf");
    expect(updated.product.displayTag).toBe("空间模块 / 陈列系列");
    expect(updated.product.publicMeta).toEqual([{ label: "材质", value: "碳钢" }]);

    const loaded = await getWorkspaceProduct(created.product.id);
    expect(loaded.product.id).toBe(created.product.id);
    expect(loaded.product.status).toBe("archived");
    expect(loaded.product.publicMeta).toEqual([{ label: "材质", value: "碳钢" }]);
  });

  it("persists media ordering and cover selection when saving a product", async () => {
    const created = await createWorkspaceProduct({
      name: "Atlas Light",
      category: "device",
      status: "draft",
      needsUpdate: false,
      owner: "Maya",
      retailPrice: 1200,
      publicProductId: "product-a",
      media: [
        { id: "m-1", url: "/media-1.jpg" },
        { id: "m-2", url: "/media-2.jpg" },
        { id: "m-3", url: "/media-3.jpg" },
      ],
      coverId: "m-2",
    });

    const updated = await updateWorkspaceProduct(created.product.id, {
      media: [
        { id: "m-3", url: "/media-3.jpg" },
        { id: "m-2", url: "/media-2.jpg" },
        { id: "m-1", url: "/media-1.jpg" },
      ],
      coverId: "m-3",
    });

    expect(updated.product.media.map((item) => item.id)).toEqual(["m-3", "m-2", "m-1"]);
    expect(updated.product.media.find((item) => item.isCover)?.id).toBe("m-3");
    expect(updated.product.hero).toBe("/media-3.jpg");

    const loaded = await getWorkspaceProduct(created.product.id);
    expect(loaded.product.media.map((item) => item.id)).toEqual(["m-3", "m-2", "m-1"]);
    expect(loaded.product.media.find((item) => item.isCover)?.id).toBe("m-3");
  });

  it("tracks status transitions in logs and switches visibility", async () => {
    const created = await createWorkspaceProduct({
      name: "Nova Beam",
      category: "flagship",
      status: "draft",
      needsUpdate: false,
      owner: "Maya",
      retailPrice: 2000,
      publicProductId: "lumina-arc",
    });

    const published = await updateWorkspaceProduct(created.product.id, {
      status: "active",
      owner: "Maya",
    });

    const archived = await updateWorkspaceProduct(created.product.id, {
      status: "archived",
      owner: "Maya",
    });

    const lastLog = archived.product.logs[archived.product.logs.length - 1];
    expect(lastLog.action).toBe("status");
    expect(lastLog.message).toContain("archived");

    expect(published.product.status).toBe("active");
    expect(archived.product.status).toBe("archived");
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

  it("imports media and cover data from json payloads", async () => {
    const jsonPayload = JSON.stringify([
      {
        name: "Media Import",
        category: "device",
        status: "active",
        needsUpdate: false,
        owner: "Maya",
        retailPrice: 1800,
        publicProductId: "product-a",
        media: [
          { id: "json-1", url: "/json-1.jpg" },
          { id: "json-2", url: "/json-2.jpg" },
        ],
        coverId: "json-2",
      },
    ]);

    const imported = await importWorkspaceProducts(jsonPayload);
    expect(imported.items[0].media.map((item) => item.id)).toEqual(["json-1", "json-2"]);
    expect(imported.items[0].media.find((item) => item.isCover)?.id).toBe("json-2");
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

  it("falls back to the first media item when coverId is missing", async () => {
    const created = await createWorkspaceProduct({
      name: "Fallback Media",
      category: "device",
      status: "active",
      needsUpdate: false,
      owner: "Maya",
      media: [
        { id: "cover-1", url: "/cover-1.jpg" },
        { id: "cover-2", url: "/cover-2.jpg" },
      ],
      coverId: "missing",
    });

    expect(created.product.media.find((item) => item.isCover)?.id).toBe("cover-1");
    expect(created.product.hero).toBe("/cover-1.jpg");
  });
});
