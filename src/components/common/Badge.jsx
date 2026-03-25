import React from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, active = false, onClick, variant = "default" }) {
  const isPrototypeDark = variant === "prototype-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 text-xs tracking-[0.2em] transition-all duration-300",
        isPrototypeDark ? "rounded-full border" : "rounded-[var(--radius-pill)]",
        active ? "shadow-[var(--shadow-subtle)]" : ""
      )}
      style={{
        backgroundColor: isPrototypeDark
          ? active
            ? "rgba(186, 195, 255, 0.14)"
            : "rgba(255, 255, 255, 0.04)"
          : active
            ? "var(--color-accent-soft)"
            : "var(--color-surface-primary)",
        color: isPrototypeDark
          ? active
            ? "#bac3ff"
            : "rgba(255, 255, 255, 0.66)"
          : active
            ? "var(--color-accent-primary)"
            : "var(--color-text-secondary)",
        borderColor: isPrototypeDark ? (active ? "rgba(186, 195, 255, 0.28)" : "rgba(255, 255, 255, 0.08)") : "transparent",
      }}
    >
      {children}
    </button>
  );
}

export default Badge;
