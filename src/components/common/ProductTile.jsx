import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function ProductTile({ item, onClick, highlight = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-panel)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-floating)]",
        highlight ? "md:translate-y-6" : ""
      )}
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="aspect-[4/5] overflow-hidden bg-[var(--color-surface-muted)]">
        <img src={item.hero} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className="text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.55rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              {item.name}
            </div>
            <div
              className="mt-3 inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-[11px] tracking-[0.22em] text-[var(--color-accent-primary)]"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              {item.tag}
            </div>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 text-[var(--color-accent-primary)] transition-transform group-hover:translate-x-1" />
        </div>

        <p className="mt-5 flex-1 text-sm leading-7 text-[var(--color-text-secondary)]">{item.desc}</p>

        <div className="mt-5 flex items-center justify-between text-xs tracking-[0.18em] text-[var(--color-text-muted)]">
          <span>{item.shortName}</span>
          <span className="text-[var(--color-accent-primary)]">{item.price}</span>
        </div>
      </div>
    </button>
  );
}

export default ProductTile;
