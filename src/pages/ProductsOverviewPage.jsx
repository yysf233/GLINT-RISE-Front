import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ProductTile } from "../components/common/ProductTile";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { getPublicProductFilters, listPublicProducts } from "../services/publicProductsCatalog";
import { ALL_PRODUCT_CATEGORY_LABEL, ALL_PRODUCT_TAG_LABEL, filterProducts } from "../utils/productSearch";
import { cn } from "../utils/cn";

export function ProductsOverviewPage() {
  const navigate = useNavigate();
  const products = listPublicProducts();
  const { categoryOptions, tagOptions } = getPublicProductFilters(products);
  const safeCategoryOptions = categoryOptions.length > 0 ? categoryOptions : [ALL_PRODUCT_CATEGORY_LABEL];
  const safeTagOptions = tagOptions.length > 0 ? tagOptions : [ALL_PRODUCT_TAG_LABEL];
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(safeCategoryOptions[0]);
  const [tag, setTag] = useState(safeTagOptions[0]);
  const filteredProducts = useMemo(
    () =>
      filterProducts(
        products,
        { keyword, category, tag },
        { categoryOptions: safeCategoryOptions, tagOptions: safeTagOptions },
      ),
    [category, keyword, products, safeCategoryOptions, safeTagOptions, tag],
  );
  const featuredProduct = products[1] ?? products[0] ?? null;
  const sideProducts = products.slice(2, 5);

  useEffect(() => {
    if (!safeCategoryOptions.includes(category)) {
      setCategory(safeCategoryOptions[0]);
    }
  }, [category, safeCategoryOptions]);

  useEffect(() => {
    if (!safeTagOptions.includes(tag)) {
      setTag(safeTagOptions[0]);
    }
  }, [safeTagOptions, tag]);

  return (
    <PageShell>
      <section data-products-layout="curated" className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="产品系列"
          title="产品总览先做策展陈列，再进入筛选结果。"
          desc="保留产品概览页首屏策展区和下半段筛选结果区，把原来的深色展示切换成更接近 Stitch 原型的浅底蓝系策展布局。"
        />

        <div className="grid gap-8 xl:grid-cols-[1.22fr_0.78fr]">
          {featuredProduct ? (
            <button
              type="button"
              onClick={() => navigate(`/product/${featuredProduct.id}`)}
              className="group overflow-hidden rounded-[var(--radius-panel)] text-left shadow-[var(--shadow-floating)]"
              style={{ background: "var(--gradient-card)" }}
            >
              <div className="grid h-full gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="min-h-[620px] overflow-hidden bg-[var(--color-surface-muted)]">
                  <img
                    src={featuredProduct.hero}
                    alt={featuredProduct.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-between p-7 md:p-9">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">精选旗舰</div>
                    <h2
                      className="mt-4 text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2.6rem, 5vw, 4rem)",
                        fontWeight: 800,
                        lineHeight: 0.94,
                        letterSpacing: "-0.06em",
                      }}
                    >
                      {featuredProduct.name}
                    </h2>
                    <div
                      className="mt-6 inline-flex rounded-[var(--radius-pill)] px-4 py-2 text-[11px] tracking-[0.2em] text-[var(--color-accent-primary)]"
                      style={{ backgroundColor: "var(--color-accent-soft)" }}
                    >
                      {featuredProduct.tag}
                    </div>
                    <p className="mt-6 text-sm leading-7 text-[var(--color-text-secondary)]">{featuredProduct.desc}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[11px] tracking-[0.22em] text-[var(--color-text-muted)]">{featuredProduct.shortName}</div>
                    <div className="inline-flex items-center gap-2 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]">
                      查看详情
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ) : null}

          <div className="grid gap-5">
            {sideProducts.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className={cn(
                  "group grid overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] lg:grid-cols-[180px_1fr]",
                  index === 1 ? "lg:translate-x-8" : "",
                )}
                style={{ background: "var(--gradient-card)" }}
              >
                <div className="h-full overflow-hidden bg-[var(--color-surface-muted)]">
                  <img src={item.hero} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] tracking-[0.26em] text-[var(--color-accent-primary)]">
                    {String(index + 2).padStart(2, "0")}
                  </div>
                  <div
                    className="mt-2 text-[var(--color-text-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.7rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {item.shortName}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigate("/products/hot")}
              className="rounded-[var(--radius-card)] px-7 py-8 text-left shadow-[var(--shadow-panel)]"
              style={{ background: "var(--gradient-accent-muted)" }}
            >
              <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">热门入口</div>
              <div
                className="mt-3 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                进入热门产品列表
              </div>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="产品筛选结果区" className="mx-auto mt-[var(--space-section-gap)] max-w-[1600px]">
        <SectionHeading
          eyebrow="筛选结果区"
          title="保留当前业务筛选能力，只把结构改成 Stitch 的轻层次结果区。"
          desc="URL 参数、分类筛选、标签筛选和产品跳转逻辑都不变，筛选后仍然可以直接进入产品详情和热门页。"
          right={
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setCategory(safeCategoryOptions[0]);
                setTag(safeTagOptions[0]);
              }}
              className="rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              清空条件
            </button>
          }
        />

        <div className="rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
          <SearchBar
            value={keyword}
            setValue={setKeyword}
            category={category}
            setCategory={setCategory}
            onSubmit={() => {}}
            options={safeCategoryOptions}
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
            <div className="rounded-[var(--radius-card)] p-5" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
              <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">标签筛选</div>
              <div className="mt-5 flex flex-wrap gap-3">
                {safeTagOptions.map((item) => (
                  <Badge key={item} active={tag === item} onClick={() => setTag(item)}>
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="mt-8 grid gap-3 text-sm text-[var(--color-text-secondary)]">
                <div>
                  共找到 <span className="text-[var(--color-accent-primary)]">{filteredProducts.length}</span> 个产品结果
                </div>
                <div className="text-[var(--color-text-muted)]">分类：{category}</div>
                <div className="text-[var(--color-text-muted)]">标签：{tag}</div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((item) => (
                  <ProductTile key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} />
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-card)] p-8" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                <div
                  className="text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  暂无匹配产品
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
                  可以尝试放宽分类或标签条件，或者直接切换到热门产品继续浏览。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("");
                      setCategory(safeCategoryOptions[0]);
                      setTag(safeTagOptions[0]);
                    }}
                    className="rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
                    style={{ backgroundColor: "var(--color-surface-primary)" }}
                  >
                    重置筛选
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/products/hot")}
                    className="rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)]"
                    style={{ background: "var(--gradient-accent)" }}
                  >
                    前往热门产品
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default ProductsOverviewPage;
