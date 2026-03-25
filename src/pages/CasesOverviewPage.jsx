import React from "react";
import { ArrowRight, LayoutGrid, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";

export function CasesOverviewPage() {
  const navigate = useNavigate();
  const feature = cases[0];
  const secondaryCases = cases.slice(1);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]" data-case-layout="curated">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.28em] text-[var(--color-accent-primary)]">
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-4 py-2">案例总览</span>
              <span>公开案例线</span>
              <span>策展式浏览</span>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
              <button
                type="button"
                onClick={() => navigate(`/case/${feature.id}`)}
                className="group overflow-hidden rounded-[var(--radius-panel)] text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--color-surface-primary)" }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={feature.hero}
                    alt={feature.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,40,78,0.02)_0%,rgba(12,40,78,0.28)_100%)]" />
                  <div className="absolute left-5 top-5 inline-flex rounded-[var(--radius-pill)] bg-white/85 px-4 py-2 text-[11px] tracking-[0.24em] text-[var(--color-accent-primary)] backdrop-blur-xl">
                    {feature.eyebrow}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 rounded-[var(--radius-card)] bg-white/88 p-5 backdrop-blur-xl">
                    <div className="text-xs tracking-[0.26em] text-[var(--color-text-muted)]">{feature.year}</div>
                    <div
                      className="mt-3 text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.8rem, 2vw, 2.5rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.05em",
                        lineHeight: 1,
                      }}
                    >
                      {feature.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{feature.summary}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-[var(--color-accent-primary)]">
                      查看案例详情
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>

              <div className="grid gap-6">
                <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-muted)] bg-white/80 p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
                  <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">案例结构说明</div>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                    保留案例总览、时间轴、图谱、详情和分享的完整跳转链路，只将视觉语言切换为浅底蓝系的编辑式结构。
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => navigate("/case-timeline")}
                      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-[var(--color-background-canvas)] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      进入时间轴
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/case-map")}
                      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      <Orbit className="h-4 w-4" />
                      进入图谱
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {secondaryCases.map((item, index) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => navigate(`/case/${item.id}`)}
                      className={`group overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 ${
                        index === 1 ? "sm:translate-y-10" : ""
                      }`}
                      style={{ backgroundColor: "var(--color-surface-primary)" }}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={item.hero}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">{item.eyebrow}</div>
                        <div
                          className="mt-2 text-[var(--color-text-primary)]"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                          }}
                        >
                          {item.title}
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.summary}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
