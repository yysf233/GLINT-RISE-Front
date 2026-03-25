import React from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { readPublicSiteSettings } from "../services/publicSiteContent";

export function EntryPage() {
  const navigate = useNavigate();
  const { brand } = readPublicSiteSettings();

  return (
    <div data-entry-layout="prototype-dark" className="relative flex min-h-screen flex-col overflow-hidden bg-[#0f1116] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(186,195,255,0.18)_0%,transparent_28%),linear-gradient(180deg,rgba(15,17,22,1)_0%,rgba(15,17,22,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="entry-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#entry-grid)" />
        </svg>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          <section
            data-testid="entry-hero"
            className="rounded-[40px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,22,28,0.9),rgba(16,17,20,0.78))] px-8 py-14 backdrop-blur-[24px] md:px-14 md:py-20"
            style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
          >
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[10px] tracking-[0.34em] text-[#bac3ff]">品牌入口</div>
              <h1
                className="mt-6 text-[#eef2ff]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.6rem, 8vw, 5.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.07em",
                  lineHeight: 0.9,
                }}
              >
                {brand.name}
              </h1>
              <p className="mt-4 text-lg tracking-[0.32em] text-white/60">{brand.cnName}</p>
              <p className="mt-8 text-sm leading-8 text-white/64 md:text-base">
                私域档案入口用于衔接公开站点与后台工作台，保留极简品牌落点与双入口动作，贴近 Stitch desktop 原型的单屏节奏。
              </p>

              <div data-testid="entry-actions" className="mt-12 flex flex-col items-center justify-center gap-5 md:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#bac3ff] px-6 text-sm font-bold tracking-[0.28em] text-[#18286f] transition hover:scale-[1.02] active:scale-95 md:w-56"
                >
                  <span>访客进入</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-transparent px-6 text-sm font-bold tracking-[0.28em] text-[#bac3ff] transition hover:border-[#bac3ff] hover:bg-[#bac3ff]/6 active:scale-95 md:w-56"
                >
                  <LogIn className="h-4 w-4" />
                  <span>登录入口</span>
                </button>
              </div>

              <div className="mt-12 flex items-center justify-center gap-2 text-[10px] tracking-[0.24em] text-white/42">
                <span className="h-1.5 w-1.5 rounded-full bg-[#bac3ff]" />
                <span>私域档案入口</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer
        data-testid="entry-footer"
        className="relative z-10 border-t border-white/6 bg-[#0c0d11]/94 px-8 py-8 backdrop-blur-xl md:px-14"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div
            className="text-white/18"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {brand.name}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] tracking-[0.24em] text-white/42">
            <span>隐私政策</span>
            <span>使用条款</span>
            <span>合规说明</span>
          </div>

          <div className="text-[10px] tracking-[0.22em] text-white/42">© 2024 {brand.name}。保留所有权利。</div>
        </div>
      </footer>
    </div>
  );
}

export default EntryPage;
