import React, { useRef } from "react";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
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
  const galleryRef = useRef(null);
  const item = cases.find((caseItem) => caseItem.id === id);

  if (!item) {
    return <Navigate to="/cases" replace />;
  }

  const heroImage = item.images[0] ?? item.hero;
  const auxiliaryImages = item.images.slice(1, 4);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]" data-case-detail-layout="editorial">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/cases")}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-white/80 px-4 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--color-text-primary)] shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回案例总览
          </button>

          <button
            type="button"
            onClick={() => shareCurrentPage(item.title, showNotice, getCaseShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5"
            style={{ background: "var(--gradient-accent)" }}
            aria-label="分享当前案例"
          >
            <Share2 className="h-4 w-4" />
            分享当前案例
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-white shadow-[var(--shadow-panel)]">
            <div className="relative aspect-[4/5] lg:aspect-[5/6]">
              <img src={heroImage} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,251,255,0.04)_0%,rgba(8,38,78,0.22)_100%)]" />
              <div className="absolute left-6 top-6 rounded-[var(--radius-pill)] bg-white/88 px-4 py-2 text-[11px] tracking-[0.24em] text-[var(--color-accent-primary)] backdrop-blur-xl">
                {item.eyebrow}
              </div>
              <div className="absolute bottom-6 left-6 right-6 max-w-[420px] rounded-[var(--radius-card)] bg-white/90 p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
                <div className="text-xs tracking-[0.28em] text-[var(--color-text-muted)]">{item.year}</div>
                <div
                  className="mt-3 text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 3vw, 3.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                  }}
                >
                  {item.title}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">案例详情</div>
                <h1
                  className="mt-4 text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                    lineHeight: 0.98,
                  }}
                >
                  {item.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-white/85 px-4 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
              >
                查看辅助图片
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">{item.summary}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetaTile label="客户名称" value={getCaseClientName(item.title)} />
              <MetaTile label="服务机构" value="GLINT RISE" />
              <MetaTile label="项目时间" value={item.year} />
              <MetaTile label="项目地点" value="上海，中国" />
            </div>

            <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/75 p-5">
              <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">项目摘要</div>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                保留原本的案例跳转、分享和图片浏览链路，仅重新组织版式，让主视觉、信息卡与辅助图片区更接近当前公开站的浅底蓝系风格。
              </p>
            </div>

            <div ref={galleryRef} className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">辅助图片</div>
                  <div className="mt-2 text-sm text-[var(--color-text-muted)]">用于补充项目细节、场景氛围与交付质感</div>
                </div>
                <div className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">共 {auxiliaryImages.length} 张</div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {auxiliaryImages.map((image, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white shadow-[var(--shadow-panel)]"
                  >
                    <img src={image} alt={`${item.title} 辅助图片 ${index + 1}`} className="h-52 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
