import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { ImageCard } from "../components/common/ImageCard";
import { SearchBar } from "../components/common/SearchBar";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { cases, industryOptions, searchCategoryOptions, subTagOptions } from "../data/siteContent";

const categoryMatchers = {
  全部分类: () => true,
  明星艺人: (item) => item.industry === "明星艺人",
  奶茶饮品: (item) => item.industry === "奶茶饮品",
  生活方式: (item) => item.category === "联名案例" || item.subTags.includes("活动"),
  产品特质: (item) => item.subTags.includes("品牌升级") || item.subTags.includes("包装"),
};

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

  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "全部分类";
  const industry = searchParams.get("industry") ?? "全部行业";
  const tag = searchParams.get("tag") ?? "全部标签";

  const syncParams = (changes) => {
    const nextState = {
      keyword,
      category,
      industry,
      tag,
      ...changes,
    };

    setSearchParams(buildSearchParams(nextState), { replace: true });
  };

  const results = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    const matchCategory = categoryMatchers[category] ?? categoryMatchers["全部分类"];

    return cases.filter((item) => {
      const keywordPass =
        !lowerKeyword ||
        [item.title, item.summary, item.category, item.industry, ...item.subTags]
          .join(" ")
          .toLowerCase()
          .includes(lowerKeyword);
      const categoryPass = matchCategory(item);
      const industryPass = industry === "全部行业" || item.industry === industry;
      const tagPass = tag === "全部标签" || item.subTags.includes(tag);

      return keywordPass && categoryPass && industryPass && tagPass;
    });
  }, [category, industry, keyword, tag]);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="内容检索"
          title="搜索结果"
          desc="搜索状态同步到 URL 查询参数，支持刷新恢复、直接访问与分享筛选结果。"
        />

        <SearchBar
          value={keyword}
          setValue={(nextKeyword) => syncParams({ keyword: nextKeyword })}
          category={category}
          setCategory={(nextCategory) => syncParams({ category: nextCategory })}
          onSubmit={() => syncParams({ keyword })}
          options={searchCategoryOptions}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside
            className="rounded-[var(--radius-card)] p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">行业筛选</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {industryOptions.map((item) => (
                <Badge key={item} active={industry === item} onClick={() => syncParams({ industry: item })}>
                  {item}
                </Badge>
              ))}
            </div>

            <div className="mt-8 text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">标签筛选</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {subTagOptions.map((item) => (
                <Badge key={item} active={tag === item} onClick={() => syncParams({ tag: item })}>
                  {item}
                </Badge>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-sm text-[var(--color-text-secondary)]">
                共找到 <span className="text-[var(--color-accent-primary)]">{results.length}</span> 个案例结果
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                分类：{category} · 行业：{industry} · 标签：{tag}
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {results.map((item) => (
                  <div key={item.id} className="space-y-4">
                    <ImageCard
                      image={item.hero}
                      title={item.title}
                      subtitle={item.summary}
                      tag={item.eyebrow}
                      className="min-h-[360px]"
                      onClick={() => navigate(`/case/${item.id}`)}
                    />
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span>{item.year}</span>
                      <span>·</span>
                      <span>{item.industry}</span>
                      {item.subTags.map((tagItem) => (
                        <span
                          key={tagItem}
                          className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-3 py-1"
                        >
                          {tagItem}
                        </span>
                      ))}
                    </div>
                  </div>
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
                  可以尝试放宽行业或标签条件，或者直接回到案例总览浏览全部内容。
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/cases")}
                  className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-accent-primary)]"
                >
                  前往案例总览
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
