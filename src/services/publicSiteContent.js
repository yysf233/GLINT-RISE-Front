import {
  brand as legacyBrand,
  cases as legacyPublicCases,
  footerLinks as legacyFooterLinks,
  navItems as legacyNavItems,
  products as legacyPublicProductSeeds,
} from "../data/siteContent";
import workspaceBannerSeeds from "../data/workspace/workspaceBannerSeeds";
import workspaceProductSeeds from "../data/workspace/workspaceProductSeeds";
import workspaceProjectSeeds from "../data/workspace/workspaceProjectSeeds";
import workspaceSiteSettingsSeeds from "../data/workspace/workspaceSiteSettingsSeeds";
import { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./mock/workspaceStorage";
import { derivePublicTimelineOrder } from "../utils/publicCaseTimeline";

const PUBLISHED_STATUSES = new Set(["published", "active", "online"]);
const LEGACY_PUBLIC_PRODUCTS_BY_ID = new Map(
  legacyPublicProductSeeds.map((item) => [String(item.id ?? "").trim(), clone(item)]),
);
const LEGACY_PUBLIC_CASE_IDS = new Set(legacyPublicCases.map((item) => text(item?.id)));

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function isPublished(item) {
  const status = String(item?.status ?? "").trim().toLowerCase();
  if (!status) {
    return false;
  }

  return PUBLISHED_STATUSES.has(status);
}

function toArray(value) {
  return Array.isArray(value) ? value.map((item) => clone(item)) : [];
}

function text(value) {
  return String(value ?? "").trim();
}

function normalizeMetaEntry(entry) {
  if (!entry) return null;

  if (Array.isArray(entry)) {
    const [label, value] = entry;
    const normalizedLabel = text(label);
    const normalizedValue = text(value);
    return normalizedLabel && normalizedValue ? [normalizedLabel, normalizedValue] : null;
  }

  if (typeof entry === "object") {
    const normalizedLabel = text(entry.label);
    const normalizedValue = text(entry.value);
    return normalizedLabel && normalizedValue ? [normalizedLabel, normalizedValue] : null;
  }

  return null;
}

function normalizePublicMeta(value, fallback) {
  const source = Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : [];
  return source.map(normalizeMetaEntry).filter(Boolean);
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

function toPublicProduct(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "thumbs")) {
    return clone(item);
  }

  const publicId = text(item.publicProductId ?? item.id);
  const legacy = getLegacyPublicProduct(publicId, item.id);
  const priceText = text(item.price ?? item.priceLabel ?? item.retailPrice ?? legacy?.price);
  const mediaList = toArray(item.media);
  const mediaUrls = mediaList.map((entry) => text(entry?.url)).filter(Boolean);
  const coverUrl = mediaList.find((entry) => entry?.isCover)?.url;
  const detailSource = item.detail ?? legacy?.detail;
  const versionText = text(item.version ?? legacy?.version);

  const next = {
    id: publicId,
    name: text(item.name ?? item.title ?? legacy?.name),
    shortName: text(item.shortName ?? legacy?.shortName ?? item.name ?? item.title),
    tag: text(item.displayTag ?? item.tag ?? legacy?.tag ?? item.category),
    price: priceText,
    desc: text(item.desc ?? item.summary ?? legacy?.desc),
    hero: text(coverUrl ?? item.hero ?? item.cover ?? item.heroImage ?? legacy?.hero),
    thumbs: mediaUrls.length > 0 ? mediaUrls : toArray(item.thumbs ?? item.images ?? legacy?.thumbs),
    meta: normalizePublicMeta(item.publicMeta ?? item.meta, legacy?.meta),
  };

  if (versionText) {
    next.version = versionText;
  }

  if (detailSource && typeof detailSource === "object") {
    next.detail = clone(detailSource);
  }

  return next;
}

function toPublicCase(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "images")) {
    return clone(item);
  }

  const publicId = text(item.publicCaseId ?? item.id);

  const next = {
    id: publicId,
    title: text(item.title ?? item.name),
    eyebrow: text(item.eyebrow),
    category: text(item.category),
    industry: text(item.industry),
    subTags: toArray(item.subTags),
    year: text(item.year),
    timelineLabel: text(item.timelineLabel),
    timelineOrder: Number(item.timelineOrder ?? 0),
    summary: text(item.summary),
    short: text(item.short ?? item.desc),
    hero: text(item.hero ?? item.cover),
    images: toArray(item.images ?? item.thumbs),
  };

  if (item.detail && typeof item.detail === "object") {
    next.detail = clone(item.detail);
  }

  return next;
}

