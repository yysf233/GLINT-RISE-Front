import React from "react";
import { readPublicSiteSettings } from "../../services/publicSiteContent";

export function Footer() {
  const siteSettings = readPublicSiteSettings();
  const { brand, footer } = siteSettings;

  return (
    <footer className="mt-24 px-[var(--space-page-x)] pb-10 pt-16">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div
            className="text-[var(--color-accent-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            {brand.name}
          </div>
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">{footer.description}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs tracking-[0.22em] text-[var(--color-text-muted)]">
          {footer.links.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
