import React from "react";
import { cn } from "../../utils/cn";

export function SectionHeading({ eyebrow, subtitle, title, desc, action, right, variant = "default" }) {
  const isDark = variant === "dark-prototype";

  return (
    <div
      className={cn(
        "mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
        isDark ? "md:mb-14" : "",
      )}
    >
      <div className={cn(isDark ? "max-w-4xl" : "max-w-3xl")}>
        {eyebrow ? (
          <div
            className={cn(
              "mb-5 flex items-center gap-3",
              isDark
                ? "text-[10px] tracking-[0.34em] text-white/46 md:text-[11px]"
                : "text-[11px] tracking-[0.32em] text-[var(--color-accent-primary)]",
            )}
          >
            {!isDark ? <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" /> : null}
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h2
          className={cn(isDark ? "text-white" : "text-[var(--color-text-primary)]")}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isDark ? "clamp(2.3rem, 5vw, 4.4rem)" : "var(--font-size-section)",
            fontWeight: 800,
            lineHeight: isDark ? 0.9 : 0.94,
            letterSpacing: isDark ? "-0.06em" : "-0.05em",
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <div className={cn("mt-3 text-[11px] tracking-[0.22em]", isDark ? "text-white/36" : "text-[var(--color-text-muted)]")}>
            {subtitle}
          </div>
        ) : null}
        {desc ? (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-8 md:text-lg",
              isDark ? "text-white/68" : "text-[var(--color-text-secondary)]",
            )}
          >
            {desc}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {right}
        {action}
      </div>
    </div>
  );
}

export default SectionHeading;
