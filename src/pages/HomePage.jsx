import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Cpu, Globe2, ScanSearch, Share2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../components/common/SearchBar";
import {
  APPLE_CAROUSEL_AUTOPLAY_MS,
  appleCarouselSlideVariants,
  APPLE_CAROUSEL_TRANSITION,
  useAppleStyleCarousel,
} from "../hooks/useAppleStyleCarousel";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { getPublicProductFilters, listPublicProducts } from "../services/publicProductsCatalog";
import { readPublicSiteSettings, readPublishedHomeBanners } from "../services/publicSiteContent";
import { ALL_PRODUCT_CATEGORY_LABEL } from "../utils/productSearch";

const CASE_PRIORITY = ["enterprise-data-synergy", "quantum-security-protocol", "bosideng-aerospace"];
const PRODUCT_ICONS = [Cpu, Shield, ScanSearch, Globe2];
const STORY_METRICS = [
  {
    value: "99.9%",
    label: "稳定性在线率",
    description: "以持续稳定作为交付底线，确保关键系统长时间可靠运行。",
  },
];

function buildSearchUrl(keyword, category) {
  const params = new URLSearchParams({
    keyword,
    category,
    tag: "all",
  });

  return `/search?${params.toString()}`;
}

function getCircularWindow(items, startIndex, size) {
  if (!Array.isArray(items) || items.length === 0 || size <= 0) {
    return [];
  }

  return Array.from({ length: Math.min(size, items.length) }, (_, index) => items[(startIndex + index) % items.length]);
}

function reorderCases(items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const prioritized = CASE_PRIORITY.map((id) => byId.get(id)).filter(Boolean);
  const remaining = items.filter((item) => !CASE_PRIORITY.includes(item.id));
  return [...prioritized, ...remaining];
}

function SectionHeading({ eyebrow, subtitle, title, action }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[10px] tracking-[0.34em] text-white/46 md:text-[11px]">{eyebrow}</div>
        <h2
          className="mt-3 text-[2rem] text-white md:text-[2.4rem] lg:text-[2.85rem]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.94,
          }}
        >
          {title}
        </h2>
        {subtitle ? <div className="mt-2 text-[11px] tracking-[0.22em] text-white/36">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}

function CaseSpotlightCard({ item, layout = "primary", onClick }) {
  if (!item) {
    return null;
  }

  const isPrimary = layout === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[30px] border border-white/6 bg-[#17181d] text-left"
      style={{
        minHeight: isPrimary ? 420 : 420,
        boxShadow: "0 28px 72px rgba(0, 0, 0, 0.26)",
      }}
    >
      <img
        src={item.hero}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,15,0.12)_0%,rgba(10,11,15,0.48)_48%,rgba(10,11,15,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <div className="text-[10px] tracking-[0.26em] text-white/58">{item.category}</div>
        <div
          className="mt-3 text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isPrimary ? "2rem" : "1.8rem",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 0.96,
          }}
        >
          {item.title}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/72">{item.summary}</p>
        <div className="mt-4 inline-flex rounded-full border border-white/16 px-3 py-1 text-[10px] tracking-[0.18em] text-white">
          {item.industry || item.year}
        </div>
      </div>
    </button>
  );
}

