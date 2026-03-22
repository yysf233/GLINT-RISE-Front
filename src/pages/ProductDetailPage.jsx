import React, { useEffect, useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { products } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { cn } from "../utils/cn";
import { shareCurrentPage } from "../utils/shareCurrentPage";

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = products.find((product) => product.id === id);
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
      <section className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between gap-4">
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
            onClick={() => shareCurrentPage(item.name, showNotice)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--color-text-primary)]"
            style={{ backgroundColor: "var(--color-surface-primary)" }}
          >
            <Share2 className="h-4 w-4" />
            分享页面
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr]">
          <div
            className="overflow-hidden rounded-[var(--radius-panel)] p-5 md:p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]">
              <img src={activeImage} alt={item.name} className="h-[680px] w-full object-cover" />
            </div>
          </div>

          <div
            className="rounded-[var(--radius-panel)] p-7 md:p-9"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="grid gap-4 sm:grid-cols-4">
              {item.thumbs.map((thumb, index) => (
                <button
                  type="button"
                  key={thumb}
                  onClick={() => setActiveImage(thumb)}
                  className={cn(
                    "overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-background-canvas)] p-1 transition",
                    activeImage === thumb ? "ring-1 ring-[var(--color-border-accent)]" : ""
                  )}
                  aria-label={`查看第 ${index + 1} 张产品图`}
                >
                  <img
                    src={thumb}
                    alt={`${item.name} 缩略图 ${index + 1}`}
                    className="h-24 w-full rounded-[var(--radius-compact)] object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-8 text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">策展产品 04</div>
            <h1
              className="mt-3 text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 4vw, 3.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              {item.name}
            </h1>
            <div className="mt-3 text-sm tracking-[0.22em] text-[var(--color-text-muted)]">{item.tag}</div>
            <p className="mt-7 text-base leading-8 text-[var(--color-text-secondary)]">{item.desc}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
