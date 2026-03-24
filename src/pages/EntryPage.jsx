import React from "react";
import { useNavigate } from "react-router-dom";
import { cases } from "../data/siteContent";
import { readPublicSiteSettings } from "../services/publicSiteContent";

export function EntryPage() {
  const navigate = useNavigate();
  const { brand } = readPublicSiteSettings();

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--color-text-primary)]">
      <img
        src={cases[0].hero}
        alt="光速上升品牌入口"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-black/25 backdrop-blur-xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col justify-between px-[var(--space-page-x)] py-10">
        <div className="flex items-center justify-between text-xs tracking-[0.32em] text-[var(--color-text-muted)]">
          <div>{brand.entryEyebrow}</div>
          <div>版本 2.0.4</div>
        </div>

        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <div
            className="text-[var(--color-accent-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--font-size-hero)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
            }}
          >
            {brand.name}
          </div>
          <div className="mt-3 text-sm tracking-[0.42em] text-[var(--color-text-secondary)] md:text-base">
            {brand.cnName}
          </div>
          <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
            以真实案例、策展型产品与统一视觉规则构成的品牌前端样板，面向后续长期迭代与模块复用。
          </p>
          <div className="mt-16 flex flex-col gap-4 md:flex-row">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-[var(--radius-pill)] px-10 py-4 text-sm font-bold tracking-[0.24em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition active:scale-95"
              style={{ background: "var(--gradient-accent)" }}
            >
              访客进入
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-[var(--radius-pill)] px-10 py-4 text-sm tracking-[0.24em] text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-secondary)]"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              登录入口
            </button>
          </div>
          <div className="mt-12 text-[11px] tracking-[0.4em] text-[var(--color-text-muted)]">品牌体验已就绪</div>
        </div>

        <div className="flex items-center justify-between text-[11px] tracking-[0.28em] text-[var(--color-text-muted)]">
          <div>状态：系统稳定</div>
          <div>© 2024</div>
        </div>
      </div>
    </div>
  );
}
