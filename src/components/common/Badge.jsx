import React from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-pill)] px-4 py-2.5 text-xs tracking-[0.2em] transition-all duration-300",
        active ? "shadow-[var(--shadow-subtle)]" : ""
      )}
      style={{
        backgroundColor: active ? "var(--color-accent-soft)" : "var(--color-surface-primary)",
        color: active ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

export default Badge;
