import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { brand, navItems } from "../../data/siteContent";
import { cn } from "../../utils/cn";

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isEntry = location.pathname === "/";

  const activePath = useMemo(() => {
    if (location.pathname.startsWith("/case")) return "/cases";
    if (location.pathname.startsWith("/product")) return "/products";
    return location.pathname;
  }, [location.pathname]);

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50 backdrop-blur-3xl"
        style={{ background: "linear-gradient(180deg, rgba(17,17,17,0.96), rgba(17,17,17,0.68), transparent)" }}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-[var(--space-page-x)]">
          <div className="flex items-center gap-3">
            {!isEntry ? (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] md:hidden"
                aria-label="打开导航菜单"
              >
                <Menu className="h-4 w-4" />
              </button>
            ) : null}
            <button type="button" onClick={() => navigate("/home")} className="text-left">
              <div
                className="text-[var(--color-accent-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  letterSpacing: "-0.06em",
                }}
              >
                {brand.name}
              </div>
              {!isEntry ? (
                <div className="text-[10px] tracking-[0.32em] text-[var(--color-text-muted)]">
                  {brand.cnName}
                </div>
              ) : null}
            </button>
          </div>

          {!isEntry ? (
            <>
              <div className="hidden items-center gap-10 md:flex">
                {navItems.map((item) => {
                  const active = activePath === item.path;
                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "border-b-2 pb-1 text-sm tracking-[0.18em] transition-colors",
                        active
                          ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 md:gap-5">
                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-primary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] md:flex md:items-center md:gap-2"
                >
                  <Search className="h-4 w-4" />
                  搜索
                </button>
                {location.pathname !== "/login" ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="hidden text-sm tracking-[0.18em] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] md:block"
                  >
                    登录占位
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-[var(--radius-pill)] px-4 py-2.5 text-xs font-bold tracking-[0.18em] text-[#1C1B19] shadow-[var(--shadow-accent)] transition active:scale-95 md:px-5 md:text-sm"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  回到入口
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              className="h-full w-[86%] max-w-sm p-6"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-[var(--color-accent-primary)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      letterSpacing: "-0.06em",
                    }}
                  >
                    {brand.name}
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.32em] text-[var(--color-text-muted)]">
                    {brand.cnName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-[var(--radius-pill)] bg-[var(--color-background-canvas)] text-[var(--color-text-primary)]"
                  aria-label="关闭导航菜单"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-8 space-y-3">
                {navItems.map((item) => {
                  const active = activePath === item.path;
                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[var(--radius-tile)] px-4 py-4 text-left",
                        active
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]"
                          : "bg-[var(--color-background-canvas)] text-[var(--color-text-primary)]"
                      )}
                    >
                      <span className="text-sm tracking-[0.22em]">{item.label}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
              <div
                className="mt-8 rounded-[var(--radius-card)] p-5"
                style={{ backgroundColor: "var(--color-background-canvas)" }}
              >
                <div className="text-[10px] tracking-[0.28em] text-[var(--color-accent-primary)]">风格说明</div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  移动端导航保留抽屉层级，避免直接压缩桌面端栏目；视觉值统一来自主题 tokens。
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
