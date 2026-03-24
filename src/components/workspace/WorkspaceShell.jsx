import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminProvider from "./admin/AdminProvider";
import { useAuth } from "../../context/useAuth";

export function WorkspaceShell({ eyebrow, title, description, children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AdminProvider>
      <AdminLayout
        role={user?.role}
        eyebrow={eyebrow}
        title={title}
        description={description}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        onBackToPublicSite={() => navigate("/home")}
      >
        {children}
      </AdminLayout>
    </AdminProvider>
  );
}

export default WorkspaceShell;
