import React from "react";

export function SectionHeading({ eyebrow, title, desc, action, right }) {
  return (
    <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-4 flex items-center gap-3 text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">
            <span className="h-px w-10 bg-[var(--color-accent-primary)]" />
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h2
          className="text-[var(--color-text-primary)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-section)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          {title}
        </h2>
        {desc ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
            {desc}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">{right}{action}</div>
    </div>
  );
}
