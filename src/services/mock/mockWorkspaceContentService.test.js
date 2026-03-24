import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWorkspaceContentConsole,
  reorderWorkspaceContentBanners,
  resetWorkspaceContentStores,
  setWorkspaceContentBannerStatus,
  updateWorkspaceContentProductDisplayTag,
  updateWorkspaceContentSettings,
} from "./mockWorkspaceContentService";

const DEVELOPER_VIEWER = {
  id: "user-developer",
  name: "开发维护",
  role: "developer",
  permissions: {
    contentMaintenance: true,
  },
};

const EMPLOYEE_VIEWER = {
  id: "user-employee",
  name: "内部员工",
  role: "employee",
  permissions: {
    contentMaintenance: false,
  },
};

function createLocalStorage() {
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
}

describe("mockWorkspaceContentService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceContentStores();
    vi.resetModules();
  });

  it("returns content console summary for developer maintainer", async () => {
    const result = await getWorkspaceContentConsole(DEVELOPER_VIEWER);

    expect(result.summary.onlineBannerCount).toBeGreaterThan(0);
    expect(result.summary.publishedProductCount).toBeGreaterThan(0);
    expect(result.summary.publicTagCount).toBeGreaterThan(0);
    expect(result.settings.brand.name).toBe("GLINT RISE");
    expect(result.products.some((item) => item.publicProductId === "lumina-arc")).toBe(true);
  });

  it("updates public site settings and syncs to the public reader", async () => {
    const updateResult = await updateWorkspaceContentSettings(
      {
        brand: { name: "GLINT OPS", cnName: "光速运维台" },
        homeHero: { eyebrow: "开发维护主视觉" },
      },
      DEVELOPER_VIEWER,
    );

    expect(updateResult.settings.brand.name).toBe("GLINT OPS");

    const { readPublicSiteSettings } = await import("../publicSiteContent");
    const publicSettings = readPublicSiteSettings();
    expect(publicSettings.brand.name).toBe("GLINT OPS");
    expect(publicSettings.brand.cnName).toBe("光速运维台");
    expect(publicSettings.homeHero.eyebrow).toBe("开发维护主视觉");
  });

  it("reorders banners and persists online visibility for the public home banner queue", async () => {
    await setWorkspaceContentBannerStatus("wb-002", "online", DEVELOPER_VIEWER);
    const reorderResult = await reorderWorkspaceContentBanners(1, 0, DEVELOPER_VIEWER);

    expect(reorderResult.items[0].id).toBe("wb-002");

    const { readPublishedHomeBanners } = await import("../publicSiteContent");
    const publicBanners = readPublishedHomeBanners();
    expect(publicBanners[0].id).toBe("wb-002");
  });

  it("updates published product public display tags and syncs public filters", async () => {
    const updateResult = await updateWorkspaceContentProductDisplayTag(
      "wp-lumina-arc",
      "极简陈列 / 发光装置",
      DEVELOPER_VIEWER,
    );

    expect(updateResult.product.displayTag).toBe("极简陈列 / 发光装置");

    const { readPublishedProducts } = await import("../publicSiteContent");
    const publicProducts = readPublishedProducts();
    const lumina = publicProducts.find((item) => item.id === "lumina-arc");
    expect(lumina?.tag).toBe("极简陈列 / 发光装置");

    const { listPublicProducts, getPublicProductFilters } = await import("../publicProductsCatalog");
    const filters = getPublicProductFilters(listPublicProducts());
    expect(filters.tagOptions).toContain("极简陈列");
    expect(filters.tagOptions).toContain("发光装置");
  });

  it("rejects viewers outside developer content maintenance", async () => {
    const result = await getWorkspaceContentConsole(EMPLOYEE_VIEWER);

    expect(result).toMatchObject({
      error: {
        code: "WORKSPACE_CONTENT_FORBIDDEN",
      },
    });
  });
});
