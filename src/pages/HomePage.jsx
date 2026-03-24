import React, { useEffect, useMemo, useState } from "react";
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
import { ALL_PRODUCT_CATEGORY_LABEL } from "../utils/productSearch";

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
  const publicProducts = listPublicProducts();
  const { categoryOptions } = getPublicProductFilters(publicProducts);
  const searchOptions = categoryOptions.length > 0 ? categoryOptions : [ALL_PRODUCT_CATEGORY_LABEL];
  const [searchValue, setSearchValue] = useState("");
  const [searchCategory, setSearchCategory] = useState(searchOptions[0]);
  const [caseIndex, setCaseIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);

  const featuredCases = cases.slice(0, 3);
  const featuredProducts = publicProducts.slice(0, 6);
  const heroProduct = featuredProducts[0] ?? publicProducts[0] ?? null;
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

  return (
    <PageShell>
      <section
        className="relative overflow-hidden rounded-[var(--radius-hero)] px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-16 xl:px-14 xl:pt-20"
        style={{ backgroundColor: "var(--color-background-canvas)" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-hero)]">
          {heroProduct ? (
            <img
              src={heroProduct.hero}
              alt="光速上升首页主视觉"
              className="h-full w-full object-cover opacity-35"
            />
          ) : null}
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero-fade)" }} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="mb-4 text-xs tracking-[0.32em] text-[var(--color-accent-primary)]">策展型品牌前端</div>
          <h1
            className="text-[var(--color-text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--font-size-hero)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 0.92,
            }}
          >
            GLINT RISE
            <br />
            <span className="text-[var(--color-accent-primary)]">光速上升</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
            保留品牌优先、搜索在前、案例与热门产品并行展示的首页结构，同时让后台已发布产品可以直接驱动首页推荐与搜索入口。
          </p>
          <div className="mt-10">
            <SearchBar
              value={searchValue}
              setValue={setSearchValue}
              category={searchCategory}
              setCategory={setSearchCategory}
              onSubmit={() => navigate(buildSearchUrl(searchValue, searchCategory))}
              options={searchOptions}
            />
          </div>
        </div>
      </section>

      <section className="mt-[var(--space-section-gap)]">
        <SectionHeading
          eyebrow="精选案例"
          title="案例轮播大图"
          desc="保留首页案例主图与右侧卡片列表的浏览节奏。"
          action={
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-[var(--color-accent-primary)]"
            >
              查看更多
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />

        <div className="relative">
          <div className="grid gap-8 lg:grid-cols-[1.65fr_0.85fr]">
            <ImageCard
              image={featuredCases[caseIndex].hero}
              title={featuredCases[caseIndex].title}
              subtitle={featuredCases[caseIndex].summary}
              tag={featuredCases[caseIndex].category}
              className="min-h-[520px]"
              onClick={() => navigate(`/case/${featuredCases[caseIndex].id}`)}
            />

            <div className="grid grid-rows-3 gap-4">
              {featuredCases.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCaseIndex(index)}
                  className="overflow-hidden rounded-[var(--radius-tile)] p-5 text-left transition"
                  style={{
                    backgroundColor:
                      index === caseIndex ? "var(--color-surface-secondary)" : "var(--color-surface-primary)",
                    boxShadow: "var(--shadow-panel)",
                  }}
                >
                  <div className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">{item.year}</div>
                  <div
                    className="mt-3 text-[var(--color-text-primary)]"
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

          <div className="mt-6 flex items-center justify-between">
            <ProgressiveBar total={featuredCases.length} active={caseIndex} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCaseIndex((current) => (current - 1 + featuredCases.length) % featuredCases.length)}
                className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
                aria-label="查看上一个案例"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCaseIndex((current) => (current + 1) % featuredCases.length)}
                className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
                aria-label="查看下一个案例"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[var(--space-section-gap)]">
        <SectionHeading
          eyebrow="热门产品"
          title="产品策展矩阵"
          desc="首页产品区直接读取后台已发布产品，保持推荐卡片与后续产品总览一致。"
          action={
            <button
              type="button"
              onClick={() => navigate("/products/hot")}
              className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-[var(--color-accent-primary)]"
            >
              进入热门产品
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {visibleProducts.map((item, index) => (
            <ProductTile
              key={item.id}
              item={item}
              highlight={index === 1}
              onClick={() => navigate(`/product/${item.id}`)}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <ProgressiveBar total={maxProductIndex + 1} active={productIndex} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProductIndex((current) => Math.max(current - 1, 0))}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
              aria-label="查看上一组产品"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setProductIndex((current) => Math.min(current + 1, maxProductIndex))}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
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
