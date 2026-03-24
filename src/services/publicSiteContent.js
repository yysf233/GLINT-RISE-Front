import { products as publicProductSeeds } from "../data/siteContent";
import workspaceProjectSeeds from "../data/workspace/workspaceProjectSeeds";
import workspaceBannerSeeds from "../data/workspace/workspaceBannerSeeds";
import { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./mock/workspaceStorage";

const PUBLISHED_STATUSES = new Set(["published", "active", "online"]);

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

function toPublicProduct(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(item, "status") && Object.prototype.hasOwnProperty.call(item, "thumbs")) {
    return clone(item);
  }

  const publicId = String(item.publicProductId ?? item.id ?? "").trim();
  const priceText = String(item.price ?? item.priceLabel ?? item.retailPrice ?? "").trim();
  const mediaList = toArray(item.media);
  const mediaUrls = mediaList.map((entry) => String(entry?.url ?? "").trim()).filter(Boolean);
  const coverUrl = mediaList.find((entry) => entry?.isCover)?.url;

  return {
    id: publicId,
    name: String(item.name ?? item.title ?? "").trim(),
    shortName: String(item.shortName ?? item.name ?? item.title ?? "").trim(),
    tag: String(item.tag ?? item.category ?? "").trim(),
    price: priceText,
    desc: String(item.desc ?? item.summary ?? "").trim(),
    hero: String(coverUrl ?? item.hero ?? item.cover ?? item.heroImage ?? "").trim(),
    thumbs: mediaUrls.length > 0 ? mediaUrls : toArray(item.thumbs ?? item.images),
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

  const publicId = String(item.publicCaseId ?? item.id ?? "").trim();

  return {
    id: publicId,
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
    items: clone(publicProductSeeds).map((item) => ({
      ...item,
      status: "published",
    })),
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

