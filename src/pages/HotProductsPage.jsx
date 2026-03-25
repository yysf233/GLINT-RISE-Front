import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductTile } from "../components/common/ProductTile";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { getHotPublicProducts, listPublicProducts } from "../services/publicProductsCatalog";

export function HotProductsPage() {
  const navigate = useNavigate();
  const hotProducts = getHotPublicProducts();
  const displayProducts = hotProducts.length > 0 ? hotProducts : listPublicProducts().slice(0, 6);
  const featuredProducts = displayProducts.slice(0, 2);
  const remainingProducts = displayProducts.slice(2);

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

        <SectionHeading
          variant="dark-prototype"
          eyebrow="HOT PRODUCTS"
          subtitle="THE ELITE SELECTION"
          title={
            <>
              THE ELITE <span className="text-white/30">SELECTION</span>
            </>
          }
          desc="热门产品页切换到原型图的精选陈列逻辑，优先展示重点单品，再延展到完整热门库。"
        />

        <div data-testid="hot-products-featured-rail" className="grid gap-5 lg:grid-cols-2">
          {featuredProducts.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
              className="group overflow-hidden rounded-[28px] border border-white/6 bg-[#1c1b1b] text-left text-white"
              style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
            >
              <div className="overflow-hidden bg-[#101114]">
                <img src={item.hero} alt={item.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
              </div>
              <div className="p-7">
                <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-[#bac3ff]">
                  {index === 0 ? "NEW SIGNAL" : "LIMITED FOCUS"}
                </div>
                <div
                  className="mt-4 text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {item.name}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/68">{item.desc}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#bac3ff]">{item.price}</div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-white/62 transition group-hover:text-white">
                    <span>VIEW PRODUCT</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {remainingProducts.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {remainingProducts.map((item) => (
              <ProductTile key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} variant="prototype-dark" />
            ))}
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}

export default HotProductsPage;
