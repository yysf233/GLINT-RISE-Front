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

function PrototypeFeatureCard({ item, onClick, layout = "primary" }) {
  if (!item) {
    return null;
  }

  const isPrimary = layout === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden border border-white/6 bg-[#1c1b1b] text-left text-white",
        isPrimary ? "min-h-[620px] rounded-[30px] p-10 md:col-span-8" : "min-h-[300px] rounded-[24px] p-8",
      )}
      style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
    >
      <img
        src={item.hero}
        alt={item.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,15,0.18)_0%,rgba(10,11,15,0.54)_48%,rgba(10,11,15,0.94)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-end">
        <div className="inline-flex w-fit rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-[#bac3ff]">
          {item.searchCategory || item.tag}
        </div>
        <div
          className="mt-5 text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isPrimary ? "clamp(2.6rem, 4vw, 4.4rem)" : "2rem",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.06em",
          }}
        >
          {isPrimary ? item.name : item.shortName}
        </div>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{item.desc}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-[#bac3ff]">
          <span>查看详情</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

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
  const featuredProduct = products[0] ?? null;
  const sideProducts = products.slice(1, 4);

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
      <section data-products-layout="prototype-dark" className="mx-auto max-w-[1600px] text-white">
        <SectionHeading
          variant="dark-prototype"
          eyebrow="产品矩阵 / 策展精选"
          subtitle="产品总览"
          title={
            <>
              架构级<span className="text-white/30">精度。</span>
            </>
          }
          desc="以首页同源的深色科技展陈语言重构产品总览，首屏负责建立策展感，下半屏继续承接真实搜索与筛选能力。"
        />

        <div data-testid="products-hero-showcase" className="grid gap-5 md:grid-cols-12">
          <PrototypeFeatureCard item={featuredProduct} onClick={() => navigate(`/product/${featuredProduct?.id}`)} />

          <div className="grid gap-5 md:col-span-4">
            {sideProducts.map((item) => (
              <PrototypeFeatureCard key={item.id} item={item} layout="secondary" onClick={() => navigate(`/product/${item.id}`)} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/products/hot")}
            className="rounded-full border border-[#9fb1ff] px-7 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#4453a7]"
          >
            热门产品库
          </button>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[1600px] border-t border-white/6 pt-14 text-white">
        <SectionHeading
          variant="dark-prototype"
          eyebrow="发现引擎"
          subtitle="筛选产品库"
          title="在不破坏策展氛围的前提下检索产品。"
          desc="搜索、分类、标签和产品跳转都保持现有数据逻辑，只把信息密度和版式调整到原型图的暗色筛选结果区。"
          right={
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setCategory(safeCategoryOptions[0]);
                setTag(safeTagOptions[0]);
              }}
              className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/72 transition hover:bg-white/10 hover:text-white"
            >
              清空条件
            </button>
          }
        />

        <div
          className="rounded-[30px] border border-white/6 bg-[#131313] p-6 md:p-8"
          style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
        >
          <SearchBar
            value={keyword}
            setValue={setKeyword}
            category={category}
            setCategory={setCategory}
            onSubmit={() => {}}
            options={safeCategoryOptions}
            variant="dark"
            placeholder="搜索洞察、产品、案例..."
          />

          <div data-testid="products-filter-grid" className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
            <aside className="rounded-[24px] border border-white/6 bg-[#1c1b1b] p-6">
              <div className="text-[10px] tracking-[0.3em] text-white/40">FILTER SUMMARY</div>
              <div className="mt-5 space-y-3 text-sm text-white/68">
                <div>
                  共找到 <span className="text-[#bac3ff]">{filteredProducts.length}</span> 个产品
                </div>
                <div>分类: {category}</div>
                <div>标签: {tag}</div>
              </div>

              <div className="mt-10 text-[10px] tracking-[0.3em] text-white/40">TAG FILTERS</div>
              <div className="mt-5 flex flex-wrap gap-3">
                {safeTagOptions.map((item) => (
                  <Badge key={item} active={tag === item} onClick={() => setTag(item)} variant="prototype-dark">
                    {item}
                  </Badge>
                ))}
              </div>
            </aside>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((item, index) => (
                  <ProductTile
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/product/${item.id}`)}
                    variant="prototype-dark"
                    highlight={index % 3 === 1}
                  />
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
                  暂无匹配产品
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/66">
                  可以放宽筛选条件，或者直接进入热门产品列表继续浏览当前公开库中的精选内容。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("");
                      setCategory(safeCategoryOptions[0]);
                      setTag(safeTagOptions[0]);
                    }}
                    className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/72 transition hover:bg-white/10 hover:text-white"
                  >
                    重置筛选
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/products/hot")}
                    className="rounded-full bg-[#4453a7] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#5262c2]"
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
