import React from "react";
import { ArrowLeft } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { useAuth } from "../context/useAuth";
import { useNotice } from "../context/useNotice";
import { resolvePostLoginRoute } from "../utils/authRoutes";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, login, user } = useAuth();
  const { showNotice } = useNotice();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const postLoginRoute = user ? resolvePostLoginRoute(user.role, location.state?.from) : undefined;

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated && postLoginRoute) {
    return <Navigate to={postLoginRoute} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(identifier, password);

      if (result?.session) {
        navigate(resolvePostLoginRoute(result.session.user.role, location.state?.from), { replace: true });
        return;
      }

      if (result?.error?.message) {
        showNotice(result.error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl pt-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-10 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回入口
        </button>

        <div
          className="rounded-[var(--radius-panel)] p-8 md:p-12"
          style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-floating)" }}
        >
          <div className="mb-4 text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">登录入口</div>
          <h1
            className="text-[var(--color-text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "3rem",
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            账号登录
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-text-secondary)]">
            使用模拟账号和固定密码登录，系统会在角色允许时返回你刚才尝试进入的工作台页面，否则跳转到默认工作台。
          </p>

          <form className="mt-10 grid gap-4" onSubmit={handleSubmit}>
            <input
              className="rounded-[var(--radius-tile)] border-none px-5 py-4 outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ backgroundColor: "var(--color-background-canvas)", color: "var(--color-text-primary)" }}
              placeholder="邮箱 / 用户名"
              aria-label="邮箱或用户名"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
            />
            <input
              className="rounded-[var(--radius-tile)] border-none px-5 py-4 outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ backgroundColor: "var(--color-background-canvas)", color: "var(--color-text-primary)" }}
              placeholder="密码"
              type="password"
              aria-label="密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="rounded-[var(--radius-pill)] px-8 py-3 font-bold tracking-[0.22em] text-[var(--color-text-on-accent)]"
                style={{ background: "var(--gradient-accent)" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "登录中" : "登录"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-[var(--radius-pill)] px-8 py-3 tracking-[0.22em] text-[var(--color-text-primary)]"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
