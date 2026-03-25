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
      <section data-product-detail-layout="prototype-dark" className="mx-auto max-w-[1600px] text-white">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/products/hot")}
            className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-white/62 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回热门产品
          </button>
          <button
            type="button"
            onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
            分享页面
          </button>
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.6fr)_minmax(360px,0.4fr)]">
          <div className="overflow-hidden rounded-[30px] border border-white/6 bg-[#1c1b1b]" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}>
            <img src={activeImage} alt={item.name} className="aspect-[4/5] w-full object-cover" />
          </div>

          <div>
            <div data-testid="product-detail-media-rail" className="grid grid-cols-4 gap-3">
              {item.thumbs.map((thumb, index) => (
                <button
                  type="button"
                  key={thumb}
                  onClick={() => setActiveImage(thumb)}
                  className={cn(
                    "overflow-hidden rounded-[18px] border bg-[#1c1b1b] transition",
                    activeImage === thumb ? "border-[#bac3ff]" : "border-white/8 hover:border-white/20",
                  )}
                  aria-label={`查看第 ${index + 1} 张产品图`}
                >
                  <img src={thumb} alt="thumb" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>

            <div
              className="mt-8 rounded-[28px] border border-white/6 bg-[#1c1b1b] p-7"
              style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.18)" }}
            >
              <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">展陈系列</div>
              <h1
                className="mt-4 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.6rem, 4vw, 4rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.92,
                }}
              >
                {item.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">{item.tag}</span>
                <span className="rounded-full bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">2026 产品系列</span>
                <span className="rounded-full bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">策展素材</span>
              </div>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/68">{item.desc}</p>

              <div className="mt-8 border-t border-white/6 pt-6">
                {item.meta.slice(0, 3).map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/6 py-3 last:border-b-0">
                    <span className="text-[10px] tracking-[0.26em] text-white/34">{label}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-[#bac3ff]"
                >
                  分享页面
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center gap-2 text-sm tracking-[0.22em] text-white/52 transition hover:text-white"
                >
                  返回产品总览
                </button>
              </div>
            </div>
          </div>
        </div>

        <div data-testid="product-detail-meta-grid" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {item.meta.map(([label, value]) => (
            <MetaTile key={label} label={label} value={value} variant="prototype-dark" />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default ProductDetailPage;
