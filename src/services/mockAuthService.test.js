import { describe, expect, it, vi } from "vitest";
import { getSession, login, logout } from "./mockAuthService";

const PERSISTED_EMPLOYEE_TOKEN = "mock-session-token:employee";

describe("mockAuthService", () => {
  it('login("employee", "glintrise-123") returns employee session', async () => {
    const result = await login("employee", "glintrise-123");

    expect(result).toMatchObject({
      session: {
        token: "mock-session-token:employee",
        user: {
          name: "内部员工",
          id: "user-employee",
          identifier: "employee",
          role: "employee",
          status: "active",
        },
      },
    });
  });

  it("unknown identifier returns USER_NOT_FOUND", async () => {
    const result = await login("unknown", "glintrise-123");

    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "账号不存在。",
      },
    });
  });

  it("wrong password returns INVALID_CREDENTIALS", async () => {
    const result = await login("employee", "wrong-password");

    expect(result).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "账号或密码错误",
      },
    });
  });

  it("getSession(restored token fixture) restores the employee session after reload", async () => {
    vi.resetModules();

    const { getSession: freshGetSession } = await import("./mockAuthService");
    const result = await freshGetSession({ token: PERSISTED_EMPLOYEE_TOKEN });

    expect(result).toMatchObject({
      session: {
        token: PERSISTED_EMPLOYEE_TOKEN,
        user: {
          id: "user-employee",
          name: "内部员工",
          identifier: "employee",
          role: "employee",
        },
      },
    });
  });

  it("invalid getSession token returns INVALID_SESSION", async () => {
    const result = await getSession({ token: "bad-token" });

    expect(result).toEqual({
      error: {
        code: "INVALID_SESSION",
        message: "登录状态已失效，请重新登录",
      },
    });
  });

  it("logout() returns { success: true }", async () => {
    const result = await logout();

    expect(result).toEqual({ success: true });
  });
});
