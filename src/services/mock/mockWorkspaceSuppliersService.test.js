import { beforeEach, describe, expect, it } from "vitest";
import {
  createWorkspaceSupplier,
  exportWorkspaceSuppliers,
  getWorkspaceSupplier,
  importWorkspaceSuppliers,
  listWorkspaceSuppliers,
  resetWorkspaceSuppliersStore,
  updateWorkspaceSupplier,
} from "./mockWorkspaceSuppliersService";

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

describe("mockWorkspaceSuppliersService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceSuppliersStore();
  });

  it("masks other people's private suppliers for employee viewers", async () => {
    const result = await listWorkspaceSuppliers({}, EMPLOYEE_VIEWER);
    const masked = result.items.find((item) => item.id === "ws-private-foreign");

    expect(masked).toMatchObject({
      id: "ws-private-foreign",
      isPrivate: true,
      isMasked: true,
      owner: "Lydia",
      name: "私有供应商（受限）",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    });

    const detail = await getWorkspaceSupplier("ws-private-foreign", EMPLOYEE_VIEWER);
    expect(detail.supplier).toMatchObject({
      id: "ws-private-foreign",
      isMasked: true,
      name: "私有供应商（受限）",
      contactPhone: "",
    });
  });

  it("shows full private supplier information to directors", async () => {
    const detail = await getWorkspaceSupplier("ws-private-foreign", DIRECTOR_VIEWER);

    expect(detail.supplier).toMatchObject({
      id: "ws-private-foreign",
      isPrivate: true,
      isMasked: false,
      name: "Lydia Precision Works",
      contactName: "Lydia",
      contactPhone: "13800000002",
      contactEmail: "lydia@supplier.test",
    });
  });

  it("creates and updates a supplier record", async () => {
    const created = await createWorkspaceSupplier({
      name: "Atlas Supplier",
      rating: "B",
      status: "active",
      isPrivate: false,
      owner: "内部员工",
      companyArea: 2400,
      leadTimeBand: "15-20天",
      priceBand: "中",
      cooperationHistory: "Retail fixtures",
      fitScore: 78,
      patentCount: 6,
      capacitySummary: "Metal and lighting",
      contactName: "Mina",
      contactPhone: "13800000009",
      contactEmail: "mina@supplier.test",
      tags: ["lighting", "retail"],
      relatedProductIds: ["wp-smart-hub"],
      summary: "Supplier for compact lighting rollouts",
    });

    expect(created.supplier.id).toMatch(/^workspace-supplier-/);

    const updated = await updateWorkspaceSupplier(created.supplier.id, {
      rating: "A",
      isPrivate: true,
      relatedProductIds: ["wp-smart-hub", "wp-interface-neo"],
    });

    expect(updated.supplier).toMatchObject({
      id: created.supplier.id,
      rating: "A",
      isPrivate: true,
      relatedProductIds: ["wp-smart-hub", "wp-interface-neo"],
    });
  });

  it("forces employee-created private suppliers to belong to the current employee", async () => {
    const created = await createWorkspaceSupplier(
      {
        name: "Employee Private Factory",
        rating: "B",
        status: "draft",
        isPrivate: true,
        owner: "Lydia",
        companyArea: 1800,
        leadTimeBand: "10-15天",
        priceBand: "中",
        cooperationHistory: "Prototype support",
        fitScore: 72,
        patentCount: 3,
        capacitySummary: "Small batch assembly",
        contactName: "Nina",
        contactPhone: "13800000011",
        contactEmail: "nina@employee.test",
        tags: ["prototype"],
        relatedProductIds: ["wp-smart-hub"],
        summary: "Should be owned by the employee creator",
      },
      EMPLOYEE_VIEWER,
    );

    expect(created.supplier).toMatchObject({
      isPrivate: true,
      owner: "内部员工",
    });
  });

  it("rejects employee edits to other people's private suppliers", async () => {
    const result = await updateWorkspaceSupplier(
      "ws-private-foreign",
      {
        summary: "Unauthorized edit attempt",
      },
      EMPLOYEE_VIEWER,
    );

    expect(result).toMatchObject({
      error: {
        code: "SUPPLIER_FORBIDDEN",
      },
    });
  });

  it("allows directors to update other people's private suppliers", async () => {
    const result = await updateWorkspaceSupplier(
      "ws-private-foreign",
      {
        summary: "Director updated note",
      },
      DIRECTOR_VIEWER,
    );

    expect(result.supplier).toMatchObject({
      id: "ws-private-foreign",
      summary: "Director updated note",
    });
  });

  it("imports suppliers and auto-computes rating when missing", async () => {
    const result = await importWorkspaceSuppliers(
      "Nova Factory||Strategic retail launch|3600|12-18天|高|retail, flagship|内部员工|false|Mina|13800000010|mina@nova.test|88|12|Precision metal shop|wp-lumina-arc|Primary strategic factory",
      EMPLOYEE_VIEWER,
    );

    expect(result.importedCount).toBe(1);
    expect(result.items[0]).toMatchObject({
      name: "Nova Factory",
      rating: "A",
      owner: "内部员工",
      tags: ["retail", "flagship"],
    });
  });

  it("forces employee imports to use the current employee as owner", async () => {
    const result = await importWorkspaceSuppliers(
      "Employee Import||Prototype line|1200|7-10天|中|lighting|Lydia|true|Iris|13800000012|iris@import.test|74|4|Small factory|wp-smart-hub|Imported by employee",
      EMPLOYEE_VIEWER,
    );

    expect(result.items[0]).toMatchObject({
      owner: "内部员工",
      isPrivate: true,
    });
  });

  it("exports visible fields for employee viewers and full fields for directors", async () => {
    const employeeExport = await exportWorkspaceSuppliers(
      {
        ids: ["ws-private-foreign"],
        format: "csv",
        includeSensitive: true,
      },
      EMPLOYEE_VIEWER,
    );

    expect(employeeExport.filename).toBe("workspace-suppliers.csv");
    expect(employeeExport.content).toContain("私有供应商（受限）");
    expect(employeeExport.content).not.toContain("13800000002");

    const directorExport = await exportWorkspaceSuppliers(
      {
        ids: ["ws-private-foreign"],
        format: "csv",
        includeSensitive: true,
      },
      DIRECTOR_VIEWER,
    );

    expect(directorExport.content).toContain("Lydia Precision Works");
    expect(directorExport.content).toContain("13800000002");
  });
});
