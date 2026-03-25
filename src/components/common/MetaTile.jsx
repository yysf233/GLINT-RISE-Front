import React from "react";

export function MetaTile({ label, value }) {
  return (
    <div className="rounded-[var(--radius-tile)] p-5 shadow-[var(--shadow-subtle)]" style={{ background: "var(--gradient-card)" }}>
      <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">{label}</div>
      <div className="mt-3 text-sm leading-7 text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

export default MetaTile;
