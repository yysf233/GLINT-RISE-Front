const now = "2026-03-24T00:00:00.000Z";

export const workspaceSupplierSeeds = [
  {
    id: "ws-public-001",
    name: "Mika Lighting",
    rating: "A",
    status: "active",
    isPrivate: false,
    owner: "内部员工",
    companyArea: 3200,
    leadTimeBand: "10-15天",
    priceBand: "中高",
    cooperationHistory: "Retail lighting rollout",
    fitScore: 89,
    patentCount: 10,
    capacitySummary: "Lighting, wiring, and smart control integration",
    contactName: "Mika",
    contactPhone: "13800000001",
    contactEmail: "mika@supplier.test",
    tags: ["lighting", "retail"],
    relatedProductIds: ["wp-smart-hub", "wp-lumina-arc"],
    summary: "旗舰零售照明长期合作供应商。",
    cooperationRecords: [
      {
        id: "record-001",
        title: "2025 秋季零售升级",
        outcome: "按期交付",
      },
    ],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded public supplier.",
      },
    ],
  },
  {
    id: "ws-private-owned",
    name: "Inner Assembly Lab",
    rating: "B",
    status: "draft",
    isPrivate: true,
    owner: "内部员工",
    companyArea: 1800,
    leadTimeBand: "7-10天",
    priceBand: "中",
    cooperationHistory: "Prototype batches",
    fitScore: 76,
    patentCount: 4,
    capacitySummary: "Prototype assembly and short-cycle verification",
    contactName: "Iris",
    contactPhone: "13800000003",
    contactEmail: "iris@supplier.test",
    tags: ["prototype", "assembly"],
    relatedProductIds: ["wp-smart-hub"],
    summary: "仅员工本人可见完整信息的私有试制供应商。",
    cooperationRecords: [
      {
        id: "record-002",
        title: "Smart Hub 打样",
        outcome: "验证通过",
      },
    ],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded employee private supplier.",
      },
    ],
  },
  {
    id: "ws-private-foreign",
    name: "Lydia Precision Works",
    rating: "A",
    status: "active",
    isPrivate: true,
    owner: "Lydia",
    companyArea: 5400,
    leadTimeBand: "12-18天",
    priceBand: "高",
    cooperationHistory: "High-precision retail launch components",
    fitScore: 94,
    patentCount: 15,
    capacitySummary: "Precision metal fabrication and limited-run packaging",
    contactName: "Lydia",
    contactPhone: "13800000002",
    contactEmail: "lydia@supplier.test",
    tags: ["precision", "retail", "flagship"],
    relatedProductIds: ["wp-lumina-arc", "wp-interface-neo"],
    summary: "由 Lydia 维护的私有高精度供应商。",
    cooperationRecords: [
      {
        id: "record-003",
        title: "Lumina Arc 限量款",
        outcome: "首批良率 98%",
      },
    ],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "Seeded foreign private supplier.",
      },
    ],
  },
];

export const workspaceSupplierSeedState = {
  version: 1,
  nextSequence: 1,
  items: workspaceSupplierSeeds,
  generatedAt: now,
};

export default workspaceSupplierSeeds;
