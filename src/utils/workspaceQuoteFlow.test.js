import { describe, expect, it } from "vitest";
import workspaceProductSeeds from "../data/workspace/workspaceProductSeeds";
import workspaceSupplierSeeds from "../data/workspace/workspaceSupplierSeeds";
import {
  buildWorkspaceQuoteMatches,
  buildWorkspaceQuotePricingPreview,
  buildWorkspaceQuoteSheetArtifact,
  buildWorkspaceQuoteSupplierRecommendations,
} from "./workspaceQuoteFlow";

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

describe("workspaceQuoteFlow", () => {
  it("matches requirements to the most relevant products", () => {
    const requirements = [
      {
        id: "req-smart-hub",
        name: "智能中控升级",
        keywords: ["smart hub", "device"],
        quantity: 100,
        targetLeadDays: 18,
        targetPriceBand: "中",
        isCustom: false,
        notes: "门店设备升级",
      },
    ];

    const matches = buildWorkspaceQuoteMatches(requirements, workspaceProductSeeds);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      requirementId: "req-smart-hub",
      requirementName: "智能中控升级",
      productId: "wp-smart-hub",
    });
    expect(matches[0].candidateProductIds).toContain("wp-smart-hub");
  });

  it("builds supplier recommendations and keeps private suppliers masked for employees", () => {
    const recommendations = buildWorkspaceQuoteSupplierRecommendations(
      [
        {
          id: "match-lumina",
          requirementId: "req-lumina",
          requirementName: "旗舰灯箱定制",
          productId: "wp-lumina-arc",
        },
      ],
      workspaceSupplierSeeds,
      EMPLOYEE_VIEWER,
      "score",
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].items.some((item) => item.supplierId === "ws-public-001")).toBe(true);
    expect(
      recommendations[0].items.find((item) => item.supplierId === "ws-private-foreign"),
    ).toMatchObject({
      supplierName: "私有供应商（受限）",
      isMasked: true,
    });

    const priceSorted = buildWorkspaceQuoteSupplierRecommendations(
      [
        {
          id: "match-lumina",
          requirementId: "req-lumina",
          requirementName: "旗舰灯箱定制",
          productId: "wp-lumina-arc",
        },
      ],
      workspaceSupplierSeeds,
      DIRECTOR_VIEWER,
      "price",
    );

    expect(priceSorted[0].items[0].supplierId).toBe("ws-public-001");
  });

  it("builds pricing preview and quote sheet artifacts with role-based cost visibility", () => {
    const requirements = [
      {
        id: "req-smart-hub",
        name: "智能中控升级",
        keywords: ["smart hub"],
        quantity: 100,
        targetLeadDays: 18,
        targetPriceBand: "中",
        isCustom: false,
        notes: "",
      },
    ];
    const matches = [
      {
        id: "match-smart-hub",
        requirementId: "req-smart-hub",
        requirementName: "智能中控升级",
        productId: "wp-smart-hub",
      },
    ];
    const supplierSelections = [
      {
        matchId: "match-smart-hub",
        supplierId: "ws-public-001",
      },
    ];
    const pricingEntries = [
      {
        matchId: "match-smart-hub",
        markupRate: 10,
        toolingFee: 0,
        leadTimeBufferDays: 3,
      },
    ];

    const employeePreview = buildWorkspaceQuotePricingPreview(
      {
        requirements,
        matches,
        supplierSelections,
        pricingEntries,
      },
      {
        products: workspaceProductSeeds,
        suppliers: workspaceSupplierSeeds,
        viewer: EMPLOYEE_VIEWER,
      },
    );

    expect(employeePreview.items[0]).toMatchObject({
      productId: "wp-smart-hub",
      quantity: 100,
      outwardUnitPrice: 902,
      baseUnitCostVisible: null,
    });

    const directorPreview = buildWorkspaceQuotePricingPreview(
      {
        requirements,
        matches,
        supplierSelections,
        pricingEntries,
      },
      {
        products: workspaceProductSeeds,
        suppliers: workspaceSupplierSeeds,
        viewer: DIRECTOR_VIEWER,
      },
    );

    expect(directorPreview.items[0].baseUnitCostVisible).toBe(820);

    const employeeArtifact = buildWorkspaceQuoteSheetArtifact(
      {
        quote: {
          id: "workspace-quote-001",
          title: "门店智能中控询价",
          owner: "内部员工",
        },
        pricingPreview: employeePreview,
      },
      EMPLOYEE_VIEWER,
    );

    expect(employeeArtifact.filename).toBe("workspace-quote-001-quote.xlsx");
    expect(employeeArtifact.content).toContain("Smart Hub");
    expect(employeeArtifact.content).not.toContain("内部成本");

    const directorArtifact = buildWorkspaceQuoteSheetArtifact(
      {
        quote: {
          id: "workspace-quote-001",
          title: "门店智能中控询价",
          owner: "部门总监",
        },
        pricingPreview: directorPreview,
      },
      DIRECTOR_VIEWER,
    );

    expect(directorArtifact.content).toContain("内部成本: 820");
  });
});
