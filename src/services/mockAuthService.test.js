import { describe, expect, it, vi } from "vitest";
import { getSession, login, logout } from "./mockAuthService";

describe("mockAuthService", () => {
  it('login("employee", "glintrise-123") returns employee session', async () => {
    const result = await login("employee", "glintrise-123");

    expect(result).toEqual({
      session: {
        token: "mock-session-token:employee",
        user: {
          name: "内部员工",
          id: "user-employee",
          role: "employee",
        },
      },
    });
  });

  it("unknown identifier returns USER_NOT_FOUND", async () => {
    const result = await login("unknown", "glintrise-123");

    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "账号不存在",
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

  it("getSession(restoredToken) returns same session shape", async () => {
    const loginResult = await login("employee", "glintrise-123");

    vi.resetModules();

    const { getSession: freshGetSession } = await import("./mockAuthService");
    const result = await freshGetSession({ token: loginResult.session.token });

    expect(result).toEqual(loginResult);
  });

  it("logout() returns { success: true }", async () => {
    const result = await logout();

    expect(result).toEqual({ success: true });
  });
});
