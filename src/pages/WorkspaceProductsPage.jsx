import React from "react";
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  LoaderCircle,
  PenSquare,
  Plus,
  Search,
  Sparkles,
  Tags,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";
import { useNotice } from "../context/useNotice";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "flagship", label: "Flagship" },
  { value: "device", label: "Device" },
  { value: "space", label: "Space" },
  { value: "hot", label: "Hot pick" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const UPDATE_OPTIONS = [
  { value: "all", label: "All sync states" },
  { value: "yes", label: "Needs update" },
  { value: "no", label: "Synced" },
];

const SORT_OPTIONS = [
  { value: "updated-desc", label: "Updated: newest first" },
  { value: "updated-asc", label: "Updated: oldest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-desc", label: "Retail price: high to low" },
  { value: "price-asc", label: "Retail price: low to high" },
];

const EMPTY_SUMMARY = {
  total: 0,
  activeCount: 0,
  draftCount: 0,
  archivedCount: 0,
  needsUpdateCount: 0,
};

const BADGE_STYLES = {
  active: {
    label: "Active",
    backgroundColor: "rgba(95, 189, 113, 0.14)",
    borderColor: "rgba(95, 189, 113, 0.4)",
    color: "#d8f3dd",
  },
  draft: {
    label: "Draft",
    backgroundColor: "rgba(214, 163, 76, 0.14)",
    borderColor: "rgba(214, 163, 76, 0.38)",
    color: "#f5d9aa",
  },
  archived: {
    label: "Archived",
    backgroundColor: "rgba(126, 126, 126, 0.16)",
    borderColor: "rgba(126, 126, 126, 0.38)",
    color: "#d7d7d7",
  },
};

function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <article
      className="rounded-[var(--radius-card)] border p-5"
      style={{ background: "var(--gradient-card)", borderColor: "var(--color-border-subtle)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.24em] text-[var(--color-text-muted)]">{label}</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">{value}</div>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)]"
          style={{ backgroundColor: "var(--color-accent-soft)" }}
        >
          <Icon className="h-5 w-5 text-[var(--color-accent-primary)]" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{hint}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const config = BADGE_STYLES[status] ?? BADGE_STYLES.draft;

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em]"
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        color: config.color,
      }}
    >
      {config.label}
    </span>
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

function formatDate(value) {
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
  }).format(date);
}

