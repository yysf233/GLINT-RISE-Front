import React from "react";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";

export function PageShell({ children }) {
  return (
    <div className="min-h-screen text-[var(--color-text-primary)]" style={{ background: "var(--gradient-page)" }}>
      <TopNav />
      <main className="px-[var(--space-page-x)] pt-[var(--space-page-top)]">{children}</main>
      <Footer />
    </div>
  );
}
