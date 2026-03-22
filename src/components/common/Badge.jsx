import React from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-pill)] px-4 py-2 text-xs tracking-[0.22em] transition-all duration-300",
        active
          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] shadow-[var(--shadow-subtle)]"
          : "bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
      )}
    >
      {children}
    </button>
  );
}
