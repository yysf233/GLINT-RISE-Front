import React from "react";
import { BookMarked, FileCheck2, WandSparkles } from "lucide-react";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";

const contentModules = [
  {
    title: "Content Maintenance",
    description: "This placeholder reserves the main maintenance surface without introducing real forms, versions, or publishing flows yet.",
    icon: BookMarked,
  },
  {
    title: "Structure Checks",
    description: "Reserved for field validation, route checks, and baseline rules once later tasks define that behavior.",
    icon: FileCheck2,
  },
  {
    title: "Release Review",
    description: "A future place for pre-release checks and regression reminders. This task only sets the boundary.",
    icon: WandSparkles,
  },
];

export function WorkspaceContentPage() {
  return (
    <WorkspaceShell
      eyebrow="Protected Workspace"
      title="Developer Workspace"
      description="Developers land on the content maintenance route. This page stays intentionally simple and only defines the shell plus placeholders."
    >
      <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Content Maintenance</div>
          <h3 className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]">Maintenance Entry Ready</h3>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
            This route gives developer accounts a clear landing page for future maintenance work without expanding into a real content backend.
          </p>
        </article>

        <article
          className="rounded-[var(--radius-panel)] border p-6 md:p-7"
          style={{ background: "var(--gradient-accent-muted)", borderColor: "var(--color-border-accent)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Current Scope</div>
          <p className="mt-4 text-lg leading-8 text-[var(--color-text-primary)]">
            This task only needs the developer shell and intentional Content Maintenance placeholders. No real management tools are added here.
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {contentModules.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
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
        })}
      </section>
    </WorkspaceShell>
  );
}

export default WorkspaceContentPage;
