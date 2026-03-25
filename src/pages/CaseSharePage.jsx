import React from "react";
import { ArrowRight, Orbit, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { getCaseTimelineLabel } from "../utils/caseTimeline";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getCaseDetailRoute, getCaseShareRoute } from "../utils/shareRoutes";

export function CaseSharePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = cases.find((caseItem) => caseItem.id === id);

  if (!item) {
    return <Navigate to="/cases" replace />;
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-[1080px]" data-case-share-layout="share" aria-label="案例分享落地页">
        <div className="overflow-hidden rounded-[var(--radius-hero)] border border-[var(--color-border-muted)] bg-[var(--color-surface-glass)] shadow-[var(--shadow-panel)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <img src={item.hero} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,38,78,0.05)_0%,rgba(8,38,78,0.28)_100%)]" />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/88 px-4 py-2 text-xs tracking-[0.2em] text-[var(--color-accent-primary)] backdrop-blur-xl">
                <Orbit className="h-3.5 w-3.5" />
                分享项目卡
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">案例分享页</div>
              <div className="mt-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-4 py-2 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]">
                {getCaseTimelineLabel(item)}
              </div>
              <h1
                className="mt-4 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.3rem, 5vw, 3.4rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.96,
                }}
              >
                {item.title}
              </h1>
              <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">{item.summary}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <MetaTile label="项目时间" value={item.year} />
                <MetaTile label="行业类型" value={item.industry} />
                <MetaTile label="项目类别" value={item.category} />
                <MetaTile label="公开标签" value={item.subTags.join(" / ")} />
              </div>

              <div className="mt-8 grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-white/80 p-5 shadow-[var(--shadow-panel)]">
                <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">分享提示</div>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  当前页面适合作为客户转发的轻量入口，保留项目摘要、分享和跳转详情的完整链路。
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate(getCaseDetailRoute(item.id))}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-muted)] bg-[var(--color-background-canvas)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
                >
                  进入官网详情
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => shareCurrentPage(`${item.title} 项目卡`, showNotice, getCaseShareRoute(item.id))}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)] transition hover:-translate-y-0.5"
                  style={{ background: "var(--gradient-accent)" }}
                  aria-label="分享项目卡"
                >
                  <Share2 className="h-4 w-4" />
                  分享项目卡
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
