import React from "react";
import { cn } from "../../utils/cn";

export function ProgressiveBar({ total, active }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-[3px] rounded-[var(--radius-pill)] transition-all duration-500",
            index === active ? "w-14 bg-[var(--color-accent-primary)]" : "w-6 bg-[var(--color-surface-muted)]"
          )}
        />
      ))}
    </div>
  );
}
