import React from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MetaTile } from "../components/common/MetaTile";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";
import { useNotice } from "../context/useNotice";
import { shareCurrentPage } from "../utils/shareCurrentPage";
import { getCaseShareRoute } from "../utils/shareRoutes";

export function CaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotice } = useNotice();
  const item = cases.find((caseItem) => caseItem.id === id);

  if (!item) {
    return <Navigate to="/cases" replace />;
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <button
          type="button"
          onClick={() => navigate("/cases")}
          className="mb-8 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-[var(--color-text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回案例总览
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="overflow-hidden rounded-[var(--radius-panel)] bg-[var(--color-surface-primary)] shadow-[var(--shadow-panel)]">
            <img src={item.hero} alt={item.title} className="h-[640px] w-full object-cover" />
          </div>

          <div
            className="rounded-[var(--radius-panel)] p-7 md:p-9"
            style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">案例年份 {item.year}</div>
                <h1
                  className="mt-3 text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.5rem, 4vw, 3.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {item.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => shareCurrentPage(item.title, showNotice, getCaseShareRoute(item.id))}
                className="rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] p-3 text-[var(--color-text-primary)]"
                aria-label="分享当前案例"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-7 text-base leading-8 text-[var(--color-text-secondary)]">{item.summary}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetaTile label="客户名称" value={item.title.split("×")[0]?.trim() || item.title} />
              <MetaTile label="服务机构" value="GLINT RISE" />
              <MetaTile label="项目时间" value={item.year} />
              <MetaTile label="项目地点" value="上海，中国" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {item.images.slice(1, 3).map((image, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[var(--radius-tile)] bg-[var(--color-background-canvas)]"
                >
                  <img src={image} alt={`${item.title} 辅助图 ${index + 1}`} className="h-56 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
