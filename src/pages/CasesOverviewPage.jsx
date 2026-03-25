import React from "react";
import { ArrowRight, LayoutGrid, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageShell } from "../components/layout/PageShell";
import { cases } from "../data/siteContent";

function CaseFeatureCard({ item, layout = "primary", onClick }) {
  if (!item) {
    return null;
  }

  const isPrimary = layout === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] border border-white/6 bg-[#1c1b1b] text-left text-white"
      style={{ minHeight: isPrimary ? 620 : 400, boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
    >
      <img
        src={item.hero}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,15,0.12)_0%,rgba(10,11,15,0.58)_48%,rgba(10,11,15,0.94)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-end p-7 md:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#bac3ff]/24 bg-[#bac3ff]/12 px-3 py-1 text-[10px] tracking-[0.22em] text-[#bac3ff]">
            {item.eyebrow}
          </span>
          <span className="text-[10px] tracking-[0.24em] text-white/36">{item.year}</span>
        </div>
        <div
          className="mt-5 text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isPrimary ? "clamp(2.8rem, 5vw, 4.8rem)" : "1.9rem",
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.92,
          }}
        >
          {item.title}
        </div>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{item.summary}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-[#bac3ff]">
          <span>EXPLORE CASE</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

export function CasesOverviewPage() {
  const navigate = useNavigate();
  const feature = cases[0];
  const secondaryCases = cases.slice(1);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px] text-white" data-case-layout="prototype-dark">
        <SectionHeading
          variant="dark-prototype"
          eyebrow="CURATED PORTFOLIO"
          subtitle="CASES OVERVIEW"
          title={
            <>
              CASES <span className="text-white/30">OVERVIEW</span>
            </>
          }
          desc="案例总览切到原型图的暗色策展结构，突出主案例，再把时间轴和图谱入口嵌进同一层信息体系。"
        />

        <div data-testid="cases-feature-grid" className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-8">
            <CaseFeatureCard item={feature} onClick={() => navigate(`/case/${feature.id}`)} />
          </div>

          <div className="grid gap-5 md:col-span-4">
            <div className="rounded-[28px] border border-white/6 bg-[#1c1b1b] p-7" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.22)" }}>
              <div className="text-[10px] tracking-[0.3em] text-white/40">CASE NAVIGATION</div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                保留案例总览、时间轴、图谱和详情页的完整跳转链路，只把布局和层次统一到暗色科技策展语言。
              </p>
              <div className="mt-8 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/case-timeline")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white/78 transition hover:bg-white/10 hover:text-white"
                >
                  <LayoutGrid className="h-4 w-4" />
                  进入时间轴
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/case-map")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4453a7] px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-[#5262c2]"
                >
                  <Orbit className="h-4 w-4" />
                  进入图谱
                </button>
              </div>
            </div>

            {secondaryCases.slice(0, 1).map((item) => (
              <CaseFeatureCard key={item.id} item={item} layout="secondary" onClick={() => navigate(`/case/${item.id}`)} />
            ))}
          </div>

          {secondaryCases.slice(1).map((item) => (
            <div key={item.id} className="md:col-span-4">
              <CaseFeatureCard item={item} layout="secondary" onClick={() => navigate(`/case/${item.id}`)} />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default CasesOverviewPage;
