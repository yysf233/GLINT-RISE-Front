import { beforeEach, describe, expect, it } from "vitest";
import { resetWorkspaceProductsStore } from "../mockWorkspaceProductsService";
import { resetWorkspaceSuppliersStore } from "./mockWorkspaceSuppliersService";
import {
  createWorkspaceQuoteDraft,
  generateWorkspaceQuoteSheet,
  getWorkspaceQuote,
  listWorkspaceQuotes,
  previewWorkspaceQuoteImport,
  resetWorkspaceQuotesStore,
  updateWorkspaceQuoteDraft,
} from "./mockWorkspaceQuotesService";

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
  name: "开发人员",
  role: "developer",
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

describe("mockWorkspaceQuotesService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceProductsStore();
    resetWorkspaceSuppliersStore();
    resetWorkspaceQuotesStore();
  });

  it("creates quote drafts, persists them, and auto-builds product matches", async () => {
    const result = await createWorkspaceQuoteDraft(
      {
        title: "门店智能中控询价",
        requirements: [
          {
            name: "智能中控升级",
            keywords: ["智能中枢", "企业中枢"],
            quantity: 100,
            targetLeadDays: 18,
            targetPriceBand: "中",
            isCustom: false,
            notes: "门店设备升级",
          },
        ],
      },
      EMPLOYEE_VIEWER,
    );

    expect(result.quote.id).toMatch(/^workspace-quote-/);
    expect(result.quote).toMatchObject({
      title: "门店智能中控询价",
      owner: "内部员工",
      status: "draft",
      currentStep: 1,
    });
    expect(result.quote.matches[0].productId).toBe("wp-smart-hub");

    const history = await listWorkspaceQuotes(EMPLOYEE_VIEWER);
    expect(history.items).toHaveLength(1);
    expect(history.items[0].title).toBe("门店智能中控询价");
  });

  it("updates drafts and generates standard quote sheets", async () => {
    const created = await createWorkspaceQuoteDraft(
      {
        title: "门店智能中控询价",
        requirements: [
          {
            name: "智能中控升级",
            keywords: ["智能中枢"],
            quantity: 100,
            targetLeadDays: 18,
            targetPriceBand: "中",
            isCustom: false,
            notes: "",
          },
        ],
      },
      EMPLOYEE_VIEWER,
    );

    const matchId = created.quote.matches[0].id;
    const updated = await updateWorkspaceQuoteDraft(
      created.quote.id,
      {
        currentStep: 4,
        supplierSelections: [
          {
            matchId,
            supplierId: "ws-public-001",
          },
        ],
        pricingEntries: [
          {
            matchId,
            markupRate: 10,
            toolingFee: 0,
            leadTimeBufferDays: 3,
          },
        ],
      },
      EMPLOYEE_VIEWER,
    );

    expect(updated.quote.currentStep).toBe(4);
    expect(updated.quote.pricingPreview.items[0].baseUnitCostVisible).toBeNull();

    const sheet = await generateWorkspaceQuoteSheet(created.quote.id, EMPLOYEE_VIEWER);
    expect(sheet.quote.status).toBe("quoted");
    expect(sheet.download.filename).toMatch(/quote\.xlsx$/);
    expect(sheet.download.content).toContain("智能中枢");
    expect(sheet.download.content).not.toContain("内部成本");
  });

  it("allows directors to access all quote drafts and generate full quote sheets", async () => {
    const created = await createWorkspaceQuoteDraft(
      {
        title: "旗舰灯箱询价",
        requirements: [
          {
            name: "旗舰灯箱定制",
            keywords: ["lumina", "lighting"],
            quantity: 80,
            targetLeadDays: 25,
            targetPriceBand: "高",
            isCustom: true,
            notes: "重点项目",
          },
        ],
      },
      DIRECTOR_VIEWER,
    );

    const matchId = created.quote.matches[0].id;
    await updateWorkspaceQuoteDraft(
      created.quote.id,
      {
        currentStep: 4,
        supplierSelections: [
          {
            matchId,
            supplierId: "ws-private-foreign",
          },
        ],
        pricingEntries: [
          {
            matchId,
            markupRate: 12,
            toolingFee: 600,
            leadTimeBufferDays: 4,
          },
        ],
      },
      DIRECTOR_VIEWER,
    );

    const sheet = await generateWorkspaceQuoteSheet(created.quote.id, DIRECTOR_VIEWER);
    expect(sheet.download.content).toContain("Lydia Precision Works");
    expect(sheet.download.content).toContain("内部成本");

    const directorHistory = await listWorkspaceQuotes(DIRECTOR_VIEWER);
    expect(directorHistory.items).toHaveLength(1);

    const detail = await getWorkspaceQuote(created.quote.id, DIRECTOR_VIEWER);
    expect(detail.quote.id).toBe(created.quote.id);
  });

  it("supports import preview and rejects developer access", async () => {
    const preview = await previewWorkspaceQuoteImport(
      "智能中控升级|smart hub|100|18|中|否|门店设备升级",
    );

    expect(preview.preview[0].requirement.name).toBe("智能中控升级");

    const createResult = await createWorkspaceQuoteDraft(
      {
        title: "开发测试询价",
        requirements: [
          {
            name: "测试需求",
            keywords: ["智能中枢"],
            quantity: 10,
            targetLeadDays: 10,
            targetPriceBand: "中",
            isCustom: false,
            notes: "",
          },
        ],
      },
      DEVELOPER_VIEWER,
    );
    expect(createResult).toMatchObject({
      error: {
        code: "QUOTE_FORBIDDEN",
      },
    });

    const listResult = await listWorkspaceQuotes(DEVELOPER_VIEWER);
    expect(listResult).toMatchObject({
      error: {
        code: "QUOTE_FORBIDDEN",
      },
    });
  });
});
