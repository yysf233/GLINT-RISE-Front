import { beforeEach, describe, expect, it } from "vitest";
import { resetWorkspaceProductsStore } from "../mockWorkspaceProductsService";
import { resetWorkspaceSuppliersStore } from "./mockWorkspaceSuppliersService";
import {
  createWorkspaceExport,
  downloadWorkspaceExport,
  listWorkspaceExports,
  resetWorkspaceExportsStore,
} from "./mockWorkspaceExportsService";

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

describe("mockWorkspaceExportsService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceProductsStore();
    resetWorkspaceSuppliersStore();
    resetWorkspaceExportsStore();
  });

  it("creates no-price export jobs for employees and persists their history", async () => {
    const result = await createWorkspaceExport(
      {
        title: "Retail Deck",
        version: "public",
        format: "pdf",
        productIds: ["wp-lumina-arc"],
        supplierIds: ["ws-private-foreign"],
        notes: "Mock export for public-ready deck",
      },
      EMPLOYEE_VIEWER,
    );

    expect(result.exportJob.id).toMatch(/^workspace-export-/);
    expect(result.exportJob).toMatchObject({
      title: "Retail Deck",
      version: "public",
      format: "pdf",
      owner: "内部员工",
      productIds: ["wp-lumina-arc"],
      supplierIds: ["ws-private-foreign"],
      productCount: 1,
      supplierCount: 1,
      containsSensitiveData: false,
    });
    expect(result.download.filename).toBe("retail-deck-public.pdf");
    expect(result.download.content).toContain("私有供应商（受限）");
    expect(result.download.content).not.toContain("13800000002");
    expect(result.download.content).not.toContain("内部成本");

    const history = await listWorkspaceExports(EMPLOYEE_VIEWER);
    expect(history.items).toHaveLength(1);
    expect(history.items[0]).toMatchObject({
      id: result.exportJob.id,
      title: "Retail Deck",
      version: "public",
    });
  });

  it("rejects priced export jobs for employees", async () => {
    const result = await createWorkspaceExport(
      {
        title: "Priced Sheet",
        version: "priced",
        format: "xlsx",
        productIds: ["wp-smart-hub"],
        supplierIds: ["ws-private-foreign"],
      },
      EMPLOYEE_VIEWER,
    );

    expect(result).toMatchObject({
      error: {
        code: "EXPORT_FORBIDDEN",
      },
    });
  });

  it("allows directors to create priced exports with full supplier data", async () => {
    const result = await createWorkspaceExport(
      {
        title: "Director Quote",
        version: "priced",
        format: "xlsx",
        productIds: ["wp-smart-hub"],
        supplierIds: ["ws-private-foreign"],
        notes: "Full quote package",
      },
      DIRECTOR_VIEWER,
    );

    expect(result.exportJob).toMatchObject({
      title: "Director Quote",
      version: "priced",
      format: "xlsx",
      owner: "部门总监",
      containsSensitiveData: true,
    });
    expect(result.download.filename).toBe("director-quote-priced.xlsx");
    expect(result.download.content).toContain("Lydia Precision Works");
    expect(result.download.content).toContain("13800000002");
    expect(result.download.content).toContain("内部成本");

    const downloaded = await downloadWorkspaceExport(result.exportJob.id, DIRECTOR_VIEWER);
    expect(downloaded.content).toContain("13800000002");
  });

  it("shows only own export history to employees and all history to directors", async () => {
    await createWorkspaceExport(
      {
        title: "Employee Public Pack",
        version: "public",
        format: "csv",
        productIds: ["wp-smart-hub"],
        supplierIds: [],
      },
      EMPLOYEE_VIEWER,
    );
    await createWorkspaceExport(
      {
        title: "Director Public Pack",
        version: "public",
        format: "csv",
        productIds: ["wp-lumina-arc"],
        supplierIds: [],
      },
      DIRECTOR_VIEWER,
    );

    const employeeHistory = await listWorkspaceExports(EMPLOYEE_VIEWER);
    const directorHistory = await listWorkspaceExports(DIRECTOR_VIEWER);

    expect(employeeHistory.items).toHaveLength(1);
    expect(employeeHistory.items[0].owner).toBe("内部员工");
    expect(directorHistory.items).toHaveLength(2);
  });

  it("rejects business export access for developers", async () => {
    const createResult = await createWorkspaceExport(
      {
        title: "Developer Export",
        version: "public",
        format: "pdf",
        productIds: ["wp-lumina-arc"],
        supplierIds: [],
      },
      DEVELOPER_VIEWER,
    );

    expect(createResult).toMatchObject({
      error: {
        code: "EXPORT_FORBIDDEN",
      },
    });

    const listResult = await listWorkspaceExports(DEVELOPER_VIEWER);
    expect(listResult).toMatchObject({
      error: {
        code: "EXPORT_FORBIDDEN",
      },
    });
  });
});
