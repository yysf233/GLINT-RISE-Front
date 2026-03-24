import { beforeEach, describe, expect, it } from "vitest";
import {
  getWorkspaceSiteSettings,
  resetWorkspaceSiteSettingsStore,
  updateWorkspaceSiteSettings,
} from "./mockWorkspaceSiteSettingsService";

const EMPLOYEE_VIEWER = {
  id: "user-employee",
  name: "内部员工",
  role: "employee",
};

const DIRECTOR_VIEWER = {
  id: "user-director",
  name: "部门总监",
  role: "director",
};

const DEVELOPER_VIEWER = {
  id: "user-developer",
  name: "开发维护",
  role: "developer",
  permissions: {
    contentMaintenance: true,
  },
};

const OUTSIDER_VIEWER = {
  id: "user-outsider",
  name: "访客",
  role: "guest",
};

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

describe("mockWorkspaceSiteSettingsService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceSiteSettingsStore();
  });

  it("returns default site settings for employee, director, and developer content maintainer", async () => {
    const employeeResult = await getWorkspaceSiteSettings(EMPLOYEE_VIEWER);
    const directorResult = await getWorkspaceSiteSettings(DIRECTOR_VIEWER);
    const developerResult = await getWorkspaceSiteSettings(DEVELOPER_VIEWER);

    expect(employeeResult.settings.brand).toMatchObject({
      name: "GLINT RISE",
    });
    expect(employeeResult.settings.navigation.items.length).toBeGreaterThan(0);
    expect(directorResult.settings.footer.links.length).toBeGreaterThan(0);
    expect(developerResult.settings.homeHero.eyebrow).toBeTruthy();
  });

  it("persists updates and normalizes duplicated navigation/footer items", async () => {
    const updateResult = await updateWorkspaceSiteSettings(
      {
        brand: {
          name: "GLINT LAB",
          cnName: "光速实验室",
          entryEyebrow: "品牌入口",
        },
        navigation: {
          items: [
            { path: "/home", label: "首页" },
            { path: "/products", label: "产品中心" },
            { path: "/products", label: "产品中心" },
            { path: "/search", label: "搜索" },
          ],
          searchPlaceholder: "搜索最新产品",
        },
        footer: {
          description: "新的页脚说明",
          links: ["隐私政策", "服务条款", "服务条款", "联系我们"],
        },
        homeHero: {
          eyebrow: "主视觉导语",
          description: "新的首页主视觉说明",
        },
      },
      EMPLOYEE_VIEWER,
    );

    expect(updateResult.settings.brand.name).toBe("GLINT LAB");
    expect(updateResult.settings.navigation.items).toEqual([
      { path: "/home", label: "首页" },
      { path: "/products", label: "产品中心" },
      { path: "/search", label: "搜索" },
    ]);
    expect(updateResult.settings.footer.links).toEqual(["隐私政策", "服务条款", "联系我们"]);

    const readBack = await getWorkspaceSiteSettings(DIRECTOR_VIEWER);
    expect(readBack.settings.brand.cnName).toBe("光速实验室");
    expect(readBack.settings.homeHero.description).toBe("新的首页主视觉说明");
  });

  it("allows developer content maintainer to update public site settings", async () => {
    const updateResult = await updateWorkspaceSiteSettings(
      {
        brand: { name: "GLINT OPS" },
        homeHero: { eyebrow: "开发维护主视觉" },
      },
      DEVELOPER_VIEWER,
    );

    expect(updateResult.settings.brand.name).toBe("GLINT OPS");
    expect(updateResult.settings.homeHero.eyebrow).toBe("开发维护主视觉");
  });

  it("rejects unauthorized viewers", async () => {
    const readResult = await getWorkspaceSiteSettings(OUTSIDER_VIEWER);
    const updateResult = await updateWorkspaceSiteSettings(
      {
        brand: { name: "forbidden" },
      },
      OUTSIDER_VIEWER,
    );

    expect(readResult).toMatchObject({
      error: { code: "SITE_SETTINGS_FORBIDDEN" },
    });
    expect(updateResult).toMatchObject({
      error: { code: "SITE_SETTINGS_FORBIDDEN" },
    });
  });
});
