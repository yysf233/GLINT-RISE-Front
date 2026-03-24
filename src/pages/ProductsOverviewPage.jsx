import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ProductTile } from "../components/common/ProductTile";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import {
  getPublicProductFilters,
  listPublicProducts,
} from "../services/publicProductsCatalog";
import {
  ALL_PRODUCT_CATEGORY_LABEL,
  ALL_PRODUCT_TAG_LABEL,
  filterProducts,
} from "../utils/productSearch";
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
    () => filterProducts(products, { keyword, category, tag }, { categoryOptions: safeCategoryOptions, tagOptions: safeTagOptions }),
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
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="产品系列"
          title="产品总览"
          desc="保留概览页左大右小的策展布局，只替换为后台已发布产品数据。"
        />

        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          {featuredProduct ? (
            <button
              type="button"
              onClick={() => navigate(`/product/${featuredProduct.id}`)}
              className="group overflow-hidden rounded-[var(--radius-panel)] text-left shadow-[var(--shadow-floating)]"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              <div className="grid h-full gap-0 md:grid-cols-[1.1fr_0.9fr]">
                <div className="min-h-[540px] overflow-hidden bg-[var(--color-surface-muted)]">
                  <img
                    src={featuredProduct.hero}
                    alt={featuredProduct.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-between p-7 md:p-9">
                  <div>
                    <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">旗舰系列</div>
                    <h2
                      className="mt-3 text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "3.2rem",
                        fontWeight: 800,
                        lineHeight: 0.94,
                        letterSpacing: "-0.06em",
                      }}
                    >
                      结构感与精准控制
                    </h2>
                    <div className="mt-8 text-sm tracking-[0.24em] text-[var(--color-text-muted)]">{featuredProduct.shortName}</div>
                    <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">{featuredProduct.desc}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-accent-primary)]">
                    查看详情
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          ) : null}

          <div className="grid gap-6">
            {sideProducts.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className={cn(
                  "group grid overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] md:grid-cols-[180px_1fr]",
                  index === 1 ? "md:translate-x-8" : "",
                )}
                style={{ backgroundColor: "var(--color-surface-primary)" }}
              >
                <div className="h-full overflow-hidden bg-[var(--color-surface-muted)]">
                  <img
                    src={item.hero}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
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
              <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">热门产品入口</div>
              <div
                className="mt-2 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                点击查看完整热门列表
              </div>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="产品筛选结果区" className="mt-[var(--space-section-gap)]">
        <SectionHeading
          eyebrow="筛选结果区"
          title="可筛选产品列表"
          desc="保留上半段策展结构，在下半段补充面向访问者的产品搜索、分类与标签筛选结果区。"
          right={
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setCategory(safeCategoryOptions[0]);
                setTag(safeTagOptions[0]);
              }}
              className="rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              清空条件
            </button>
          }
        />

        <SearchBar
          value={keyword}
          setValue={setKeyword}
          category={category}
          setCategory={setCategory}
          onSubmit={() => {}}
          options={safeCategoryOptions}
        />

        <div
          className="mt-8 rounded-[var(--radius-card)] p-6"
          style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">标签筛选</div>
          <div className="mt-5 flex flex-wrap gap-3">
            {safeTagOptions.map((item) => (
              <Badge key={item} active={tag === item} onClick={() => setTag(item)}>
                {item}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div className="text-[var(--color-text-secondary)]">
              共找到 <span className="text-[var(--color-accent-primary)]">{filteredProducts.length}</span> 个产品结果
            </div>
            <div className="text-[var(--color-text-muted)]">
              分类：{category} · 标签：{tag}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((item) => (
              <ProductTile key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} />
            ))}
          </div>
        ) : (
          <div
            className="mt-8 rounded-[var(--radius-card)] p-8"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
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
              可以尝试放宽分类或标签条件，或直接切换到热门产品继续浏览。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setCategory(safeCategoryOptions[0]);
                  setTag(safeTagOptions[0]);
                }}
                className="rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
              >
                重置筛选
              </button>
              <button
                type="button"
                onClick={() => navigate("/products/hot")}
                className="rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold tracking-[0.18em] text-[var(--color-text-on-accent)]"
                style={{ background: "var(--gradient-accent)" }}
              >
                前往热门产品
              </button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
