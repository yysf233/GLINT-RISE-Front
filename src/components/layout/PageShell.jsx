import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { themeVars } from "../../theme/tokens";
import { cn } from "../../utils/cn";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";

export function PageShell({ children, lockViewport = false, hideFooter = false }) {
  const location = useLocation();
  const isPrototypeDark = location.pathname !== "/";

  return (
    <div
      data-public-theme="glint-rise-public"
      data-page-shell-mode={lockViewport ? "viewport-locked" : "default"}
      data-testid="page-shell-root"
      className={cn(
        lockViewport ? "h-[100dvh] overflow-hidden" : "min-h-screen",
        "text-[var(--color-text-primary)]",
      )}
      style={{ ...themeVars, background: isPrototypeDark ? "#0f1116" : "var(--gradient-page)" }}
    >
      <TopNav />
      <motion.main
        key={`${location.pathname}${location.search}`}
        data-testid="page-shell-main"
        data-page-motion="enabled"
        className={cn(
          "px-[var(--space-page-x)] pt-[var(--space-page-top)]",
          lockViewport && "h-[100dvh] overflow-hidden",
        )}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      {hideFooter ? null : <Footer />}
    </div>
  );
}
