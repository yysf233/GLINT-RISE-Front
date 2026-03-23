import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ProductTile } from "../components/common/ProductTile";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import {
  productSearchCategoryMap,
  productSearchCategoryOptions,
  productSearchTagOptions,
  products,
} from "../data/siteContent";

const ALL_CATEGORY_VALUES = new Set(["", "all", "全部产品"]);
const ALL_TAG_VALUES = new Set(["", "all", "全部标签"]);

function buildSearchParams(nextState) {
  const params = new URLSearchParams();
  Object.entries(nextState).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params;
}

function normalizeCategory(value) {
  if (ALL_CATEGORY_VALUES.has(value ?? "")) {
    return productSearchCategoryOptions[0];
  }

  return productSearchCategoryOptions.includes(value) ? value : productSearchCategoryOptions[0];
}

function normalizeTag(value) {
  if (ALL_TAG_VALUES.has(value ?? "")) {
    return productSearchTagOptions[0];
  }

  return productSearchTagOptions.includes(value) ? value : productSearchTagOptions[0];
}

function extractProductTags(item) {
  return item.tag
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") ?? "";
  const category = normalizeCategory(searchParams.get("category"));
  const tag = normalizeTag(searchParams.get("tag"));

  const syncParams = (changes) => {
    const nextState = {
      keyword,
      category,
      tag,
      ...changes,
    };

    setSearchParams(buildSearchParams(nextState), { replace: true });
  };

  const results = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return products.filter((item) => {
      const productTags = extractProductTags(item);
      const searchableText = [
        item.name,
        item.shortName,
        item.tag,
        item.desc,
        productSearchCategoryMap[item.id],
        ...productTags,
        ...item.meta.flat(),
      ]
        .join(" ")
        .toLowerCase();
      const keywordPass =
        !lowerKeyword || searchableText.includes(lowerKeyword);
      const categoryPass = category === "全部产品" || productSearchCategoryMap[item.id] === category;
      const tagPass = tag === "全部标签" || productTags.includes(tag);

      return keywordPass && categoryPass && tagPass;
    });
  }, [category, keyword, tag]);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="产品检索"
          title="搜索结果"
          desc="主搜索页已统一聚焦产品检索，搜索状态同步到 URL 查询参数，支持刷新恢复、直接访问与分享筛选结果。"
        />

        <SearchBar
          value={keyword}
          setValue={(nextKeyword) => syncParams({ keyword: nextKeyword })}
          category={category}
          setCategory={(nextCategory) => syncParams({ category: nextCategory })}
          onSubmit={() => syncParams({ keyword })}
          options={productSearchCategoryOptions}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside
            className="rounded-[var(--radius-card)] p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">品类筛选</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {productSearchCategoryOptions.map((item) => (
                <Badge key={item} active={category === item} onClick={() => syncParams({ category: item })}>
                  {item}
                </Badge>
              ))}
            </div>

            <div className="mt-8 text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">标签筛选</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {productSearchTagOptions.map((item) => (
                <Badge key={item} active={tag === item} onClick={() => syncParams({ tag: item })}>
                  {item}
                </Badge>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-sm text-[var(--color-text-secondary)]">
                共找到 <span className="text-[var(--color-accent-primary)]">{results.length}</span> 个产品结果
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                分类：{category} · 标签：{tag}
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <ProductTile key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} />
                ))}
              </div>
            ) : (
              <div
                className="rounded-[var(--radius-card)] p-8"
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
                  暂无匹配结果
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
                  可以尝试放宽分类或标签条件，或者直接回到产品概览浏览完整产品内容。
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-accent-primary)]"
                >
                  前往产品概览
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
