import { products as legacyPublicProductSeeds } from "../data/siteContent";
import workspaceProductSeeds, { workspaceProductSeedState } from "../data/workspaceProductSeeds";
import { previewWorkspaceProductImport as previewWorkspaceProductImportText } from "../utils/workspaceProductImport";
import {
  filterWorkspaceProducts,
  getWorkspaceProductSummary,
  normalizeWorkspaceProductQuery,
} from "../utils/workspaceProductFilters";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./mock/workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.products;
const FIXED_DELAY_MS = 5;
const LEGACY_PUBLIC_PRODUCTS_BY_ID = new Map(
  legacyPublicProductSeeds.map((item) => [String(item.id ?? "").trim(), clone(item)]),
);

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

  const memory = (globalThis.__GLINT_WORKSPACE_PRODUCT_MEMORY__ ||= new Map());

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

function normalizeTags(tags) {
  const values = Array.isArray(tags) ? tags : text(tags).split(",");
  return [...new Set(values.map((item) => text(item)).filter(Boolean))];
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
  if (["yes", "true", "1"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;

  return fallback;
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

function normalizeMetaEntry(entry) {
  if (!entry) return null;

  if (Array.isArray(entry)) {
    const [label, value] = entry;
    const normalizedLabel = text(label);
    const normalizedValue = text(value);
    return normalizedLabel && normalizedValue ? { label: normalizedLabel, value: normalizedValue } : null;
  }

  if (typeof entry === "object") {
    const normalizedLabel = text(entry.label);
    const normalizedValue = text(entry.value);
    return normalizedLabel && normalizedValue ? { label: normalizedLabel, value: normalizedValue } : null;
  }

  return null;
}

function normalizePublicMeta(value, fallback = []) {
  const source = Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : [];
  return source.map(normalizeMetaEntry).filter(Boolean);
}

function normalizeMedia(media, coverId, existingMedia) {
  const source = Array.isArray(media) ? media : Array.isArray(existingMedia) ? existingMedia : [];
  const normalized = source
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const id = text(item.id) || `media-${index + 1}`;
      return {
        id,
        url: text(item.url ?? item.src ?? item.image ?? item.hero),
        title: text(item.title ?? item.name),
        isCover: Boolean(item.isCover),
      };
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return [];
  }

  const requestedCoverId = text(coverId);
  const existingCoverId = normalized.find((item) => item.isCover)?.id;
  const hasRequested = requestedCoverId && normalized.some((item) => item.id === requestedCoverId);
  const finalCoverId = hasRequested ? requestedCoverId : existingCoverId || normalized[0]?.id;

  return normalized.map((item) => ({
    ...item,
    isCover: item.id === finalCoverId,
  }));
}

function getLegacyPublicProduct(...candidates) {
  for (const candidate of candidates) {
    const key = text(candidate);
    if (!key) continue;
    const matched = LEGACY_PUBLIC_PRODUCTS_BY_ID.get(key);
    if (matched) {
      return matched;
    }
  }

  return null;
}

function enrichWorkspaceProduct(item) {
  const product = clone(item);
  const legacy = getLegacyPublicProduct(product.publicProductId, product.id);

  return {
    ...product,
    shortName: text(product.shortName ?? legacy?.shortName ?? product.name),
    displayTag: text(product.displayTag ?? product.tag ?? legacy?.tag),
    publicMeta: normalizePublicMeta(product.publicMeta ?? product.meta, legacy?.meta),
  };
}

function createInitialStore() {
  return {
    version: workspaceProductSeedState.version,
    nextSequence: workspaceProductSeedState.nextSequence,
    items: clone(workspaceProductSeeds).map(enrichWorkspaceProduct),
  };
}

function readStoreFromStorage() {
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialStore();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      return createInitialStore();
    }

    return {
      version: Number(parsed.version) || workspaceProductSeedState.version,
      nextSequence: Number(parsed.nextSequence) || workspaceProductSeedState.nextSequence,
      items: clone(parsed.items).map(enrichWorkspaceProduct),
    };
  } catch {
    return createInitialStore();
  }
}

function persistStore(store) {
  const storage = getStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(store));
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

