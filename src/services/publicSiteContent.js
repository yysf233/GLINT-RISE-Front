import { cases as publicCaseSeeds, products as publicProductSeeds } from "../data/siteContent";
import { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./mock/workspaceStorage";

const PUBLISHED_STATUSES = new Set(["published", "active", "online"]);

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function isPublished(item) {
  const status = String(item?.status ?? "").trim().toLowerCase();
  if (!status) {
    return true;
  }

  return PUBLISHED_STATUSES.has(status);
}

function toArray(value) {
  return Array.isArray(value) ? value.map((item) => clone(item)) : [];
}

function toPublicProduct(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "thumbs")) {
    return clone(item);
  }

  return {
    id: String(item.id ?? "").trim(),
    name: String(item.name ?? item.title ?? "").trim(),
    shortName: String(item.shortName ?? item.name ?? item.title ?? "").trim(),
    tag: String(item.tag ?? item.category ?? "").trim(),
    price: String(item.price ?? item.priceLabel ?? "").trim(),
    desc: String(item.desc ?? item.summary ?? "").trim(),
    hero: String(item.hero ?? item.cover ?? item.heroImage ?? "").trim(),
    thumbs: toArray(item.thumbs ?? item.images),
    meta: toArray(item.meta),
  };
}

function toPublicCase(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "images")) {
    return clone(item);
  }

  return {
    id: String(item.id ?? "").trim(),
    title: String(item.title ?? item.name ?? "").trim(),
    eyebrow: String(item.eyebrow ?? "").trim(),
    category: String(item.category ?? "").trim(),
    industry: String(item.industry ?? "").trim(),
    subTags: toArray(item.subTags),
    year: String(item.year ?? "").trim(),
    timelineLabel: String(item.timelineLabel ?? "").trim(),
    timelineOrder: Number(item.timelineOrder ?? 0),
    summary: String(item.summary ?? "").trim(),
    short: String(item.short ?? item.desc ?? "").trim(),
    hero: String(item.hero ?? item.cover ?? "").trim(),
    images: toArray(item.images ?? item.thumbs),
  };
}

function toPublicBanner(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "images")) {
    return clone(item);
  }

  return {
    id: String(item.id ?? "").trim(),
    title: String(item.title ?? item.name ?? "").trim(),
    hero: String(item.hero ?? item.cover ?? "").trim(),
    images: toArray(item.images ?? item.thumbs),
  };
}

const productStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.products,
  seed: {
    version: 1,
    items: clone(publicProductSeeds),
  },
});

const caseStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.projects,
  seed: {
    version: 1,
    items: clone(publicCaseSeeds),
  },
});

const bannerStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.banners,
  seed: {
    version: 1,
    items: [],
  },
});

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

export function readPublishedHomeBanners() {
  return bannerStorage
    .read()
    .items.filter(isPublished)
    .map(toPublicBanner)
    .filter(Boolean);
}

export const publicSiteContent = {
  readPublishedProducts,
  readPublishedCases,
  readPublishedHomeBanners,
};

export default publicSiteContent;