export function WorkspaceProductsPage() {
  const navigate = useNavigate();
  const { showNotice } = useNotice();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = React.useDeferredValue(keyword);
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [needsUpdate, setNeedsUpdate] = React.useState("all");
  const [sort, setSort] = React.useState("updated-desc");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [listState, setListState] = React.useState({
    status: "loading",
    items: [],
    total: 0,
    summary: EMPTY_SUMMARY,
    error: "",
  });
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [bulkTagsInput, setBulkTagsInput] = React.useState("");
  const [isApplyingTags, setIsApplyingTags] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;

    setListState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    workspaceProductsApi
      .listWorkspaceProducts({
        keyword: deferredKeyword,
        category,
        status,
        needsUpdate,
        sort,
      })
      .then((result) => {
        if (!isActive) {
          return;
        }

        if (result?.error) {
          setListState({
            status: "error",
            items: [],
            total: 0,
            summary: EMPTY_SUMMARY,
            error: result.error.message || "Unable to load products.",
          });
          return;
        }

        setListState({
          status: "ready",
          items: result?.items ?? [],
          total: result?.total ?? 0,
          summary: { ...EMPTY_SUMMARY, ...(result?.summary ?? {}) },
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setListState({
          status: "error",
          items: [],
          total: 0,
          summary: EMPTY_SUMMARY,
          error: "Unable to load products.",
        });
      });

    return () => {
      isActive = false;
    };
  }, [category, deferredKeyword, needsUpdate, refreshToken, sort, status]);

  React.useEffect(() => {
    setSelectedIds((current) => current.filter((id) => listState.items.some((item) => item.id === id)));
  }, [listState.items]);

  const allVisibleSelected = listState.items.length > 0 && selectedIds.length === listState.items.length;
  const selectedCount = selectedIds.length;

  const handleToggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(listState.items.map((item) => item.id));
  };

  const handleToggleOne = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };

  const handleApplyBulkTags = async () => {
    if (selectedIds.length === 0 || isApplyingTags) {
      return;
    }

    const tags = bulkTagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      showNotice("Enter at least one tag before applying.");
      return;
    }

    setIsApplyingTags(true);

    try {
      const result = await workspaceProductsApi.bulkAddWorkspaceProductTags({
        ids: selectedIds,
        tags,
      });

      if (result?.error) {
        showNotice(result.error.message || "Bulk tag update failed.");
        return;
      }

      showNotice(`Applied ${tags.length} tag(s) to ${result.updatedCount ?? selectedIds.length} product(s).`);
      setBulkTagsInput("");
      setSelectedIds([]);
      setRefreshToken((value) => value + 1);
    } finally {
      setIsApplyingTags(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Products Console"
      title="Product Operations"
      description="Employees and directors manage the mock product catalog here. Search, filter, batch tag, create, edit, and import all run on the shared mock service contract."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Catalog total"
          value={listState.summary.total}
          hint="Total records available to the current filterable mock catalog."
          icon={Boxes}
        />
        <MetricCard
          label="Active records"
          value={listState.summary.activeCount}
          hint="Currently visible items ready for public or internal use."
          icon={Sparkles}
        />
        <MetricCard
          label="Draft records"
          value={listState.summary.draftCount}
          hint="Items still under editing or waiting for a release decision."
          icon={CircleAlert}
        />
        <MetricCard
          label="Needs update"
          value={listState.summary.needsUpdateCount}
          hint="Records flagged for content refresh or public-site sync."
          icon={Tags}
        />
      </section>

      <section
        className="mt-6 rounded-[var(--radius-panel)] border p-5 md:p-6"
        style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs tracking-[0.28em] text-[var(--color-accent-primary)]">Manage Catalog</div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">Mock product table with full management actions</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              This backend slice keeps the full management loop usable before a real API exists. The module persists local changes, so create, edit,
              import, and bulk tag updates survive refresh.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/workspace/products/new")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-on-accent)]"
              style={{ background: "var(--gradient-accent)" }}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
            <button
              type="button"
              onClick={() => navigate("/workspace/products/import")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-primary)]"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <Upload className="h-4 w-4" />
              Batch Import
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr),repeat(4,minmax(0,0.7fr))]">
          <label className="block">
            <span className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">Search</span>
            <div
              className="mt-2 flex items-center gap-3 rounded-[var(--radius-pill)] border px-4"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            >
              <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
              <input
                data-testid="workspace-products-search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search name, owner, tag, or summary"
                className="h-12 w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">Category</span>
            <select
              data-testid="workspace-products-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">Status</span>
            <select
              data-testid="workspace-products-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">Sync state</span>
            <select
              data-testid="workspace-products-needs-update"
              value={needsUpdate}
              onChange={(event) => setNeedsUpdate(event.target.value)}
              className="mt-2 h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            >
              {UPDATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">Sort</span>
            <select
              data-testid="workspace-products-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="mt-2 h-12 w-full rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="mt-6 flex flex-col gap-4 rounded-[var(--radius-card)] border p-4 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <div>
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              {listState.total} matching record{listState.total === 1 ? "" : "s"}
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {selectedCount} selected. Use bulk tag to patch multiple records without leaving the table.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[420px] md:flex-row">
            <input
              data-testid="workspace-products-bulk-tags"
              value={bulkTagsInput}
              onChange={(event) => setBulkTagsInput(event.target.value)}
              placeholder="Enter tags, separated by commas"
              className="h-12 flex-1 rounded-[var(--radius-pill)] border px-4 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-surface-secondary)" }}
            />
            <button
              type="button"
              data-testid="workspace-products-apply-tags"
              onClick={handleApplyBulkTags}
              disabled={selectedCount === 0 || isApplyingTags}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-5 text-sm font-semibold tracking-[0.14em] text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              {isApplyingTags ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Tags className="h-4 w-4" />}
              Apply Tags
            </button>
          </div>
        </div>
      </section>

      <section
        className="mt-6 overflow-hidden rounded-[var(--radius-panel)] border"
        style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-subtle)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
                <th className="px-5 py-4 text-left">
                  <label className="inline-flex items-center gap-3 text-xs tracking-[0.24em] text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      data-testid="workspace-products-select-all"
                      checked={allVisibleSelected}
                      onChange={handleToggleAll}
                      className="h-4 w-4 rounded border"
                    />
                    All
                  </label>
                </th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Product</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Category</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Status</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Owner</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Retail Price</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Updated</th>
                <th className="px-5 py-4 text-left text-xs tracking-[0.24em] text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listState.items.map((item) => (
                <tr key={item.id} className="border-b align-top" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleToggleOne(item.id)}
                      data-testid={`workspace-products-select-${item.id}`}
                      className="mt-1 h-4 w-4 rounded border"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{item.id}</div>
                    <div className="mt-3 max-w-[22rem] text-sm leading-6 text-[var(--color-text-secondary)]">{item.summary}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.tags ?? []).map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full border px-3 py-1 text-xs text-[var(--color-text-secondary)]"
                          style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{item.categoryLabel || item.category}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-3">
                      <StatusBadge status={item.status} />
                      {item.needsUpdate ? (
                        <span
                          className="rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.14em]"
                          style={{
                            backgroundColor: "rgba(214, 163, 76, 0.12)",
                            borderColor: "rgba(214, 163, 76, 0.34)",
                            color: "var(--color-accent-primary)",
                          }}
                        >
                          Needs update
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">Synced</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{item.owner}</td>
                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{formatCurrency(item.retailPrice)}</td>
                  <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{formatDate(item.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        data-testid={`workspace-products-view-${item.id}`}
                        onClick={() => navigate(`/workspace/products/${item.id}`)}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
                        style={{ backgroundColor: "var(--color-surface-secondary)" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                        View
                      </button>
                      <button
                        type="button"
                        data-testid={`workspace-products-edit-${item.id}`}
                        onClick={() => navigate(`/workspace/products/${item.id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
                        style={{ backgroundColor: "var(--color-surface-secondary)" }}
                      >
                        <PenSquare className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listState.status === "loading" || listState.status === "refreshing" ? (
          <div className="flex items-center gap-3 border-t px-5 py-5 text-sm text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border-subtle)" }}>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Refreshing the mock catalog.
          </div>
        ) : null}

        {listState.status === "error" ? (
          <div className="border-t px-5 py-5 text-sm text-[#f5d9aa]" style={{ borderColor: "var(--color-border-subtle)" }}>
            {listState.error}
          </div>
        ) : null}

        {listState.status === "ready" && listState.items.length === 0 ? (
          <div className="border-t px-5 py-8 text-sm text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border-subtle)" }}>
            No records match the current filters. Clear the search or import new records to continue.
          </div>
        ) : null}
      </section>
    </WorkspaceShell>
  );
}

export default WorkspaceProductsPage;
