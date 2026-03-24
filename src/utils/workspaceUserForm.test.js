import { describe, expect, it } from "vitest";
import {
  buildWorkspaceUserPayload,
  createWorkspaceUserFormDefaults,
  mapWorkspaceUserToForm,
} from "./workspaceUserForm";

describe("workspaceUserForm helpers", () => {
  it("creates user defaults", () => {
    const defaults = createWorkspaceUserFormDefaults({ role: "director" });

    expect(defaults.role).toBe("employee");
    expect(defaults.status).toBe("active");
    expect(defaults.permissions.siteSettings).toBe(true);
    expect(defaults.dataScope).toEqual({
      products: "team",
      suppliers: "self",
      quotes: "self",
    });
  });

  it("maps user records into form values", () => {
    const mapped = mapWorkspaceUserToForm({
      identifier: "maya",
      name: "Maya",
      email: "maya@test.com",
      role: "director",
      status: "disabled",
      department: "业务中台",
      title: "负责人",
      notes: "需要审批导出权限",
      permissions: {
        pricedExport: true,
        userAdmin: true,
      },
      dataScope: {
        products: "all",
        suppliers: "team",
        quotes: "all",
      },
    });

    expect(mapped.identifier).toBe("maya");
    expect(mapped.permissions.pricedExport).toBe(true);
    expect(mapped.permissions.contentMaintenance).toBe(false);
    expect(mapped.dataScope.products).toBe("all");
  });

  it("builds normalized user payload", () => {
    const payload = buildWorkspaceUserPayload({
      identifier: "  maya.ops  ",
      name: "  Maya Ops  ",
      email: "  maya.ops@test.com ",
      role: " director ",
      status: " active ",
      department: " 供应链 ",
      title: " 协同负责人 ",
      notes: " 需要完整审批记录 ",
      permissions: {
        supplierSensitive: true,
      },
      dataScope: {
        products: " all ",
      },
    });

    expect(payload).toEqual({
      identifier: "maya.ops",
      name: "Maya Ops",
      email: "maya.ops@test.com",
      role: "director",
      status: "active",
      department: "供应链",
      title: "协同负责人",
      notes: "需要完整审批记录",
      permissions: {
        contentMaintenance: false,
        siteSettings: false,
        supplierSensitive: true,
        pricedExport: false,
        userAdmin: false,
        logAccess: false,
      },
      dataScope: {
        products: "all",
        suppliers: "self",
        quotes: "self",
      },
    });
  });
});
