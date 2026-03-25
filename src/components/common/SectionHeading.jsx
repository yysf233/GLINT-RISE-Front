import React from "react";

export function SectionHeading({ eyebrow, title, desc, action, right }) {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-5 flex items-center gap-3 text-[11px] tracking-[0.32em] text-[var(--color-accent-primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h2
          className="text-[var(--color-text-primary)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-section)",
            fontWeight: 800,
            lineHeight: 0.94,
            letterSpacing: "-0.05em",
          }}
        >
          {title}
        </h2>
        {desc ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">{desc}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-4">{right}{action}</div>
    </div>
  );
}

export default SectionHeading;
