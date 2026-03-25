import React from "react";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { SectionHeading } from "../components/common/SectionHeading";
import { getHotPublicProducts, listPublicProducts } from "../services/publicProductsCatalog";

export function HotProductsPage() {
  const navigate = useNavigate();
  const hotProducts = getHotPublicProducts();
  const displayProducts = hotProducts.length > 0 ? hotProducts : listPublicProducts().slice(0, 6);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="热门精选"
          title="热门产品列表延续策展感，但仍然直接走现有公开产品数据。"
          desc="热门产品页继续优先读取后台已发布且被标记为热门精选的产品，没有热门项时再回退到公开产品前六项。"
          right={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <Filter className="h-4 w-4" />
              热门清单
            </button>
          }
        />

        <div className="mb-8 grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
          <div className="rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
            <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">热门说明</div>
            <div
              className="mt-3 text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              热门产品页保持高密度陈列，方便快速浏览与跳转。
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              页面只改视觉，不改热门产品的判定来源和产品详情跳转逻辑。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayProducts.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-floating)]"
                style={{ background: "var(--gradient-card)" }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                  <img src={item.hero} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="text-[10px] tracking-[0.26em] text-[var(--color-accent-primary)]">{item.shortName}</div>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3
                      className="text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.7rem",
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {item.name}
                    </h3>
                    <ArrowRight className="mt-1 h-4 w-4 text-[var(--color-accent-primary)]" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayProducts.slice(3).map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
              className="group overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-floating)]"
              style={{ background: "var(--gradient-card)" }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                <img src={item.hero} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="text-[10px] tracking-[0.26em] text-[var(--color-accent-primary)]">{item.shortName}</div>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3
                    className="text-[var(--color-text-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.7rem",
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
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            返回产品总览
          </button>
        </div>
      </section>
    </PageShell>
  );
}

export default HotProductsPage;
