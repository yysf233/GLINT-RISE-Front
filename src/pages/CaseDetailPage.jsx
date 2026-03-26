import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight, Share2, Sparkles } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { cases } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getCaseShareRoute } from "../utils/shareRoutes";

function navigateToSection(sectionId, setActiveSection) {
  setActiveSection(sectionId);
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildFallbackDetail(item) {
  return {
    heroTitle: item.title,
    heroSubtitle: item.summary,
    sidebarTitle: item.title,
    sidebarSubtitle: item.category,
    nav: [
      { id: "case-overview", label: "项目概览" },
      { id: "case-scope", label: "服务范围" },
      { id: "case-stage", label: "执行节点" },
      { id: "case-deliverables", label: "交付成果" },
      { id: "case-results", label: "结果数据" },
    ],
    overview: [
      { label: "项目类型", value: item.category },
      { label: "所属行业", value: item.industry },
      { label: "时间节点", value: item.timelineLabel || item.year },
    ],
    scope: item.subTags ?? [],
    stages: [
      { label: "调研与诊断", value: "2 周" },
      { label: "方案与打样", value: "4 周" },
      { label: "联调与发布", value: "3 周" },
    ],
    deliverables: [
      { title: "主视觉系统", caption: "统一用于首页、案例页与公开分享页" },
      { title: "空间导视物料", caption: "用于展陈、路演与客户汇报场景" },
      { title: "传播与销售资产", caption: "适配销售支持与媒体沟通" },
    ],
    results: [
      { label: "传播一致性", value: "显著提升" },
      { label: "客户反馈", value: "高频正向" },
      { label: "线索转化", value: "+18%" },
    ],
    support: {
      title: "后续支持",
      summary: "支持二次迭代、方案复盘与公开材料联动更新。",
      email: "cases@glint-rise.com",
    },
  };
}

function resolveCaseDetail(item) {
  const fallback = buildFallbackDetail(item);
  const detail = item?.detail && typeof item.detail === "object" ? item.detail : {};

  return {
    ...fallback,
    ...detail,
    heroTitle: detail.heroTitle ?? detail.title ?? fallback.heroTitle,
    heroSubtitle: detail.heroSubtitle ?? fallback.heroSubtitle,
    sidebarTitle: detail.sidebarTitle ?? detail.title ?? fallback.sidebarTitle,
    sidebarSubtitle: detail.sidebarSubtitle ?? fallback.sidebarSubtitle,
    nav: Array.isArray(detail.nav) ? detail.nav : fallback.nav,
    overview: Array.isArray(detail.overview) ? detail.overview : fallback.overview,
    scope: Array.isArray(detail.scope) ? detail.scope : fallback.scope,
    stages: Array.isArray(detail.stages) ? detail.stages : fallback.stages,
    deliverables: Array.isArray(detail.deliverables) ? detail.deliverables : fallback.deliverables,
    results: Array.isArray(detail.results) ? detail.results : fallback.results,
    support: detail.support ?? fallback.support,
  };
}

function DetailSidebar({ item, detail, activeSection, onNavigate }) {
  return (
    <aside
      data-testid="case-detail-sidebar"
      className="rounded-[30px] border border-white/6 bg-[#171717] p-5 shadow-[0_32px_80px_rgba(0,0,0,0.32)] xl:sticky xl:top-6 xl:h-fit"
    >
      <div className="text-xs tracking-[0.18em] text-white/46">统一案例详情模板</div>
      <h1
        className="mt-4 text-white"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          lineHeight: 0.94,
        }}
      >
        {detail.sidebarTitle}
      </h1>
      <div className="mt-2 text-[11px] tracking-[0.24em] text-white/38">{detail.sidebarSubtitle}</div>

      <div className="mt-8 space-y-2">
        {detail.nav.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onNavigate(entry.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left text-sm transition",
              activeSection === entry.id
                ? "border-[#c6cdfd]/30 bg-[#c6cdfd]/12 text-white"
                : "border-white/6 bg-white/[0.02] text-white/62 hover:border-white/12 hover:text-white",
            )}
          >
            <span>{entry.label}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-[22px] border border-white/6 bg-[#111111] p-4">
        <div className="text-[10px] tracking-[0.28em] text-white/34">案例摘要</div>
        <div className="mt-3 text-sm leading-7 text-white/68">{item.short || item.summary}</div>
      </div>
    </aside>
  );
}

