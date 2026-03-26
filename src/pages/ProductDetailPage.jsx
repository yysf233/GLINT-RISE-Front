import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  Cpu,
  Download,
  FileText,
  Package,
  ScanSearch,
  Share2,
  Shield,
  Truck,
  Wrench,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useNotice } from "../context/useNotice";
import { getPublicProductById } from "../services/publicProductsCatalog";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getProductShareRoute } from "../utils/shareRoutes";

const PRODUCT_DETAIL_ICON_MAP = {
  cpu: Cpu,
  shield: Shield,
  scan: ScanSearch,
  tooling: Wrench,
  package: Package,
  logistics: Truck,
  document: FileText,
  boxes: Boxes,
};

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

function getIconComponent(icon) {
  return PRODUCT_DETAIL_ICON_MAP[icon] ?? Cpu;
}

function navigateToSection(sectionId, setActiveSection) {
  setActiveSection(sectionId);
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildFallbackDetail(item) {
  const size =
    text(item?.detail?.size) ||
    readMetaValue(item?.meta, "尺寸", "封装规格", "规格") ||
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
      { id: "product-overview", label: "产品概览" },
      { id: "product-specs", label: "商品参数" },
      { id: "product-supply", label: "供应方案" },
      { id: "product-packaging", label: "包装形式" },
      { id: "product-support", label: "企业支持" },
    ],
    summaryRows: [
      { label: "尺寸", value: size },
      { label: "材质", value: material },
    ],
    primaryActionLabel: "立即配置",
    secondaryActionLabel: "下载资料",
    capabilityItems: [
      { icon: "cpu", label: "算力调度", value: "跨场景稳定分配" },
      { icon: "shield", label: "安全隔离", value: "核心链路分层保护" },
      { icon: "scan", label: "热域监测", value: "实时校准温控策略" },
      { icon: "tooling", label: "模组维护", value: "面向企业长期迭代" },
      { icon: "package", label: "封装一致性", value: "适配量产交付规范" },
      { icon: "logistics", label: "部署运输", value: "支持整批次发货" },
    ],
    specTableTitle: "商品参数",
    specTableBadge: "技术细节",
    specTableRows: [
      { label: "产品编号", value: text(item?.detail?.sku) || text(item?.id).toUpperCase() },
      { label: "品牌", value: text(item?.detail?.brand) || "GLINT RISE" },
      { label: "价格区间", value: text(item?.detail?.priceRange) || text(item?.price) || "待询价" },
      { label: "峰值频率", value: text(item?.detail?.capacity) || "5.4 GHz 稳态调度" },
      { label: "热设计功耗", value: text(item?.detail?.tdp) || "170W" },
      { label: "核心 / 线程", value: text(item?.detail?.coreCount) || "16 / 32" },
    ],
    tooling: {
      title: "模具信息",
      summary: "适配高一致性量产工艺与企业级交付节奏。",
      cards: [
        { label: "模具费用", value: "¥45,000.00" },
        { label: "标准交期", value: "21 天" },
      ],
    },
    stock: {
      title: "现货形式",
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
      range: "激光雕刻、时钟校准、封装组件",
      minimum: "500 套",
      leadTime: "45-60 天",
      basePrice: "¥12,400 / 套起",
    },
    packaging: {
      title: "包装形式",
      summary: "采用企业级托盘与防静电缓冲层，支持整机封签、恒温运输和项目交付资料联装。",
      bullets: ["防静电保护", "密封流转", "恒温控制"],
    },
    documents: [
      { icon: "document", title: "产品手册.pdf", caption: "部署与维护说明" },
      { icon: "shield", title: "合规证书.pdf", caption: "材料与安全说明" },
      { icon: "boxes", title: "封装模型.step", caption: "装配结构参考" },
    ],
    supportLinks: ["部署门户", "接口对接指南", "固件更新说明"],
    sales: {
      title: "企业采购",
      summary: "支持批量采购、项目排产与物流协同，适合企业级长期部署计划。",
      email: "solutions@glint-rise.com",
    },
  };
}

