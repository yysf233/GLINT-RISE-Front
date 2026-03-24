const now = "2026-03-24T00:00:00.000Z";

export const workspaceBannerSeeds = [
  {
    id: "wb-001",
    title: "首页主视觉",
    status: "online",
    target: "/products",
    hero: "/banner-hero-01.jpg",
    images: ["/banner-hero-01.jpg"],
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded banner item.",
      },
    ],
  },
  {
    id: "wb-002",
    title: "案例推荐",
    status: "offline",
    target: "/cases",
    hero: "/banner-hero-02.jpg",
    images: ["/banner-hero-02.jpg"],
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded banner item.",
      },
    ],
  },
];

export const workspaceBannerSeedState = {
  version: 1,
  nextSequence: 1,
  items: workspaceBannerSeeds,
  generatedAt: now,
};

export default workspaceBannerSeeds;
