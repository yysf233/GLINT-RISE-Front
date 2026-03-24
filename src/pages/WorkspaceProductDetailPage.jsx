import React from "react";
import { ArrowLeft, ExternalLink, FilePenLine, LoaderCircle, PackageSearch, ScrollText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";

function DetailCard({ label, value, hint }) {
  return (
    <article
      className="rounded-[var(--radius-card)] border p-5"
      style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
    >
      <div className="text-xs tracking-[0.24em] text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">{value || "--"}</div>
      {hint ? <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{hint}</p> : null}
    </article>
  );
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function WorkspaceProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [state, setState] = React.useState({
    status: "loading",
    product: null,
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;

    setState({
      status: "loading",
      product: null,
      error: "",
    });

    workspaceProductsApi
      .getWorkspaceProduct(productId)
      .then((result) => {
        if (!isActive) {
          return;
        }

        if (result?.error) {
          setState({
            status: "error",
            product: null,
            error: result.error.message || "Unable to load this product.",
          });
          return;
        }

        setState({
          status: "ready",
          product: result?.product ?? null,
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState({
          status: "error",
          product: null,
          error: "Unable to load this product.",
        });
      });

    return () => {
      isActive = false;
    };
  }, [productId]);

  const product = state.product;

  return (
    <WorkspaceShell
      eyebrow="Product Detail"
      title={product?.name || "Product Detail"}
      description="Inspect the mock backend record, internal metadata, sync notes, pricing, and recent activity before editing or importing updates."
    >
      {state.status === "loading" ? (
        <section
          className="flex items-center gap-3 rounded-[var(--radius-panel)] border p-6 text-sm text-[var(--color-text-secondary)]"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading product record.
        </section>
      ) : null}

      {state.status === "error" ? (
        <section
          className="rounded-[var(--radius-panel)] border p-6"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <div className="flex items-center gap-3 text-lg font-semibold text-[var(--color-text-primary)]">
            <PackageSearch className="h-5 w-5 text-[var(--color-accent-primary)]" />
            Product not available
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{state.error}</p>
          <button
            type="button"
            onClick={() => navigate("/workspace/products")}
            className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </section>
      ) : null}

      {product ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.3fr,0.7fr]">
            <article
              className="overflow-hidden rounded-[var(--radius-panel)] border"
              style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
            >
              <div className="aspect-[1.6/1] w-full overflow-hidden border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
                <img src={product.hero} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-6 md:p-7">
                <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">{product.id}</div>
                <h3 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">{product.name}</h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">{product.summary}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(product.tags ?? []).map((tag) => (
                    <span
                      key={`${product.id}-${tag}`}
                      className="rounded-full border px-3 py-1 text-xs text-[var(--color-text-secondary)]"
                      style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    data-testid="workspace-product-detail-edit"
                    onClick={() => navigate(`/workspace/products/${product.id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-on-accent)]"
                    style={{ background: "var(--gradient-accent)" }}
                  >
                    <FilePenLine className="h-4 w-4" />
                    Edit Product
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
                  {product.publicProductId ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product.publicProductId}`)}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
                      style={{ backgroundColor: "var(--color-surface-secondary)" }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Public Detail
                    </button>
                  ) : null}
                </div>
              </div>
            </article>

            <article
              className="rounded-[var(--radius-panel)] border p-6 md:p-7"
              style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
            >
              <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Record Snapshot</div>
              <div className="mt-5 grid gap-4">
                <DetailCard label="Status" value={product.statusLabel || product.status} />
                <DetailCard label="Category" value={product.categoryLabel || product.category} />
                <DetailCard label="Owner" value={product.owner} />
                <DetailCard label="Last updated" value={formatDateTime(product.updatedAt)} />
                <DetailCard label="Public sync" value={product.needsUpdate ? "Needs update" : "Synced"} />
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Retail price" value={formatCurrency(product.retailPrice)} hint="Reference price carried by the mock service." />
            <DetailCard label="Internal cost" value={formatCurrency(product.internalCost)} hint="Internal cost estimate used for the backend table." />
            <DetailCard label="Owner team" value={product.ownerTeam || "Operations"} hint="Editable from the product form." />
            <DetailCard label="Public product id" value={product.publicProductId || "Not linked"} hint="Used when this backend record maps to a public detail page." />
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr,1fr]">
            <article
              className="rounded-[var(--radius-panel)] border p-6 md:p-7"
              style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
            >
              <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Progress Summary</div>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{product.progressSummary || "No progress summary available."}</p>

              <div className="mt-8 text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Supplier Summary</div>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{product.supplierSummary || "No supplier summary available."}</p>
            </article>

            <article
              className="rounded-[var(--radius-panel)] border p-6 md:p-7"
              style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <ScrollText className="h-5 w-5 text-[var(--color-accent-primary)]" />
                <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Recent Activity</div>
              </div>

              <div className="mt-5 grid gap-4">
                {(product.logs ?? []).map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-[var(--radius-card)] border p-4"
                    style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">{entry.action}</div>
                      <div className="text-xs tracking-[0.16em] text-[var(--color-text-muted)]">{formatDateTime(entry.timestamp)}</div>
                    </div>
                    <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{entry.message || entry.detail}</div>
                    <div className="mt-3 text-xs tracking-[0.16em] text-[var(--color-text-muted)]">Actor: {entry.actor}</div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </WorkspaceShell>
  );
}

export default WorkspaceProductDetailPage;
