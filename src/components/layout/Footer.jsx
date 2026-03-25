import React from "react";
import { Globe, Mail, Orbit } from "lucide-react";
import { useLocation } from "react-router-dom";
import { readPublicSiteSettings } from "../../services/publicSiteContent";

export function Footer() {
  const siteSettings = readPublicSiteSettings();
  const { brand, footer } = siteSettings;
  const location = useLocation();
  const isHome = location.pathname !== "/";
  const darkFooterLinks = footer.links.length > 0 ? footer.links : ["PRIVACY", "TERMS", "COMPLIANCE", "SITEMAP"];

  if (isHome) {
    return (
      <footer className="border-t border-white/5 bg-[#0e0e0e] px-[var(--space-page-x)] py-14 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="text-lg uppercase text-white/28"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  letterSpacing: "0.28em",
                }}
              >
                {brand.name}
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/42">{footer.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[11px] tracking-[0.24em] text-white/42">
              {darkFooterLinks.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="text-[11px] tracking-[0.22em] text-white/36">© 2024 {brand.name}. ALL RIGHTS RESERVED.</div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-white/28">
            <button type="button" className="transition hover:text-[#bac3ff]" aria-label="访问公开站地图">
              <Globe className="h-4 w-4" />
            </button>
            <button type="button" className="transition hover:text-[#bac3ff]" aria-label="联系邮箱">
              <Mail className="h-4 w-4" />
            </button>
            <button type="button" className="transition hover:text-[#bac3ff]" aria-label="查看合作网络">
              <Orbit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-28 px-[var(--space-page-x)] pb-12 pt-4">
      <div
        className="mx-auto max-w-[1600px] rounded-[var(--radius-panel)] px-6 py-10 shadow-[var(--shadow-subtle)] md:px-10 md:py-12"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-3 text-[11px] tracking-[0.32em] text-[var(--color-accent-primary)]">公开站体验页脚</div>
            <div
              className="text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.06em",
              }}
            >
              {brand.name}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">{footer.description}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {footer.links.map((item, index) => (
              <div
                key={item}
                className="rounded-[var(--radius-card)] px-5 py-4"
                style={{ backgroundColor: index % 2 === 0 ? "var(--color-surface-secondary)" : "var(--color-background-canvas)" }}
              >
                <div className="text-[10px] tracking-[0.28em] text-[var(--color-text-muted)]">链接 {String(index + 1).padStart(2, "0")}</div>
                <div className="mt-2 text-sm tracking-[0.14em] text-[var(--color-text-primary)]">{item}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--color-border-subtle)] pt-6 text-[11px] tracking-[0.22em] text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between">
          <span>{brand.cnName}</span>
          <span>GLINT RISE 公开体验系统</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