function generateUniqueId(store, base = "workspace-product") {
  let sequence = Number(store.nextSequence) || 1;
  let candidate = `${base}-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `${base}-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function findProductIndex(store, id) {
  return store.items.findIndex((item) => item.id === id);
}

function getProductById(store, id) {
  return store.items.find((item) => item.id === id) ?? null;
}

function normalizeProductPayload(input, existingProduct = null) {
  const payload = input ?? {};
  const base = existingProduct ?? {};
  const legacy = getLegacyPublicProduct(payload.publicProductId, base.publicProductId, payload.id, base.id);
  const mergedName = text(payload.name ?? base.name);
  const mergedCategory = text(payload.category ?? base.category);
  const mergedStatus = text(payload.status ?? base.status);
  const mergedOwner = text(payload.owner ?? base.owner);
  const normalizedMedia = normalizeMedia(payload.media, payload.coverId, base.media);
  const coverMedia = normalizedMedia.find((item) => item.isCover);
  const nextHero = text(payload.hero ?? coverMedia?.url ?? base.hero);

  return {
    id: text(payload.id ?? base.id),
    name: mergedName,
    shortName: text(payload.shortName ?? base.shortName ?? legacy?.shortName ?? mergedName),
    category: mergedCategory,
    status: mergedStatus,
    needsUpdate: normalizeBoolean(payload.needsUpdate, Boolean(base.needsUpdate)),
    owner: mergedOwner,
    ownerTeam: text(payload.ownerTeam ?? base.ownerTeam),
    updatedAt: text(payload.updatedAt ?? base.updatedAt) || nowIso(),
    tags: normalizeTags(payload.tags ?? base.tags ?? []),
    displayTag: text(payload.displayTag ?? base.displayTag ?? base.tag ?? legacy?.tag),
    retailPrice: normalizeNumber(payload.retailPrice, normalizeNumber(base.retailPrice, 0)),
    internalCost: normalizeNumber(payload.internalCost, normalizeNumber(base.internalCost, 0)),
    summary: text(payload.summary ?? base.summary),
    publicProductId: text(payload.publicProductId ?? base.publicProductId),
    hero: nextHero,
    media: normalizedMedia,
    publicMeta: normalizePublicMeta(payload.publicMeta, base.publicMeta ?? legacy?.meta),
    progressSummary: text(payload.progressSummary ?? base.progressSummary),
    supplierSummary: text(payload.supplierSummary ?? base.supplierSummary),
    logs: normalizeLogs(
      payload.logs ?? base.logs,
      existingProduct ? "update" : "create",
      mergedOwner || "system",
      existingProduct ? "Updated workspace product." : "Created workspace product.",
    ),
  };
}

function validateProductPayload(payload, { requireAll = true } = {}) {
  const requiredFields = [];

  if (!text(payload.name)) requiredFields.push("name");
  if (!text(payload.category)) requiredFields.push("category");
  if (!text(payload.status)) requiredFields.push("status");
  if (!text(payload.owner)) requiredFields.push("owner");

  if (requireAll && requiredFields.length > 0) {
    return createError("INVALID_PRODUCT_INPUT", `Missing required fields: ${requiredFields.join(", ")}`);
  }

  if (payload.category && !["flagship", "device", "space", "hot"].includes(payload.category)) {
    return createError("INVALID_PRODUCT_INPUT", `Unsupported category: ${payload.category}`);
  }

  if (payload.status && !["active", "draft", "archived"].includes(payload.status)) {
    return createError("INVALID_PRODUCT_INPUT", `Unsupported status: ${payload.status}`);
  }

  return null;
}

function buildListResult(items) {
  return {
    items: clone(items),
    total: items.length,
    summary: getWorkspaceProductSummary(items),
  };
}

function materializeImportedProduct(store, imported, index) {
  const payload = normalizeProductPayload(imported, null);
  const id = text(payload.id) || generateUniqueId(store);
  const existingWithId = store.items.some((item) => item.id === id);
  const finalId = existingWithId ? generateUniqueId(store) : id;

  return {
    id: finalId,
    name: payload.name,
    shortName: payload.shortName,
    category: payload.category,
    status: payload.status,
    needsUpdate: payload.needsUpdate,
    owner: payload.owner,
    ownerTeam: payload.ownerTeam,
    updatedAt: payload.updatedAt,
    tags: payload.tags,
    displayTag: payload.displayTag,
    retailPrice: payload.retailPrice,
    internalCost: payload.internalCost,
    summary: payload.summary,
    publicProductId: payload.publicProductId,
    hero: payload.hero,
    media: payload.media,
    publicMeta: payload.publicMeta,
    progressSummary: payload.progressSummary,
    supplierSummary: payload.supplierSummary,
    logs: normalizeLogs(payload.logs, "import", payload.owner || "import", `Imported record ${index}.`),
  };
}

export async function listWorkspaceProducts(query) {
  await delay();
  const store = getStore();
  const normalizedQuery = normalizeWorkspaceProductQuery(query);
  const items = filterWorkspaceProducts(store.items, normalizedQuery);
  return buildListResult(items);
}

export async function getWorkspaceProduct(id) {
  await delay();
  const store = getStore();
  const product = getProductById(store, text(id));

  if (!product) {
    return createError("PRODUCT_NOT_FOUND", "Product not found.");
  }

  return { product: clone(product) };
}

export async function createWorkspaceProduct(input) {
  await delay();
  const store = getStore();
  const validationError = validateProductPayload(input ?? {}, { requireAll: true });
  if (validationError) {
    return validationError;
  }

  const product = normalizeProductPayload(input);
  const requestedId = text(product.id);
  const id = requestedId && !store.items.some((item) => item.id === requestedId) ? requestedId : generateUniqueId(store);
  const storedProduct = {
    ...product,
    id,
    updatedAt: product.updatedAt || nowIso(),
  };

  store.items = [storedProduct, ...store.items];
  saveStore(store);

  return {
    product: clone(storedProduct),
  };
}

export async function updateWorkspaceProduct(id, input) {
  await delay();
  const store = getStore();
  const index = findProductIndex(store, text(id));

  if (index === -1) {
    return createError("PRODUCT_NOT_FOUND", "Product not found.");
  }

  const currentProduct = store.items[index];
  const validationError = validateProductPayload({ ...currentProduct, ...input }, { requireAll: false });
  if (validationError) {
    return validationError;
  }

  const statusChanged = text(input?.status) && text(input?.status) !== text(currentProduct.status);
  const nextLogs = [
    ...normalizeLogs(currentProduct.logs, "seed", currentProduct.owner || "system", "Existing product."),
    {
      timestamp: nowIso(),
      action: "update",
      actor: text(input?.owner ?? currentProduct.owner) || "system",
      message: "Updated workspace product.",
    },
  ];

  if (statusChanged) {
    nextLogs.push({
      timestamp: nowIso(),
      action: "status",
      actor: text(input?.owner ?? currentProduct.owner) || "system",
      message: `Status changed to ${text(input?.status)}.`,
    });
  }

  const updatedProduct = {
    ...currentProduct,
    ...normalizeProductPayload(input, currentProduct),
    id: currentProduct.id,
    updatedAt: nowIso(),
    logs: nextLogs,
  };

  store.items[index] = updatedProduct;
  saveStore(store);

  return {
    product: clone(updatedProduct),
  };
}

export async function bulkAddWorkspaceProductTags({ ids, tags } = {}) {
  await delay();
  const store = getStore();
  const normalizedIds = Array.isArray(ids) ? [...new Set(ids.map((value) => text(value)).filter(Boolean))] : [];
  const normalizedTags = normalizeTags(tags);

  if (normalizedIds.length === 0 || normalizedTags.length === 0) {
    return createError("INVALID_BULK_TAG_INPUT", "ids and tags are required.");
  }

  const updatedItems = [];
  for (const id of normalizedIds) {
    const index = findProductIndex(store, id);
    if (index === -1) {
      continue;
    }

    const currentProduct = store.items[index];
    const mergedTags = [...new Set([...(currentProduct.tags ?? []), ...normalizedTags])];
    const updatedProduct = {
      ...currentProduct,
      tags: mergedTags,
      updatedAt: nowIso(),
      logs: [
        ...normalizeLogs(currentProduct.logs, "seed", currentProduct.owner || "system", "Existing product."),
        {
          timestamp: nowIso(),
          action: "bulk-tag",
          actor: "system",
          message: `Added tags: ${normalizedTags.join(", ")}`,
        },
      ],
    };

    store.items[index] = updatedProduct;
    updatedItems.push(updatedProduct);
  }

  saveStore(store);

  return buildListResult(updatedItems);
}

export async function previewWorkspaceProductImport(rawText) {
  await delay();
  return previewWorkspaceProductImportText(rawText);
}

export async function importWorkspaceProducts(rawText) {
  await delay();
  const store = getStore();
  const preview = previewWorkspaceProductImportText(rawText);
  const items = [];
  const skippedWarnings = [...preview.warnings];

  for (const row of preview.preview) {
    if (!row.product) {
      skippedWarnings.push(...row.warnings);
      continue;
    }

    const importedProduct = materializeImportedProduct(store, row.product, row.index);
    store.items.unshift(importedProduct);
    items.push(importedProduct);
  }

  if (items.length === 0) {
    return createError("INVALID_IMPORT_INPUT", "Import preview contains no valid records.");
  }

  saveStore(store);

  return {
    importedCount: items.length,
    items: clone(items),
    warnings: skippedWarnings,
  };
}

export function resetWorkspaceProductsStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceProductsService = {
  listWorkspaceProducts,
  getWorkspaceProduct,
  createWorkspaceProduct,
  updateWorkspaceProduct,
  bulkAddWorkspaceProductTags,
  previewWorkspaceProductImport,
  importWorkspaceProducts,
  resetWorkspaceProductsStore,
};

export default mockWorkspaceProductsService;
