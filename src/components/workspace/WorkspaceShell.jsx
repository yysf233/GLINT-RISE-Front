import React from "react";
import { ArrowLeft, Boxes, FilePenLine, LayoutDashboard, LogOut, ShieldAlert } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const roleLabels = {
  employee: "Employee Workspace",
  director: "Director Workspace",
  developer: "Developer Workspace",
};

const navItemsByRole = {
  employee: [
    { to: "/workspace/dashboard", label: "Workspace Overview", description: "Welcome state and future modules", icon: LayoutDashboard },
    { to: "/workspace/products", label: "Product Operations", description: "Mock list, detail, edit, and import flows", icon: Boxes },
    { to: "/workspace/forbidden", label: "Access Notes", description: "Recovery actions for restricted routes", icon: ShieldAlert },
  ],
  director: [
    { to: "/workspace/dashboard", label: "Workspace Overview", description: "Welcome state and decision placeholders", icon: LayoutDashboard },
    { to: "/workspace/products", label: "Product Operations", description: "Mock list, detail, edit, and import flows", icon: Boxes },
    { to: "/workspace/forbidden", label: "Access Notes", description: "Recovery actions for restricted routes", icon: ShieldAlert },
  ],
  developer: [
    { to: "/workspace/content", label: "Content Maintenance", description: "Maintenance and release placeholders", icon: FilePenLine },
    { to: "/workspace/forbidden", label: "Access Notes", description: "Recovery actions for restricted routes", icon: ShieldAlert },
  ],
};

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink to={item.to} className="block">
      {({ isActive }) => (
        <div
          className="rounded-[var(--radius-card)] border px-4 py-4 transition-transform duration-[var(--motion-fast)] hover:-translate-y-0.5"
          style={{
            background: isActive ? "var(--gradient-accent-soft)" : "var(--gradient-card)",
            borderColor: isActive ? "var(--color-border-accent)" : "var(--color-border-subtle)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]"
              style={{ backgroundColor: isActive ? "rgba(17, 17, 17, 0.28)" : "var(--color-accent-soft)" }}
            >
              <Icon className="h-4 w-4 text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.14em] text-[var(--color-text-primary)]">{item.label}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
            </div>
          </div>
        </div>
      )}
    </NavLink>
  );
}

export function WorkspaceShell({ eyebrow, title, description, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const roleLabel = roleLabels[user?.role] ?? "Workspace";
  const navItems = navItemsByRole[user?.role] ?? [];

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
    <div className="min-h-screen text-[var(--color-text-primary)]" style={{ background: "var(--gradient-page)" }}>
      <div className="grid min-h-screen lg:grid-cols-[320px,1fr]">
        <aside
          className="border-b px-6 py-6 lg:border-b-0 lg:border-r lg:px-7 lg:py-8"
          style={{
            backgroundColor: "rgba(17, 17, 17, 0.72)",
            borderColor: "var(--color-border-subtle)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="rounded-[var(--radius-panel)] border p-5" style={{ borderColor: "var(--color-border-subtle)" }}>
            <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">GLINT RISE</div>
            <h1
              className="mt-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em" }}
            >
              {roleLabel}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Protected routes are wired in. This shell only reserves clear entry points for later workspace modules.
            </p>
          </div>

          <nav className="mt-6 grid gap-3">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>

          <div
            className="mt-6 rounded-[var(--radius-card)] border p-5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: "var(--color-border-subtle)" }}
          >
            <div className="text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Current Route</div>
            <div className="mt-3 text-sm text-[var(--color-text-primary)]">{location.pathname}</div>
            <div className="mt-4 text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Current Account</div>
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{user?.id ?? "Unnamed account"}</div>
          </div>
        </aside>

        <div className="px-5 py-5 md:px-7 md:py-7">
          <header
            className="rounded-[var(--radius-panel)] border px-5 py-5 md:px-7"
            style={{
              backgroundColor: "rgba(28, 27, 25, 0.9)",
              borderColor: "var(--color-border-subtle)",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-xs tracking-[0.3em] text-[var(--color-accent-primary)]">{eyebrow}</div>
                <h2
                  className="mt-4 text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {title}
                </h2>
                <p className="mt-4 max-w-3xl text-[var(--color-text-secondary)]">{description}</p>
              </div>

              <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                <div
                  className="rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold tracking-[0.16em]"
                  style={{ borderColor: "var(--color-border-accent)", backgroundColor: "var(--color-accent-soft)" }}
                >
                  {roleLabel}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-primary)]"
                  style={{ backgroundColor: "var(--color-surface-secondary)" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Public Site
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-on-accent)] disabled:opacity-70"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging Out" : "Log Out"}
                </button>
              </div>
            </div>
          </header>

          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceShell;
