import React from "react";
import { cn } from "../../utils/cn";

export function ImageCard({ image, title, subtitle, tag, onClick, className = "", overlay = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-card)] text-left shadow-[var(--shadow-floating)] transition duration-500 hover:translate-y-[var(--motion-hover-lift)]",
        className
      )}
      style={{ backgroundColor: "var(--color-surface-secondary)" }}
    >
      <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      {overlay ? (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(13,23,41,0.08), var(--color-overlay-strong))" }}
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        {tag ? (
          <div className="mb-3 inline-flex rounded-[var(--radius-pill)] bg-white/70 px-3 py-1 text-[10px] tracking-[0.24em] text-[var(--color-accent-primary)] backdrop-blur-md">
            {tag}
          </div>
        ) : null}
        <h3
          className="text-white"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-card-title)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </h3>
        {subtitle ? <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 md:text-base">{subtitle}</p> : null}
      </div>
    </button>
  );
}

export default ImageCard;
