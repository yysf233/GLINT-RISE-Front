import React from "react";

export function MetaTile({ label, value }) {
  return (
    <div
      className="rounded-[var(--radius-tile)] p-5"
      style={{ backgroundColor: "var(--color-background-canvas)" }}
    >
      <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">{label}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
