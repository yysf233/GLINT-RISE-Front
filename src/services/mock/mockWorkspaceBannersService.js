import workspaceBannerSeeds, { workspaceBannerSeedState } from "../../data/workspace/workspaceBannerSeeds";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";
import { validateWorkspaceBannerTarget } from "../../utils/workspaceBannerTargets";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.banners;
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

  const memory = (globalThis.__GLINT_WORKSPACE_BANNER_MEMORY__ ||= new Map());

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
    version: workspaceBannerSeedState.version,
    nextSequence: workspaceBannerSeedState.nextSequence,
    items: clone(workspaceBannerSeeds),
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
      version: Number(parsed.version) || workspaceBannerSeedState.version,
      nextSequence: Number(parsed.nextSequence) || workspaceBannerSeedState.nextSequence,
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

function normalizeBannerPayload(input, existingBanner = null) {
  const payload = input ?? {};
  const base = existingBanner ?? {};
  const target = text(payload.target ?? base.target);
  const validation = validateWorkspaceBannerTarget(target);

  if (!validation.valid) {
    return { error: createError("INVALID_BANNER_TARGET", validation.message) };
  }

  return {
    id: text(payload.id ?? base.id),
    title: text(payload.title ?? base.title),
    status: text(payload.status ?? base.status),
    target: validation.normalized,
    hero: text(payload.hero ?? base.hero),
    images: Array.isArray(payload.images ?? base.images) ? clone(payload.images ?? base.images) : [],
    updatedAt: text(payload.updatedAt ?? base.updatedAt) || nowIso(),
    logs: Array.isArray(payload.logs ?? base.logs) ? clone(payload.logs ?? base.logs) : [],
  };
}

function generateUniqueId(store) {
  let sequence = Number(store.nextSequence) || 1;
  let candidate = `workspace-banner-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `workspace-banner-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function findBannerIndex(store, id) {
  return store.items.findIndex((item) => item.id === id);
}

export async function listWorkspaceBanners() {
  await delay();
  const store = getStore();
  return {
    items: clone(store.items),
    total: store.items.length,
  };
}

export async function createWorkspaceBanner(input) {
  await delay();
  const store = getStore();
  const normalized = normalizeBannerPayload(input);

  if (normalized.error) {
    return normalized.error;
  }

  const id = normalized.id && !store.items.some((item) => item.id === normalized.id)
    ? normalized.id
    : generateUniqueId(store);

  const banner = {
    ...normalized,
    id,
    updatedAt: normalized.updatedAt || nowIso(),
    logs: [
      ...(normalized.logs ?? []),
      {
        timestamp: nowIso(),
        action: "create",
        actor: "system",
        message: "Created workspace banner.",
      },
    ],
  };

  store.items = [banner, ...store.items];
  saveStore(store);

  return { banner: clone(banner) };
}

export async function updateWorkspaceBanner(id, input) {
  await delay();
  const store = getStore();
  const index = findBannerIndex(store, text(id));
  if (index === -1) {
    return createError("BANNER_NOT_FOUND", "Banner not found.");
  }

  const normalized = normalizeBannerPayload(input, store.items[index]);
  if (normalized.error) {
    return normalized.error;
  }

  const updated = {
    ...store.items[index],
    ...normalized,
    id: store.items[index].id,
    updatedAt: nowIso(),
    logs: [
      ...(store.items[index].logs ?? []),
      {
        timestamp: nowIso(),
        action: "update",
        actor: "system",
        message: "Updated workspace banner.",
      },
    ],
  };

  store.items[index] = updated;
  saveStore(store);
  return { banner: clone(updated) };
}

export async function reorderWorkspaceBanners(fromIndex, toIndex) {
  await delay();
  const store = getStore();
  const items = [...store.items];

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return { items: clone(items), total: items.length };
  }

  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);

  store.items = items;
  saveStore(store);

  return { items: clone(items), total: items.length };
}

export function resetWorkspaceBannersStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceBannersService = {
  listWorkspaceBanners,
  createWorkspaceBanner,
  updateWorkspaceBanner,
  reorderWorkspaceBanners,
  resetWorkspaceBannersStore,
};

export default mockWorkspaceBannersService;
