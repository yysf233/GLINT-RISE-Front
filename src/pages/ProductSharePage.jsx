import React from "react";
import { ArrowRight, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { getPublicProductById } from "../services/publicProductsCatalog";
import { getProductDetailRoute } from "../utils/shareRoutes";

export function ProductSharePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const item = getPublicProductById(id);

  if (!item) {
    return <Navigate to="/products" replace />;
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-[1080px]" aria-label="产品分享落地页">
        <div
          className="overflow-hidden rounded-[var(--radius-hero)]"
          style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
        >
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <img src={item.hero} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "var(--gradient-hero-fade)" }} />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-black/45 px-4 py-2 text-xs tracking-[0.2em] text-white backdrop-blur-xl">
                <Share2 className="h-3.5 w-3.5" />
                分享产品卡
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">GLINT RISE PUBLIC SHARE</div>
              <h1
                className="mt-4 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.3rem, 5vw, 3.4rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.96,
                }}
              >
                {item.name}
              </h1>
              <div className="mt-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-4 py-2 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]">
                {item.tag}
              </div>
              <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">{item.desc}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {item.meta.slice(0, 4).map(([label, value]) => (
                  <MetaTile key={label} label={label} value={value} />
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate(getProductDetailRoute(item.id))}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold tracking-[0.18em] text-[var(--color-text-on-accent)]"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  进入官网详情
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="text-sm leading-7 text-[var(--color-text-muted)]">
                  当前页面仅保留公开可分享字段，适合用作微信、QQ、钉钉中的直接落点。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default ProductSharePage;
