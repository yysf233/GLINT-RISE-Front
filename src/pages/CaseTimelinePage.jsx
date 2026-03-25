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
      <section className="mx-auto max-w-[1600px] text-white" data-case-timeline-layout="prototype-dark" aria-label="项目时间轴">
        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[28px] border border-white/6 bg-[#1c1b1b] p-6" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.22)" }}>
            <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">案例时间轴</div>
            <h1
              className="mt-4 text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.6rem, 4vw, 4rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
              }}
            >
              按时间梳理案例叙事
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/68">
              将公开案例按季度重新组织，保留详情跳转与图谱联动，把时间轴的视觉层次切到和案例页一致的暗色策展语言。
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[20px] bg-[#101114] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">{timelineSections.length}</div>
                <div className="mt-2 text-[10px] tracking-[0.22em] text-white/38">时间分段</div>
              </div>
              <div className="rounded-[20px] bg-[#101114] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">{cases.length}</div>
                <div className="mt-2 text-[10px] tracking-[0.22em] text-white/38">公开案例</div>
              </div>
              <div className="rounded-[20px] bg-[#101114] p-4">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">桌面 / 移动</div>
                <div className="mt-2 text-[10px] tracking-[0.22em] text-white/38">双端共用</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => navigate("/cases")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
              >
                <LayoutGrid className="h-4 w-4" />
                查看案例总览
              </button>
              <button
                type="button"
                onClick={() => navigate("/case-map")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4453a7] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#5262c2]"
              >
                <Orbit className="h-4 w-4" />
                进入案例图谱
              </button>
            </div>
          </aside>

          <div className="rounded-[28px] border border-white/6 bg-[#131313] p-6 md:p-8" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] tracking-[0.28em] text-white/40">时间轴视图</div>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-white/68">
                  每个阶段保留案例标题、摘要、标签和详情跳转，方便继续扩充季度内容或做客户讲述时的快速导航。
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1c1b1b] px-3 py-2 text-xs tracking-[0.22em] text-white shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  className="rounded-full bg-[#101114] p-2 transition hover:bg-[#17181d]"
                  aria-label="缩小图谱"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[4ch] text-center">{Math.round(scale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  className="rounded-full bg-[#101114] p-2 transition hover:bg-[#17181d]"
                  aria-label="放大图谱"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setScale(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#101114] px-3 py-2 transition hover:bg-[#17181d]"
                  aria-label="重置图谱缩放"
                >
                  <Maximize2 className="h-3 w-3" />
                  重置图谱缩放
                </button>
              </div>
            </div>

            <div data-testid="case-timeline-rail" className="mt-8 space-y-12">
              {timelineSections.map((section) => (
                <section key={section.id} className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-white/10" />
                  <div className="relative pl-10" style={{ transform: `scale(${scale})`, transformOrigin: "left top" }}>
                    <div className="inline-flex rounded-full border border-[#bac3ff]/20 bg-[#bac3ff]/12 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[#bac3ff]">
                      {section.label}
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      {section.items.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => navigate(`/case/${item.id}`)}
                          className="group rounded-[24px] border border-white/6 bg-[#1c1b1b] p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,0,0,0.22)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[10px] tracking-[0.24em] text-[#bac3ff]">{getCaseTimelineLabel(item)}</div>
                              <div
                                className="mt-3 text-white"
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
                            <span className="rounded-full bg-[#101114] p-3 text-[#bac3ff] transition group-hover:translate-x-1">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-white/66">{item.summary}</p>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#101114] px-3 py-1.5 text-xs tracking-[0.18em] text-white/54">{item.industry}</span>
                            <span className="rounded-full bg-[#101114] px-3 py-1.5 text-xs tracking-[0.18em] text-white/54">{item.category}</span>
                            {item.subTags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-[#bac3ff]/12 px-3 py-1.5 text-xs tracking-[0.18em] text-[#bac3ff]">
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

export default CaseTimelinePage;