function resolveProductDetail(item) {
  const fallback = buildFallbackDetail(item);
  const detail = item?.detail && typeof item.detail === "object" ? item.detail : {};

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
    capabilityItems: Array.isArray(detail.capabilityItems) ? detail.capabilityItems : fallback.capabilityItems,
    specTableRows: Array.isArray(detail.specTableRows) ? detail.specTableRows : fallback.specTableRows,
    tooling: detail.tooling ?? fallback.tooling,
    stock: detail.stock ?? fallback.stock,
    custom: detail.custom ?? fallback.custom,
    packaging: detail.packaging ?? fallback.packaging,
    documents: Array.isArray(detail.documents) ? detail.documents : fallback.documents,
    supportLinks: Array.isArray(detail.supportLinks) ? detail.supportLinks : fallback.supportLinks,
    sales: detail.sales ?? fallback.sales,
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
        onClick={() => onNavigate("product-support")}
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

function CapabilityCard({ item }) {
  const Icon = getIconComponent(item.icon);

  return (
    <div className="rounded-[22px] border border-white/6 bg-[#181818] p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.16)]">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-[16px] bg-[#c6cdfd]/12 text-[#c6cdfd]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-semibold text-white">{item.label}</div>
      <div className="mt-2 text-[11px] leading-6 text-white/48">{item.value}</div>
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
            <section id="product-overview" data-testid="product-detail-hero" className="grid gap-6 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
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

                <div className="mt-8 grid gap-6 border-t border-white/6 pt-6 sm:grid-cols-2">
                  {detail.summaryRows.map((row) => (
                    <div key={row.label}>
                      <div className="text-[10px] tracking-[0.26em] text-white/36">{row.label}</div>
                      <div className="mt-2 text-xl font-semibold text-white">{row.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigateToSection("product-support", setActiveSection)}
                    className="inline-flex items-center justify-center rounded-[18px] bg-[#c6cdfd] px-6 py-4 text-sm font-semibold tracking-[0.1em] text-[#111421] transition hover:opacity-92"
                  >
                    {detail.primaryActionLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToSection("product-support", setActiveSection)}
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-[#131313] px-6 py-4 text-sm font-semibold tracking-[0.1em] text-white transition hover:border-white/18"
                  >
                    {detail.secondaryActionLabel}
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section data-testid="product-detail-capability-strip" className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {detail.capabilityItems.map((capability) => (
                <CapabilityCard key={capability.label} item={capability} />
              ))}
            </section>

            <section id="product-specs" data-testid="product-detail-spec-grid" className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_320px]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between gap-3">
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.9rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {detail.specTableTitle}
                  </div>
                  <div className="text-[10px] tracking-[0.28em] text-[#d5dbff]">{detail.specTableBadge}</div>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {detail.specTableRows.map((row) => (
                    <div key={row.label} className="border-b border-white/6 pb-4">
                      <div className="text-[10px] tracking-[0.26em] text-white/34">{row.label}</div>
                      <div className="mt-2 text-lg font-semibold text-white">{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#202020] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {detail.tooling.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">{detail.tooling.summary}</p>

                <div className="mt-6 space-y-4">
                  {detail.tooling.cards.map((card) => (
                    <div key={card.label} className="rounded-[18px] bg-[#111111] p-4">
                      <div className="text-[10px] tracking-[0.26em] text-white/36">{card.label}</div>
                      <div className="mt-2 text-2xl font-bold text-white">{card.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="product-supply" data-testid="product-detail-supply-grid" className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {detail.stock.title}
                </div>
                <div className="mt-6 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/36">起订量</div>
                    <div className="mt-2 text-lg font-semibold text-white">{detail.stock.moq}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/36">交付周期</div>
                    <div className="mt-2 text-lg font-semibold text-white">{detail.stock.leadTime}</div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-white/6 pt-6">
                  {detail.stock.tiers.map((tier) => (
                    <div key={tier.range} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-white/62">{tier.range}</span>
                      <span className="font-semibold text-white">{tier.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[linear-gradient(135deg,#1a1a1a_0%,#252525_100%)] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {detail.custom.title}
                </div>
                <div className="mt-8 grid gap-5 text-sm text-white/68 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/36">定制范围</div>
                    <div className="mt-2 text-base font-semibold text-white">{detail.custom.range}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/36">最低起订</div>
                    <div className="mt-2 text-base font-semibold text-white">{detail.custom.minimum}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-white/36">交付周期</div>
                    <div className="mt-2 text-base font-semibold text-white">{detail.custom.leadTime}</div>
                  </div>
                </div>

                <div className="mt-10 rounded-[22px] border border-white/6 bg-[#111111] p-5">
                  <div className="text-[10px] tracking-[0.26em] text-white/36">定制参考价</div>
                  <div className="mt-2 text-4xl font-bold tracking-[-0.04em] text-white">{detail.custom.basePrice}</div>
                </div>
              </div>
            </section>

            <section id="product-packaging" data-testid="product-detail-packaging-panel" className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
              <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-center">
                <div className="overflow-hidden rounded-[22px] border border-white/6 bg-[#111111]">
                  <img src={galleryImages[galleryImages.length - 1] ?? item.hero} alt={`${item.name} 包装示意`} className="aspect-[4/3] w-full object-cover" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {detail.packaging.title}
                  </div>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">{detail.packaging.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-6">
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

            <section id="product-support" data-testid="product-detail-support-grid" className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.7fr)_320px]">
              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  资料与合规
                </div>
                <div className="mt-6 space-y-3">
                  {detail.documents.map((document) => {
                    const Icon = getIconComponent(document.icon);

                    return (
                      <button
                        key={document.title}
                        type="button"
                        className="flex w-full items-center justify-between rounded-[18px] border border-white/6 bg-[#111111] px-4 py-3 text-left transition hover:border-white/14"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#d5dbff]/12 text-[#d5dbff]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{document.title}</div>
                            <div className="mt-1 text-[11px] text-white/42">{document.caption}</div>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-white/36" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/6 bg-[#171717] p-7 shadow-[0_28px_72px_rgba(0,0,0,0.2)]">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  企业支持
                </div>
                <div className="mt-6 space-y-4">
                  {detail.supportLinks.map((link) => (
                    <div key={link} className="flex items-center justify-between border-b border-white/6 pb-4 text-sm text-white/70 last:border-b-0 last:pb-0">
                      <span>{link}</span>
                      <ChevronRight className="h-4 w-4 text-white/36" />
                    </div>
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
                  {detail.sales.title}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/66">{detail.sales.summary}</p>
                <a href={`mailto:${detail.sales.email}`} className="mt-8 inline-flex text-sm font-semibold text-[#d5dbff] hover:text-white">
                  {detail.sales.email}
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