export function CaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = cases.find((caseItem) => caseItem.id === id);
  const [activeSection, setActiveSection] = useState("case-overview");

  if (!item) {
    return <Navigate to="/cases" replace />;
  }

  const detail = useMemo(() => resolveCaseDetail(item), [item]);
  const galleryImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.hero].filter(Boolean);

  return (
    <div data-case-detail-layout="industrial-cn" className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto max-w-[1600px] px-5 py-5 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="inline-flex items-center gap-2 text-sm text-white/66 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回案例矩阵
            </button>
            <div className="hidden h-4 w-px bg-white/10 md:block" />
            <div className="text-sm font-semibold text-[#d5dbff]">光速上升案例目录</div>
          </div>

          <button
            type="button"
            onClick={() => shareCurrentPage(item.title, showNotice, getCaseShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
            分享当前案例
          </button>
        </header>

        <div data-testid="case-detail-shell" className="grid gap-6 pt-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <DetailSidebar
            item={item}
            detail={detail}
            activeSection={activeSection}
            onNavigate={(sectionId) => navigateToSection(sectionId, setActiveSection)}
          />

          <main className="space-y-6">
            <section id="case-overview" data-testid="case-detail-hero" className="grid gap-6 xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
              <div className="relative overflow-hidden rounded-[34px] border border-white/6 bg-[#171717] shadow-[0_36px_90px_rgba(0,0,0,0.34)]">
                <img src={galleryImages[0] ?? item.hero} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,9,0.18)_0%,rgba(8,8,9,0.74)_100%)]" />
                <div className="relative flex min-h-[560px] flex-col justify-between p-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] tracking-[0.24em] text-[#d5dbff] backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    {item.eyebrow}
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/46">{item.timelineLabel || item.year}</div>
                    <div
                      className="mt-4 text-white"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2.8rem, 4.8vw, 5rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.06em",
                        lineHeight: 0.92,
                      }}
                    >
                      {detail.heroTitle}
                    </div>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/74">{detail.heroSubtitle}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/6 bg-[#171717] p-7 shadow-[0_36px_90px_rgba(0,0,0,0.28)] md:p-8">
                <div className="text-[11px] tracking-[0.34em] text-[#d5dbff]">项目概览</div>
                <h2
                  className="mt-4 text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.6rem, 4.4vw, 4.6rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.06em",
                    lineHeight: 0.92,
                  }}
                >
                  {item.title}
                </h2>
                <p className="mt-6 text-base leading-8 text-white/70">{item.summary}</p>

                <div className="mt-8 grid gap-4 border-t border-white/6 pt-6 sm:grid-cols-2">
                  {detail.overview.map((entry) => (
                    <div key={entry.label} className="rounded-[20px] border border-white/6 bg-[#111111] p-4">
                      <div className="text-[10px] tracking-[0.26em] text-white/36">{entry.label}</div>
                      <div className="mt-3 text-lg font-semibold text-white">{entry.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {detail.scope.map((label) => (
                    <span key={label} className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/74">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section id="case-scope" data-testid="case-detail-summary-grid" className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,0.58fr)]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  服务范围
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {detail.scope.map((scopeItem) => (
                    <div key={scopeItem} className="rounded-[20px] border border-white/6 bg-[#111111] p-4">
                      <div className="text-sm font-semibold text-white">{scopeItem}</div>
                      <div className="mt-2 text-[12px] leading-6 text-white/46">按照公开展示、销售支持与项目落地三条链路统一组织。</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-white/6 bg-[#171717] shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <img src={galleryImages[1] ?? galleryImages[0] ?? item.hero} alt={`${item.title} 细节画面`} className="aspect-[4/5] w-full object-cover" />
              </div>
            </section>

            <section id="case-stage" data-testid="case-detail-stage-grid" className="grid gap-6 md:grid-cols-3">
              {detail.stages.map((stage, index) => (
                <div key={stage.label} className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                  <div className="text-[10px] tracking-[0.28em] text-[#d5dbff]">执行节点 {String(index + 1).padStart(2, "0")}</div>
                  <div
                    className="mt-4 text-white"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {stage.label}
                  </div>
                  <div className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-white">{stage.value}</div>
                </div>
              ))}
            </section>

            <section id="case-deliverables" data-testid="case-detail-deliverables" className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                交付成果
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {detail.deliverables.map((deliverable) => (
                  <div key={deliverable.title} className="rounded-[20px] border border-white/6 bg-[#111111] p-5">
                    <div className="text-lg font-semibold text-white">{deliverable.title}</div>
                    <p className="mt-3 text-sm leading-7 text-white/58">{deliverable.caption}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="case-results" data-testid="case-detail-results-grid" className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,0.72fr)]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  结果数据
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {detail.results.map((result) => (
                    <div key={result.label} className="rounded-[20px] border border-white/6 bg-[#111111] p-5">
                      <div className="text-[10px] tracking-[0.26em] text-white/36">{result.label}</div>
                      <div className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white">{result.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-white/6 bg-[#171717] shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <img src={galleryImages[2] ?? galleryImages[0] ?? item.hero} alt={`${item.title} 结果展示`} className="aspect-[4/3] w-full object-cover" />
              </div>
            </section>

            <section data-testid="case-detail-support-grid" className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_320px]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {detail.support.title}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/66">{detail.support.summary}</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {detail.nav.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => navigateToSection(entry.id, setActiveSection)}
                      className="flex items-center justify-between rounded-[20px] border border-white/6 bg-[#111111] px-4 py-4 text-left text-sm text-white/74 transition hover:border-white/14 hover:text-white"
                    >
                      <span>{entry.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-white/36" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#1f1f1f] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  联系案例团队
                </div>
                <p className="mt-4 text-sm leading-7 text-white/66">支持案例复盘、二次方案深化与销售材料联动更新。</p>
                <a href={`mailto:${detail.support.email}`} className="mt-8 inline-flex text-sm font-semibold text-[#d5dbff] hover:text-white">
                  {detail.support.email}
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailPage;