function ProductShowcaseCard({ item, icon: Icon, onClick }) {
  if (!item) {
    return null;
  }

  const categoryLabel = item.searchCategory || item.tag || "精选产品";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-[26px] border border-white/6 bg-[#252427] p-4 text-left text-white transition hover:-translate-y-1"
      style={{ boxShadow: "0 24px 56px rgba(0, 0, 0, 0.18)" }}
    >
      <div className="overflow-hidden rounded-[18px] bg-[#101114]">
        <img
          src={item.hero}
          alt={item.name}
          className="aspect-[1/1] w-full object-cover transition duration-700 group-hover:scale-[1.05]"
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div
          className="text-[1.15rem] text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {item.name}
        </div>
        <div className="rounded-full border border-white/12 bg-white/4 p-2 text-[#b8c4ff]">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-white/64">{item.desc}</p>

      <div className="mt-4 flex items-center justify-between text-[10px] tracking-[0.22em] text-white/40">
        <span>{categoryLabel}</span>
        <Share2 className="h-4 w-4 text-[#b8c4ff]" />
      </div>
    </button>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const siteSettings = readPublicSiteSettings();
  const publicProducts = listPublicProducts();
  const homeBanners = readPublishedHomeBanners();
  const { categoryOptions } = getPublicProductFilters(publicProducts);
  const searchOptions = categoryOptions.length > 0 ? categoryOptions : [ALL_PRODUCT_CATEGORY_LABEL];
  const [searchValue, setSearchValue] = useState("");
  const [searchCategory, setSearchCategory] = useState(searchOptions[0]);
  const featuredCases = useMemo(() => reorderCases(cases).slice(0, 4), []);
  const featuredProducts = useMemo(() => publicProducts.slice(0, 8), [publicProducts]);
  const heroCarousel = useAppleStyleCarousel({
    length: homeBanners.length,
    autoplayMs: APPLE_CAROUSEL_AUTOPLAY_MS,
  });
  const productCarousel = useAppleStyleCarousel({
    length: featuredProducts.length,
    autoplayMs: APPLE_CAROUSEL_AUTOPLAY_MS,
  });
  const bannerIndex = homeBanners.length > 0 ? heroCarousel.activeIndex % homeBanners.length : 0;
  const productIndex = featuredProducts.length > 0 ? productCarousel.activeIndex % featuredProducts.length : 0;
  const heroProduct = featuredProducts[0] ?? publicProducts[0] ?? null;
  const currentBanner = homeBanners[bannerIndex] ?? null;
  const heroVisual = currentBanner?.hero || heroProduct?.hero || featuredCases[0]?.hero || "";
  const spotlightCases = useMemo(
    () => getCircularWindow(featuredCases, bannerIndex % Math.max(featuredCases.length, 1), 2),
    [bannerIndex, featuredCases],
  );
  const visibleProducts = useMemo(
    () => getCircularWindow(featuredProducts, productIndex, 4),
    [featuredProducts, productIndex],
  );

  useEffect(() => {
    if (!searchOptions.includes(searchCategory)) {
      setSearchCategory(searchOptions[0]);
    }
  }, [searchCategory, searchOptions]);

  return (
    <PageShell>
      <section data-home-layout="prototype-dark" className="mx-auto max-w-[1600px] text-white">
        <div
          data-testid="home-hero-carousel"
          data-carousel-style="apple-product"
          data-carousel-state={heroCarousel.isPaused ? "paused" : "playing"}
          aria-roledescription="carousel"
          className="relative overflow-hidden rounded-[34px] border border-white/6 bg-[#0f1116] px-6 py-6 md:px-8 lg:px-10 lg:py-8"
          style={{ boxShadow: "0 32px 96px rgba(0, 0, 0, 0.32)" }}
          {...heroCarousel.hoverHandlers}
        >
          <div data-testid="home-hero-carousel-track" className="absolute inset-0">
            <AnimatePresence mode="wait">
              {heroVisual ? (
                <motion.img
                  key={heroVisual}
                  src={heroVisual}
                  alt={siteSettings.brand.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
                  variants={appleCarouselSlideVariants}
                  initial="initial"
                  animate={{ ...appleCarouselSlideVariants.animate, opacity: 0.14 }}
                  exit="exit"
                  transition={APPLE_CAROUSEL_TRANSITION}
                />
              ) : null}
            </AnimatePresence>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_36%,rgba(0,204,255,0.16),transparent_24%),radial-gradient(circle_at_82%_48%,rgba(0,110,242,0.22),transparent_36%),linear-gradient(90deg,rgba(12,14,18,0.98)_0%,rgba(12,14,18,0.9)_45%,rgba(12,14,18,0.76)_64%,rgba(12,14,18,0.94)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(8,9,12,0.56)_0%,rgba(8,9,12,0)_100%)]" />

          <div
            data-testid="home-hero-orb"
            className="pointer-events-none absolute right-[-10%] top-1/2 hidden h-[620px] w-[620px] -translate-y-1/2 rounded-full border border-white/10 lg:block"
            style={{
              background:
                "radial-gradient(circle at center, rgba(116, 204, 255, 0.36) 0%, rgba(116, 204, 255, 0.14) 14%, rgba(116, 204, 255, 0) 36%), repeating-radial-gradient(circle at center, rgba(255,255,255,0.14) 0 2px, transparent 2px 68px)",
              boxShadow: "0 0 120px rgba(67, 183, 255, 0.18)",
            }}
          >
            <div className="absolute inset-[8%] rounded-full border border-white/12" />
            <div className="absolute inset-[18%] rounded-full border border-white/10" />
            <div className="absolute inset-[28%] rounded-full border border-white/8" />
            <div className="absolute inset-[38%] rounded-full border border-white/8" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(135,206,255,0.26)_0%,rgba(135,206,255,0)_34%)]" />
          </div>

          <div className="relative z-10 grid min-h-[680px] items-center lg:grid-cols-[0.78fr_1.22fr]">
            <div className="max-w-[640px] py-12 lg:py-20">
              <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.34em] text-white/60 md:text-[11px]">
                <span>{siteSettings.homeHero.eyebrow || "未来前沿科技"}</span>
                {currentBanner ? (
                  <span
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-white/78"
                    data-testid="home-hero-banner-title"
                  >
                    {currentBanner.title}
                  </span>
                ) : null}
              </div>

              <h1
                className="mt-5 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.4rem, 8vw, 5.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.07em",
                  lineHeight: 0.9,
                }}
              >
                {siteSettings.brand.name}
                <br />
                <span className="text-[#c7d1ff]">{siteSettings.brand.cnName}</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/72 md:text-lg">
                {siteSettings.homeHero.description}
              </p>

              <div className="mt-8 max-w-[640px]">
                <SearchBar
                  value={searchValue}
                  setValue={setSearchValue}
                  category={searchCategory}
                  setCategory={setSearchCategory}
                  onSubmit={() => navigate(buildSearchUrl(searchValue, searchCategory))}
                  options={searchOptions}
                  variant="dark"
                  placeholder="搜索洞察、产品、案例..."
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {currentBanner ? (
                  <button
                    type="button"
                    onClick={() => navigate(currentBanner.target || "/products")}
                    className="rounded-full border border-white/10 bg-[#4453a7] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#5262c2]"
                    data-testid="home-hero-banner-target"
                  >
                    查看专题
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigate("/cases")}
                  className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/78 transition hover:bg-white/10"
                >
                  浏览更多
                </button>

                <div className="flex items-center gap-2">
                  {homeBanners.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => heroCarousel.goTo(index)}
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: index === bannerIndex ? 34 : 11,
                        backgroundColor: index === bannerIndex ? "#c7d1ff" : "rgba(255,255,255,0.18)",
                      }}
                      aria-label={`切换到轮播 ${index + 1}`}
                      data-testid={`home-hero-banner-dot-${index}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-testid="home-case-spotlight"
        data-carousel-style="apple-product"
        className="mx-auto mt-14 max-w-[1600px] border-t border-white/6 pt-14 text-white"
        {...heroCarousel.hoverHandlers}
      >
        <SectionHeading
          eyebrow="公司案例轮播大图"
          subtitle="精选成功案例"
          title="企业数字化与安全升级的高信号成果。"
          action={
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="inline-flex items-center gap-2 text-sm tracking-[0.18em] text-white/72 transition hover:text-white"
            >
              <span>浏览更多</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={spotlightCases.map((item) => item?.id ?? "empty").join(":")}
            className="grid gap-5 lg:grid-cols-[1.42fr_0.98fr]"
            variants={appleCarouselSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={APPLE_CAROUSEL_TRANSITION}
          >
            <CaseSpotlightCard item={spotlightCases[0]} onClick={() => navigate(`/case/${spotlightCases[0].id}`)} />
            <CaseSpotlightCard
              item={spotlightCases[1]}
              layout="secondary"
              onClick={() => navigate(`/case/${spotlightCases[1].id}`)}
            />
          </motion.div>
        </AnimatePresence>
      </section>

      <section
        data-testid="home-product-carousel"
        data-carousel-style="apple-product"
        data-carousel-state={productCarousel.isPaused ? "paused" : "playing"}
        className="mx-auto mt-14 max-w-[1600px] border-t border-white/6 pt-14 text-white"
      >
        <SectionHeading
          eyebrow="库中产品热门推荐轮播"
          subtitle="精选产品生态"
          title="以四卡推荐位展示当前热门产品与技术组件。"
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => productCarousel.prev()}
                disabled={featuredProducts.length <= 1}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/4 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="查看上一组产品"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => productCarousel.next()}
                disabled={featuredProducts.length <= 1}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/4 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="查看下一组产品"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="overflow-hidden" {...productCarousel.hoverHandlers}>
          <AnimatePresence mode="wait">
            <motion.div
              key={visibleProducts.map((item) => item.id).join(":")}
              data-testid="home-product-carousel-track"
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
              variants={appleCarouselSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={APPLE_CAROUSEL_TRANSITION}
            >
              {visibleProducts.map((item, index) => {
                const Icon = PRODUCT_ICONS[index % PRODUCT_ICONS.length];
                return <ProductShowcaseCard key={`${item.id}-${index}`} item={item} icon={Icon} onClick={() => navigate(`/product/${item.id}`)} />;
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-full border border-[#9fb1ff] px-7 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#4453a7]"
          >
            查看完整产品库
          </button>
        </div>
      </section>

      <section data-testid="home-brand-story-grid" className="mx-auto mt-16 max-w-[1600px] border-t border-white/6 py-16 text-white">
        <div className="grid gap-5 lg:grid-cols-[1.9fr_1fr]">
          <article className="relative min-h-[310px] overflow-hidden rounded-[30px] border border-white/6 bg-[#141416]">
            <img
              src={spotlightCases[0]?.hero || heroVisual}
              alt={siteSettings.brand.name}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,14,0.86)_0%,rgba(14,14,14,0.5)_54%,rgba(14,14,14,0.72)_100%)]" />
            <div className="relative z-10 max-w-[560px] p-7 md:p-9">
              <div className="text-[10px] tracking-[0.32em] text-white/58">企业愿景</div>
              <div
                className="mt-4 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.1rem, 4.5vw, 3.3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.94,
                }}
              >
                塑造下一代数字基础设施。
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                我们不仅构建产品，也为下一阶段的全球连接能力搭建可持续的基础设施。
              </p>
            </div>
          </article>

          <article className="rounded-[30px] border border-white/6 bg-[#5866d9] p-7 text-white">
            <div className="grid h-full content-between gap-8">
              <div className="rounded-full border border-white/16 bg-white/10 p-3 w-fit">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  全球覆盖
                </div>
                <p className="mt-3 max-w-xs text-sm leading-7 text-white/82">
                  服务覆盖 40 余个国家，以本地化策略推进数字化升级。
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.76fr_1.24fr]">
          {STORY_METRICS.map((item) => (
            <article key={item.label} className="rounded-[28px] border border-white/6 bg-[#171719] p-7">
              <div
                className="text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                {item.value}
              </div>
              <div className="mt-1 text-[10px] tracking-[0.3em] text-white/52">{item.label}</div>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/68">{item.description}</p>
            </article>
          ))}

          <article className="flex flex-col justify-between gap-8 rounded-[28px] border border-white/6 bg-[#101114] p-7 md:flex-row md:items-center">
            <div>
              <div
                className="text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                与 {siteSettings.brand.name} 携手共建
              </div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/68">
                与创新者和行业伙伴共同构建面向全球规模的韧性数字系统。
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-[0.16em] text-[#101114] transition hover:bg-[#dbe2ff]"
            >
              立即咨询
            </button>
          </article>
        </div>
      </section>
    </PageShell>
  );
}

export default HomePage;
