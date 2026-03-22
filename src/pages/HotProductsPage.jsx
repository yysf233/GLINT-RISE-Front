import React from "react";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { products } from "../data/siteContent";

export function HotProductsPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="热门精选"
          title="热门产品推荐"
          desc="对应热门产品独立列表页，以六张卡片形成完整浏览矩阵，不扩展购物车或库存模块。"
          right={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              <Filter className="h-4 w-4" />
              热门清单
            </button>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(3).map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
              className="group overflow-hidden rounded-[var(--radius-panel)] text-left shadow-[var(--shadow-panel)] transition hover:shadow-[var(--shadow-floating)]"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                <img
                  src={item.hero}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="text-[10px] tracking-[0.26em] text-[var(--color-accent-primary)]">{item.shortName}</div>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3
                    className="text-[var(--color-text-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {item.name}
                  </h3>
                  <ArrowRight className="mt-1 h-4 w-4 text-[var(--color-accent-primary)]" />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.desc}</p>
                <div className="mt-5 text-sm font-semibold text-[var(--color-accent-primary)]">{item.price}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
            style={{ backgroundColor: "var(--color-surface-primary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            返回产品概览
          </button>
        </div>
      </section>
    </PageShell>
  );
}
