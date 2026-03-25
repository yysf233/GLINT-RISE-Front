import React from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getCaseShareRoute } from "../utils/shareRoutes";

function getCaseClientName(title) {
  return title.split(/[×：]/)[0].trim();
}

export function CaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = cases.find((caseItem) => caseItem.id === id);

  if (!item) {
    return <Navigate to="/cases" replace />;
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px] text-white" data-case-detail-layout="prototype-dark">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/cases")}
            className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-white/62 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回案例总览
          </button>

          <button
            type="button"
            onClick={() => shareCurrentPage(item.title, showNotice, getCaseShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
            aria-label="分享当前案例"
          >
            <Share2 className="h-4 w-4" />
            分享当前案例
          </button>
        </div>

        <header data-testid="case-detail-header" className="mb-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div className="max-w-4xl">
            <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">{item.timelineLabel || item.year}</div>
            <h1
              className="mt-5 text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.4rem, 8vw, 6rem)",
                fontWeight: 800,
                letterSpacing: "-0.07em",
                lineHeight: 0.9,
              }}
            >
              {item.title.split("×").map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  {index > 0 ? <><br />× </> : null}
                  {part.trim()}
                </React.Fragment>
              ))}
            </h1>
            <div className="mt-8 h-px w-24 bg-[#bac3ff]/30" />
            <p className="mt-8 max-w-3xl text-lg leading-9 text-white/68">{item.summary}</p>
          </div>

          <div className="space-y-6 lg:text-right">
            <div>
              <div className="text-[10px] tracking-[0.28em] text-white/34">行业领域</div>
              <div className="mt-2 text-sm text-white">{item.industry}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const anchor = document.getElementById("case-detail-film-panel");
                anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-[#bac3ff]"
            >
              进入视觉档案
            </button>
          </div>
        </header>

        <div className="space-y-12">
          <div className="relative overflow-hidden rounded-[30px] border border-white/6 bg-[#1c1b1b]" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}>
            <img src={item.images[0] ?? item.hero} alt={item.title} className="aspect-[21/9] w-full object-cover grayscale transition duration-700 hover:grayscale-0" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,15,0)_0%,rgba(10,11,15,0.62)_100%)]" />
            <div className="absolute bottom-7 left-7 text-[10px] tracking-[0.3em] text-white/40">视觉档案 01 // 主视觉</div>
          </div>

          <div data-testid="case-detail-showcase-grid" className="grid gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(300px,0.38fr)]">
            <div className="overflow-hidden rounded-[28px] border border-white/6 bg-[#1c1b1b]" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.18)" }}>
              <img src={item.images[1] ?? item.images[0] ?? item.hero} alt={`${item.title} 视觉细节`} className="aspect-[4/5] w-full object-cover grayscale transition duration-700 hover:grayscale-0" />
            </div>

            <div className="space-y-8 lg:pt-10">
              <div className="rounded-[28px] border border-white/6 bg-[#1c1b1b] p-7">
                <div
                  className="text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  材质完整性
                </div>
                <p className="mt-4 text-sm leading-7 text-white/68">{item.short || item.summary}</p>
                <div className="mt-8 overflow-hidden rounded-[24px] bg-[#101114]">
                  <img src={item.images[2] ?? item.images[1] ?? item.hero} alt={`${item.title} 补充画面`} className="aspect-square w-full object-cover opacity-70" />
                </div>
                <div className="mt-6 border-l-2 border-[#bac3ff]/24 pl-5 text-sm italic leading-7 text-white/46">
                  “每个案例都被视作一套空间叙事系统，而不只是平面的传播素材。”
                </div>
              </div>
            </div>
          </div>

          <div
            id="case-detail-film-panel"
            data-testid="case-detail-film-panel"
            className="relative overflow-hidden rounded-[30px] border border-white/6 bg-[#1c1b1b]"
          >
            <img src={item.images[3] ?? item.images[0] ?? item.hero} alt={`${item.title} 终稿视觉`} className="aspect-[16/7] w-full object-cover grayscale brightness-75" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/6 backdrop-blur-md">
                  <span className="text-lg text-white">▶</span>
                </div>
                <div className="mt-4 text-[10px] tracking-[0.28em] text-white/52">观看项目短片</div>
              </div>
            </div>
          </div>
        </div>

        <div data-testid="case-detail-meta-grid" className="mt-16 grid gap-4 border-t border-white/6 pt-10 sm:grid-cols-2 xl:grid-cols-4">
          <MetaTile label="客户名称" value={getCaseClientName(item.title)} variant="prototype-dark" />
          <MetaTile label="服务机构" value="GLINT RISE" variant="prototype-dark" />
          <MetaTile label="项目时间" value={item.year} variant="prototype-dark" />
          <MetaTile label="项目地点" value="上海，中国" variant="prototype-dark" />
        </div>
      </section>
    </PageShell>
  );
}

export default CaseDetailPage;
