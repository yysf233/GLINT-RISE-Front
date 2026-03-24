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

describe("publicSiteContent", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    vi.resetModules();
  });

  it("only exposes published products and cases", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.products,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "product-live",
          status: "published",
          name: "Live Product",
          shortName: "Live",
          tag: "Launch",
          price: "$12",
          desc: "Visible on the public site",
          hero: "/hero-live.jpg",
          images: ["/thumb-2.jpg", "/thumb-1.jpg"],
          meta: [["State", "Ready"]],
          internalNotes: "hidden",
        },
        {
          id: "product-draft",
          status: "draft",
          name: "Draft Product",
          shortName: "Draft",
          tag: "Draft",
          price: "$10",
          desc: "Hidden",
          hero: "/hero-draft.jpg",
          images: ["/draft.jpg"],
          meta: [["State", "Draft"]],
        },
      ],
    });

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.projects,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "case-live",
          status: "published",
          title: "Live Case",
          eyebrow: "Featured",
          category: "Case Study",
          industry: "Retail",
          subTags: ["Launch", "Design"],
          year: "2026",
          timelineLabel: "2026.Q1",
          timelineOrder: 202601,
          summary: "Visible case",
          short: "Short public summary",
          hero: "/case-live.jpg",
          images: ["/case-2.jpg", "/case-1.jpg"],
          internalMemo: "hidden",
        },
        {
          id: "case-draft",
          status: "draft",
          title: "Draft Case",
          eyebrow: "Draft",
          category: "Case Study",
          industry: "Retail",
          subTags: [],
          year: "2026",
          timelineLabel: "2026.Q2",
          timelineOrder: 202602,
          summary: "Hidden case",
          short: "Hidden summary",
          hero: "/case-draft.jpg",
          images: ["/case-draft.jpg"],
        },
      ],
    });

    const { readPublishedProducts, readPublishedCases } = await import("./publicSiteContent");

    expect(readPublishedProducts()).toEqual([
      {
        id: "product-live",
        name: "Live Product",
        shortName: "Live",
        tag: "Launch",
        price: "$12",
        desc: "Visible on the public site",
        hero: "/hero-live.jpg",
        thumbs: ["/thumb-2.jpg", "/thumb-1.jpg"],
        meta: [["State", "Ready"]],
      },
    ]);

    expect(readPublishedCases()).toEqual([
      {
        id: "case-live",
        title: "Live Case",
        eyebrow: "Featured",
        category: "Case Study",
        industry: "Retail",
        subTags: ["Launch", "Design"],
        year: "2026",
        timelineLabel: "2026.Q1",
        timelineOrder: 202601,
        summary: "Visible case",
        short: "Short public summary",
        hero: "/case-live.jpg",
        images: ["/case-2.jpg", "/case-1.jpg"],
      },
    ]);
  });

  it("maps workspace product schema into the public product model", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.products,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "wp-001",
          publicProductId: "public-001",
          status: "active",
          name: "Workspace Product",
          category: "flagship",
          retailPrice: 2499,
          summary: "Workspace summary",
          hero: "/workspace-hero.jpg",
          images: ["/img-2.jpg", "/img-1.jpg"],
        },
        {
          id: "wp-002",
          status: "draft",
          name: "Draft Workspace Product",
          category: "device",
          retailPrice: 1500,
          summary: "Hidden",
          hero: "/draft-hero.jpg",
          images: ["/draft.jpg"],
        },
      ],
    });

    const { readPublishedProducts } = await import("./publicSiteContent");

    expect(readPublishedProducts()).toEqual([
      {
        id: "public-001",
        name: "Workspace Product",
        shortName: "Workspace Product",
        tag: "flagship",
        price: "2499",
        desc: "Workspace summary",
        hero: "/workspace-hero.jpg",
        thumbs: ["/img-2.jpg", "/img-1.jpg"],
        meta: [],
      },
    ]);
  });

  it("keeps online banners and their images in backend order", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.banners,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "banner-second",
          status: "online",
          title: "Second Banner",
          hero: "/banner-second.jpg",
          images: ["/second-2.jpg", "/second-1.jpg"],
        },
        {
          id: "banner-first",
          status: "online",
          title: "First Banner",
          hero: "/banner-first.jpg",
          images: ["/first-2.jpg", "/first-1.jpg"],
        },
        {
          id: "banner-hidden",
          status: "offline",
          title: "Hidden Banner",
          hero: "/hidden.jpg",
          images: ["/hidden-1.jpg"],
        },
      ],
    });

    const { readPublishedHomeBanners } = await import("./publicSiteContent");

    expect(readPublishedHomeBanners()).toEqual([
      {
        id: "banner-second",
        title: "Second Banner",
        hero: "/banner-second.jpg",
        images: ["/second-2.jpg", "/second-1.jpg"],
      },
      {
        id: "banner-first",
        title: "First Banner",
        hero: "/banner-first.jpg",
        images: ["/first-2.jpg", "/first-1.jpg"],
      },
    ]);
  });
});
