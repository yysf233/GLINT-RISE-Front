import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { PageShell } from "./components/layout/PageShell";
import { themeVars } from "./theme/tokens";
import { CaseSharePage } from "./pages/CaseSharePage";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { CaseMapPage } from "./pages/CaseMapPage";
import { CaseTimelinePage } from "./pages/CaseTimelinePage";
import { CasesOverviewPage } from "./pages/CasesOverviewPage";
import { EntryPage } from "./pages/EntryPage";
import { HomePage } from "./pages/HomePage";
import { HotProductsPage } from "./pages/HotProductsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductSharePage } from "./pages/ProductSharePage";
import { ProductsOverviewPage } from "./pages/ProductsOverviewPage";
import { SearchPage } from "./pages/SearchPage";

function WorkspacePlaceholderPage({ eyebrow, title, description }) {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl pt-4">
        <div
          className="rounded-[var(--radius-panel)] p-8 md:p-12"
          style={{ backgroundColor: "var(--color-surface-primary)", boxShadow: "var(--shadow-floating)" }}
        >
          <div className="mb-4 text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">{eyebrow}</div>
          <h1
            className="text-[var(--color-text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "3rem",
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </section>
    </PageShell>
  );
}

export default function App() {
  return (
    <div style={themeVars}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cases" element={<CasesOverviewPage />} />
          <Route path="/case-timeline" element={<CaseTimelinePage />} />
          <Route path="/case-map" element={<CaseMapPage />} />
          <Route path="/case/:id" element={<CaseDetailPage />} />
          <Route path="/share/case/:id" element={<CaseSharePage />} />
          <Route path="/products" element={<ProductsOverviewPage />} />
          <Route path="/products/hot" element={<HotProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/share/product/:id" element={<ProductSharePage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/workspace/dashboard"
              element={
                <WorkspacePlaceholderPage
                  eyebrow="工作台占位"
                  title="仪表盘"
                  description="受保护的工作台路由已接入认证上下文，后续任务将在这里补齐真正的仪表盘内容。"
                />
              }
            />
            <Route
              path="/workspace/content"
              element={
                <WorkspacePlaceholderPage
                  eyebrow="工作台占位"
                  title="内容台"
                  description="当前仅保留最小受保护内容页，用于验证角色落地和受限访问跳转行为。"
                />
              }
            />
            <Route
              path="/workspace/forbidden"
              element={
                <WorkspacePlaceholderPage
                  eyebrow="访问受限"
                  title="无权访问"
                  description="当前账号没有进入该工作台页面的权限，请切换到允许的角色后再继续。"
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
