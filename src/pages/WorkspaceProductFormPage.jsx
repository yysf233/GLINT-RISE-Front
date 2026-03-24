import React from "react";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";
import { useNotice } from "../context/useNotice";

const CATEGORY_OPTIONS = [
  { value: "flagship", label: "Flagship" },
  { value: "device", label: "Device" },
  { value: "space", label: "Space" },
  { value: "hot", label: "Hot pick" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const DEFAULT_FORM = {
  id: "",
  name: "",
  category: "flagship",
  status: "draft",
  owner: "",
  ownerTeam: "",
  publicProductId: "",
  retailPrice: "",
  internalCost: "",
  tagsText: "",
  summary: "",
  progressSummary: "",
  supplierSummary: "",
  hero: "",
  needsUpdate: true,
};

function normalizeProductForm(product) {
  return {
    id: product.id || "",
    name: product.name || "",
    category: product.category || "flagship",
    status: product.status || "draft",
    owner: product.owner || "",
    ownerTeam: product.ownerTeam || "",
    publicProductId: product.publicProductId || "",
    retailPrice: product.retailPrice ? String(product.retailPrice) : "",
    internalCost: product.internalCost ? String(product.internalCost) : "",
    tagsText: (product.tags ?? []).join(", "),
    summary: product.summary || "",
    progressSummary: product.progressSummary || "",
    supplierSummary: product.supplierSummary || "",
    hero: product.hero || "",
    needsUpdate: Boolean(product.needsUpdate),
  };
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPayload(form) {
  const fallbackId = slugify(form.id) || slugify(form.name);

  return {
    id: fallbackId,
    name: form.name.trim(),
    category: form.category,
    status: form.status,
    owner: form.owner.trim(),
    ownerTeam: form.ownerTeam.trim(),
    publicProductId: form.publicProductId.trim() || null,
    retailPrice: Number(form.retailPrice),
    internalCost: Number(form.internalCost),
    tags: form.tagsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    summary: form.summary.trim(),
    progressSummary: form.progressSummary.trim(),
    supplierSummary: form.supplierSummary.trim(),
    hero: form.hero.trim(),
    needsUpdate: Boolean(form.needsUpdate),
  };
}

function validateForm(form, isEditMode) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!isEditMode && !slugify(form.id || form.name)) {
    errors.id = "Provide an id or a name that can become a valid slug.";
  }

  if (!form.owner.trim()) {
    errors.owner = "Owner is required.";
  }

  if (!form.summary.trim()) {
    errors.summary = "Summary is required.";
  }

  if (!form.retailPrice || Number.isNaN(Number(form.retailPrice))) {
    errors.retailPrice = "Retail price must be a number.";
  }

  if (!form.internalCost || Number.isNaN(Number(form.internalCost))) {
    errors.internalCost = "Internal cost must be a number.";
  }

  if (!form.hero.trim()) {
    errors.hero = "Hero image URL is required.";
  }

  return errors;
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-2">{children}</div>
      {error ? <div className="mt-2 text-sm text-[#f5d9aa]">{error}</div> : null}
    </label>
  );
}

