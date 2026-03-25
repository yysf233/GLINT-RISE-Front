import React, { useMemo, useState } from "react";
import { ArrowRight, LayoutGrid, Maximize2, Minus, Orbit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { buildCaseTimelineSections, getCaseTimelineLabel } from "../utils/caseTimeline";

export function CaseTimelinePage() {
  const navigate = useNavigate();
  const timelineSections = useMemo(() => buildCaseTimelineSections(cases), []);
  const [scale, setScale] = useState(1);

  const handleZoom = (delta) => {
    setScale((current) => {
      const next = +(current + delta).toFixed(1);
      return Math.min(1.35, Math.max(0.85, next));
    });
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]" data-case-timeline-layout="timeline" aria-label="项目时间轴">
        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
            <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">项目时间轴</div>
            <h1
              className="mt-4 text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 3vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 1,
              }}
            >
              按时间梳理案例叙事
            </h1>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              将公开案例按季度和年份重新组织，保留详情跳转与图谱联动，只把版式切换成更轻的策展式信息结构。
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[var(--radius-card)] bg-white/80 p-4 shadow-[var(--shadow-panel)]">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">{timelineSections.length}</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">时间分段</div>
              </div>
              <div className="rounded-[var(--radius-card)] bg-white/80 p-4 shadow-[var(--shadow-panel)]">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">{cases.length}</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">公开案例</div>
              </div>
              <div className="rounded-[var(--radius-card)] bg-white/80 p-4 shadow-[var(--shadow-panel)]">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">PC / M</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">双端共用</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => navigate("/cases")}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-[var(--color-background-canvas)] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
              >
                <LayoutGrid className="h-4 w-4" />
                查看案例总览
              </button>
              <button
                type="button"
                onClick={() => navigate("/case-map")}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5"
                style={{ background: "var(--gradient-accent)" }}
              >
                <Orbit className="h-4 w-4" />
                进入案例图谱
              </button>
            </div>
          </aside>

          <div className="rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">时间轴视图</div>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[var(--color-text-secondary)]">
                  每个阶段保留案例标题、摘要、标签和详情跳转，便于继续补充季度内容或在客户讲述中直接引用。
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-white/85 px-3 py-2 text-xs tracking-[0.22em] text-[var(--color-text-primary)] shadow-[var(--shadow-panel)]">
                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-2 transition hover:-translate-y-0.5"
                  aria-label="缩小图谱"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[4ch] text-center">{Math.round(scale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-2 transition hover:-translate-y-0.5"
                  aria-label="放大图谱"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setScale(1)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] px-3 py-2 transition hover:-translate-y-0.5"
                  aria-label="重置图谱缩放"
                >
                  <Maximize2 className="h-3 w-3" />
                  重置图谱缩放
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-12">
              {timelineSections.map((section) => (
                <section key={section.id} className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-[var(--color-border-muted)]" />
                  <div className="relative pl-10" style={{ transform: `scale(${scale})`, transformOrigin: "left top" }}>
                    <div className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[var(--color-accent-primary)]">
                      {section.label}
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      {section.items.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => navigate(`/case/${item.id}`)}
                          className="group rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/90 p-5 text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs tracking-[0.24em] text-[var(--color-accent-primary)]">
                                {getCaseTimelineLabel(item)}
                              </div>
                              <div
                                className="mt-3 text-[var(--color-text-primary)]"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontSize: "1.45rem",
                                  fontWeight: 700,
                                  letterSpacing: "-0.04em",
                                  lineHeight: 1.08,
                                }}
                              >
                                {item.title}
                              </div>
                            </div>
                            <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-3 text-[var(--color-accent-primary)] transition group-hover:translate-x-1">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item.summary}</p>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] px-3 py-1.5 text-xs tracking-[0.18em] text-[var(--color-text-secondary)]">
                              {item.industry}
                            </span>
                            <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] px-3 py-1.5 text-xs tracking-[0.18em] text-[var(--color-text-secondary)]">
                              {item.category}
                            </span>
                            {item.subTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs tracking-[0.18em] text-[var(--color-accent-primary)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
