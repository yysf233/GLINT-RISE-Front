const now = "2026-03-24T00:00:00.000Z";
const placeholderHero =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='%23161310'/><circle cx='900' cy='150' r='180' fill='%23a56f33' fill-opacity='0.18'/><circle cx='220' cy='640' r='220' fill='%23e8d3a3' fill-opacity='0.12'/><text x='600' y='390' text-anchor='middle' fill='%23f5e2bd' font-size='74' font-family='Arial, sans-serif'>GLINT RISE</text><text x='600' y='462' text-anchor='middle' fill='%23c7b089' font-size='28' font-family='Arial, sans-serif'>Workspace Project</text></svg>";

export const workspaceProjectSeeds = [
  {
    id: "wp-case-001",
    title: "北极星项目",
    status: "active",
    owner: "Maya",
    industry: "Retail",
    year: "2026",
    category: "Case Study",
    publicCaseId: "bosideng-aerospace",
    summary: "公开案例链路的对齐样本。",
    short: "旗舰案例上架对齐。",
    hero: placeholderHero,
    timeline: [
      { id: "t-1", label: "启动", order: 1 },
      { id: "t-2", label: "发布", order: 2 },
    ],
    relatedProducts: [
      { id: "wp-lumina-arc", publicProductId: "lumina-arc" },
    ],
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded project record.",
      },
    ],
  },
  {
    id: "wp-case-002",
    title: "量子协同计划",
    status: "draft",
    owner: "Leo",
    industry: "Security",
    year: "2026",
    category: "Case Study",
    publicCaseId: "quantum-security-protocol",
    summary: "草稿案例用于流程验证。",
    short: "草稿案例不应公开。",
    hero: placeholderHero,
    timeline: [
      { id: "t-1", label: "准备", order: 1 },
    ],
    relatedProducts: [
      { id: "wp-smart-hub", publicProductId: "product-a" },
    ],
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded draft project.",
      },
    ],
  },
];

export const workspaceProjectSeedState = {
  version: 1,
  nextSequence: 1,
  items: workspaceProjectSeeds,
  generatedAt: now,
};

export default workspaceProjectSeeds;
