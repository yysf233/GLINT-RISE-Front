import React from "react";
import { ArrowRight, KeyRound, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import { getDefaultWorkspaceRoute } from "../utils/authRoutes";

const roleLabels = {
  employee: "Employee Workspace",
  director: "Director Workspace",
  developer: "Developer Workspace",
};

export function WorkspaceForbiddenPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSwitching, setIsSwitching] = React.useState(false);
  const fallbackRoute = getDefaultWorkspaceRoute(user?.role) ?? "/home";

  const handleSwitchAccount = async () => {
    if (isSwitching) {
      return;
    }

    setIsSwitching(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Restricted Route"
      title="No Access"
      description="This account is authenticated but it does not have permission for the requested workspace page. Use the recovery actions below."
    >
      <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)]"
            style={{ backgroundColor: "rgba(169, 107, 49, 0.22)" }}
          >
            <ShieldX className="h-6 w-6 text-[var(--color-accent-primary)]" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[var(--color-text-primary)]">Recovery Actions</h3>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
            Your current role is {roleLabels[user?.role] ?? "Protected Account"}. This page exists only to explain the restriction and provide a way back.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate(fallbackRoute)}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-on-accent)]"
              style={{ background: "var(--gradient-accent)" }}
            >
              <ArrowRight className="h-4 w-4" />
              Return to My Workspace
            </button>
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isSwitching}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-primary)] disabled:opacity-70"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <KeyRound className="h-4 w-4" />
              {isSwitching ? "Switching" : "Switch Account"}
            </button>
          </div>
        </article>

        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">What To Do Next</div>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <li>Use Return to My Workspace to go back to the default route your current role can open.</li>
            <li>Use Switch Account if another role should have access to the page you wanted.</li>
            <li>Use Back to Public Site in the shell if you want to continue outside the protected area.</li>
          </ul>
        </article>
      </section>
    </WorkspaceShell>
  );
}

export default WorkspaceForbiddenPage;
