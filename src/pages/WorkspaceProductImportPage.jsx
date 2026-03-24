import React from "react";
import { ArrowLeft, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";
import { useNotice } from "../context/useNotice";

const SAMPLE_IMPORT = `Aurora Stage Grid|aurora-stage-grid|space|draft|Mina Wu|4600|3100|immersive, launch|yes|Spatial product grid for stage and gallery deployments.
Signal Relay Mini|signal-relay-mini|device|active|Harper Lin|1580|940|compact, retail|no|Compact smart device for light operational rollouts.`;

export function WorkspaceProductImportPage() {
  const navigate = useNavigate();
  const { showNotice } = useNotice();
  const [rawText, setRawText] = React.useState(SAMPLE_IMPORT);
  const [previewState, setPreviewState] = React.useState({
    status: "idle",
    items: [],
    warnings: [],
    error: "",
  });
  const [isImporting, setIsImporting] = React.useState(false);

  const handlePreview = async () => {
    setPreviewState({
      status: "loading",
      items: [],
      warnings: [],
      error: "",
    });

    const result = await workspaceProductsApi.previewWorkspaceProductImport(rawText);

    if (result?.error) {
      setPreviewState({
        status: "error",
        items: [],
        warnings: [],
        error: result.error.message || "Unable to preview this import.",
      });
      return;
    }

    setPreviewState({
      status: "ready",
      items: (result.preview ?? []).filter((entry) => entry.product).map((entry) => entry.product),
      warnings: result.warnings ?? [],
      error: "",
    });
  };

  const handleImport = async () => {
    if (isImporting) {
      return;
    }

    if (previewState.status !== "ready") {
      await handlePreview();
      return;
    }

    setIsImporting(true);

    try {
      const result = await workspaceProductsApi.importWorkspaceProducts(rawText);

      if (result?.error) {
        showNotice(result.error.message || "Unable to import products.");
        return;
      }

      showNotice(`Imported ${result.importedCount ?? 0} product record(s).`);
      navigate("/workspace/products");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Batch Import"
      title="Batch Import Products"
      description="Paste pipe-delimited rows to preview and import mock workspace products. This route validates the text, shows warnings, and persists imported records into the local mock catalog."
    >
      <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <article
          className="rounded-[var(--radius-panel)] border p-5 md:p-6"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Input Format</div>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">One line per product record</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            Use this order: <code>name|id|category|status|owner|retailPrice|internalCost|tags|needsUpdate|summary</code>.
          </p>

          <textarea
            data-testid="workspace-product-import-input"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            className="mt-5 min-h-[320px] w-full rounded-[var(--radius-card)] border px-4 py-4 text-sm leading-7 text-[var(--color-text-primary)] outline-none"
            style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              data-testid="workspace-product-import-preview"
              onClick={handlePreview}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              {previewState.status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Preview Import
            </button>
            <button
              type="button"
              data-testid="workspace-product-import-submit"
              onClick={handleImport}
              disabled={isImporting}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-on-accent)] disabled:opacity-70"
              style={{ background: "var(--gradient-accent)" }}
            >
              {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import Records
            </button>
            <button
              type="button"
              onClick={() => navigate("/workspace/products")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </button>
          </div>
        </article>

        <article
          className="rounded-[var(--radius-panel)] border p-5 md:p-6"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Preview</div>
          {previewState.status === "idle" ? (
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Preview the import first. The mock parser will normalize tags, validate required fields, and report warnings before anything is written.
            </p>
          ) : null}

          {previewState.status === "loading" ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Building preview rows.
            </div>
          ) : null}

          {previewState.status === "error" ? <div className="mt-4 text-sm text-[#f5d9aa]">{previewState.error}</div> : null}

          {previewState.warnings.length > 0 ? (
            <div
              className="mt-4 rounded-[var(--radius-card)] border px-4 py-4"
              style={{ borderColor: "rgba(214, 163, 76, 0.38)", backgroundColor: "rgba(214, 163, 76, 0.08)" }}
            >
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">Warnings</div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-secondary)]">
                {previewState.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {previewState.items.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {previewState.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[var(--radius-card)] border p-4"
                  style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</div>
                    <div className="text-xs tracking-[0.16em] text-[var(--color-text-muted)]">{item.id}</div>
                  </div>
                  <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{item.summary}</div>
                  <div className="mt-3 text-xs tracking-[0.14em] text-[var(--color-text-muted)]">
                    {item.category} | {item.status} | {item.owner}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </WorkspaceShell>
  );
}

export default WorkspaceProductImportPage;
