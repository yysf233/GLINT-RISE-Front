import React from "react";
import { BarChart3, FolderKanban, UsersRound } from "lucide-react";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";

const dashboardConfigs = {
  employee: {
    eyebrow: "Protected Workspace",
    title: "Employee Workspace",
    description: "Employees land here first. This page stays intentionally light and only defines a stable welcome state plus future module placeholders.",
    focusTitle: "Daily Entry Point",
    focusBody: "Later tasks can add alerts, collaboration flow, and notices here. For now this page only establishes the employee shell.",
    modules: [
      {
        title: "Task Pulse",
        description: "Reserved for personal tasks, routing checkpoints, and notices without introducing real dashboard behavior yet.",
        icon: UsersRound,
      },
      {
        title: "Reference Access",
        description: "A future place for shared references and common shortcuts. No live data is connected in this task.",
        icon: FolderKanban,
      },
      {
        title: "Future Modules",
        description: "Additional employee workspace modules will arrive later. This task only locks the entry layout and copy.",
        icon: BarChart3,
      },
    ],
  },
  director: {
    eyebrow: "Protected Workspace",
    title: "Director Workspace",
    description: "Directors use the same shell, but the welcome copy switches to a management view so the role landing state is explicit.",
    focusTitle: "Decision View",
    focusBody: "Later tasks can attach approvals, operating signals, and cross-team watchpoints here. This task keeps it to placeholders only.",
    modules: [
      {
        title: "Decision View",
        description: "Reserved for summary metrics and approvals once later tasks define the actual director tooling.",
        icon: BarChart3,
      },
      {
        title: "Team Rhythm",
        description: "A placeholder for cross-team coordination signals without adding real reporting behavior yet.",
        icon: UsersRound,
      },
      {
        title: "Future Modules",
        description: "More director-facing modules can slot in later. Right now the role-specific landing state is the goal.",
        icon: FolderKanban,
      },
    ],
  },
};

function PlaceholderCard({ item }) {
  const Icon = item.icon;

  return (
    <article
      className="rounded-[var(--radius-card)] border p-5"
      style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)]"
        style={{ backgroundColor: "var(--color-accent-soft)" }}
      >
        <Icon className="h-5 w-5 text-[var(--color-accent-primary)]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
    </article>
  );
}

export function WorkspaceDashboardPage() {
  const { user } = useAuth();
  const config = dashboardConfigs[user?.role] ?? dashboardConfigs.employee;

  return (
    <WorkspaceShell eyebrow={config.eyebrow} title={config.title} description={config.description}>
      <section className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Role Welcome</div>
          <h3 className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]">{config.focusTitle}</h3>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">{config.focusBody}</p>
        </article>

        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ background: "var(--gradient-accent-muted)", borderColor: "var(--color-border-accent)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Scope Guardrail</div>
          <p className="mt-4 text-lg leading-8 text-[var(--color-text-primary)]">
            This page only proves that employee and director users land inside the right shell and see intentional placeholders.
          </p>
        </article>
      </section>

      <section className="mt-6">
        <div className="mb-4 text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Future Modules</div>
        <div className="grid gap-4 md:grid-cols-3">
          {config.modules.map((item) => (
            <PlaceholderCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}

export default WorkspaceDashboardPage;
