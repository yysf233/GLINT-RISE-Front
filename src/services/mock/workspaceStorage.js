const STORAGE_PREFIX = "glint-rise.workspace";
const DEFAULT_VERSION = 1;
const MODULE_CACHE = new Map();

export const WORKSPACE_STORAGE_KEYS = {
  products: `${STORAGE_PREFIX}-products.v1`,
  projects: `${STORAGE_PREFIX}-projects.v1`,
  banners: `${STORAGE_PREFIX}-banners.v1`,
};

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function getStorage() {
  if (typeof globalThis.localStorage !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  const memory = (globalThis.__GLINT_WORKSPACE_STORAGE_MEMORY__ ||= new Map());

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

function normalizeSeed(seed) {
  if (seed && typeof seed === "object") {
    return clone(seed);
  }

  return {
    version: DEFAULT_VERSION,
    items: [],
  };
}

function persist(key, value) {
  getStorage().setItem(key, JSON.stringify(value));
}

function readFromStorage(key, seed) {
  if (MODULE_CACHE.has(key)) {
    return clone(MODULE_CACHE.get(key));
  }

  const fallback = normalizeSeed(seed);
  const raw = getStorage().getItem(key);

  if (!raw) {
    MODULE_CACHE.set(key, clone(fallback));
    persist(key, fallback);
    return clone(fallback);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      throw new Error("Invalid storage payload");
    }

    const snapshot = clone(parsed);
    MODULE_CACHE.set(key, snapshot);
    return clone(snapshot);
  } catch {
    MODULE_CACHE.set(key, clone(fallback));
    persist(key, fallback);
    return clone(fallback);
  }
}

function writeToStorage(key, value) {
  const snapshot = clone(value);
  MODULE_CACHE.set(key, snapshot);
  persist(key, snapshot);
  return clone(snapshot);
}

export function createWorkspaceStorage({ key, seed } = {}) {
  if (!key) {
    throw new Error("Workspace storage key is required.");
  }

  const normalizedSeed = normalizeSeed(seed);

  return {
    key,
    read() {
      return readFromStorage(key, normalizedSeed);
    },
    write(value) {
      return writeToStorage(key, value);
    },
    reset() {
      return writeToStorage(key, normalizedSeed);
    },
  };
}

export function readWorkspaceStorage({ key, seed } = {}) {
  return createWorkspaceStorage({ key, seed }).read();
}

export function writeWorkspaceStorage({ key, seed, value } = {}) {
  const storage = createWorkspaceStorage({ key, seed });
  return storage.write(value);
}

export function resetWorkspaceStorage({ key, seed } = {}) {
  return createWorkspaceStorage({ key, seed }).reset();
}

export default {
  WORKSPACE_STORAGE_KEYS,
  createWorkspaceStorage,
  readWorkspaceStorage,
  writeWorkspaceStorage,
  resetWorkspaceStorage,
};
