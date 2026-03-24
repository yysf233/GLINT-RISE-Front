import { describe, expect, it } from "vitest";
import { filterWorkspaceProducts, normalizeWorkspaceProductQuery } from "./workspaceProductFilters";

const sampleProducts = [
  {
    id: "alpha",
    name: "Alpha Core",
    category: "device",
    status: "active",
    needsUpdate: true,
    owner: "Maya",
    updatedAt: "2026-03-23T08:00:00.000Z",
    tags: ["core", "rack"],
    retailPrice: 1200,
    internalCost: 600,
    summary: "Edge device for pilot deployments",
    publicProductId: "product-a",
    hero: "/alpha.jpg",
    progressSummary: "Ready",
    supplierSummary: "Supplier locked",
    logs: [],
  },
  {
    id: "beta",
    name: "Beta Space",
    category: "space",
    status: "draft",
    needsUpdate: false,
    owner: "Leo",
    updatedAt: "2026-03-24T08:00:00.000Z",
    tags: ["space", "showcase"],
    retailPrice: 2200,
    internalCost: 900,
    summary: "Showcase installation",
    publicProductId: "product-b",
    hero: "/beta.jpg",
    progressSummary: "Draft",
    supplierSummary: "Pending",
    logs: [],
  },
  {
    id: "gamma",
    name: "Gamma Hot",
    category: "hot",
    status: "archived",
    needsUpdate: true,
    owner: "Nina",
    updatedAt: "2026-03-22T08:00:00.000Z",
    tags: ["hot", "promotion"],
    retailPrice: 3200,
    internalCost: 1500,
    summary: "Hot launch item",
    publicProductId: "hot-01",
    hero: "/gamma.jpg",
    progressSummary: "Archived",
    supplierSummary: "Archived",
    logs: [],
  },
];

describe("workspaceProductFilters", () => {
  it("normalizes missing query values to defaults", () => {
    expect(normalizeWorkspaceProductQuery()).toEqual({
      keyword: "",
      category: "all",
      status: "all",
      needsUpdate: "all",
      sort: "updated-desc",
    });
  });

  it("filters and sorts products by keyword category status needsUpdate and sort", () => {
    const result = filterWorkspaceProducts(sampleProducts, {
      keyword: "core",
      category: "device",
      status: "active",
      needsUpdate: "yes",
      sort: "price-asc",
    });

    expect(result.map((item) => item.id)).toEqual(["alpha"]);
  });

  it("sorts products by updated date descending when query is empty", () => {
    const result = filterWorkspaceProducts(sampleProducts);

    expect(result.map((item) => item.id)).toEqual(["beta", "alpha", "gamma"]);
  });
});
