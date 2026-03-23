import React, { useMemo } from "react";
import { ArrowRight, LayoutGrid, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { buildCaseTimelineSections, getCaseTimelineLabel } from "../utils/caseTimeline";

export function CaseTimelinePage() {
  const navigate = useNavigate();
  const timelineSections = useMemo(() => buildCaseTimelineSections(cases), []);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]" aria-label="项目时间轴">
        <SectionHeading
          eyebrow="项目时间轴"
          title="按时间梳理案例叙事"
          desc="新增独立时间轴页，把公开案例按时间分段组织，兼顾客户浏览、销售讲述和后续内容扩充。当前页面保留案例总览与案例图谱的双入口，不替代现有策展页。"
          right={
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
            >
              <LayoutGrid className="h-4 w-4" />
              查看案例总览
            </button>
          }
          action={
            <button
              type="button"
              onClick={() => navigate("/case-map")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold tracking-[0.18em] text-[var(--color-text-on-accent)]"
              style={{ background: "var(--gradient-accent)" }}
            >
              <Orbit className="h-4 w-4" />
              进入案例图谱
            </button>
          }
        />

        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <aside
            className="h-fit rounded-[var(--radius-panel)] p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">时间轴概览</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[var(--radius-tile)] bg-[var(--color-background-canvas)] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em]">{timelineSections.length}</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">时间分段</div>
              </div>
              <div className="rounded-[var(--radius-tile)] bg-[var(--color-background-canvas)] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em]">{cases.length}</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">公开案例</div>
              </div>
              <div className="rounded-[var(--radius-tile)] bg-[var(--color-background-canvas)] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em]">PC / M</div>
                <div className="mt-2 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">双端共用时间轴</div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-[var(--color-text-secondary)]">
              时间轴页按近到远组织案例节点。每个节点保留案例标题、摘要、标签与详情跳转，便于后续继续往下补更多年份和季度内容。
            </p>
          </aside>

          <div
            className="rounded-[var(--radius-panel)] p-6 md:p-8"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="relative pl-5 md:pl-10">
              <div className="absolute bottom-0 left-[7px] top-0 w-px bg-[var(--color-border-muted)] md:left-4" />

              <div className="space-y-10 md:space-y-12">
                {timelineSections.map((section) => (
                  <section key={section.id} className="relative">
                    <div className="absolute left-0 top-3 grid h-4 w-4 place-items-center rounded-full bg-[var(--color-accent-primary)] shadow-[var(--shadow-accent)] md:left-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-on-accent)]" />
                    </div>

                    <div className="ml-7 md:ml-10">
                      <div className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] px-4 py-2 text-sm font-bold tracking-[0.18em] text-[var(--color-accent-primary)]">
                        {section.label}
                      </div>

                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        {section.items.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => navigate(`/case/${item.id}`)}
                            className="group rounded-[var(--radius-card)] p-5 text-left transition hover:bg-[var(--color-surface-secondary)]"
                            style={{ backgroundColor: "var(--color-background-canvas)" }}
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
                                  }}
                                >
                                  {item.title}
                                </div>
                              </div>
                              <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] transition group-hover:translate-x-1">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item.summary}</p>

                            <div className="mt-5 flex flex-wrap gap-2">
                              <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-3 py-1.5 text-xs tracking-[0.18em] text-[var(--color-text-secondary)]">
                                {item.industry}
                              </span>
                              <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-3 py-1.5 text-xs tracking-[0.18em] text-[var(--color-text-secondary)]">
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
        </div>
      </section>
    </PageShell>
  );
}
