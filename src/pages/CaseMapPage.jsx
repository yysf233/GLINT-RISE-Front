import React, { useState } from "react";
import { Grid3X3, Maximize2, Minus, Plus, Share2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { caseMapLines, caseMapNodes } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";

export function CaseMapPage() {
  const navigate = useNavigate();
  const { showNotice } = useNotice();
  const [scale, setScale] = useState(1);

  const getNode = (id) => caseMapNodes.find((node) => node.id === id);

  const updateScale = (delta) => {
    setScale((current) => {
      const next = +(current + delta).toFixed(1);
      return Math.min(1.35, Math.max(0.85, next));
    });
  };

  return (
    <PageShell>
      <section className="relative mx-auto max-w-[1600px] text-white" data-case-map-layout="prototype-dark" aria-label="案例图谱">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">案例图谱</div>
            <h1
              className="mt-4 text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.6rem, 4vw, 4.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
              }}
            >
              案例图谱页
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => shareCurrentPage("案例图谱", showNotice)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              分享页面
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            data-testid="case-map-canvas"
            className="relative min-h-[760px] overflow-hidden rounded-[30px] border border-white/6 bg-[#0e0e0e]"
            style={{
              backgroundImage: "radial-gradient(rgba(69,70,82,0.55) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)",
            }}
          >
            <svg className="absolute inset-0 h-full w-full opacity-60">
              {caseMapLines.map(([from, to]) => {
                const fromNode = getNode(from);
                const toNode = getNode(to);

                return (
                  <line
                    key={`${from}-${to}`}
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke="rgba(186, 195, 255, 0.18)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6">
              <div className="absolute inset-[22%] rounded-full border border-white/8" />
              <div className="absolute inset-[40%] rounded-full border border-white/8" />
            </div>

            <div className="absolute inset-0" style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
              {caseMapNodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => {
                    if (node.id === "hub" || node.id === "entry") return;
                    navigate(`/case/${node.id}`);
                  }}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 border text-left transition hover:-translate-y-[54%]",
                    node.id === "hub"
                      ? "grid h-40 w-40 place-items-center rounded-full border-[#bac3ff]/28 bg-[#101114]"
                      : node.featured
                        ? "min-w-[270px] rounded-[26px] border-[#bac3ff]/20 bg-[#1c1b1b] p-6"
                        : "min-w-[180px] rounded-[20px] border-white/8 bg-[#1c1b1b] px-4 py-4",
                  )}
                >
                  {node.id === "hub" ? (
                    <div className="text-center">
                      <Sparkles className="mx-auto h-6 w-6 text-[#bac3ff]" />
                      <div className="mt-3 text-sm font-semibold tracking-[0.18em] text-white">案例中心</div>
                      <div className="mt-1 text-[10px] tracking-[0.24em] text-white/36">核心节点</div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "grid h-10 w-10 place-items-center rounded-[14px]",
                            node.featured ? "bg-[#bac3ff]/12 text-[#bac3ff]" : "bg-[#101114] text-white/48",
                          )}
                        >
                          {node.featured ? <Sparkles className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-[10px] tracking-[0.26em] text-white/34">{node.featured ? "重点节点" : "普通节点"}</div>
                          <div className="mt-1 text-sm font-semibold text-white">{node.label}</div>
                        </div>
                      </div>
                      {node.featured ? (
                        <div className="mt-3 text-xs leading-6 text-white/58">点击可直接进入案例详情，查看完整视觉档案和项目信息。</div>
                      ) : null}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-[#1c1b1b]/92 px-3 py-2 text-xs tracking-[0.22em] text-white shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => updateScale(-0.1)}
                className="rounded-full bg-[#101114] p-2 transition hover:bg-[#17181d]"
                aria-label="缩小图谱"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[4ch] text-center">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={() => updateScale(0.1)}
                className="rounded-full bg-[#101114] p-2 transition hover:bg-[#17181d]"
                aria-label="放大图谱"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setScale(1)}
                className="rounded-full bg-[#bac3ff]/10 p-2 text-[#bac3ff] transition hover:bg-[#bac3ff]/16"
                aria-label="重置图谱缩放"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/6 bg-[#1c1b1b] p-6">
              <div className="text-[10px] tracking-[0.28em] text-white/40">实时统计</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[20px] bg-[#101114] p-4">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">42</div>
                  <div className="mt-1 text-[10px] tracking-[0.22em] text-white/38">活跃节点</div>
                </div>
                <div className="rounded-[20px] bg-[#101114] p-4">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">128</div>
                  <div className="mt-1 text-[10px] tracking-[0.22em] text-white/38">连接数</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/6 bg-[#1c1b1b] p-6">
              <div className="text-[10px] tracking-[0.28em] text-white/40">图谱说明</div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-white/64">
                <li>核心节点保持居中，维持案例传播的主浏览路径。</li>
                <li>重点节点直接连到详情页，普通节点承担生态关系提示。</li>
                <li>右下角保留缩放与重置控制，保证图谱浏览效率。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default CaseMapPage;
