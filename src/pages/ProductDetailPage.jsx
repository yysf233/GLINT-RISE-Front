import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import {
  APPLE_CAROUSEL_AUTOPLAY_MS,
  appleCarouselSlideVariants,
  APPLE_CAROUSEL_TRANSITION,
  useAppleStyleCarousel,
} from "../hooks/useAppleStyleCarousel";
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

  const galleryCarousel = useAppleStyleCarousel({
    length: item?.thumbs?.length ?? 0,
    autoplayMs: APPLE_CAROUSEL_AUTOPLAY_MS,
  });

  if (!item) {
    return <Navigate to="/products" replace />;
  }

  const galleryImages = item.thumbs;
  const activeImageIndex = galleryCarousel.activeIndex % galleryImages.length;
  const activeImage = galleryImages[activeImageIndex];
  const sideRailImages = galleryImages
    .map((thumb, index) => ({ thumb, index }))
    .filter(({ index }) => index !== activeImageIndex)
    .slice(0, 3);
  const specPairs = item.meta.slice(0, 3);

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
            分享当前产品
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.62fr)_minmax(360px,0.38fr)]">
          <div
            data-testid="product-detail-gallery-grid"
            data-carousel-style="apple-product"
            data-carousel-state={galleryCarousel.isPaused ? "paused" : "playing"}
            aria-roledescription="carousel"
            className="rounded-[30px] border border-white/6 bg-[#141519] p-5 md:p-6"
            style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
            {...galleryCarousel.hoverHandlers}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(220px,0.28fr)]">
              <div data-testid="product-detail-gallery-track" className="relative overflow-hidden rounded-[26px] bg-[#0f1014]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={item.name}
                    className="aspect-[4/5] w-full object-cover"
                    variants={appleCarouselSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={APPLE_CAROUSEL_TRANSITION}
                  />
                </AnimatePresence>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {sideRailImages.map(({ thumb, index }) => (
                  <button
                    type="button"
                    key={thumb}
                    onClick={() => galleryCarousel.goTo(index)}
                    className={cn(
                      "overflow-hidden rounded-[20px] border bg-[#0f1014] text-left transition",
                      activeImage === thumb ? "border-[#bac3ff]" : "border-white/8 hover:border-white/18",
                    )}
                    aria-label={`查看第 ${index + 1} 张产品图`}
                  >
                    <img src={thumb} alt={`${item.name} 细节图 ${index + 1}`} className="aspect-[4/5] w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {galleryImages.map((thumb, index) => (
                <button
                  type="button"
                  key={`${thumb}-thumb`}
                  onClick={() => galleryCarousel.goTo(index)}
                  className={cn(
                    "overflow-hidden rounded-[16px] border bg-[#111216] transition",
                    activeImageIndex === index ? "border-[#bac3ff]" : "border-white/8 hover:border-white/18",
                  )}
                  aria-label={`查看第 ${index + 1} 张产品图`}
                >
                  <img src={thumb} alt={`${item.name} 缩略图 ${index + 1}`} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div data-testid="product-detail-spec-panel" className="space-y-5">
            <div
              className="rounded-[30px] border border-white/6 bg-[#17181d] p-7 md:p-8"
              style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.18)" }}
            >
              <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">展陈系列</div>
              <h1
                className="mt-4 text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.8rem, 4vw, 4.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.92,
                }}
              >
                {item.name}
              </h1>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">
                  {item.tag}
                </span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">
                  2026 产品系列
                </span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] tracking-[0.22em] text-white/68">
                  策展素材
                </span>
              </div>

              <p className="mt-6 text-base leading-8 text-white/68">{item.desc}</p>

              <div className="mt-8 border-t border-white/6 pt-6">
                <div className="text-[10px] tracking-[0.3em] text-white/40">参数规格</div>
                <div className="mt-5 space-y-4">
                  {specPairs.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/6 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-[10px] tracking-[0.26em] text-white/34">{label}</span>
                      <span className="text-sm text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => shareCurrentPage(item.name, showNotice, getProductShareRoute(item.id))}
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-[#bac3ff]"
                >
                  分享当前产品
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

            <div
              data-testid="product-detail-ecosystem-panel"
              className="overflow-hidden rounded-[30px] border border-white/6 bg-[#141519]"
              style={{ boxShadow: "0 24px 64px rgba(0, 0, 0, 0.16)" }}
            >
              <div className="grid gap-0 md:grid-cols-[minmax(0,0.56fr)_minmax(240px,0.44fr)]">
                <div className="p-7 md:p-8">
                  <div className="text-[10px] tracking-[0.3em] text-[#bac3ff]">生态联动</div>
                  <div
                    className="mt-4 text-white"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    统一空间控制与展示系统
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/66">
                    产品详情保持公开展示与分享能力，同时将材质、交互界面和连接方式收束进更接近原型的编辑式信息板块。
                  </p>
                </div>

                <div className="overflow-hidden bg-[#0f1014]">
                  <img
                    src={sideRailImages[0]?.thumb ?? galleryImages[0]}
                    alt={`${item.name} 生态联动`}
                    className="h-full min-h-[240px] w-full object-cover"
                  />
                </div>
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
