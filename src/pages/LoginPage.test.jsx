import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { NoticeProvider } from "../context/NoticeContext";
import { AuthContext } from "../context/AuthContext";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renders the dark prototype login form with quick-fill cards and fixed mock password hint", () => {
    const html = renderToStaticMarkup(
      <NoticeProvider>
        <AuthContext.Provider
          value={{
            status: "unauthenticated",
            session: null,
            user: null,
            isAuthenticated: false,
            isBootstrapping: false,
            login: async () => ({ error: { message: "账号或密码错误" } }),
            logout: async () => {},
          }}
        >
          <MemoryRouter initialEntries={["/login"]}>
            <LoginPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </NoticeProvider>,
    );

    expect(html).toContain('data-login-layout="prototype-dark"');
    expect(html).toContain("账号登录");
    expect(html).toContain("邮箱 / 用户名");
    expect(html).toContain("glintrise-123");
  });
});
