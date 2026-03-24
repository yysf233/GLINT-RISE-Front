import { productSearchCategoryMap } from "../data/siteContent";
import workspaceProductSeeds from "../data/workspace/workspaceProductSeeds";
import { createWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./mock/workspaceStorage";
import { readPublishedProducts } from "./publicSiteContent";

const ALL_CATEGORY_LABEL = "全部产品";
const ALL_TAG_LABEL = "全部标签";
const PUBLISHED_STATUSES = new Set(["published", "active", "online"]);
const CATEGORY_LABELS_BY_VALUE = {
  flagship: "旗舰产品",
  device: "智能设备",
  space: "空间体验",
  hot: "热门精选",
};
const CATEGORY_ORDER = [
  CATEGORY_LABELS_BY_VALUE.flagship,
  CATEGORY_LABELS_BY_VALUE.device,
  CATEGORY_LABELS_BY_VALUE.space,
  CATEGORY_LABELS_BY_VALUE.hot,
];

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? "").trim();
}

function splitDisplayTags(value) {
  return text(value)
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPublished(item) {
  return PUBLISHED_STATUSES.has(text(item?.status).toLowerCase());
}

const productStorage = createWorkspaceStorage({
  key: WORKSPACE_STORAGE_KEYS.products,
  seed: {
    version: 1,
    items: clone(workspaceProductSeeds),
  },
});

function readPublishedWorkspaceProducts() {
  return productStorage.read().items.filter(isPublished);
}

function buildWorkspaceIndex() {
  return new Map(
    readPublishedWorkspaceProducts().map((item) => [text(item.publicProductId ?? item.id), clone(item)]),
  );
}

export function getPublicProductSearchCategory(product, workspaceRecord = null) {
  const workspaceCategory = text(workspaceRecord?.category);
  if (CATEGORY_LABELS_BY_VALUE[workspaceCategory]) {
    return CATEGORY_LABELS_BY_VALUE[workspaceCategory];
  }

  const legacyCategory = productSearchCategoryMap[text(product?.id)];
  if (legacyCategory) {
    return legacyCategory;
  }

  return ALL_CATEGORY_LABEL;
}

export function getPublicProductSearchTags(product, workspaceRecord = null) {
  const explicitTags = splitDisplayTags(workspaceRecord?.displayTag ?? product?.tag);
  if (explicitTags.length > 0 && explicitTags.join(" / ") !== text(workspaceRecord?.category)) {
    return explicitTags;
  }

  const fallbackCategory = getPublicProductSearchCategory(product, workspaceRecord);
  return fallbackCategory === ALL_CATEGORY_LABEL ? [] : [fallbackCategory];
}

export function listPublicProducts() {
  const workspaceIndex = buildWorkspaceIndex();

  return readPublishedProducts().map((product) => {
    const workspaceRecord = workspaceIndex.get(text(product.id));
    return {
      ...product,
      searchCategory: getPublicProductSearchCategory(product, workspaceRecord),
      searchTags: getPublicProductSearchTags(product, workspaceRecord),
    };
  });
}

export function getPublicProductById(id) {
  const targetId = text(id);
  return listPublicProducts().find((item) => item.id === targetId) ?? null;
}

export function getPublicProductFilters(items = listPublicProducts()) {
  const categoryOptions = [
    ALL_CATEGORY_LABEL,
    ...CATEGORY_ORDER.filter((category) => items.some((item) => item.searchCategory === category)),
  ];
  const tagOptions = [
    ALL_TAG_LABEL,
    ...new Set(items.flatMap((item) => item.searchTags ?? []).map((tag) => text(tag)).filter(Boolean)),
  ];

  return {
    categoryOptions,
    tagOptions,
  };
}

export function getFeaturedPublicProducts(limit = 6) {
  return listPublicProducts().slice(0, limit);
}

export function getHotPublicProducts(limit) {
  const items = listPublicProducts().filter(
    (item) => item.searchCategory === CATEGORY_LABELS_BY_VALUE.hot,
  );
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export const publicProductsCatalog = {
  listPublicProducts,
  getPublicProductById,
  getPublicProductFilters,
  getFeaturedPublicProducts,
  getHotPublicProducts,
  getPublicProductSearchCategory,
  getPublicProductSearchTags,
  ALL_CATEGORY_LABEL,
  ALL_TAG_LABEL,
};

export default publicProductsCatalog;
