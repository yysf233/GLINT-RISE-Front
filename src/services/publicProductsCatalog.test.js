import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("publicProductsCatalog", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    vi.resetModules();
  });

  it("reads published workspace products and derives dynamic filters", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.products,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "wp-sync-001",
          publicProductId: "public-sync-001",
          status: "active",
          name: "星港装置",
          shortName: "星港",
          category: "hot",
          displayTag: "限量款 / 夜光系列",
          retailPrice: 8888,
          summary: "来自后台已发布产品的数据摘要",
          media: [
            { id: "m-1", url: "/sync-1.jpg", isCover: true },
            { id: "m-2", url: "/sync-2.jpg", isCover: false },
          ],
          publicMeta: [
            { label: "材质", value: "铝合金" },
            { label: "系列", value: "V3.0" },
          ],
        },
      ],
    });

    const {
      getHotPublicProducts,
      getPublicProductById,
      getPublicProductFilters,
      listPublicProducts,
    } = await import("./publicProductsCatalog");

    const items = listPublicProducts();
    expect(items).toEqual([
      {
        id: "public-sync-001",
        name: "星港装置",
        shortName: "星港",
        tag: "限量款 / 夜光系列",
        price: "8888",
        desc: "来自后台已发布产品的数据摘要",
        hero: "/sync-1.jpg",
        thumbs: ["/sync-1.jpg", "/sync-2.jpg"],
        meta: [
          ["材质", "铝合金"],
          ["系列", "V3.0"],
        ],
        searchCategory: "热门精选",
        searchTags: ["限量款", "夜光系列"],
      },
    ]);

    expect(getPublicProductById("public-sync-001")).toMatchObject({
      id: "public-sync-001",
      shortName: "星港",
      searchCategory: "热门精选",
    });

    expect(getPublicProductFilters(items)).toEqual({
      categoryOptions: ["全部产品", "热门精选"],
      tagOptions: ["全部标签", "限量款", "夜光系列"],
    });

    expect(getHotPublicProducts().map((item) => item.id)).toEqual(["public-sync-001"]);
  });

  it("reflects workspace create and update operations in the public catalog", async () => {
    const { createWorkspaceProduct, updateWorkspaceProduct } = await import("./mockWorkspaceProductsService");
    const { getPublicProductById, listPublicProducts } = await import("./publicProductsCatalog");

    const created = await createWorkspaceProduct({
      id: "sync-product",
      publicProductId: "sync-product",
      name: "同步样机",
      shortName: "样机",
      category: "device",
      status: "draft",
      owner: "Maya",
      displayTag: "预发布",
      summary: "草稿阶段不应暴露到前台",
      publicMeta: [{ label: "版本", value: "Draft" }],
    });

    expect(created.product.status).toBe("draft");
    expect(listPublicProducts().some((item) => item.id === "sync-product")).toBe(false);

    await updateWorkspaceProduct(created.product.id, {
      status: "active",
      shortName: "同步成品",
      displayTag: "前台同步 / 正式版",
      summary: "更新后应该同步到前台",
      publicMeta: [{ label: "版本", value: "Release" }],
    });

    expect(getPublicProductById("sync-product")).toMatchObject({
      id: "sync-product",
      shortName: "同步成品",
      tag: "前台同步 / 正式版",
      desc: "更新后应该同步到前台",
      meta: [["版本", "Release"]],
    });
  });
  it("removes archived workspace products from the public catalog", async () => {
    const { createWorkspaceProduct, updateWorkspaceProduct } = await import("./mockWorkspaceProductsService");
    const { getPublicProductById, listPublicProducts } = await import("./publicProductsCatalog");

    const created = await createWorkspaceProduct({
      id: "archive-product",
      publicProductId: "archive-product",
      name: "Archived Sample",
      shortName: "Archived",
      category: "device",
      status: "active",
      owner: "Maya",
      displayTag: "公开在售",
      summary: "首次发布后会在前台显示",
      publicMeta: [{ label: "版本", value: "Live" }],
    });

    expect(getPublicProductById("archive-product")).toMatchObject({
      id: "archive-product",
      shortName: "Archived",
    });

    await updateWorkspaceProduct(created.product.id, {
      status: "archived",
      owner: "Maya",
    });

    expect(getPublicProductById("archive-product")).toBeNull();
    expect(listPublicProducts().some((item) => item.id === "archive-product")).toBe(false);
  });
});
