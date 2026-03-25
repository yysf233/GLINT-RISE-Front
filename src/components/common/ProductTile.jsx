import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function ProductTile({ item, onClick, highlight = false, variant = "default" }) {
  const isPrototypeDark = variant === "prototype-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-full flex-col overflow-hidden text-left transition-all duration-500 hover:-translate-y-1",
        isPrototypeDark
          ? "rounded-[22px] border border-white/6 bg-[#1c1b1b] text-white hover:shadow-[0_28px_72px_rgba(0,0,0,0.28)]"
          : "rounded-[var(--radius-card)] shadow-[var(--shadow-panel)] hover:shadow-[var(--shadow-floating)]",
        highlight ? "md:translate-y-6" : ""
      )}
      style={isPrototypeDark ? undefined : { background: "var(--gradient-card)" }}
    >
      <div className={cn("overflow-hidden", isPrototypeDark ? "aspect-[4/5] bg-[#101114]" : "aspect-[4/5] bg-[var(--color-surface-muted)]")}>
        <img src={item.hero} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      </div>

      <div className={cn("flex flex-1 flex-col", isPrototypeDark ? "p-6" : "p-5 md:p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={cn(isPrototypeDark ? "text-white" : "text-[var(--color-text-primary)]")}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: isPrototypeDark ? "1.35rem" : "1.55rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              {item.name}
            </div>
            <div
              className={cn(
                "mt-3 inline-flex px-3 py-1 text-[11px] tracking-[0.22em]",
                isPrototypeDark
                  ? "rounded-full bg-white/6 text-[#bac3ff]"
                  : "rounded-[var(--radius-pill)] text-[var(--color-accent-primary)]",
              )}
              style={isPrototypeDark ? undefined : { backgroundColor: "var(--color-accent-soft)" }}
            >
              {item.tag}
            </div>
          </div>
          <ArrowRight
            className={cn(
              "mt-1 h-4 w-4 transition-transform group-hover:translate-x-1",
              isPrototypeDark ? "text-[#bac3ff]" : "text-[var(--color-accent-primary)]",
            )}
          />
        </div>

        <p className={cn("mt-5 flex-1 text-sm leading-7", isPrototypeDark ? "text-white/66" : "text-[var(--color-text-secondary)]")}>
          {item.desc}
        </p>

        <div
          className={cn(
            "mt-5 flex items-center justify-between text-xs tracking-[0.18em]",
            isPrototypeDark ? "text-white/38" : "text-[var(--color-text-muted)]",
          )}
        >
          <span>{item.shortName}</span>
          <span className={cn(isPrototypeDark ? "text-[#bac3ff]" : "text-[var(--color-accent-primary)]")}>{item.price}</span>
        </div>
      </div>
    </button>
  );
}

export default ProductTile;
