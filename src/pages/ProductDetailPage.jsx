import React, { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Download, Share2, Shield } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useNotice } from "../context/useNotice";
import { getPublicProductById } from "../services/publicProductsCatalog";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getProductShareRoute } from "../utils/shareRoutes";

function text(value) {
  return String(value ?? "").trim();
}

function readMetaValue(metaEntries, ...labels) {
  const metaMap = new Map(Array.isArray(metaEntries) ? metaEntries : []);
  for (const label of labels) {
    const value = text(metaMap.get(label));
    if (value) {
      return value;
    }
  }

  return "";
}

function navigateToSection(sectionId, setActiveSection) {
  setActiveSection(sectionId);
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function normalizeTierList(value, fallbackRange = "", fallbackPrice = "") {
  const tiers = Array.isArray(value)
    ? value
        .map((entry) => ({
          range: text(entry?.range),
          value: text(entry?.value),
        }))
        .filter((entry) => entry.range && entry.value)
    : [];

  if (tiers.length > 0) {
    return tiers;
  }

  const price = text(fallbackPrice);
  if (!price) {
    return [];
  }

  return [
    {
      range: text(fallbackRange) || "项目参考价",
      value: price,
    },
  ];
}

function readCardValue(cards, ...labels) {
  const entries = Array.isArray(cards) ? cards : [];
  for (const label of labels) {
    const matched = entries.find((entry) => text(entry?.label).includes(label));
    const value = text(matched?.value);
    if (value) {
      return value;
    }
  }

  return "";
}

function buildFallbackDetail(item) {
  const size =
    text(item?.detail?.size) ||
    readMetaValue(item?.meta, "产品尺寸", "尺寸", "封装规格", "规格") ||
    "45mm × 45mm × 4.2mm";
  const material =
    text(item?.detail?.material) ||
    readMetaValue(item?.meta, "材质", "材质体系", "材料") ||
    "单晶硅复合基板";
  const version = text(item?.version) || "企业旗舰版";

  return {
    headerTabs: ["产品", "解决方案", "技术支持", "企业采购"],
    eyebrow: "企业级工业核心",
    heroTitle: item.name,
    heroSubtitle: version,
    sidebarTitle: item.name,
    sidebarSubtitle: item.tag,
    nav: [
      { id: "product-overview", label: "产品总览" },
      { id: "product-basics", label: "基础参数" },
      { id: "product-pricing", label: "供货与定制" },
      { id: "product-tooling", label: "模具与交期" },
      { id: "product-packaging", label: "包装样式" },
    ],
    summaryRows: [
      { label: "产品尺寸", value: size },
      { label: "材质", value: material },
    ],
    primaryActionLabel: "提交询价",
    secondaryActionLabel: "下载资料",
    tooling: {
      title: "模具信息",
      summary: "如涉及开模与专用结构件，可按项目节奏提供对外参考报价与工期。",
      quote: "¥45,000.00",
      leadTime: "21 天",
    },
    stock: {
      title: "现采形式",
      summary: "适用于标准配置的快速对外供货与项目补货。",
      moq: "10 套",
      leadTime: "3-5 个工作日",
      tiers: [
        { range: "10 - 49 套", value: "¥18,900 / 套" },
        { range: "50 - 199 套", value: "¥16,500 / 套" },
        { range: "200+ 套", value: "¥14,200 / 套" },
      ],
    },
    custom: {
      title: "定制形式",
      summary: "适用于品牌联名、工艺调整与项目化结构改造。",
      range: "激光雕刻、时钟校准、封装组件",
      minimum: "500 套",
      leadTime: "45-60 天",
      tiers: [
        { range: "500 - 999 套", value: "¥13,600 / 套" },
        { range: "1000 - 1999 套", value: "¥12,900 / 套" },
        { range: "2000+ 套", value: "¥12,400 / 套" },
      ],
    },
    packaging: {
      title: "标配包装样式",
      summary: "采用企业级托盘与防静电缓冲层，支持整机封签、恒温运输和项目交付资料联装。",
      bullets: ["防静电保护", "密封流转", "恒温控制"],
    },
  };
}

function resolveProductDetail(item) {
  const fallback = buildFallbackDetail(item);
  const detail = item?.detail && typeof item.detail === "object" ? item.detail : {};
  const stock = detail.stock && typeof detail.stock === "object" ? { ...fallback.stock, ...detail.stock } : fallback.stock;
  const custom =
    detail.custom && typeof detail.custom === "object" ? { ...fallback.custom, ...detail.custom } : fallback.custom;
  const tooling =
    detail.tooling && typeof detail.tooling === "object" ? { ...fallback.tooling, ...detail.tooling } : fallback.tooling;
  const packaging =
    detail.packaging && typeof detail.packaging === "object"
      ? { ...fallback.packaging, ...detail.packaging }
      : fallback.packaging;

  return {
    ...fallback,
    ...detail,
    heroTitle: text(detail.heroTitle ?? detail.title) || fallback.heroTitle,
    heroSubtitle: text(detail.heroSubtitle ?? detail.subtitle) || fallback.heroSubtitle,
    sidebarTitle: text(detail.sidebarTitle ?? detail.title) || fallback.sidebarTitle,
    sidebarSubtitle: text(detail.sidebarSubtitle) || fallback.sidebarSubtitle,
    headerTabs: Array.isArray(detail.headerTabs) ? detail.headerTabs : fallback.headerTabs,
    nav: Array.isArray(detail.nav) ? detail.nav : fallback.nav,
    summaryRows: Array.isArray(detail.summaryRows) ? detail.summaryRows : fallback.summaryRows,
    primaryActionLabel: text(detail.primaryActionLabel) || fallback.primaryActionLabel,
    secondaryActionLabel: text(detail.secondaryActionLabel) || fallback.secondaryActionLabel,
    tooling: {
      ...tooling,
      quote: text(tooling.quote) || readCardValue(tooling.cards, "模具费", "模具费用", "模具报价"),
      leadTime: text(tooling.leadTime) || readCardValue(tooling.cards, "模具工期", "标准交期", "工期"),
    },
    stock: {
      ...stock,
      tiers: normalizeTierList(stock.tiers, stock.moq, stock.referencePrice),
    },
    custom: {
      ...custom,
      tiers: normalizeTierList(custom.tiers, custom.minimum, custom.basePrice),
    },
    packaging: {
      ...packaging,
      bullets:
        Array.isArray(packaging.bullets) && packaging.bullets.length > 0 ? packaging.bullets : fallback.packaging.bullets,
    },
  };
}

function DetailSidebar({ item, detail, activeSection, onNavigate }) {
  return (
    <aside
      data-testid="product-detail-sidebar"
      className="rounded-[30px] border border-white/6 bg-[#171717] p-5 shadow-[0_32px_80px_rgba(0,0,0,0.32)] xl:sticky xl:top-6 xl:h-fit"
    >
      <div className="text-xs tracking-[0.18em] text-white/46">统一工业详情模板</div>
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

      <button
        type="button"
        onClick={() => onNavigate("product-pricing")}
        className="mt-10 inline-flex w-full items-center justify-center rounded-[18px] bg-[#c6cdfd] px-4 py-3 text-sm font-semibold tracking-[0.1em] text-[#101320] transition hover:opacity-92"
      >
        提交询价
      </button>

      <div className="mt-8 rounded-[22px] border border-white/6 bg-[#111111] p-4">
        <div className="text-[10px] tracking-[0.28em] text-white/34">当前产品说明</div>
        <div className="mt-3 text-sm leading-7 text-white/68">{item.desc}</div>
      </div>
    </aside>
  );
}

function SectionHeading({ title, eyebrow }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.9rem",
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        {title}
      </div>
      {eyebrow ? <div className="text-[10px] tracking-[0.28em] text-[#d5dbff]">{eyebrow}</div> : null}
    </div>
  );
}

