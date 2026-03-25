import React, { useState } from "react";
import { Grid3X3, Maximize2, Minus, Plus, Search, Share2, Sparkles } from "lucide-react";
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
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleNodes = !normalizedQuery
    ? caseMapNodes
    : caseMapNodes.filter((node) => node.label.toLowerCase().includes(normalizedQuery));

  const firstFeatured = visibleNodes.find((node) => node.featured);
  const focusNode = firstFeatured ?? visibleNodes.find((node) => node.id !== "hub") ?? caseMapNodes.find((node) => node.featured) ?? caseMapNodes[0];

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  const getNode = (id) => caseMapNodes.find((node) => node.id === id);

  const updateScale = (delta) => {
    setScale((current) => {
      const next = +(current + delta).toFixed(1);
      return Math.min(1.35, Math.max(0.85, next));
    });
  };

  return (
    <PageShell>
      <section className="relative mx-auto max-w-[1600px] text-white" data-case-map-layout="prototype-dark" aria-label="案例生态图谱">
        <div
          data-testid="case-map-toolbar"
          className="mb-8 flex flex-col gap-5 rounded-[28px] border border-white/6 bg-[#15161b] p-5 md:flex-row md:items-center md:justify-between"
          style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.22)" }}
        >
          <div>
            <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">案例生态图谱</div>
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
              案例生态图谱
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-12 items-center gap-3 rounded-full border border-white/10 bg-white/4 px-4 text-sm text-white/72">
              <Search className="h-4 w-4 text-[#bac3ff]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索案例节点"
                aria-label="搜索案例节点"
                className="w-full bg-transparent outline-none placeholder:text-white/38 sm:w-52"
              />
            </label>

            <button
              type="button"
              onClick={() => shareCurrentPage("案例生态图谱", showNotice)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 text-sm tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              分享洞察
            </button>
          </div>
        </div>

        <div
          data-testid="case-map-canvas"
          className="relative min-h-[860px] overflow-hidden rounded-[32px] border border-white/6 bg-[#0c0d11]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(53, 70, 132, 0.32) 0%, rgba(15,17,22,0.12) 28%, rgba(12,13,17,1) 68%), radial-gradient(rgba(69,70,82,0.45) 1px, transparent 1px)",
            backgroundSize: "auto, 36px 36px",
            boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)",
          }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-60">
            {caseMapLines.map(([from, to]) => {
              const fromNode = getNode(from);
              const toNode = getNode(to);

              if (!fromNode || !toNode) {
                return null;
              }

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
            <div className="absolute inset-[18%] rounded-full border border-white/8" />
            <div className="absolute inset-[36%] rounded-full border border-white/8" />
            <div className="absolute inset-[52%] rounded-full border border-white/10" />
          </div>

          <div data-testid="case-map-node-focus" className="absolute right-6 top-6 z-10 w-full max-w-[320px] rounded-[26px] border border-white/10 bg-[#17181d]/88 p-5 backdrop-blur-xl">
            <div className="text-[10px] tracking-[0.28em] text-[#bac3ff]">案例中心</div>
            <div className="mt-4 flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#bac3ff]/12 text-[#bac3ff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{focusNode?.label ?? "案例节点"}</div>
                <p className="mt-2 text-xs leading-6 text-white/62">
                  重点节点会优先浮出，便于从图谱直接进入详情页并查看完整视觉档案。
                </p>
              </div>
            </div>
          </div>

          <div data-testid="case-map-live-stats" className="absolute bottom-6 left-6 z-10 rounded-[24px] border border-white/10 bg-[#17181d]/88 p-5 backdrop-blur-xl">
            <div className="text-[10px] tracking-[0.28em] text-white/40">实时统计</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[18px] bg-[#101114] px-4 py-3">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">{visibleNodes.length}</div>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-white/38">活跃节点</div>
              </div>
              <div className="rounded-[18px] bg-[#101114] px-4 py-3">
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">{caseMapLines.length}</div>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-white/38">连接数</div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0" style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
            {caseMapNodes.map((node) => {
              const isVisible = !normalizedQuery || visibleNodeIds.has(node.id);

              return (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => {
                    if (node.id === "hub" || node.id === "entry") {
                      return;
                    }

                    navigate(`/case/${node.id}`);
                  }}
                  style={{ left: `${node.x}%`, top: `${node.y}%`, opacity: isVisible ? 1 : 0.2 }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 border text-left transition hover:-translate-y-[54%]",
                    node.id === "hub"
                      ? "grid h-44 w-44 place-items-center rounded-full border-[#bac3ff]/28 bg-[#101114]"
                      : node.featured
                        ? "min-w-[280px] rounded-[26px] border-[#bac3ff]/20 bg-[#17181d] p-6"
                        : "min-w-[190px] rounded-[20px] border-white/8 bg-[#17181d] px-4 py-4",
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
              );
            })}
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#17181d]/92 px-3 py-2 text-xs tracking-[0.22em] text-white shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
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
      </section>
    </PageShell>
  );
}

export default CaseMapPage;