function toPublicTimelineProject(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    id: text(item.id),
    title: text(item.title ?? item.name),
    category: text(item.category),
    industry: text(item.industry),
    publicCaseId: text(item.publicCaseId),
    timelineYear: text(item.timelineYear),
    timelineQuarter: text(item.timelineQuarter),
    timelineOrder: Number(item.timelineOrder ?? 0),
    timelineCardSide: text(item.timelineCardSide),
    timelineAccent: text(item.timelineAccent),
    summary: text(item.summary),
    short: text(item.short ?? item.desc),
  };
}

function isTimelineProjectDemoReady(item) {
  const publicCaseId = text(item?.publicCaseId);
  return derivePublicTimelineOrder(item) > 0 && LEGACY_PUBLIC_CASE_IDS.has(publicCaseId);
}

function resolvePublicTimelineProjects(items) {
  const persistedProjects = toArray(items)
    .filter(isPublished)
    .map(toPublicTimelineProject)
    .filter(Boolean);

  if (persistedProjects.some(isTimelineProjectDemoReady)) {
    return persistedProjects;
  }

  return workspaceProjectSeeds
    .filter(isPublished)
    .map(toPublicTimelineProject)
    .filter(Boolean);
}

function toPublicBanner(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "images")) {
    return clone(item);
  }

  return {
    id: text(item.id),
    title: text(item.title ?? item.name),
    target: text(item.target),
    hero: text(item.hero ?? item.cover),
    images: toArray(item.images ?? item.thumbs),
  };
}

const productStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.products,
  seed: {
    version: 1,
    items: clone(workspaceProductSeeds),
  },
});

const caseStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.projects,
  seed: {
    version: 1,
    items: clone(workspaceProjectSeeds),
  },
});

const bannerStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.banners,
  seed: {
    version: 1,
    items: clone(workspaceBannerSeeds),
  },
});

const siteSettingsStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.siteSettings,
  seed: {
    version: 1,
    items: clone([workspaceSiteSettingsSeeds]),
  },
});

function normalizeNavItems(items, fallback = []) {
  const source = Array.isArray(items) ? items : fallback;
  const seen = new Set();

  return source
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

function normalizeStringList(items, fallback = []) {
  const source = Array.isArray(items) ? items : fallback;
  const seen = new Set();

  return source
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

export function readPublicSiteSettings() {
  const snapshot = siteSettingsStorage.read();
  const current = Array.isArray(snapshot.items) && snapshot.items.length > 0 ? snapshot.items[0] : workspaceSiteSettingsSeeds;

  return {
    brand: {
      name: text(current?.brand?.name) || legacyBrand.name,
      cnName: text(current?.brand?.cnName) || legacyBrand.cnName,
      entryEyebrow: text(current?.brand?.entryEyebrow) || legacyBrand.entryEyebrow,
    },
    navigation: {
      items: normalizeNavItems(current?.navigation?.items, legacyNavItems),
      searchPlaceholder: text(current?.navigation?.searchPlaceholder) || "搜索产品名称",
    },
    footer: {
      description: text(current?.footer?.description) || workspaceSiteSettingsSeeds.footer.description,
      links: normalizeStringList(current?.footer?.links, legacyFooterLinks),
    },
    homeHero: {
      eyebrow: text(current?.homeHero?.eyebrow) || workspaceSiteSettingsSeeds.homeHero.eyebrow,
      description: text(current?.homeHero?.description) || workspaceSiteSettingsSeeds.homeHero.description,
    },
  };
}

export function readPublishedProducts() {
  return productStorage
    .read()
    .items.filter(isPublished)
    .map(toPublicProduct)
    .filter(Boolean);
}

export function readPublishedCases() {
  return caseStorage
    .read()
    .items.filter(isPublished)
    .map(toPublicCase)
    .filter(Boolean);
}

export function readPublishedTimelineProjects() {
  return resolvePublicTimelineProjects(caseStorage.read().items);
}

export function readPublishedHomeBanners() {
  return bannerStorage
    .read()
    .items.filter(isPublished)
    .map(toPublicBanner)
    .filter(Boolean);
}

export const publicSiteContent = {
  readPublicSiteSettings,
  readPublishedProducts,
  readPublishedCases,
  readPublishedTimelineProjects,
  readPublishedHomeBanners,
};

export default publicSiteContent;