function MetricCard({ label, value, className = "" }) {
  return (
    <div className={cn("rounded-[22px] border border-white/6 bg-[#111111] p-5", className)}>
      <div className="text-[10px] tracking-[0.26em] text-white/36">{label}</div>
      <div className="mt-3 text-xl font-semibold leading-tight text-white">{text(value) || "按项目确认"}</div>
    </div>
  );
}

function PricingCard({ title, summary, fields, tiers, accentClassName = "" }) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]",
        accentClassName,
      )}
    >
      <SectionHeading title={title} eyebrow="对外报价结构" />
      {summary ? <p className="mt-3 text-sm leading-7 text-white/64">{summary}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <MetricCard key={field.label} label={field.label} value={field.value} className={field.className} />
        ))}
      </div>

      <div className="mt-8 border-t border-white/6 pt-6">
        <div className="text-[10px] tracking-[0.28em] text-white/34">阶梯报价（参考价）</div>
        <div className="mt-4 space-y-3">
          {tiers.length > 0 ? (
            tiers.map((tier) => (
              <div
                key={`${tier.range}-${tier.value}`}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-white/6 bg-white/[0.02] px-4 py-3 text-sm"
              >
                <span className="text-white/62">{tier.range}</span>
                <span className="font-semibold text-white">{tier.value}</span>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-3 text-sm text-white/52">
              当前产品未配置阶梯参考价
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = getPublicProductById(id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("product-overview");

  if (!item) {
    return <Navigate to="/products" replace />;
  }

  const galleryImages = Array.isArray(item.thumbs) && item.thumbs.length > 0 ? item.thumbs : [item.hero].filter(Boolean);
  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0] ?? item.hero;
  const detail = useMemo(() => resolveProductDetail(item), [item]);
  const heroFacts = [
    { label: "公开参考价", value: text(item.price) || "待询价" },
    { label: "产品编号", value: text(detail.sku) || text(item.id).toUpperCase() },
    { label: "版本定位", value: text(item.version) || detail.heroSubtitle },
  ];
  const displayMeta = Array.isArray(item.meta)
    ? item.meta
        .map((entry) => (Array.isArray(entry) ? { label: text(entry[0]), value: text(entry[1]) } : null))
        .filter((entry) => entry?.label && entry?.value)
        .slice(0, 4)
    : [];

  return (
    <div data-product-detail-layout="industrial-cn" className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto max-w-[1600px] px-5 py-5 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 text-sm text-white/66 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回产品矩阵
            </button>
            <div className="hidden h-4 w-px bg-white/10 md:block" />
            <div className="text-sm font-semibold text-[#d5dbff]">光速上升工业目录</div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-white/54 lg:flex">
            {detail.headerTabs.map((label, index) => (
              <span key={label} className={index === 0 ? "text-[#d5dbff]" : ""}>
                {label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
            分享当前产品
          </button>
        </header>

        <div data-testid="product-detail-shell" className="grid gap-6 pt-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <DetailSidebar
            item={item}
            detail={detail}
            activeSection={activeSection}
            onNavigate={(sectionId) => navigateToSection(sectionId, setActiveSection)}
          />

          <main className="space-y-6">
            <section id="product-overview" data-testid="product-detail-hero" className="grid gap-6 xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
              <div className="relative overflow-hidden rounded-[34px] border border-white/6 bg-[#161616] shadow-[0_36px_90px_rgba(0,0,0,0.34)]">
                <img src={activeImage} alt={item.name} className="absolute inset-0 h-full w-full object-cover opacity-28" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_24%),linear-gradient(180deg,rgba(8,8,9,0.54)_0%,rgba(8,8,9,0.9)_100%)]" />

                <div className="relative flex min-h-[560px] items-center justify-center p-8">
                  <div className="absolute left-7 top-7 text-[11px] tracking-[0.28em] text-white/38">{detail.heroSubtitle}</div>

                  <div className="relative w-full max-w-[420px] rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,#2b2b2b_0%,#171717_100%)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
                    <div className="absolute inset-[10px] rounded-[22px] border border-white/8" />
                    <div className="absolute inset-x-8 top-4 flex items-center justify-between text-white/28">
                      <span className="h-1.5 w-14 rounded-full bg-white/18" />
                      <span className="h-1.5 w-10 rounded-full bg-white/18" />
                      <span className="h-1.5 w-14 rounded-full bg-white/18" />
                    </div>
                    <div className="relative grid min-h-[360px] place-items-center rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,#d8d8d8_0%,#8f8f8f_100%)] text-[#2a2a2a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                      <div className="text-center">
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "2.6rem",
                            fontWeight: 800,
                            letterSpacing: "-0.05em",
                            lineHeight: 0.94,
                          }}
                        >
                          {detail.heroTitle}
                        </div>
                        <div className="mt-3 text-sm tracking-[0.32em] text-[#464646]">{detail.heroSubtitle}</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-8 bottom-7 flex flex-wrap items-center justify-center gap-3">
                    {galleryImages.map((thumb, index) => (
                      <button
                        key={`${thumb}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={cn(
                          "overflow-hidden rounded-[16px] border transition",
                          activeImageIndex === index ? "border-[#d5dbff]/70 bg-[#d5dbff]/16" : "border-white/10 bg-white/4 hover:border-white/18",
                        )}
                        aria-label={`查看第 ${index + 1} 张产品图`}
                      >
                        <img src={thumb} alt={`${item.name} 缩略图 ${index + 1}`} className="h-14 w-14 object-cover opacity-80" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/6 bg-[#171717] p-7 shadow-[0_36px_90px_rgba(0,0,0,0.28)] md:p-8">
                <div className="text-[11px] tracking-[0.34em] text-[#d5dbff]">{detail.eyebrow}</div>
                <h2
                  className="mt-4 text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3rem, 5vw, 5.2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.06em",
                    lineHeight: 0.9,
                  }}
                >
                  {item.name}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">{item.desc}</p>

                <div className="mt-8 grid gap-4 border-t border-white/6 pt-6 sm:grid-cols-3">
                  {heroFacts.map((fact) => (
                    <MetricCard key={fact.label} label={fact.label} value={fact.value} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigateToSection("product-pricing", setActiveSection)}
                    className="inline-flex items-center justify-center rounded-[18px] bg-[#c6cdfd] px-6 py-4 text-sm font-semibold tracking-[0.1em] text-[#111421] transition hover:opacity-92"
                  >
                    {detail.primaryActionLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToSection("product-packaging", setActiveSection)}
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-[#131313] px-6 py-4 text-sm font-semibold tracking-[0.1em] text-white transition hover:border-white/18"
                  >
                    {detail.secondaryActionLabel}
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section id="product-basics" data-testid="product-detail-basics-grid" className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <SectionHeading title="基础参数" eyebrow="对外展示基础字段" />
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {detail.summaryRows.map((row) => (
                    <MetricCard key={row.label} label={row.label} value={row.value} />
                  ))}
                  <MetricCard label="产品编号" value={text(detail.sku) || text(item.id).toUpperCase()} />
                  <MetricCard label="品牌" value={text(detail.brand) || "GLINT RISE"} />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#1f1f1f] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <SectionHeading title="展示信息" eyebrow="公开页同步标签" />
                <div className="mt-6 space-y-4">
                  {displayMeta.length > 0 ? (
                    displayMeta.map((entry) => (
                      <div key={entry.label} className="border-b border-white/6 pb-4 last:border-b-0 last:pb-0">
                        <div className="text-[10px] tracking-[0.26em] text-white/34">{entry.label}</div>
                        <div className="mt-2 text-sm leading-7 text-white/72">{entry.value}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm leading-7 text-white/60">当前产品暂无附加展示标签。</div>
                  )}
                </div>
              </div>
            </section>

            <section id="product-pricing" data-testid="product-detail-pricing-grid" className="grid gap-6 xl:grid-cols-2">
              <PricingCard
                title={detail.stock.title}
                summary={detail.stock.summary}
                fields={[
                  { label: "对外起订量", value: detail.stock.moq },
                  { label: "对外工期", value: detail.stock.leadTime },
                ]}
                tiers={detail.stock.tiers}
              />

              <PricingCard
                title={detail.custom.title}
                summary={detail.custom.summary}
                accentClassName="bg-[linear-gradient(135deg,#1a1a1a_0%,#252525_100%)]"
                fields={[
                  { label: "产品可定制范围", value: detail.custom.range, className: "sm:col-span-2" },
                  { label: "对外起订量", value: detail.custom.minimum },
                  { label: "对外工期", value: detail.custom.leadTime },
                ]}
                tiers={detail.custom.tiers}
              />
            </section>

            <section id="product-tooling" data-testid="product-detail-tooling-panel" className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-center">
                <div>
                  <SectionHeading title={detail.tooling.title} eyebrow="项目打样与模具参考" />
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66">{detail.tooling.summary}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard label="模具费对外报价（参考价）" value={detail.tooling.quote} />
                  <MetricCard label="模具对外工期（参考工期）" value={detail.tooling.leadTime} />
                </div>
              </div>
            </section>

            <section id="product-packaging" data-testid="product-detail-packaging-panel" className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
              <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-center">
                <div className="overflow-hidden rounded-[22px] border border-white/6 bg-[#111111]">
                  <img src={galleryImages[galleryImages.length - 1] ?? item.hero} alt={`${item.name} 包装示意`} className="aspect-[4/3] w-full object-cover" />
                </div>
                <div>
                  <SectionHeading title={detail.packaging.title} eyebrow="对外标准交付" />
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-white/66">{detail.packaging.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-6">
                    {detail.packaging.bullets.map((bullet) => (
                      <div key={bullet} className="inline-flex items-center gap-2 text-sm text-white/74">
                        <Shield className="h-4 w-4 text-[#d5dbff]" />
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
