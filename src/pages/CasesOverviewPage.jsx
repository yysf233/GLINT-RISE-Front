import React from "react";
import { ArrowRight, LayoutGrid, Orbit, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";

function CaseBentoCard({ item, className = "", featured = false, onClick }) {
  if (!item) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[30px] border border-white/6 bg-[#17181d] text-left text-white shadow-[0_28px_72px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 ${className}`}
    >
      <img
        src={item.hero}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,10,14,0.08)_0%,rgba(9,10,14,0.44)_42%,rgba(9,10,14,0.94)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#bac3ff]/20 bg-[#bac3ff]/12 px-3 py-1 text-[10px] tracking-[0.22em] text-[#bac3ff]">
            {item.eyebrow}
          </span>
          <span className="text-[10px] tracking-[0.24em] text-white/42">{item.year}</span>
        </div>

        <div
          className="mt-4 text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: featured ? "clamp(2.3rem, 4.5vw, 4.9rem)" : "1.9rem",
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.94,
          }}
        >
          {item.title}
        </div>

        <p className={`mt-4 text-sm leading-7 ${featured ? "max-w-2xl text-white/72" : "max-w-xl text-white/68"}`}>{item.summary}</p>

        <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-[#bac3ff]">
          <span>查看案例</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

function getBentoSpanClass(index) {
  if (index === 0) {
    return "md:col-span-7 lg:min-h-[420px]";
  }

  if (index === 1) {
    return "md:col-span-5 lg:min-h-[420px]";
  }

  if (index === 2) {
    return "md:col-span-4 lg:min-h-[340px]";
  }

  if (index === 3) {
    return "md:col-span-4 lg:min-h-[340px]";
  }

  return "md:col-span-4 lg:min-h-[340px]";
}

export function CasesOverviewPage() {
  const navigate = useNavigate();
  const feature = cases[0];
  const gridCases = cases.slice(1);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px] text-white" data-case-layout="prototype-dark">
        <div
          data-testid="cases-editorial-hero"
          className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"
        >
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/6 bg-[#15161b] p-6 md:p-8" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.22)" }}>
              <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.34em] text-white/46">
                <Sparkles className="h-4 w-4 text-[#bac3ff]" />
                <span>精选案例矩阵</span>
                <span className="text-white/24">/</span>
                <span>案例总览</span>
              </div>

              <div
                className="mt-6 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.8rem, 6vw, 5.4rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.07em",
                  lineHeight: 0.9,
                }}
              >
                案例总览
              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                以暗色编辑版式串联案例详情、时间轴与图谱入口，保留动态案例数据，同时把每个案例作为可进入的叙事节点来展示。
              </p>

              {feature ? (
                <div className="mt-8">
                  <CaseBentoCard
                    item={feature}
                    featured
                    className="min-h-[420px] md:min-h-[520px]"
                    onClick={() => navigate(`/case/${feature.id}`)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/6 bg-[#17181d] p-6 md:p-8" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.18)" }}>
              <div className="text-[10px] tracking-[0.32em] text-white/40">导航入口</div>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/case-timeline")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
                >
                  <LayoutGrid className="h-4 w-4" />
                  进入案例时间轴
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

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[24px] bg-[#101114] p-5">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">{cases.length}</div>
                  <div className="mt-2 text-[10px] tracking-[0.24em] text-white/38">公开案例</div>
                </div>
                <div className="rounded-[24px] bg-[#101114] p-5">
                  <div className="text-3xl font-extrabold tracking-[-0.05em] text-white">Dark</div>
                  <div className="mt-2 text-[10px] tracking-[0.24em] text-white/38">原型风格</div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/6 bg-[#14151a] p-6 md:p-8">
              <div className="text-[10px] tracking-[0.3em] text-white/40">编辑说明</div>
              <p className="mt-4 text-sm leading-7 text-white/66">
                入口保持为可点击按钮，案例卡片继续读取动态案例数据，页面组织改为更接近原型的 hero + bento 结构。
              </p>
            </div>
          </aside>
        </div>

        <div data-testid="cases-bento-grid" className="mt-6 grid gap-5 md:grid-cols-12 lg:auto-rows-[minmax(240px,auto)]">
          {gridCases.map((item, index) => (
            <CaseBentoCard
              key={item.id}
              item={item}
              className={getBentoSpanClass(index)}
              onClick={() => navigate(`/case/${item.id}`)}
            />
          ))}
        </div>

        <div
          data-testid="cases-footer-note"
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/6 bg-[#101114] px-5 py-4 text-sm text-white/62"
        >
          <span>精选案例矩阵继续向下展开，查看案例可进入详情页。</span>
          <span className="text-[#bac3ff]">进入案例时间轴 / 进入案例图谱</span>
        </div>
      </section>
    </PageShell>
  );
}

export default CasesOverviewPage;
