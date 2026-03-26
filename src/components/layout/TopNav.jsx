import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { readPublicSiteSettings } from "../../services/publicSiteContent";
import { cn } from "../../utils/cn";

const NAV_ROUTE_BEZIER = "cubic-bezier(0.22, 1, 0.36, 1)";
const NAV_ROUTE_TRANSITION = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1],
};

export function TopNav() {
  const siteSettings = readPublicSiteSettings();
  const { brand, navigation } = siteSettings;
  const navItems = navigation.items;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const searchFormRef = useRef(null);
  const searchInputRef = useRef(null);
  const isEntry = location.pathname === "/";
  const isPrototypeShell = location.pathname !== "/";
  const isSearchRoute = location.pathname === "/search";
  const desktopNavItems = useMemo(() => navItems.filter((item) => item.path !== "/search"), [navItems]);

  const activePath = useMemo(() => {
    if (location.pathname.startsWith("/case-timeline")) return "/case-timeline";
    if (location.pathname.startsWith("/case-map")) return "/cases";
    if (location.pathname.startsWith("/case/")) return "/cases";
    if (location.pathname.startsWith("/product")) return "/products";
    return location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isSearchRoute) return;

    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("keyword") ?? "");
    setSearchOpen(true);
  }, [isSearchRoute, location.search]);

  useEffect(() => {
    if (!isSearchRoute) {
      setSearchOpen(false);
    }
  }, [isSearchRoute]);

  const desktopSearchExpanded = searchOpen || isSearchRoute;
  const desktopSearchCollapsedWidth = isPrototypeShell ? 52 : 164;
  const desktopSearchExpandedWidth = isPrototypeShell ? 288 : 340;
  const visibleDesktopNavItems = desktopNavItems;
  const visibleMobileNavItems = isPrototypeShell ? desktopNavItems : navItems;

  const buildDesktopSearchRoute = (keyword) => {
    const currentParams = new URLSearchParams(location.search);
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      category: isSearchRoute ? currentParams.get("category") ?? "all" : "all",
      tag: isSearchRoute ? currentParams.get("tag") ?? "all" : "all",
    });

    return `/search?${params.toString()}`;
  };

  const openDesktopSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleDesktopSearchSubmit = (event) => {
    event.preventDefault();

    if (!desktopSearchExpanded) {
      openDesktopSearch();
      return;
    }

    navigate(buildDesktopSearchRoute(searchValue));
  };

  if (isEntry) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 px-[var(--space-page-x)] pt-4">
        <div
          data-nav-appearance={isPrototypeShell ? "dark-prototype" : "glass"}
          className={cn(
            "mx-auto flex h-[76px] w-full max-w-[1600px] items-center justify-between rounded-[var(--radius-pill)] px-4 backdrop-blur-[20px] md:px-6",
            isPrototypeShell
              ? "border border-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.28)]"
              : "border border-[color:var(--color-border-subtle)] shadow-[var(--shadow-floating)]",
          )}
          style={{ background: isPrototypeShell ? "rgba(14, 14, 14, 0.72)" : "var(--gradient-glass)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-[var(--radius-pill)] md:hidden",
                isPrototypeShell ? "bg-white/8 text-white" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]",
              )}
              aria-label="打开导航菜单"
            >
              <Menu className="h-4 w-4" />
            </button>

            <button type="button" onClick={() => navigate("/home")} className="text-left">
              <div
                className={cn(isPrototypeShell ? "text-[#eef2ff]" : "text-[var(--color-text-primary)]")}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isPrototypeShell ? "1.2rem" : "1.6rem",
                  fontWeight: 800,
                  letterSpacing: isPrototypeShell ? "-0.03em" : "-0.06em",
                }}
              >
                {brand.name}
              </div>
              {!isPrototypeShell ? (
                <div className="text-[10px] tracking-[0.28em] text-[var(--color-text-muted)]">{brand.cnName}</div>
              ) : null}
            </button>
          </div>

          <div className={cn("hidden items-center lg:flex", isPrototypeShell ? "gap-10" : "gap-8")}>
            {visibleDesktopNavItems.map((item) => {
              const active = activePath === item.path;
              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  data-nav-active={active ? "true" : "false"}
                  className={cn(
                    "relative pb-1 text-sm transition-colors",
                    isPrototypeShell ? "font-semibold tracking-[0.14em]" : "tracking-[0.18em]",
                  )}
                  style={{
                    color: active
                      ? isPrototypeShell
                        ? "#eef2ff"
                        : "var(--color-accent-primary)"
                      : isPrototypeShell
                        ? "rgba(229, 226, 225, 0.7)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  <span className="relative z-10">{item.label}</span>
                  {active ? (
                    <motion.span
                      layoutId="top-nav-active-indicator"
                      data-testid="top-nav-active-indicator"
                      data-nav-transition={NAV_ROUTE_BEZIER}
                      className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full"
                      transition={NAV_ROUTE_TRANSITION}
                      style={{ background: isPrototypeShell ? "#bac3ff" : "var(--gradient-accent)" }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {location.pathname !== "/login" ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={cn(
                  "hidden text-sm transition md:block",
                  isPrototypeShell
                    ? "tracking-[0.14em] text-white/72 hover:text-white"
                    : "tracking-[0.18em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                登录
              </button>
            ) : null}

            <motion.form
              ref={searchFormRef}
              initial={false}
              animate={{ width: desktopSearchExpanded ? desktopSearchExpandedWidth : desktopSearchCollapsedWidth }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleDesktopSearchSubmit}
              onClick={() => {
                if (!desktopSearchExpanded) {
                  openDesktopSearch();
                }
              }}
              onBlur={(event) => {
                if (searchFormRef.current?.contains(event.relatedTarget)) return;
                if (!isSearchRoute) {
                  setSearchOpen(false);
                }
              }}
              className="hidden h-12 items-center overflow-hidden rounded-[var(--radius-pill)] md:flex"
              style={{ backgroundColor: isPrototypeShell ? "rgba(255,255,255,0.08)" : "var(--color-surface-secondary)" }}
              aria-label="顶部搜索框"
              data-testid="top-nav-search-form"
            >
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !searchValue.trim() && !isSearchRoute) {
                    setSearchOpen(false);
                    searchInputRef.current?.blur();
                  }
                }}
                placeholder={navigation.searchPlaceholder}
                className={cn(
                  "min-w-0 bg-transparent text-sm outline-none transition-all duration-200",
                  isPrototypeShell ? "text-white placeholder:text-white/45" : "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                  desktopSearchExpanded ? "w-full px-4 opacity-100" : "pointer-events-none w-0 px-0 opacity-0",
                )}
                aria-label="顶部搜索输入"
                data-testid="top-nav-search-input"
              />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap text-sm transition-all duration-200",
                  isPrototypeShell ? "text-white/0" : "text-[var(--color-text-secondary)]",
                  desktopSearchExpanded ? "w-0 px-0 opacity-0" : isPrototypeShell ? "w-0 px-0 opacity-0" : "w-auto px-3 opacity-100",
                )}
              >
                搜索
              </span>
              <button
                type={desktopSearchExpanded ? "submit" : "button"}
                onClick={(event) => {
                  if (!desktopSearchExpanded) {
                    event.preventDefault();
                    openDesktopSearch();
                  }
                }}
                className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-pill)] text-[var(--color-text-on-accent)]"
                style={{ background: isPrototypeShell ? "#4453a7" : "var(--gradient-accent)" }}
                aria-label={desktopSearchExpanded ? "提交顶部搜索" : "展开顶部搜索"}
                data-testid="top-nav-search-submit"
              >
                <Search className="h-4 w-4" />
              </button>
            </motion.form>

            {isPrototypeShell ? (
              <button
                type="button"
                onClick={() => navigate("/workspace/dashboard")}
                className="hidden rounded-full bg-[#bac3ff] px-5 py-2 text-sm font-semibold tracking-[0.16em] text-[#15267b] transition hover:opacity-90 md:block"
              >
                控制台
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hidden rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[var(--color-accent-primary)] transition hover:bg-[var(--color-surface-secondary)] md:block"
              >
                回到入口
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[rgba(18,24,36,0.18)] backdrop-blur-xl md:hidden"
          >
              <motion.div
                initial={{ x: -32, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -32, opacity: 0 }}
                className="h-full w-[86%] max-w-sm p-6"
              style={{ backgroundColor: isPrototypeShell ? "#111317" : "var(--color-surface-primary)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={cn(isPrototypeShell ? "text-white" : "text-[var(--color-text-primary)]")}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {brand.name}
                  </div>
                  <div className={cn("mt-1 text-[10px] tracking-[0.28em]", isPrototypeShell ? "text-white/50" : "text-[var(--color-text-muted)]")}>
                    {brand.cnName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-[var(--radius-pill)]",
                    isPrototypeShell ? "bg-white/8 text-white" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]",
                  )}
                  aria-label="关闭导航菜单"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-3">
                {visibleMobileNavItems.map((item) => {
                  const active = activePath === item.path;
                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="flex items-center justify-between rounded-[var(--radius-card)] px-4 py-4 text-left transition"
                      style={{
                        backgroundColor: active
                          ? isPrototypeShell
                            ? "rgba(255,255,255,0.08)"
                            : "var(--color-surface-secondary)"
                          : "transparent",
                      }}
                    >
                      <span className={cn(isPrototypeShell ? "text-white" : "text-[var(--color-text-primary)]")}>{item.label}</span>
                      <ArrowRight className={cn("h-4 w-4", isPrototypeShell ? "text-white/45" : "text-[var(--color-text-muted)]")} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-10">
                <div className={cn("text-[11px] tracking-[0.28em]", isPrototypeShell ? "text-white/42" : "text-[var(--color-text-muted)]")}>站内搜索</div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setMenuOpen(false);
                    navigate(buildDesktopSearchRoute(searchValue));
                  }}
                  className={cn(
                    "mt-8 flex items-center gap-2 rounded-[var(--radius-card)] p-2",
                    isPrototypeShell ? "bg-white/8" : "bg-[var(--color-surface-secondary)]",
                  )}
                >
                  <Search className={cn("ml-2 h-4 w-4", isPrototypeShell ? "text-white/42" : "text-[var(--color-text-muted)]")} />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder={navigation.searchPlaceholder}
                    className={cn(
                      "min-w-0 flex-1 bg-transparent text-sm outline-none",
                      isPrototypeShell ? "text-white placeholder:text-white/40" : "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                    )}
                  />
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
