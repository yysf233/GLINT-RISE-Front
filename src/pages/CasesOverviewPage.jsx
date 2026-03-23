import React from "react";
import { useNavigate } from "react-router-dom";
import { ImageCard } from "../components/common/ImageCard";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";

export function CasesOverviewPage() {
  const navigate = useNavigate();
  const feature = cases[0];

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px]">
        <SectionHeading
          eyebrow="精选案例"
          title="案例总览"
          desc="保留总览页的首屏大图与多卡片矩阵结构，用于快速浏览案例分层与叙事方向。"
          right={
            <button
              type="button"
              onClick={() => navigate("/case-timeline")}
              className="rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-5 py-3 text-sm tracking-[0.22em] text-[var(--color-text-primary)]"
            >
              进入时间轴
            </button>
          }
          action={
            <button
              type="button"
              onClick={() => navigate("/case-map")}
              className="rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold tracking-[0.22em] text-[var(--color-text-on-accent)]"
              style={{ background: "var(--gradient-accent)" }}
            >
              进入图谱
            </button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <ImageCard
            image={feature.hero}
            title={feature.title}
            subtitle={feature.summary}
            tag={feature.eyebrow}
            className="min-h-[520px]"
            onClick={() => navigate(`/case/${feature.id}`)}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {cases.slice(1).map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/case/${item.id}`)}
                className={`group overflow-hidden rounded-[var(--radius-card)] text-left transition hover:bg-[var(--color-surface-secondary)] ${index === 1 ? "sm:translate-y-10" : ""}`}
                style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-panel)" }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.hero}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[10px] tracking-[0.26em] text-[var(--color-accent-primary)]">{item.eyebrow}</div>
                  <div
                    className="mt-2 text-[var(--color-text-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
