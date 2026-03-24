import workspaceSupplierSeeds, {
  workspaceSupplierSeedState,
} from "../../data/workspace/workspaceSupplierSeeds";
import { previewWorkspaceSupplierImport } from "../../utils/workspaceSupplierImport";
import {
  applySupplierVisibility,
  canEditSupplier,
  resolveSupplierViewerName,
} from "../../utils/workspaceSupplierVisibility";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.suppliers;
const FIXED_DELAY_MS = 5;

let cachedStore = null;

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, FIXED_DELAY_MS);
  });
}

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function getStorage() {
  if (typeof globalThis.localStorage !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  const memory = (globalThis.__GLINT_WORKSPACE_SUPPLIER_MEMORY__ ||= new Map());

  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(String(key), String(value));
    },
    removeItem(key) {
      memory.delete(String(key));
    },
  };
}

function nowIso() {
  return new Date().toISOString();
}

function text(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = text(value).toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return fallback;
}

function normalizeList(value) {
  const source = Array.isArray(value) ? value : String(value ?? "").split(",");
  return [...new Set(source.map((item) => text(item)).filter(Boolean))];
}

function normalizeCooperationRecords(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .map((record, index) => ({
      id: text(record?.id) || `record-${index + 1}`,
      title: text(record?.title),
      outcome: text(record?.outcome),
    }))
    .filter((record) => record.title || record.outcome);
}

function normalizeLogs(logs, fallbackAction, actor, message) {
  if (Array.isArray(logs) && logs.length > 0) {
    return logs.map((entry) => ({
      timestamp: text(entry.timestamp) || nowIso(),
      action: text(entry.action) || fallbackAction,
      actor: text(entry.actor) || actor,
      message: text(entry.message) || message,
    }));
  }

  return [
    {
      timestamp: nowIso(),
      action: fallbackAction,
      actor,
      message,
    },
  ];
}

function createInitialStore() {
  return {
    version: workspaceSupplierSeedState.version,
    nextSequence: workspaceSupplierSeedState.nextSequence,
    items: clone(workspaceSupplierSeeds),
  };
}

function readStoreFromStorage() {
  const raw = getStorage().getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialStore();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      return createInitialStore();
    }

    return {
      version: Number(parsed.version) || workspaceSupplierSeedState.version,
      nextSequence: Number(parsed.nextSequence) || workspaceSupplierSeedState.nextSequence,
      items: clone(parsed.items),
    };
  } catch {
    return createInitialStore();
  }
}

function persistStore(store) {
  getStorage().setItem(STORAGE_KEY, JSON.stringify(store));
  invalidateWorkspaceStorageCache(STORAGE_KEY);
}

function getStore() {
  if (!cachedStore) {
    cachedStore = readStoreFromStorage();
    persistStore(cachedStore);
  }

  return cachedStore;
}

function saveStore(store) {
  cachedStore = store;
  persistStore(store);
}

