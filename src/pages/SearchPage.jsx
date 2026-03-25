import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ProductTile } from "../components/common/ProductTile";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { getPublicProductFilters, listPublicProducts } from "../services/publicProductsCatalog";
import {
  ALL_PRODUCT_CATEGORY_LABEL,
  ALL_PRODUCT_TAG_LABEL,
  filterProducts,
  normalizeProductSearchCategory,
  normalizeProductSearchTag,
} from "../utils/productSearch";

function buildSearchParams(nextState) {
  const params = new URLSearchParams();
  Object.entries(nextState).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params;
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = listPublicProducts();
  const { categoryOptions, tagOptions } = getPublicProductFilters(products);
  const safeCategoryOptions = categoryOptions.length > 0 ? categoryOptions : [ALL_PRODUCT_CATEGORY_LABEL];
  const safeTagOptions = tagOptions.length > 0 ? tagOptions : [ALL_PRODUCT_TAG_LABEL];

  const keyword = searchParams.get("keyword") ?? "";
  const category = normalizeProductSearchCategory(searchParams.get("category"), safeCategoryOptions);
  const tag = normalizeProductSearchTag(searchParams.get("tag"), safeTagOptions);

  const syncParams = (changes) => {
    const nextState = { keyword, category, tag, ...changes };
    setSearchParams(buildSearchParams(nextState), { replace: true });
  };

  const results = useMemo(
    () => filterProducts(products, { keyword, category, tag }, { categoryOptions: safeCategoryOptions, tagOptions: safeTagOptions }),
    [category, keyword, products, safeCategoryOptions, safeTagOptions, tag],
  );

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="产品搜索"
          title="搜索结果页改成高密度策展布局，但继续同步 URL 参数。"
          desc="关键词、分类和标签仍然实时写入 URL，支持刷新恢复、直接访问和分享当前筛选状态。"
        />

        <div className="rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
          <SearchBar
            value={keyword}
            setValue={(nextKeyword) => syncParams({ keyword: nextKeyword })}
            category={category}
            setCategory={(nextCategory) => syncParams({ category: nextCategory })}
            onSubmit={() => syncParams({ keyword })}
            options={safeCategoryOptions}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-[var(--radius-card)] p-6" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
              <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">类别筛选</div>
              <div className="mt-5 flex flex-wrap gap-3">
                {safeCategoryOptions.map((item) => (
                  <Badge key={item} active={category === item} onClick={() => syncParams({ category: item })}>
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="mt-8 text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">标签筛选</div>
              <div className="mt-5 flex flex-wrap gap-3">
                {safeTagOptions.map((item) => (
                  <Badge key={item} active={tag === item} onClick={() => syncParams({ tag: item })}>
                    {item}
                  </Badge>
                ))}
              </div>
            </aside>

            <div>
              <div
                className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-subtle)] md:flex-row md:items-center md:justify-between"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
              >
                <div className="text-sm text-[var(--color-text-secondary)]">
                  共找到 <span className="text-[var(--color-accent-primary)]">{results.length}</span> 个产品结果
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">分类：{category} · 标签：{tag}</div>
              </div>

              {results.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {results.map((item) => (
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
                    暂无匹配结果
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
                    可以尝试放宽分类或标签条件，或者直接回到产品总览浏览完整产品内容。
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-accent-primary)]"
                  >
                    前往产品总览
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default SearchPage;
