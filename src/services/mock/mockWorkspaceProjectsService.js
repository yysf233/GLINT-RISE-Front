import workspaceProjectSeeds, { workspaceProjectSeedState } from "../../data/workspace/workspaceProjectSeeds";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";
import { reorderWorkspaceProjectTimeline } from "../../utils/workspaceProjectTimeline";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.projects;
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

  const memory = (globalThis.__GLINT_WORKSPACE_PROJECT_MEMORY__ ||= new Map());

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

function createInitialStore() {
  return {
    version: workspaceProjectSeedState.version,
    nextSequence: workspaceProjectSeedState.nextSequence,
    items: clone(workspaceProjectSeeds),
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
      version: Number(parsed.version) || workspaceProjectSeedState.version,
      nextSequence: Number(parsed.nextSequence) || workspaceProjectSeedState.nextSequence,
      items: clone(parsed.items),
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

function nowIso() {
  return new Date().toISOString();
}

function text(value) {
  return String(value ?? "").trim();
}

function normalizeTimeline(timeline) {
  return Array.isArray(timeline)
    ? timeline
        .map((node, index) => ({
          id: text(node.id) || `timeline-${index + 1}`,
          label: text(node.label),
          order: Number(node.order ?? index + 1),
          description: text(node.description),
        }))
        .filter((node) => node.label)
    : [];
}

function normalizeRelatedProducts(products) {
  return Array.isArray(products)
    ? products
        .map((item) => ({
          id: text(item.id),
          publicProductId: text(item.publicProductId),
        }))
        .filter((item) => item.id || item.publicProductId)
    : [];
}

function normalizeProjectPayload(input, existingProject = null) {
  const payload = input ?? {};
  const base = existingProject ?? {};

  return {
    id: text(payload.id ?? base.id),
    title: text(payload.title ?? base.title),
    status: text(payload.status ?? base.status),
    owner: text(payload.owner ?? base.owner),
    industry: text(payload.industry ?? base.industry),
    year: text(payload.year ?? base.year),
    category: text(payload.category ?? base.category),
    publicCaseId: text(payload.publicCaseId ?? base.publicCaseId),
    summary: text(payload.summary ?? base.summary),
    short: text(payload.short ?? base.short),
    hero: text(payload.hero ?? base.hero),
    timeline: normalizeTimeline(payload.timeline ?? base.timeline),
    relatedProducts: normalizeRelatedProducts(payload.relatedProducts ?? base.relatedProducts),
    updatedAt: text(payload.updatedAt ?? base.updatedAt) || nowIso(),
    logs: Array.isArray(payload.logs ?? base.logs) ? clone(payload.logs ?? base.logs) : [],
  };
}

function generateUniqueId(store) {
  let sequence = Number(store.nextSequence) || 1;
  let candidate = `workspace-project-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `workspace-project-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function findProjectIndex(store, id) {
  return store.items.findIndex((item) => item.id === id);
}

export async function listWorkspaceProjects() {
  await delay();
  const store = getStore();
  return {
    items: clone(store.items),
    total: store.items.length,
  };
}

export async function getWorkspaceProject(id) {
  await delay();
  const store = getStore();
  const project = store.items.find((item) => item.id === text(id)) ?? null;

  if (!project) {
    return createError("PROJECT_NOT_FOUND", "Project not found.");
  }

  return { project: clone(project) };
}

export async function createWorkspaceProject(input) {
  await delay();
  const store = getStore();
  const payload = normalizeProjectPayload(input);
  const id = payload.id && !store.items.some((item) => item.id === payload.id) ? payload.id : generateUniqueId(store);

  const project = {
    ...payload,
    id,
    updatedAt: payload.updatedAt || nowIso(),
    logs: [
      ...(payload.logs ?? []),
      {
        timestamp: nowIso(),
        action: "create",
        actor: payload.owner || "system",
        message: "Created workspace project.",
      },
    ],
  };

  store.items = [project, ...store.items];
  saveStore(store);

  return { project: clone(project) };
}

export async function updateWorkspaceProject(id, input) {
  await delay();
  const store = getStore();
  const index = findProjectIndex(store, text(id));
  if (index === -1) {
    return createError("PROJECT_NOT_FOUND", "Project not found.");
  }

  const current = store.items[index];
  const updated = {
    ...current,
    ...normalizeProjectPayload(input, current),
    id: current.id,
    updatedAt: nowIso(),
    logs: [
      ...(current.logs ?? []),
      {
        timestamp: nowIso(),
        action: "update",
        actor: text(input?.owner ?? current.owner) || "system",
        message: "Updated workspace project.",
      },
    ],
  };

  store.items[index] = updated;
  saveStore(store);

  return { project: clone(updated) };
}

export async function reorderWorkspaceProjectTimelineNodes(id, fromIndex, toIndex) {
  await delay();
  const store = getStore();
  const index = findProjectIndex(store, text(id));
  if (index === -1) {
    return createError("PROJECT_NOT_FOUND", "Project not found.");
  }

  const current = store.items[index];
  const reordered = reorderWorkspaceProjectTimeline(current.timeline, fromIndex, toIndex);

  store.items[index] = {
    ...current,
    timeline: reordered,
    updatedAt: nowIso(),
  };
  saveStore(store);
  return { project: clone(store.items[index]) };
}

export function resetWorkspaceProjectsStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceProjectsService = {
  listWorkspaceProjects,
  getWorkspaceProject,
  createWorkspaceProject,
  updateWorkspaceProject,
  reorderWorkspaceProjectTimelineNodes,
  resetWorkspaceProjectsStore,
};

export default mockWorkspaceProjectsService;
