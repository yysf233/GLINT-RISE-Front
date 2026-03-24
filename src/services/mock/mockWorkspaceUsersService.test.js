import { beforeEach, describe, expect, it } from "vitest";
import {
  approveWorkspacePermissionRequest,
  createWorkspacePermissionRequest,
  createWorkspaceUser,
  getAuthUserByIdentifier,
  getAuthUserByToken,
  listWorkspacePermissionRequests,
  listWorkspaceUsers,
  resetWorkspaceUsersStore,
  updateWorkspaceUser,
} from "./mockWorkspaceUsersService";

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
  name: "开发维护",
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

describe("mockWorkspaceUsersService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceUsersStore();
  });

  it("lists users and pending permission requests for employee", async () => {
    const usersResult = await listWorkspaceUsers({}, EMPLOYEE_VIEWER);
    const requestsResult = await listWorkspacePermissionRequests({}, EMPLOYEE_VIEWER);

    expect(usersResult.items).toHaveLength(3);
    expect(usersResult.items[0]).toHaveProperty("permissions");
    expect(requestsResult.items.some((item) => item.status === "pending")).toBe(true);
  });

  it("allows directors to create and update users", async () => {
    const createResult = await createWorkspaceUser(
      {
        identifier: "maya",
        name: "Maya",
        email: "maya@glintrise.test",
        role: "employee",
        status: "active",
        department: "零售增长",
        title: "项目经理",
        permissions: {
          siteSettings: true,
        },
        dataScope: {
          products: "team",
          suppliers: "self",
          quotes: "team",
        },
      },
      DIRECTOR_VIEWER,
    );

    expect(createResult.user.id).toMatch(/^workspace-user-/);
    expect(createResult.user.identifier).toBe("maya");

    const updateResult = await updateWorkspaceUser(
      createResult.user.id,
      {
        role: "director",
        status: "active",
        permissions: {
          siteSettings: true,
          pricedExport: true,
          userAdmin: true,
          logAccess: true,
        },
        dataScope: {
          products: "all",
          suppliers: "all",
          quotes: "all",
        },
      },
      DIRECTOR_VIEWER,
    );

    expect(updateResult.user.role).toBe("director");
    expect(updateResult.user.permissions.pricedExport).toBe(true);
  });

  it("allows employees to create self permission requests and directors to approve them", async () => {
    const requestResult = await createWorkspacePermissionRequest(
      {
        type: "priced_export",
        permissionKey: "pricedExport",
        permissionLabel: "带价导出权限",
        reason: "当前项目需要带价比较稿。",
      },
      EMPLOYEE_VIEWER,
    );

    expect(requestResult.request.status).toBe("pending");
    expect(requestResult.request.userId).toBe("user-employee");

    const approveResult = await approveWorkspacePermissionRequest(
      requestResult.request.id,
      {
        decision: "approved",
        comment: "仅用于当前项目导出。",
      },
      DIRECTOR_VIEWER,
    );

    expect(approveResult.request.status).toBe("approved");

    const authUser = await getAuthUserByIdentifier("employee");
    expect(authUser.user.permissions.pricedExport).toBe(true);
  });

  it("rejects non-director user management writes", async () => {
    const createResult = await createWorkspaceUser(
      {
        identifier: "blocked",
        name: "Blocked",
        email: "blocked@test.com",
        role: "employee",
        status: "active",
      },
      EMPLOYEE_VIEWER,
    );
    const approveResult = await approveWorkspacePermissionRequest(
      "permission-request-002",
      {
        decision: "approved",
      },
      EMPLOYEE_VIEWER,
    );

    expect(createResult).toMatchObject({
      error: {
        code: "USER_ADMIN_FORBIDDEN",
      },
    });
    expect(approveResult).toMatchObject({
      error: {
        code: "USER_ADMIN_FORBIDDEN",
      },
    });
  });

  it("feeds auth lookup and disabled accounts are blocked", async () => {
    const userLookup = await getAuthUserByIdentifier("developer");
    expect(userLookup.user.role).toBe("developer");

    await updateWorkspaceUser(
      "user-employee",
      {
        status: "disabled",
      },
      DIRECTOR_VIEWER,
    );

    const tokenLookup = await getAuthUserByToken("mock-session-token:employee");
    expect(tokenLookup).toMatchObject({
      error: {
        code: "USER_DISABLED",
      },
    });
  });

  it("keeps developers out of business user management auth source writes", async () => {
    const requestResult = await createWorkspacePermissionRequest(
      {
        type: "priced_export",
        permissionKey: "pricedExport",
        permissionLabel: "带价导出权限",
        reason: "test",
      },
      DEVELOPER_VIEWER,
    );

    expect(requestResult.request.userId).toBe("user-developer");
  });
});
