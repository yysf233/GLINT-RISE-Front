import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { products } from "../data/siteContent";
import { cn } from "../utils/cn";

export function ProductsOverviewPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="产品系列"
          title="产品概览"
          desc="保留概览页左大右小的策展布局，突出旗舰产品，再通过右侧列表引导到更多产品详情。"
        />

        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <button
            type="button"
            onClick={() => navigate(`/product/${products[1].id}`)}
            className="group overflow-hidden rounded-[var(--radius-panel)] text-left shadow-[var(--shadow-floating)]"
            style={{ backgroundColor: "var(--color-surface-primary)" }}
          >
            <div className="grid h-full gap-0 md:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-[540px] overflow-hidden bg-[var(--color-surface-muted)]">
                <img
                  src={products[1].hero}
                  alt={products[1].name}
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
                  <div className="mt-8 text-sm tracking-[0.24em] text-[var(--color-text-muted)]">{products[1].shortName}</div>
                  <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">{products[1].desc}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-accent-primary)]">
                  查看详情
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>

          <div className="grid gap-6">
            {products.slice(2, 5).map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className={cn(
                  "group grid overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] md:grid-cols-[180px_1fr]",
                  index === 1 ? "md:translate-x-8" : ""
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
    </PageShell>
  );
}
