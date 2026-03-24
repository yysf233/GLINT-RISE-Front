import { listWorkspaceProducts } from "../mockWorkspaceProductsService";
import { listWorkspaceSuppliers } from "./mockWorkspaceSuppliersService";
import { previewWorkspaceQuoteImport as previewWorkspaceQuoteImportText } from "../../utils/workspaceQuoteImport";
import {
  buildWorkspaceQuoteMatches,
  buildWorkspaceQuotePricingPreview,
  buildWorkspaceQuoteSheetArtifact,
  buildWorkspaceQuoteSupplierRecommendations,
  normalizeWorkspaceQuoteRequirements,
} from "../../utils/workspaceQuoteFlow";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.quotes;
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

  const memory = (globalThis.__GLINT_WORKSPACE_QUOTE_MEMORY__ ||= new Map());

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

function isQuoteRoleAllowed(viewer = {}) {
  return ["employee", "director"].includes(text(viewer.role));
}

function canAccessQuote(quote = {}, viewer = {}) {
  if (text(viewer.role) === "director") {
    return true;
  }

  return text(quote.ownerId) === text(viewer.id);
}

function createInitialStore() {
  return {
    version: 1,
    nextSequence: 1,
    items: [],
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
      version: Number(parsed.version) || 1,
      nextSequence: Number(parsed.nextSequence) || 1,
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
  let candidate = `workspace-quote-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `workspace-quote-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function normalizePricingEntries(entries = []) {
  return (Array.isArray(entries) ? entries : []).map((entry) => ({
    matchId: text(entry.matchId),
    markupRate: Number(entry.markupRate) || 0,
    toolingFee: Number(entry.toolingFee) || 0,
    leadTimeBufferDays: Number(entry.leadTimeBufferDays) || 0,
  }));
}

async function getCatalogForViewer(viewer = {}) {
  const [productsResult, suppliersResult] = await Promise.all([
    listWorkspaceProducts({}),
    listWorkspaceSuppliers({}, viewer),
  ]);

  return {
    products: productsResult?.items ?? [],
    suppliers: suppliersResult?.items ?? [],
  };
}

function buildQuoteSnapshot(quote = {}, viewer = {}, catalog = {}) {
  const requirements = normalizeWorkspaceQuoteRequirements(quote.requirements);
  const matches = buildWorkspaceQuoteMatches(requirements, catalog.products, quote.matches);
  const supplierSortBy = text(quote.supplierSortBy) || "score";
  const supplierRecommendations = buildWorkspaceQuoteSupplierRecommendations(
    matches,
    catalog.suppliers,
    viewer,
    supplierSortBy,
  );
  const supplierSelections = matches.map((match) => {
    const existingSelection = (quote.supplierSelections ?? []).find((item) => text(item.matchId) === text(match.id));
    const fallbackSupplierId =
      supplierRecommendations.find((item) => item.matchId === match.id)?.items?.[0]?.supplierId || "";

    return {
      matchId: match.id,
      supplierId: text(existingSelection?.supplierId) || text(fallbackSupplierId),
    };
  });
  const pricingEntries = matches.map((match) => {
    const existingEntry = normalizePricingEntries(quote.pricingEntries).find((item) => item.matchId === match.id);
    return {
      matchId: match.id,
      markupRate: Number(existingEntry?.markupRate) || 0,
      toolingFee: Number(existingEntry?.toolingFee) || 0,
      leadTimeBufferDays: Number(existingEntry?.leadTimeBufferDays) || 0,
    };
  });
  const pricingPreview = buildWorkspaceQuotePricingPreview(
    {
      requirements,
      matches,
      supplierSelections,
      pricingEntries,
    },
    {
      products: catalog.products,
      suppliers: catalog.suppliers,
      viewer,
    },
  );

  return {
    ...quote,
    requirements,
    matches,
    supplierSortBy,
    supplierRecommendations,
    supplierSelections,
    pricingEntries,
    pricingPreview,
  };
}

function projectQuoteListItem(quote = {}) {
  return {
    id: quote.id,
    title: quote.title,
    status: quote.status,
    currentStep: quote.currentStep,
    owner: quote.owner,
    ownerId: quote.ownerId,
    requirementCount: Array.isArray(quote.requirements) ? quote.requirements.length : 0,
    matchCount: Array.isArray(quote.matches) ? quote.matches.length : 0,
    updatedAt: quote.updatedAt,
  };
}

export async function previewWorkspaceQuoteImport(rawText) {
  await delay();
  return previewWorkspaceQuoteImportText(rawText);
}

export async function listWorkspaceQuotes(viewer = {}) {
  await delay();
  if (!isQuoteRoleAllowed(viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access quote workflow.");
  }

  const items = getStore().items
    .filter((quote) => canAccessQuote(quote, viewer))
    .map(projectQuoteListItem);

  return {
    items,
    total: items.length,
  };
}

export async function getWorkspaceQuote(id, viewer = {}) {
  await delay();
  if (!isQuoteRoleAllowed(viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access quote workflow.");
  }

  const quote = getStore().items.find((item) => item.id === text(id));
  if (!quote) {
    return createError("QUOTE_NOT_FOUND", "Quote draft not found.");
  }
  if (!canAccessQuote(quote, viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access this quote draft.");
  }

  const catalog = await getCatalogForViewer(viewer);
  return {
    quote: buildQuoteSnapshot(clone(quote), viewer, catalog),
  };
}

export async function createWorkspaceQuoteDraft(input = {}, viewer = {}) {
  await delay();
  if (!isQuoteRoleAllowed(viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access quote workflow.");
  }

  const store = getStore();
  const requirements = normalizeWorkspaceQuoteRequirements(input.requirements);
  if (!text(input.title)) {
    return createError("INVALID_QUOTE_INPUT", "Quote title is required.");
  }
  if (requirements.length === 0) {
    return createError("INVALID_QUOTE_INPUT", "At least one valid quote requirement is required.");
  }

  const quote = {
    id: generateUniqueId(store),
    title: text(input.title),
    status: "draft",
    currentStep: Math.min(5, Math.max(1, Number(input.currentStep) || 1)),
    ownerId: text(viewer.id),
    owner: text(viewer.name) || "内部员工",
    supplierSortBy: text(input.supplierSortBy) || "score",
    requirements,
    matches: Array.isArray(input.matches) ? clone(input.matches) : [],
    supplierSelections: Array.isArray(input.supplierSelections) ? clone(input.supplierSelections) : [],
    pricingEntries: Array.isArray(input.pricingEntries) ? clone(input.pricingEntries) : [],
    quoteSheet: null,
    logs: [
      {
        timestamp: nowIso(),
        action: "create",
        actor: text(viewer.name) || "system",
        message: "Created workspace quote draft.",
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const catalog = await getCatalogForViewer(viewer);
  const hydrated = buildQuoteSnapshot(quote, viewer, catalog);
  store.items.unshift(hydrated);
  saveStore(store);

  return {
    quote: clone(hydrated),
  };
}

export async function updateWorkspaceQuoteDraft(id, input = {}, viewer = {}) {
  await delay();
  if (!isQuoteRoleAllowed(viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access quote workflow.");
  }

  const store = getStore();
  const index = store.items.findIndex((item) => item.id === text(id));
  if (index === -1) {
    return createError("QUOTE_NOT_FOUND", "Quote draft not found.");
  }

  const currentQuote = store.items[index];
  if (!canAccessQuote(currentQuote, viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to update this quote draft.");
  }

  const nextRequirements =
    input.requirements !== undefined
      ? normalizeWorkspaceQuoteRequirements(input.requirements)
      : currentQuote.requirements;
  if (nextRequirements.length === 0) {
    return createError("INVALID_QUOTE_INPUT", "At least one valid quote requirement is required.");
  }

  const nextQuote = {
    ...currentQuote,
    title: text(input.title ?? currentQuote.title),
    currentStep: Math.min(5, Math.max(1, Number(input.currentStep) || currentQuote.currentStep || 1)),
    supplierSortBy: text(input.supplierSortBy ?? currentQuote.supplierSortBy) || "score",
    requirements: nextRequirements,
    matches: input.matches !== undefined ? clone(input.matches) : currentQuote.matches,
    supplierSelections:
      input.supplierSelections !== undefined ? clone(input.supplierSelections) : currentQuote.supplierSelections,
    pricingEntries: input.pricingEntries !== undefined ? clone(input.pricingEntries) : currentQuote.pricingEntries,
    updatedAt: nowIso(),
    logs: [
      ...(Array.isArray(currentQuote.logs) ? currentQuote.logs : []),
      {
        timestamp: nowIso(),
        action: "update",
        actor: text(viewer.name) || "system",
        message: "Updated workspace quote draft.",
      },
    ],
  };

  const catalog = await getCatalogForViewer(viewer);
  const hydrated = buildQuoteSnapshot(nextQuote, viewer, catalog);
  store.items[index] = hydrated;
  saveStore(store);

  return {
    quote: clone(hydrated),
  };
}

export async function generateWorkspaceQuoteSheet(id, viewer = {}) {
  await delay();
  if (!isQuoteRoleAllowed(viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to access quote workflow.");
  }

  const store = getStore();
  const index = store.items.findIndex((item) => item.id === text(id));
  if (index === -1) {
    return createError("QUOTE_NOT_FOUND", "Quote draft not found.");
  }

  const currentQuote = store.items[index];
  if (!canAccessQuote(currentQuote, viewer)) {
    return createError("QUOTE_FORBIDDEN", "You do not have permission to update this quote draft.");
  }

  const catalog = await getCatalogForViewer(viewer);
  const hydrated = buildQuoteSnapshot(currentQuote, viewer, catalog);
  const artifact = buildWorkspaceQuoteSheetArtifact(
    {
      quote: hydrated,
      pricingPreview: hydrated.pricingPreview,
    },
    viewer,
  );
  const nextQuote = {
    ...hydrated,
    status: "quoted",
    currentStep: 5,
    quoteSheet: {
      generatedAt: nowIso(),
      ...artifact,
    },
    updatedAt: nowIso(),
    logs: [
      ...(Array.isArray(hydrated.logs) ? hydrated.logs : []),
      {
        timestamp: nowIso(),
        action: "generate-sheet",
        actor: text(viewer.name) || "system",
        message: "Generated standard quote sheet.",
      },
    ],
  };

  store.items[index] = nextQuote;
  saveStore(store);

  return {
    quote: clone(nextQuote),
    download: clone(nextQuote.quoteSheet),
  };
}

export function resetWorkspaceQuotesStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceQuotesService = {
  createWorkspaceQuoteDraft,
  generateWorkspaceQuoteSheet,
  getWorkspaceQuote,
  listWorkspaceQuotes,
  previewWorkspaceQuoteImport,
  resetWorkspaceQuotesStore,
  updateWorkspaceQuoteDraft,
};

export default mockWorkspaceQuotesService;
