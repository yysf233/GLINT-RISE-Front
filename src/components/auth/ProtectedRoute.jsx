import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { canAccessWorkspaceRoute } from "../../utils/authRoutes";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessWorkspaceRoute(user.role, location.pathname)) {
    return <Navigate to="/workspace/forbidden" replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
