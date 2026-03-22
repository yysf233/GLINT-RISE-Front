import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

export function LoginPage() {
  const navigate = useNavigate();

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
          <div className="mb-4 text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">登录占位页</div>
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
            当前版本仅保留登录入口结构，不接入真实认证流程，后续可在此页继续扩展权限体系与表单校验。
          </p>

          <div className="mt-10 grid gap-4">
            <input
              className="rounded-[var(--radius-tile)] border-none px-5 py-4 outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ backgroundColor: "var(--color-background-canvas)", color: "var(--color-text-primary)" }}
              placeholder="邮箱 / 用户名"
              aria-label="邮箱或用户名"
            />
            <input
              className="rounded-[var(--radius-tile)] border-none px-5 py-4 outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ backgroundColor: "var(--color-background-canvas)", color: "var(--color-text-primary)" }}
              placeholder="密码"
              type="password"
              aria-label="密码"
            />
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="rounded-[var(--radius-pill)] px-8 py-3 font-bold tracking-[0.22em] text-[var(--color-text-on-accent)]"
                style={{ background: "var(--gradient-accent)" }}
              >
                进入首页
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
          </div>
        </div>
      </section>
    </PageShell>
  );
}
