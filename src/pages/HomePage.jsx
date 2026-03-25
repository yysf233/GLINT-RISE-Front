import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageCard } from "../components/common/ImageCard";
import { ProductTile } from "../components/common/ProductTile";
import { ProgressiveBar } from "../components/common/ProgressiveBar";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { getPublicProductFilters, listPublicProducts } from "../services/publicProductsCatalog";
import { readPublicSiteSettings, readPublishedHomeBanners } from "../services/publicSiteContent";
import { ALL_PRODUCT_CATEGORY_LABEL } from "../utils/productSearch";

const HERO_AUTOPLAY_MS = 5200;

function buildSearchUrl(keyword, category) {
  const params = new URLSearchParams({
    keyword,
    category,
    tag: "all",
  });

  return `/search?${params.toString()}`;
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
  const [bannerIndex, setBannerIndex] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);

  const featuredCases = cases.slice(0, 3);
  const featuredProducts = publicProducts.slice(0, 6);
  const heroProduct = featuredProducts[0] ?? publicProducts[0] ?? null;
  const currentBanner = homeBanners[bannerIndex] ?? null;
  const heroVisual = currentBanner?.hero || heroProduct?.hero || "";
  const maxProductIndex = Math.max(featuredProducts.length - 3, 0);
  const visibleProducts = useMemo(
    () => featuredProducts.slice(productIndex, productIndex + 3),
    [featuredProducts, productIndex],
  );

  useEffect(() => {
    if (!searchOptions.includes(searchCategory)) {
      setSearchCategory(searchOptions[0]);
    }
  }, [searchCategory, searchOptions]);

  useEffect(() => {
    if (homeBanners.length <= 1) {
      setBannerIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % homeBanners.length);
    }, HERO_AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [homeBanners.length]);

  useEffect(() => {
    if (bannerIndex >= homeBanners.length) {
      setBannerIndex(0);
    }
  }, [bannerIndex, homeBanners.length]);

  return (
    <PageShell>
      <section data-home-layout="editorial" className="mx-auto max-w-[1600px]">
        <div
          className="relative overflow-hidden rounded-[var(--radius-hero)] px-6 py-6 shadow-[var(--shadow-floating)] md:px-8 md:py-8 xl:px-10"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-[var(--color-accent-soft)] blur-3xl" />
          <div className="absolute -right-10 top-12 h-64 w-64 rounded-full bg-[rgba(0,110,242,0.10)] blur-3xl" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
            <div className="flex flex-col justify-between py-4">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="text-[11px] tracking-[0.34em] text-[var(--color-accent-primary)]">
                    {siteSettings.homeHero.eyebrow}
                  </div>
                  {currentBanner ? (
                    <div
                      className="rounded-[var(--radius-pill)] px-3 py-1 text-[11px] tracking-[0.22em] text-[var(--color-accent-primary)]"
                      style={{ backgroundColor: "var(--color-accent-soft)" }}
                      data-testid="home-hero-banner-title"
                    >
                      {currentBanner.title}
                    </div>
                  ) : null}
                </div>

                <h1
                  className="max-w-4xl text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--font-size-hero)",
                    fontWeight: 800,
                    letterSpacing: "-0.065em",
                    lineHeight: 0.92,
                  }}
                >
                  {siteSettings.brand.name}
                  <br />
                  <span className="text-[var(--color-accent-primary)]">{siteSettings.brand.cnName}</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
                  {siteSettings.homeHero.description}
                </p>
              </div>

              <div className="mt-10 space-y-6">
                <SearchBar
                  value={searchValue}
                  setValue={setSearchValue}
                  category={searchCategory}
                  setCategory={setSearchCategory}
                  onSubmit={() => navigate(buildSearchUrl(searchValue, searchCategory))}
                  options={searchOptions}
                />

                <div className="flex flex-wrap items-center gap-4">
                  {currentBanner ? (
                    <button
                      type="button"
                      onClick={() => navigate(currentBanner.target || "/products")}
                      className="rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)]"
                      style={{ background: "var(--gradient-accent)" }}
                      data-testid="home-hero-banner-target"
                    >
                      查看当前轮播
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate("/cases")}
                    className="rounded-[var(--radius-pill)] px-6 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
                    style={{ backgroundColor: "var(--color-surface-secondary)" }}
                  >
                    浏览案例总览
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  {homeBanners.length > 1 ? (
                    <div className="flex items-center gap-2">
                      {homeBanners.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBannerIndex(index)}
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: index === bannerIndex ? 34 : 12,
                            backgroundColor:
                              index === bannerIndex ? "var(--color-accent-primary)" : "var(--color-surface-muted)",
                          }}
                          aria-label={`切换到轮播 ${index + 1}`}
                          data-testid={`home-hero-banner-dot-${index}`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="text-[11px] tracking-[0.24em] text-[var(--color-text-muted)]">
                    已发布产品 {publicProducts.length} · 当前案例 {featuredCases.length}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative min-h-[440px] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-panel)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <AnimatePresence mode="wait">
                {heroVisual ? (
                  <motion.img
                    key={heroVisual}
                    src={heroVisual}
                    alt="光速上升首页主视觉"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
              </AnimatePresence>
              <div className="absolute inset-0" style={{ background: "var(--gradient-hero-fade)" }} />

              <div
                className="absolute right-5 top-5 rounded-[var(--radius-card)] px-4 py-3 backdrop-blur-md"
                style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
              >
                <div className="text-[10px] tracking-[0.28em] text-[var(--color-text-muted)]">自动轮播</div>
                <div className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{HERO_AUTOPLAY_MS / 1000}s / 轮</div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div
                  className="mb-3 inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]"
                  style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
                >
                  主视觉卡片
                </div>
                <h2
                  className="max-w-xl text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    lineHeight: 0.95,
                  }}
                >
                  {currentBanner?.title || heroProduct?.name || siteSettings.brand.name}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
                  以后端可维护的轮播主视觉作为首页叙事起点，保留搜索、跳转和自动轮播能力。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-[var(--space-section-gap)] max-w-[1600px]">
        <SectionHeading
          eyebrow="精选案例"
          title="案例总览保持策展叙事，但层次切到 Stitch 语言。"
          desc="保留首页案例主图、右侧切换和时间线入口，只把布局切成更轻、更具编辑感的浅底容器。"
          action={
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              查看更多
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />

        <div className="grid gap-8 xl:grid-cols-[0.74fr_1.26fr]">
          <div className="grid gap-4">
            <div className="rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
              <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">当前案例</div>
              <div
                className="mt-3 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                {featuredCases[caseIndex].title}
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{featuredCases[caseIndex].summary}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-[11px] tracking-[0.22em] text-[var(--color-text-muted)]">
                <span>{featuredCases[caseIndex].year}</span>
                <span>{featuredCases[caseIndex].category}</span>
              </div>
            </div>

            <div className="grid gap-3">
              {featuredCases.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCaseIndex(index)}
                  className="rounded-[var(--radius-card)] px-5 py-5 text-left shadow-[var(--shadow-subtle)] transition"
                  style={{ backgroundColor: index === caseIndex ? "var(--color-surface-secondary)" : "var(--color-surface-primary)" }}
                >
                  <div className="text-[10px] tracking-[0.26em] text-[var(--color-text-muted)]">{item.year}</div>
                  <div
                    className="mt-2 text-[var(--color-text-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.45rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.short}</p>
                </button>
              ))}
            </div>
          </div>

          <ImageCard
            image={featuredCases[caseIndex].hero}
            title={featuredCases[caseIndex].title}
            subtitle={featuredCases[caseIndex].summary}
            tag={featuredCases[caseIndex].category}
            className="min-h-[620px]"
            onClick={() => navigate(`/case/${featuredCases[caseIndex].id}`)}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <ProgressiveBar total={featuredCases.length} active={caseIndex} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCaseIndex((current) => (current - 1 + featuredCases.length) % featuredCases.length)}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)]"
              aria-label="查看上一个案例"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCaseIndex((current) => (current + 1) % featuredCases.length)}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)]"
              aria-label="查看下一个案例"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-[var(--space-section-gap)] max-w-[1600px]">
        <SectionHeading
          eyebrow="热门产品"
          title="公开产品列表保留原有逻辑，视觉切到轻量策展矩阵。"
          desc="首页产品区继续读取后台已发布产品，保留产品切换、详情跳转和热门入口，只把卡片语言统一到 Stitch 的浅底蓝系。"
          action={
            <button
              type="button"
              onClick={() => navigate("/products/hot")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              进入热门产品
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />

        <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
            <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">产品策展</div>
            <div
              className="mt-3 text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              以功能完整为前提做高拟真视觉升级。
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              当前首页仍保留产品切换、详情跳转和后台数据同步，只把容器、留白、图片承托与信息层次更新为 Stitch 的浅底蓝系语言。
            </p>
            <div className="mt-6 grid gap-3 text-[11px] tracking-[0.22em] text-[var(--color-text-muted)]">
              <div>已发布产品：{publicProducts.length}</div>
              <div>当前窗口：第 {productIndex + 1} 组</div>
              <div>当前分类入口：{searchCategory}</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((item, index) => (
              <ProductTile key={item.id} item={item} highlight={index === 1} onClick={() => navigate(`/product/${item.id}`)} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <ProgressiveBar total={maxProductIndex + 1} active={productIndex} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProductIndex((current) => Math.max(current - 1, 0))}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)]"
              aria-label="查看上一组产品"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setProductIndex((current) => Math.min(current + 1, maxProductIndex))}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)]"
              aria-label="查看下一组产品"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default HomePage;
