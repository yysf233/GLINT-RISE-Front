import workspaceSiteSettingsSeeds from "../../data/workspace/workspaceSiteSettingsSeeds";
import { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.siteSettings;
const FIXED_DELAY_MS = 5;
const ALLOWED_ROLES = new Set(["employee", "director"]);

const siteSettingsStorage = createWorkspaceStorage({
  key: STORAGE_KEY,
  seed: {
    version: 1,
    items: [workspaceSiteSettingsSeeds],
  },
});

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? "").trim();
}

function nowIso() {
  return new Date().toISOString();
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

function isAllowed(viewer = {}) {
  const role = text(viewer.role);
  if (ALLOWED_ROLES.has(role)) {
    return true;
  }

  return role === "developer" && viewer?.permissions?.contentMaintenance === true;
}

function normalizeNavItems(items = []) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      path: text(item?.path),
      label: text(item?.label),
    }))
    .filter((item) => item.path && item.label)
    .filter((item) => {
      if (seen.has(item.path)) {
        return false;
      }
      seen.add(item.path);
      return true;
    });
}

function normalizeStringList(items = []) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => text(item))
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
}

function normalizeSettings(input = {}) {
  const seed = clone(workspaceSiteSettingsSeeds);

  return {
    id: "site-settings",
    brand: {
      name: text(input.brand?.name) || seed.brand.name,
      cnName: text(input.brand?.cnName) || seed.brand.cnName,
      entryEyebrow: text(input.brand?.entryEyebrow) || seed.brand.entryEyebrow,
    },
    navigation: {
      items: normalizeNavItems(input.navigation?.items).length > 0
        ? normalizeNavItems(input.navigation?.items)
        : seed.navigation.items,
      searchPlaceholder: text(input.navigation?.searchPlaceholder) || seed.navigation.searchPlaceholder,
    },
    footer: {
      description: text(input.footer?.description) || seed.footer.description,
      links: normalizeStringList(input.footer?.links).length > 0
        ? normalizeStringList(input.footer?.links)
        : seed.footer.links,
    },
    homeHero: {
      eyebrow: text(input.homeHero?.eyebrow) || seed.homeHero.eyebrow,
      description: text(input.homeHero?.description) || seed.homeHero.description,
    },
    updatedAt: text(input.updatedAt) || nowIso(),
  };
}

function readSettingsSnapshot() {
  const store = siteSettingsStorage.read();
  const current = Array.isArray(store.items) && store.items.length > 0 ? store.items[0] : workspaceSiteSettingsSeeds;
  return normalizeSettings(current);
}

export async function getWorkspaceSiteSettings(viewer = {}) {
  await delay();
  if (!isAllowed(viewer)) {
    return createError("SITE_SETTINGS_FORBIDDEN", "You do not have permission to access site settings.");
  }

  return {
    settings: readSettingsSnapshot(),
  };
}

export async function updateWorkspaceSiteSettings(input = {}, viewer = {}) {
  await delay();
  if (!isAllowed(viewer)) {
    return createError("SITE_SETTINGS_FORBIDDEN", "You do not have permission to update site settings.");
  }

  const nextSettings = normalizeSettings({
    ...readSettingsSnapshot(),
    ...clone(input),
    brand: {
      ...readSettingsSnapshot().brand,
      ...(input.brand ?? {}),
    },
    navigation: {
      ...readSettingsSnapshot().navigation,
      ...(input.navigation ?? {}),
    },
    footer: {
      ...readSettingsSnapshot().footer,
      ...(input.footer ?? {}),
    },
    homeHero: {
      ...readSettingsSnapshot().homeHero,
      ...(input.homeHero ?? {}),
    },
    updatedAt: nowIso(),
  });

  siteSettingsStorage.write({
    version: 1,
    items: [nextSettings],
  });

  return {
    settings: clone(nextSettings),
  };
}

export function resetWorkspaceSiteSettingsStore() {
  siteSettingsStorage.reset();
}

export const mockWorkspaceSiteSettingsService = {
  getWorkspaceSiteSettings,
  updateWorkspaceSiteSettings,
  resetWorkspaceSiteSettingsStore,
};

export default mockWorkspaceSiteSettingsService;
