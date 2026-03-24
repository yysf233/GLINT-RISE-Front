import { beforeEach, describe, expect, it } from "vitest";
import {
  acknowledgeWorkspaceMonitorAlert,
  getWorkspaceLogsDashboard,
  resetWorkspaceLogsStore,
} from "./mockWorkspaceLogsService";

const EMPLOYEE_VIEWER = {
  id: "user-employee",
  name: "内部员工",
  role: "employee",
  permissions: {
    logAccess: false,
  },
};

const DIRECTOR_VIEWER = {
  id: "user-director",
  name: "部门总监",
  role: "director",
  permissions: {
    logAccess: true,
  },
};

const DEVELOPER_VIEWER = {
  id: "user-developer",
  name: "开发维护",
  role: "developer",
  permissions: {
    logAccess: false,
  },
};

const EMPLOYEE_WITH_LOG_ACCESS = {
  ...EMPLOYEE_VIEWER,
  permissions: {
    logAccess: true,
  },
};

function createLocalStorage() {
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
}

describe("mockWorkspaceLogsService", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    resetWorkspaceLogsStore();
  });

  it("returns limited personal logs for employee without log access", async () => {
    const result = await getWorkspaceLogsDashboard({}, EMPLOYEE_VIEWER);

    expect(result.accessLevel).toBe("limited");
    expect(result.summary.totalActivityLogs).toBeGreaterThan(0);
    expect(result.activityLogs.every((item) => item.actorId === "user-employee" || item.ownerId === "user-employee")).toBe(true);
    expect(result.accessLogs.every((item) => item.actorId === "user-employee")).toBe(true);
    expect(result.alerts.every((item) => item.detail === "")).toBe(true);
  });

  it("returns full logs and alert details for director or employees with log access", async () => {
    const directorResult = await getWorkspaceLogsDashboard({}, DIRECTOR_VIEWER);
    const employeeResult = await getWorkspaceLogsDashboard({}, EMPLOYEE_WITH_LOG_ACCESS);

    expect(directorResult.accessLevel).toBe("full");
    expect(directorResult.activityLogs.some((item) => item.module === "suppliers")).toBe(true);
    expect(directorResult.accessLogs.some((item) => item.actorId === "user-director")).toBe(true);
    expect(directorResult.alerts.some((item) => item.detail.includes("优先加载策略"))).toBe(true);

    expect(employeeResult.accessLevel).toBe("full");
    expect(employeeResult.alerts.some((item) => item.detail.length > 0)).toBe(true);
  });

  it("allows only director to acknowledge runtime alerts and persists the result", async () => {
    const employeeResult = await acknowledgeWorkspaceMonitorAlert("alert-001", EMPLOYEE_VIEWER);
    expect(employeeResult).toMatchObject({
      error: {
        code: "WORKSPACE_LOGS_FORBIDDEN",
      },
    });

    const directorResult = await acknowledgeWorkspaceMonitorAlert("alert-001", DIRECTOR_VIEWER);
    expect(directorResult.alert).toMatchObject({
      id: "alert-001",
      status: "acknowledged",
      acknowledgedBy: "部门总监",
    });

    const readBack = await getWorkspaceLogsDashboard({}, DIRECTOR_VIEWER);
    const acknowledged = readBack.alerts.find((item) => item.id === "alert-001");
    expect(acknowledged?.status).toBe("acknowledged");
    expect(acknowledged?.acknowledgedBy).toBe("部门总监");
  });

  it("rejects developer access", async () => {
    const result = await getWorkspaceLogsDashboard({}, DEVELOPER_VIEWER);

    expect(result).toMatchObject({
      error: {
        code: "WORKSPACE_LOGS_FORBIDDEN",
      },
    });
  });
});
