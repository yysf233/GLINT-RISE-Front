import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
import { WorkspaceContentPage } from "./pages/WorkspaceContentPage";
import { WorkspaceDashboardPage } from "./pages/WorkspaceDashboardPage";
import { WorkspaceBannersPage } from "./pages/WorkspaceBannersPage";
import { WorkspaceForbiddenPage } from "./pages/WorkspaceForbiddenPage";
import { WorkspaceProjectDetailPage } from "./pages/WorkspaceProjectDetailPage";
import { WorkspaceProjectFormPage } from "./pages/WorkspaceProjectFormPage";
import { WorkspaceProjectsPage } from "./pages/WorkspaceProjectsPage";
import { WorkspaceExportsPage } from "./pages/WorkspaceExportsPage";
import { WorkspaceProductDetailPage } from "./pages/WorkspaceProductDetailPage";
import { WorkspaceProductFormPage } from "./pages/WorkspaceProductFormPage";
import { WorkspaceProductImportPage } from "./pages/WorkspaceProductImportPage";
import { WorkspaceProductsPage } from "./pages/WorkspaceProductsPage";
import { WorkspaceQuotesPage } from "./pages/WorkspaceQuotesPage";
import { WorkspaceLogsPage } from "./pages/WorkspaceLogsPage";
import { WorkspaceSiteSettingsPage } from "./pages/WorkspaceSiteSettingsPage";
import { WorkspaceSupplierDetailPage } from "./pages/WorkspaceSupplierDetailPage";
import { WorkspaceSupplierFormPage } from "./pages/WorkspaceSupplierFormPage";
import { WorkspaceSupplierImportPage } from "./pages/WorkspaceSupplierImportPage";
import { WorkspaceSuppliersPage } from "./pages/WorkspaceSuppliersPage";
import { WorkspaceUserDetailPage } from "./pages/WorkspaceUserDetailPage";
import { WorkspaceUserFormPage } from "./pages/WorkspaceUserFormPage";
import { WorkspaceUsersPage } from "./pages/WorkspaceUsersPage";

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
            <Route path="/workspace/dashboard" element={<WorkspaceDashboardPage />} />
            <Route path="/workspace/content" element={<WorkspaceContentPage />} />
            <Route path="/workspace/content/banners" element={<WorkspaceBannersPage />} />
            <Route path="/workspace/products" element={<WorkspaceProductsPage />} />
            <Route path="/workspace/products/new" element={<WorkspaceProductFormPage />} />
            <Route path="/workspace/products/import" element={<WorkspaceProductImportPage />} />
            <Route path="/workspace/products/:productId" element={<WorkspaceProductDetailPage />} />
            <Route path="/workspace/products/:productId/edit" element={<WorkspaceProductFormPage />} />
            <Route path="/workspace/projects" element={<WorkspaceProjectsPage />} />
            <Route path="/workspace/projects/new" element={<WorkspaceProjectFormPage />} />
            <Route path="/workspace/projects/:projectId" element={<WorkspaceProjectDetailPage />} />
            <Route path="/workspace/projects/:projectId/edit" element={<WorkspaceProjectFormPage />} />
            <Route path="/workspace/suppliers" element={<WorkspaceSuppliersPage />} />
            <Route path="/workspace/suppliers/new" element={<WorkspaceSupplierFormPage />} />
            <Route path="/workspace/suppliers/import" element={<WorkspaceSupplierImportPage />} />
            <Route path="/workspace/suppliers/:supplierId" element={<WorkspaceSupplierDetailPage />} />
            <Route path="/workspace/suppliers/:supplierId/edit" element={<WorkspaceSupplierFormPage />} />
            <Route path="/workspace/quotes" element={<WorkspaceQuotesPage />} />
            <Route path="/workspace/exports" element={<WorkspaceExportsPage />} />
            <Route path="/workspace/settings/content" element={<WorkspaceSiteSettingsPage />} />
            <Route path="/workspace/settings/logs" element={<WorkspaceLogsPage />} />
            <Route path="/workspace/settings/users" element={<WorkspaceUsersPage />} />
            <Route path="/workspace/settings/users/new" element={<WorkspaceUserFormPage />} />
            <Route path="/workspace/settings/users/:userId" element={<WorkspaceUserDetailPage />} />
            <Route path="/workspace/settings/users/:userId/edit" element={<WorkspaceUserFormPage />} />
            <Route path="/workspace/forbidden" element={<WorkspaceForbiddenPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
