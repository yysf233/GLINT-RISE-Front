import { beforeEach, describe, expect, it } from "vitest";
import {
  createWorkspaceBanner,
  listWorkspaceBanners,
  reorderWorkspaceBanners,
  resetWorkspaceBannersStore,
  updateWorkspaceBanner,
} from "./mockWorkspaceBannersService";

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

describe("mockWorkspaceBannersService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceBannersStore();
  });

  it("lists seeded banners", async () => {
    const result = await listWorkspaceBanners();
    expect(result.total).toBeGreaterThan(0);
    expect(result.items).toHaveLength(result.total);
  });

  it("creates and updates banners with valid targets", async () => {
    const created = await createWorkspaceBanner({
      title: "Hero Banner",
      status: "offline",
      target: "/products",
      hero: "/hero.jpg",
      images: ["/hero.jpg"],
    });

    expect(created.banner.id).toMatch(/^workspace-banner-/);

    const updated = await updateWorkspaceBanner(created.banner.id, {
      status: "online",
      title: "Hero Banner v2",
    });

    expect(updated.banner.status).toBe("online");
    expect(updated.banner.title).toBe("Hero Banner v2");
  });

  it("rejects invalid banner targets", async () => {
    const created = await createWorkspaceBanner({
      title: "Invalid Banner",
      status: "online",
      target: "https://example.com",
      hero: "/hero.jpg",
    });

    expect(created).toEqual({
      error: {
        code: "INVALID_BANNER_TARGET",
        message: "仅支持站内路由",
      },
    });
  });

  it("reorders banners by index", async () => {
    await createWorkspaceBanner({
      title: "First Banner",
      status: "online",
      target: "/products",
      hero: "/first.jpg",
    });

    await createWorkspaceBanner({
      title: "Second Banner",
      status: "online",
      target: "/cases",
      hero: "/second.jpg",
    });

    const before = await listWorkspaceBanners();
    const reordered = await reorderWorkspaceBanners(0, 1);

    expect(before.items[0].title).not.toBe(reordered.items[0].title);
  });
});
