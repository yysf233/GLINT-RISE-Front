import React from "react";
import { cn } from "../../utils/cn";

export function MetaTile({ label, value, variant = "default" }) {
  const isPrototypeDark = variant === "prototype-dark";

  return (
    <div
      className={cn(
        "p-5",
        isPrototypeDark
          ? "rounded-[20px] border border-white/6 bg-[#1c1b1b]"
          : "rounded-[var(--radius-tile)] shadow-[var(--shadow-subtle)]",
      )}
      style={isPrototypeDark ? undefined : { background: "var(--gradient-card)" }}
    >
      <div className={cn("text-[10px] tracking-[0.28em]", isPrototypeDark ? "text-white/38" : "text-[var(--color-accent-primary)]")}>
        {label}
      </div>
      <div className={cn("mt-3 text-sm leading-7", isPrototypeDark ? "text-white" : "text-[var(--color-text-primary)]")}>{value}</div>
    </div>
  );
}

export default MetaTile;
