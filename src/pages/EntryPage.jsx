import React from "react";
import { useNavigate } from "react-router-dom";
import { readPublicSiteSettings } from "../services/publicSiteContent";

export function EntryPage() {
  const navigate = useNavigate();
  const { brand } = readPublicSiteSettings();

  return (
    <div data-entry-layout="prototype-dark" className="relative flex min-h-screen flex-col overflow-hidden bg-[#131313] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(186,195,255,0.1)_0%,transparent_34%),linear-gradient(180deg,rgba(19,19,19,1)_0%,rgba(19,19,19,0.96)_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="entry-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#entry-grid)" />
        </svg>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center">
          <div className="mb-16 text-center">
            <h1
              className="text-[#bac3ff]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.6rem, 8vw, 5rem)",
                fontWeight: 800,
                letterSpacing: "-0.06em",
                lineHeight: 0.92,
              }}
            >
              {brand.name}
            </h1>
            <p className="mt-4 text-lg font-light tracking-[0.4em] text-white/62">{brand.cnName}</p>
          </div>

          <div
            className="w-full rounded-[28px] border border-white/8 bg-[rgba(28,27,27,0.6)] px-8 py-12 backdrop-blur-[24px] md:px-12"
            style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}
          >
            <div className="mx-auto h-px w-12 bg-white/16" />

            <div className="mt-12 flex flex-col items-center justify-center gap-6 md:flex-row">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="group relative h-14 w-full overflow-hidden rounded-full bg-[#bac3ff] text-sm font-bold uppercase tracking-[0.28em] text-[#15267b] transition hover:scale-[1.02] active:scale-95 md:w-48"
              >
                <span className="relative z-10">访客进入</span>
                <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="h-14 w-full rounded-full border border-white/14 bg-transparent text-sm font-bold uppercase tracking-[0.28em] text-[#bac3ff] transition hover:border-[#bac3ff] hover:bg-[#bac3ff]/5 active:scale-95 md:w-48"
              >
                登录进入
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 opacity-40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#bac3ff]" />
              <span className="text-[10px] tracking-[0.22em] uppercase">Private Archive Access</span>
            </div>
          </div>

          <div className="mt-20 flex gap-48 opacity-10">
            <div className="h-32 w-px bg-gradient-to-b from-[#bac3ff] to-transparent" />
            <div className="h-32 w-px bg-gradient-to-b from-[#bac3ff] to-transparent" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-white/5 bg-[#0e0e0e] px-12 py-12">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-8 md:flex-row">
          <div
            className="text-white/10"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {brand.name}
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.24em] text-white/40">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Compliance</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">© 2024 {brand.name}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default EntryPage;
