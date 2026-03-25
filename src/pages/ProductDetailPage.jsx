import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { useNotice } from "../context/useNotice";
import { getPublicProductById } from "../services/publicProductsCatalog";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getProductShareRoute } from "../utils/shareRoutes";

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = getPublicProductById(id);
  const [activeImage, setActiveImage] = useState(item?.thumbs[0] ?? "");

  useEffect(() => {
    if (item) {
      setActiveImage(item.thumbs[0]);
    }
  }, [item]);

  if (!item) {
    return <Navigate to="/products" replace />;
  }

  return (
    <PageShell>
      <section data-product-detail-layout="editorial" className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/products/hot")}
            className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-text-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
          <button
            type="button"
            onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <Share2 className="h-4 w-4" />
            分享页面
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[var(--radius-panel)] p-5 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]">
              <img src={activeImage} alt={item.name} className="h-[720px] w-full object-cover" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {item.thumbs.map((thumb, index) => (
                <button
                  type="button"
                  key={thumb}
                  onClick={() => setActiveImage(thumb)}
                  className={cn(
                    "overflow-hidden rounded-[var(--radius-control)] p-1 transition",
                    activeImage === thumb ? "ring-1 ring-[var(--color-border-accent)]" : "",
                  )}
                  style={{ backgroundColor: "var(--color-background-canvas)" }}
                  aria-label={`查看第 ${index + 1} 张产品图`}
                >
                  <img src={thumb} alt="thumb" className="h-24 w-full rounded-[var(--radius-compact)] object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[var(--radius-panel)] p-7 shadow-[var(--shadow-panel)]" style={{ background: "var(--gradient-card)" }}>
              <div className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)]">产品详情</div>
              <h1
                className="mt-4 text-[var(--color-text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.8rem, 4vw, 4rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.94,
                }}
              >
                {item.name}
              </h1>
              <div
                className="mt-4 inline-flex rounded-[var(--radius-pill)] px-4 py-2 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
                style={{ backgroundColor: "var(--color-accent-soft)" }}
              >
                {item.tag}
              </div>
              <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">{item.desc}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-text-on-accent)]"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  分享页面
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-accent-primary)]"
                  style={{ backgroundColor: "var(--color-surface-secondary)" }}
                >
                  返回产品总览
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {item.meta.map(([label, value]) => (
                <MetaTile key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default ProductDetailPage;
