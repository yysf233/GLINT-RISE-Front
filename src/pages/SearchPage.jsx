import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ProductTile } from "../components/common/ProductTile";
import { SearchBar } from "../components/common/SearchBar";
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
      <section data-search-layout="prototype-dark" className="mx-auto max-w-[1600px] text-white">
        <div data-testid="search-toolbar" className="mb-10 space-y-8 md:mb-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">发现引擎</div>
              <h1
                className="mt-4 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.06em",
                  lineHeight: 0.92,
                }}
              >
                搜索洞察、产品、案例
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/66">
                保留 URL 参数同步、刷新恢复和搜索跳转能力，同时把公开搜索页压到更接近 Stitch desktop 原型的顶部检索条与左侧导航结构。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.22em] text-white/46">
              <span className="rounded-full border border-white/8 bg-white/4 px-4 py-2">关键词：{keyword || "全部"}</span>
              <span className="rounded-full border border-white/8 bg-white/4 px-4 py-2">分类：{category}</span>
              <span className="rounded-full border border-white/8 bg-white/4 px-4 py-2">标签：{tag}</span>
            </div>
          </div>

          <div
            className="rounded-[30px] border border-white/6 bg-[#131313] p-6 md:p-8"
            style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
          >
            <SearchBar
              value={keyword}
              setValue={(nextKeyword) => syncParams({ keyword: nextKeyword })}
              category={category}
              setCategory={(nextCategory) => syncParams({ category: nextCategory })}
              onSubmit={() => syncParams({ keyword })}
              options={safeCategoryOptions}
              variant="dark"
              placeholder="搜索洞察、产品、案例..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <aside
            data-testid="search-filter-sidebar"
            className="w-full rounded-[24px] border border-white/6 bg-[#1c1b1b] p-6 xl:w-[280px] xl:shrink-0"
            style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.22)" }}
          >
            <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">行业分类</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {safeCategoryOptions.map((item) => (
                <Badge key={item} active={category === item} onClick={() => syncParams({ category: item })} variant="prototype-dark">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="mt-10 text-[10px] tracking-[0.3em] text-white/40">细分标签</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {safeTagOptions.map((item) => (
                <Badge key={item} active={tag === item} onClick={() => syncParams({ tag: item })} variant="prototype-dark">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="mt-10 border-t border-white/6 pt-6 text-sm text-white/68">
              <div>
                共找到 <span className="text-[#bac3ff]">{results.length}</span> 个结果
              </div>
              <div className="mt-2">关键词：{keyword || "全部"}</div>
              <div className="mt-2">行业：{category}</div>
              <div className="mt-2">标签：{tag}</div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div
              className="mb-6 flex flex-col gap-4 border-b border-white/6 pb-4 md:flex-row md:items-end md:justify-between"
              data-testid="search-results-summary"
            >
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
                  搜索结果
                </div>
                <div className="mt-2 text-sm text-white/46">共找到 {results.length} 个匹配项</div>
              </div>
              <div className="flex gap-4 text-xs font-semibold tracking-[0.22em]">
                <span className="text-[#bac3ff]">最新</span>
                <span className="text-white/36">热门</span>
              </div>
            </div>

            {results.length > 0 ? (
              <div data-testid="search-results-grid" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <ProductTile key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} variant="prototype-dark" />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-white/6 bg-[#1c1b1b] p-8">
                <div
                  className="text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  暂无匹配结果
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/66">
                  可以尝试放宽行业或标签条件，或者直接回到产品总览浏览完整公开内容。
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-[#bac3ff]"
                >
                  前往产品总览
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default SearchPage;
