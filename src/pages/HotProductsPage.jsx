import React from "react";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { getHotPublicProducts, listPublicProducts } from "../services/publicProductsCatalog";

function HotProductCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/6 bg-[#1c1b1b] text-left text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(0,0,0,0.28)]"
      style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.18)" }}
    >
      <div className="relative overflow-hidden bg-[#101114]">
        <img
          src={item.hero}
          alt={item.name}
          className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.08)_0%,rgba(8,10,14,0.56)_100%)]" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="inline-flex w-fit rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-[#bac3ff]">
          {item.tag}
        </div>
        <div
          className="mt-4 text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.55rem",
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          {item.name}
        </div>
        <p className="mt-4 flex-1 text-sm leading-7 text-white/66">{item.desc}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-[#bac3ff]">{item.price}</div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-white/62 transition group-hover:text-white">
            <span>查看产品</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

export function HotProductsPage() {
  const navigate = useNavigate();
  const hotProducts = getHotPublicProducts();
  const displayProducts = hotProducts.length > 0 ? hotProducts : listPublicProducts().slice(0, 6);

  return (
    <PageShell>
      <section data-hot-products-layout="prototype-dark" className="mx-auto max-w-[1600px] text-white">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-white/62 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回产品总览
          </button>
        </div>

        <div
          data-testid="hot-products-editorial-header"
          className="rounded-[30px] border border-white/6 bg-[#131313] p-6 md:p-8"
          style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
            <div className="max-w-4xl">
              <div className="text-[10px] tracking-[0.32em] text-[#bac3ff]">热门产品推荐</div>
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
                精选推荐
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/66">
                以更统一的编辑式节奏展示热门产品，保留深色原型的视觉密度，同时把产品入口收束为一个清晰的浏览网格。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <span className="inline-flex items-center rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[11px] tracking-[0.22em] text-white/62">
                热门产品推荐
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[11px] tracking-[0.22em] text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                筛选产品
              </button>
              <span className="inline-flex items-center rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[11px] tracking-[0.22em] text-[#bac3ff]">
                {displayProducts.length} 款产品
              </span>
            </div>
          </div>
        </div>

        <div data-testid="hot-products-grid" className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayProducts.map((item) => (
            <HotProductCard key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default HotProductsPage;