function InputField(props) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] ${props.className ?? ""}`}
      style={{
        borderColor: "var(--color-border-subtle)",
        backgroundColor: "var(--color-surface-secondary)",
        ...(props.style ?? {}),
      }}
    />
  );
}

function TextareaField(props) {
  return (
    <textarea
      {...props}
      className={`min-h-[144px] w-full rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] ${props.className ?? ""}`}
      style={{
        borderColor: "var(--color-border-subtle)",
        backgroundColor: "var(--color-surface-secondary)",
        ...(props.style ?? {}),
      }}
    />
  );
}

export function WorkspaceProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { showNotice } = useNotice();
  const isEditMode = Boolean(productId);
  const [form, setForm] = React.useState(DEFAULT_FORM);
  const [errors, setErrors] = React.useState({});
  const [pageState, setPageState] = React.useState({
    status: isEditMode ? "loading" : "ready",
    error: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isEditMode) {
      return undefined;
    }

    let isActive = true;

    workspaceProductsApi
      .getWorkspaceProduct(productId)
      .then((result) => {
        if (!isActive) {
          return;
        }

        if (result?.error || !result?.product) {
          setPageState({
            status: "error",
            error: result?.error?.message || "Unable to load this product for editing.",
          });
          return;
        }

        setForm(normalizeProductForm(result.product));
        setPageState({
          status: "ready",
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setPageState({
          status: "error",
          error: "Unable to load this product for editing.",
        });
      });

    return () => {
      isActive = false;
    };
  }, [isEditMode, productId]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form, isEditMode);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildPayload(form);
      const result = isEditMode
        ? await workspaceProductsApi.updateWorkspaceProduct(productId, payload)
        : await workspaceProductsApi.createWorkspaceProduct(payload);

      if (result?.error || !result?.product) {
        showNotice(result?.error?.message || "Unable to save this product.");
        return;
      }

      showNotice(isEditMode ? "Product record updated." : "Product record created.");
      navigate(`/workspace/products/${result.product.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow={isEditMode ? "Edit Product" : "Create Product"}
      title={isEditMode ? "Edit Workspace Product" : "Create Workspace Product"}
      description="Use the shared mock contract to create or edit backend product records. The same form writes into persisted local mock storage, so refresh keeps the changes."
    >
      {pageState.status === "loading" ? (
        <section
          className="flex items-center gap-3 rounded-[var(--radius-panel)] border p-6 text-sm text-[var(--color-text-secondary)]"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading product editor.
        </section>
      ) : null}

      {pageState.status === "error" ? (
        <section
          className="rounded-[var(--radius-panel)] border p-6"
          style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
        >
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Editor unavailable</h3>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{pageState.error}</p>
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

      {pageState.status === "ready" ? (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <section
            className="rounded-[var(--radius-panel)] border p-5 md:p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Product name" error={errors.name}>
                <InputField
                  data-testid="workspace-product-form-name"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Aurora Control Hub"
                />
              </Field>
              <Field label="Record id" error={errors.id}>
                <InputField
                  value={form.id}
                  onChange={(event) => handleChange("id", event.target.value)}
                  disabled={isEditMode}
                  placeholder="aurora-control-hub"
                  data-testid="workspace-product-form-id"
                />
              </Field>
              <Field label="Owner" error={errors.owner}>
                <InputField
                  data-testid="workspace-product-form-owner"
                  value={form.owner}
                  onChange={(event) => handleChange("owner", event.target.value)}
                  placeholder="Lydia Chen"
                />
              </Field>
              <Field label="Owner team">
                <InputField
                  data-testid="workspace-product-form-owner-team"
                  value={form.ownerTeam}
                  onChange={(event) => handleChange("ownerTeam", event.target.value)}
                  placeholder="Product Operations"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                  className="h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
                  style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) => handleChange("status", event.target.value)}
                  className="h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
                  style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Retail price" error={errors.retailPrice}>
                <InputField
                  data-testid="workspace-product-form-retail-price"
                  value={form.retailPrice}
                  onChange={(event) => handleChange("retailPrice", event.target.value)}
                  placeholder="2499"
                />
              </Field>
              <Field label="Internal cost" error={errors.internalCost}>
                <InputField
                  data-testid="workspace-product-form-internal-cost"
                  value={form.internalCost}
                  onChange={(event) => handleChange("internalCost", event.target.value)}
                  placeholder="1620"
                />
              </Field>
              <Field label="Public product id">
                <InputField value={form.publicProductId} onChange={(event) => handleChange("publicProductId", event.target.value)} placeholder="lumina-arc" />
              </Field>
            </div>
          </section>

          <section
            className="rounded-[var(--radius-panel)] border p-5 md:p-6"
            style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
          >
            <div className="grid gap-5 xl:grid-cols-[1fr,1fr]">
              <Field label="Summary" error={errors.summary}>
                <TextareaField
                  data-testid="workspace-product-form-summary"
                  value={form.summary}
                  onChange={(event) => handleChange("summary", event.target.value)}
                  placeholder="Short overview for list and detail views."
                />
              </Field>
              <Field label="Progress summary">
                <TextareaField
                  data-testid="workspace-product-form-progress-summary"
                  value={form.progressSummary}
                  onChange={(event) => handleChange("progressSummary", event.target.value)}
                  placeholder="Internal milestone snapshot, blockers, and recent decisions."
                />
              </Field>
              <Field label="Supplier summary">
                <TextareaField
                  data-testid="workspace-product-form-supplier-summary"
                  value={form.supplierSummary}
                  onChange={(event) => handleChange("supplierSummary", event.target.value)}
                  placeholder="Supplier baseline, lead-time notes, and current fulfillment status."
                />
              </Field>
              <div className="grid gap-5">
                <Field label="Tags">
                  <TextareaField
                    data-testid="workspace-product-form-tags"
                    value={form.tagsText}
                    onChange={(event) => handleChange("tagsText", event.target.value)}
                    placeholder="immersive, flagship, launch-ready"
                    className="min-h-[104px]"
                  />
                </Field>
                <Field label="Hero image URL" error={errors.hero}>
                  <TextareaField
                    data-testid="workspace-product-form-hero"
                    value={form.hero}
                    onChange={(event) => handleChange("hero", event.target.value)}
                    placeholder="https://example.com/hero.jpg"
                    className="min-h-[104px]"
                  />
                </Field>
                <label
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-4 text-sm text-[var(--color-text-primary)]"
                  style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
                >
                  <input type="checkbox" checked={form.needsUpdate} onChange={(event) => handleChange("needsUpdate", event.target.checked)} />
                  Mark this record as needing a public-site update
                </label>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <button
              type="submit"
              data-testid="workspace-product-form-submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-on-accent)] disabled:opacity-70"
              style={{ background: "var(--gradient-accent)" }}
            >
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditMode ? "Save Changes" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/workspace/products/${productId}` : "/workspace/products")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
          </section>
        </form>
      ) : null}
    </WorkspaceShell>
  );
}

export default WorkspaceProductFormPage;
