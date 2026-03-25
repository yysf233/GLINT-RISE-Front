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
      <section className="mx-auto max-w-[1600px]" data-case-map-layout="map" aria-label="案例图谱">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">案例图谱</div>
            <h1
              className="mt-3 text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 3vw, 3.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 1,
              }}
            >
              案例关系图
            </h1>
            <p className="mt-4 max-w-[58ch] text-sm leading-7 text-[var(--color-text-secondary)]">
              以图谱方式串联案例之间的主题与叙事路径，保留缩放、详情跳转和分享能力，只换成更轻的蓝系界面。
            </p>
          </div>

          <button
            type="button"
            onClick={() => shareCurrentPage("案例图谱", showNotice)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Share2 className="h-4 w-4" />
            分享页面
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_340px]">
          <div className="overflow-hidden rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl md:p-8">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/80 p-4 shadow-[var(--shadow-panel)] md:p-6">
              <div
                className="relative h-[560px] overflow-hidden rounded-[var(--radius-media)]"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(97, 163, 255, 0.16) 0%, rgba(255,255,255,0.94) 40%), linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)",
                }}
              >
                <svg className="absolute inset-0 h-full w-full">
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
                        stroke="rgba(84, 132, 198, 0.5)"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>

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
                        "absolute -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-tile)] px-4 py-3 text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-[50%]",
                        node.featured ? "min-w-[240px]" : "min-w-[170px]",
                      )}
                      aria-label={node.label}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 rounded-[var(--radius-tile)]",
                          node.featured ? "bg-[linear-gradient(180deg,rgba(84,132,198,0.16)_0%,rgba(255,255,255,0.94)_100%)]" : "bg-white/92",
                        )}
                      />
                      <div className="relative flex items-center gap-3">
                        <div
                          className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)]"
                          style={{
                            backgroundColor: node.featured ? "var(--color-accent-primary)" : "var(--color-background-canvas)",
                            color: node.featured ? "var(--color-text-on-accent)" : "var(--color-accent-primary)",
                          }}
                        >
                          {node.featured ? <Sparkles className="h-5 w-5" /> : <Grid3X3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-[10px] tracking-[0.26em] text-[var(--color-text-muted)]">
                            {node.featured ? "重点节点" : "普通节点"}
                          </div>
                          <div className="mt-1 text-sm font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                            {node.label}
                          </div>
                        </div>
                      </div>
                      {node.featured ? (
                        <div className="relative mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                          点击可直接进入案例详情页，查看完整信息和扩展图片。
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-white/88 px-3 py-2 text-xs tracking-[0.22em] text-[var(--color-text-primary)] shadow-[var(--shadow-panel)] backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => updateScale(-0.1)}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-2 transition hover:-translate-y-0.5"
                    aria-label="缩小图谱"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[4ch] text-center">{Math.round(scale * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => updateScale(0.1)}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-2 transition hover:-translate-y-0.5"
                    aria-label="放大图谱"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(1)}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-2 transition hover:-translate-y-0.5"
                    aria-label="重置图谱缩放"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/85 p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
              <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">图谱统计</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[var(--radius-card)] bg-[var(--color-background-canvas)] p-4">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">42</div>
                  <div className="mt-1 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">活跃节点</div>
                </div>
                <div className="rounded-[var(--radius-card)] bg-[var(--color-background-canvas)] p-4">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">128</div>
                  <div className="mt-1 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">连接关系</div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/85 p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
              <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">图谱说明</div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                <li>核心节点保持居中，符合案例传播的主要浏览路径。</li>
                <li>右下角保留缩放与重置控制，方便快速切换视角。</li>
                <li>分享按钮复用当前路由地址，保证分享后可直达对应页面。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
