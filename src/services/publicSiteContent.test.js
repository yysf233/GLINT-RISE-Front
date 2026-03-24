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

  it("uses workspace media ordering and cover image for public products", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.products,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "wp-media",
          publicProductId: "product-media",
          status: "active",
          name: "Media Product",
          category: "device",
          retailPrice: 1200,
          summary: "Media summary",
          media: [
            { id: "m-1", url: "/media-1.jpg", isCover: false },
            { id: "m-2", url: "/media-2.jpg", isCover: true },
            { id: "m-3", url: "/media-3.jpg", isCover: false },
          ],
        },
      ],
    });

    const { readPublishedProducts } = await import("./publicSiteContent");

    expect(readPublishedProducts()).toEqual([
      {
        id: "product-media",
        name: "Media Product",
        shortName: "Media Product",
        tag: "device",
        price: "1200",
        desc: "Media summary",
        hero: "/media-2.jpg",
        thumbs: ["/media-1.jpg", "/media-2.jpg", "/media-3.jpg"],
        meta: [],
      },
    ]);
  });

  it("reflects workspace product updates in the public adapter", async () => {
    const { readPublishedProducts } = await import("./publicSiteContent");
    const { createWorkspaceProduct } = await import("./mockWorkspaceProductsService");

    const before = readPublishedProducts();

    await createWorkspaceProduct({
      name: "Public Sync",
      category: "device",
      status: "active",
      needsUpdate: false,
      owner: "Maya",
      retailPrice: 2000,
      publicProductId: "public-sync",
    });

    const after = readPublishedProducts();
    expect(after.length).toBe(before.length + 1);
    expect(after.some((item) => item.id === "public-sync")).toBe(true);
  });

  it("maps workspace public display fields for the public site", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.products,
      seed: { version: 1, items: [] },
    }).write({
      version: 1,
      items: [
        {
          id: "wp-public-display",
          publicProductId: "public-display",
          status: "active",
          name: "Public Display Product",
          shortName: "Display",
          category: "flagship",
          displayTag: "可持续科技 / 旗舰系列",
          retailPrice: 5200,
          summary: "Mapped from workspace public fields",
          media: [
            { id: "cover", url: "/cover.jpg", isCover: true },
            { id: "detail", url: "/detail.jpg", isCover: false },
          ],
          publicMeta: [
            { label: "材质", value: "阳极铝" },
            { label: "连接", value: "统一空间控制" },
          ],
        },
      ],
    });

    const { readPublishedProducts } = await import("./publicSiteContent");

    expect(readPublishedProducts()).toEqual([
      {
        id: "public-display",
        name: "Public Display Product",
        shortName: "Display",
        tag: "可持续科技 / 旗舰系列",
        price: "5200",
        desc: "Mapped from workspace public fields",
        hero: "/cover.jpg",
        thumbs: ["/cover.jpg", "/detail.jpg"],
        meta: [
          ["材质", "阳极铝"],
          ["连接", "统一空间控制"],
        ],
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
        target: "",
        hero: "/banner-second.jpg",
        images: ["/second-2.jpg", "/second-1.jpg"],
      },
      {
        id: "banner-first",
        title: "First Banner",
        target: "",
        hero: "/banner-first.jpg",
        images: ["/first-2.jpg", "/first-1.jpg"],
      },
    ]);
  });

  it("reads public site settings from workspace configuration storage", async () => {
    const { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } = await import("./mock/workspaceStorage");

    createWorkspaceStorage({
      key: WORKSPACE_STORAGE_KEYS.siteSettings,
      seed: {
        version: 1,
        items: [],
      },
    }).write({
      version: 1,
      items: [
        {
          id: "site-settings",
          brand: {
            name: "GLINT LAB",
            cnName: "光速实验室",
            entryEyebrow: "品牌入口",
          },
          navigation: {
            items: [
              { path: "/home", label: "首页" },
              { path: "/products", label: "产品中心" },
              { path: "/search", label: "搜索" },
            ],
            searchPlaceholder: "搜索最新产品",
          },
          footer: {
            description: "新的页脚说明",
            links: ["隐私政策", "服务条款", "联系我们"],
          },
          homeHero: {
            eyebrow: "品牌主视觉",
            description: "新的首页主视觉文案",
          },
        },
      ],
    });

    const { readPublicSiteSettings } = await import("./publicSiteContent");
    expect(readPublicSiteSettings()).toMatchObject({
      brand: {
        name: "GLINT LAB",
        cnName: "光速实验室",
        entryEyebrow: "品牌入口",
      },
      navigation: {
        items: [
          { path: "/home", label: "首页" },
          { path: "/products", label: "产品中心" },
          { path: "/search", label: "搜索" },
        ],
        searchPlaceholder: "搜索最新产品",
      },
      footer: {
        description: "新的页脚说明",
        links: ["隐私政策", "服务条款", "联系我们"],
      },
      homeHero: {
        eyebrow: "品牌主视觉",
        description: "新的首页主视觉文案",
      },
    });
  });
});