function generateUniqueId(store) {
  let sequence = Number(store.nextSequence) || 1;
  let candidate = `workspace-supplier-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `workspace-supplier-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function findSupplierIndex(store, id) {
  return store.items.findIndex((item) => item.id === text(id));
}

function resolveOwner(payload = {}, existingSupplier = null, viewer = {}) {
  const viewerRole = text(viewer.role);
  const viewerName = resolveSupplierViewerName(viewer);
  const currentOwner = text(existingSupplier?.owner);
  const requestedOwner = text(payload.owner);

  if (!viewerRole) {
    return requestedOwner || currentOwner || viewerName || "system";
  }

  if (viewerRole === "director") {
    return requestedOwner || currentOwner || viewerName || "部门总监";
  }

  if (viewerRole === "employee") {
    if (existingSupplier?.isPrivate) {
      return currentOwner || viewerName || requestedOwner || "内部员工";
    }

    if (normalizeBoolean(payload.isPrivate, existingSupplier?.isPrivate)) {
      return viewerName || currentOwner || requestedOwner || "内部员工";
    }

    return currentOwner || viewerName || requestedOwner || "内部员工";
  }

  return requestedOwner || currentOwner || viewerName || "system";
}

function normalizeSupplierPayload(input, existingSupplier = null, viewer = {}) {
  const payload = input ?? {};
  const base = existingSupplier ?? {};
  const owner = resolveOwner(payload, existingSupplier, viewer);

  return {
    id: text(payload.id ?? base.id),
    name: text(payload.name ?? base.name),
    rating: text(payload.rating ?? base.rating) || "B",
    status: text(payload.status ?? base.status) || "draft",
    isPrivate: normalizeBoolean(payload.isPrivate, Boolean(base.isPrivate)),
    owner,
    companyArea: normalizeNumber(payload.companyArea, normalizeNumber(base.companyArea, 0)),
    leadTimeBand: text(payload.leadTimeBand ?? base.leadTimeBand),
    priceBand: text(payload.priceBand ?? base.priceBand),
    cooperationHistory: text(payload.cooperationHistory ?? base.cooperationHistory),
    fitScore: normalizeNumber(payload.fitScore, normalizeNumber(base.fitScore, 0)),
    patentCount: normalizeNumber(payload.patentCount, normalizeNumber(base.patentCount, 0)),
    capacitySummary: text(payload.capacitySummary ?? base.capacitySummary),
    contactName: text(payload.contactName ?? base.contactName),
    contactPhone: text(payload.contactPhone ?? base.contactPhone),
    contactEmail: text(payload.contactEmail ?? base.contactEmail),
    tags: normalizeList(payload.tags ?? base.tags),
    relatedProductIds: normalizeList(payload.relatedProductIds ?? base.relatedProductIds),
    summary: text(payload.summary ?? base.summary),
    cooperationRecords: normalizeCooperationRecords(
      payload.cooperationRecords,
      base.cooperationRecords,
    ),
    updatedAt: text(payload.updatedAt ?? base.updatedAt) || nowIso(),
    logs: Array.isArray(payload.logs ?? base.logs) ? clone(payload.logs ?? base.logs) : [],
  };
}

function validateSupplierPayload(payload) {
  const missingFields = [];
  if (!text(payload.name)) missingFields.push("name");
  if (!text(payload.rating)) missingFields.push("rating");
  if (!text(payload.status)) missingFields.push("status");
  if (!text(payload.owner)) missingFields.push("owner");
  if (!text(payload.leadTimeBand)) missingFields.push("leadTimeBand");
  if (!text(payload.priceBand)) missingFields.push("priceBand");
  if (!text(payload.contactName)) missingFields.push("contactName");
  if (!text(payload.contactPhone)) missingFields.push("contactPhone");

  if (missingFields.length > 0) {
    return createError("INVALID_SUPPLIER_INPUT", `Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!["A", "B", "C"].includes(text(payload.rating))) {
    return createError("INVALID_SUPPLIER_INPUT", `Unsupported rating: ${payload.rating}`);
  }

  if (!["active", "draft", "archived"].includes(text(payload.status))) {
    return createError("INVALID_SUPPLIER_INPUT", `Unsupported status: ${payload.status}`);
  }

  return null;
}

function materializeSupplier(store, supplier, viewer, index) {
  const payload = normalizeSupplierPayload(supplier, null, viewer);
  const requestedId = text(payload.id);
  const id = requestedId && !store.items.some((item) => item.id === requestedId)
    ? requestedId
    : generateUniqueId(store);
  const actor = resolveSupplierViewerName(viewer) || payload.owner || "import";

  return {
    ...payload,
    id,
    updatedAt: nowIso(),
    logs: normalizeLogs(payload.logs, "import", actor, `Imported supplier record ${index}.`),
  };
}

function projectSupplier(supplier, viewer) {
  return applySupplierVisibility(supplier, viewer);
}

function filterSuppliers(items, query = {}) {
  const keyword = text(query.keyword).toLowerCase();
  const status = text(query.status);
  const rating = text(query.rating);
  const visibility = text(query.visibility);

  return items.filter((item) => {
    if (status && status !== "all" && item.status !== status) {
      return false;
    }

    if (rating && rating !== "all" && item.rating !== rating) {
      return false;
    }

    if (visibility === "private" && !item.isPrivate) {
      return false;
    }

    if (visibility === "public" && item.isPrivate) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = [
      item.id,
      item.name,
      item.owner,
      item.cooperationHistory,
      item.capacitySummary,
      item.summary,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .map((value) => text(value).toLowerCase())
      .join(" ");

    return haystack.includes(keyword);
  });
}

function toCsvValue(value) {
  const normalized = String(value ?? "");
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

export async function listWorkspaceSuppliers(query = {}, viewer = {}) {
  await delay();
  const store = getStore();
  const filtered = filterSuppliers(store.items, query);
  return {
    items: filtered.map((item) => projectSupplier(item, viewer)),
    total: filtered.length,
  };
}

export async function getWorkspaceSupplier(id, viewer = {}) {
  await delay();
  const store = getStore();
  const supplier = store.items.find((item) => item.id === text(id));
  if (!supplier) {
    return createError("SUPPLIER_NOT_FOUND", "Supplier not found.");
  }

  return {
    supplier: projectSupplier(supplier, viewer),
  };
}

export async function createWorkspaceSupplier(input, viewer = {}) {
  await delay();
  const store = getStore();
  const payload = normalizeSupplierPayload(input, null, viewer);
  const validationError = validateSupplierPayload(payload);
  if (validationError) {
    return validationError;
  }

  const requestedId = text(payload.id);
  const id = requestedId && !store.items.some((item) => item.id === requestedId)
    ? requestedId
    : generateUniqueId(store);
  const actor = resolveSupplierViewerName(viewer) || payload.owner || "system";

  const supplier = {
    ...payload,
    id,
    updatedAt: nowIso(),
    logs: [
      ...normalizeLogs(payload.logs, "create", actor, "Created workspace supplier."),
    ],
  };

  store.items = [supplier, ...store.items];
  saveStore(store);

  return {
    supplier: clone(supplier),
  };
}

export async function updateWorkspaceSupplier(id, input, viewer = {}) {
  await delay();
  const store = getStore();
  const index = findSupplierIndex(store, id);
  if (index === -1) {
    return createError("SUPPLIER_NOT_FOUND", "Supplier not found.");
  }

  const currentSupplier = store.items[index];
  if (!canEditSupplier(currentSupplier, viewer)) {
    return createError("SUPPLIER_FORBIDDEN", "You do not have permission to edit this supplier.");
  }

  const payload = normalizeSupplierPayload(input, currentSupplier, viewer);
  const validationError = validateSupplierPayload(payload);
  if (validationError) {
    return validationError;
  }

  const actor = resolveSupplierViewerName(viewer) || payload.owner || currentSupplier.owner || "system";
  const updatedSupplier = {
    ...currentSupplier,
    ...payload,
    id: currentSupplier.id,
    updatedAt: nowIso(),
    logs: [
      ...normalizeLogs(currentSupplier.logs, "seed", currentSupplier.owner || "system", "Existing supplier."),
      {
        timestamp: nowIso(),
        action: "update",
        actor,
        message: "Updated workspace supplier.",
      },
    ],
  };

  store.items[index] = updatedSupplier;
  saveStore(store);

  return {
    supplier: clone(updatedSupplier),
  };
}

export async function previewWorkspaceSuppliersImport(rawText) {
  await delay();
  return previewWorkspaceSupplierImport(rawText);
}

export async function importWorkspaceSuppliers(rawText, viewer = {}) {
  await delay();
  const store = getStore();
  const preview = previewWorkspaceSupplierImport(rawText);
  const items = [];
  const warnings = [...preview.warnings];

  preview.preview.forEach((record, index) => {
    if (!record.supplier) {
      return;
    }

    const supplier = materializeSupplier(store, record.supplier, viewer, index + 1);
    const validationError = validateSupplierPayload(supplier);
    if (validationError) {
      warnings.push(`Record ${index + 1}: ${validationError.error.message}`);
      return;
    }

    store.items.unshift(supplier);
    items.push(supplier);
  });

  if (items.length === 0) {
    return createError("INVALID_IMPORT_INPUT", "Import preview contains no valid supplier records.");
  }

  saveStore(store);
  return {
    importedCount: items.length,
    items: clone(items),
    warnings,
  };
}

export async function exportWorkspaceSuppliers({ ids, format = "csv", includeSensitive = false } = {}, viewer = {}) {
  await delay();
  const store = getStore();
  const selectedIds = Array.isArray(ids) ? ids.map((item) => text(item)).filter(Boolean) : [];
  const selected = selectedIds.length > 0
    ? store.items.filter((item) => selectedIds.includes(item.id))
    : store.items;
  const projected = selected.map((item) => projectSupplier(item, viewer));

  if (text(format).toLowerCase() !== "csv") {
    return createError("UNSUPPORTED_EXPORT_FORMAT", `Unsupported format: ${format}`);
  }

  const columns = [
    "id",
    "name",
    "rating",
    "status",
    "isPrivate",
    "owner",
    "companyArea",
    "leadTimeBand",
    "priceBand",
    "cooperationHistory",
    "fitScore",
    "patentCount",
    "capacitySummary",
    "contactName",
    "contactPhone",
    "contactEmail",
    "tags",
    "relatedProductIds",
    "summary",
  ];

  const rows = projected.map((item) => ({
    ...item,
    contactName: includeSensitive ? item.contactName : "",
    contactPhone: includeSensitive ? item.contactPhone : "",
    contactEmail: includeSensitive ? item.contactEmail : "",
    tags: Array.isArray(item.tags) ? item.tags.join(";") : "",
    relatedProductIds: Array.isArray(item.relatedProductIds) ? item.relatedProductIds.join(";") : "",
  }));

  const content = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => toCsvValue(row[column])).join(",")),
  ].join("\n");

  return {
    filename: "workspace-suppliers.csv",
    content,
    total: rows.length,
  };
}

export function resetWorkspaceSuppliersStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceSuppliersService = {
  createWorkspaceSupplier,
  exportWorkspaceSuppliers,
  getWorkspaceSupplier,
  importWorkspaceSuppliers,
  listWorkspaceSuppliers,
  previewWorkspaceSuppliersImport,
  resetWorkspaceSuppliersStore,
  updateWorkspaceSupplier,
};

export default mockWorkspaceSuppliersService;
