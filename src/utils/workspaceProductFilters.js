const CATEGORY_VALUES = new Set(["all", "flagship", "device", "space", "hot"]);
const STATUS_VALUES = new Set(["all", "active", "draft", "archived"]);
const NEEDS_UPDATE_VALUES = new Set(["all", "yes", "no"]);
const SORT_VALUES = new Set([
  "updated-desc",
  "updated-asc",
  "name-asc",
  "name-desc",
  "price-desc",
  "price-asc",
]);

const DEFAULT_QUERY = {
  keyword: "",
  category: "all",
  status: "all",
  needsUpdate: "all",
  sort: "updated-desc",
};

function toLower(value) {
  return String(value ?? "").toLowerCase();
}

function normalizeSelectValue(value, allowedValues, fallback) {
  return allowedValues.has(value) ? value : fallback;
}

function normalizeKeyword(keyword) {
  return String(keyword ?? "").trim();
}

function productPrice(product) {
  const value = Number(product?.retailPrice);
  return Number.isFinite(value) ? value : 0;
}

function productUpdatedAt(product) {
  const value = Date.parse(product?.updatedAt ?? "");
  return Number.isFinite(value) ? value : 0;
}

function compareStrings(left, right, direction = 1) {
  const result = String(left ?? "").localeCompare(String(right ?? ""), "en", { sensitivity: "base" });
  if (result !== 0) {
    return result * direction;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), "zh-Hans", { sensitivity: "base" }) * direction;
}

function sortProducts(products, sort) {
  const items = [...products];

  items.sort((left, right) => {
    switch (sort) {
      case "updated-asc":
        return productUpdatedAt(left) - productUpdatedAt(right) || compareStrings(left.name, right.name);
      case "name-asc":
        return compareStrings(left.name, right.name) || compareStrings(left.id, right.id);
      case "name-desc":
        return compareStrings(right.name, left.name) || compareStrings(right.id, left.id);
      case "price-desc":
        return productPrice(right) - productPrice(left) || compareStrings(left.name, right.name);
      case "price-asc":
        return productPrice(left) - productPrice(right) || compareStrings(left.name, right.name);
      case "updated-desc":
      default:
        return productUpdatedAt(right) - productUpdatedAt(left) || compareStrings(left.name, right.name);
    }
  });

  return items;
}

function productKeywordText(product) {
  return [
    product.id,
    product.name,
    product.owner,
    product.summary,
    product.progressSummary,
    product.supplierSummary,
    product.publicProductId,
    ...(Array.isArray(product.tags) ? product.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function normalizeWorkspaceProductQuery(query) {
  const normalized = query ?? {};

  return {
    keyword: normalizeKeyword(normalized.keyword),
    category: normalizeSelectValue(normalized.category, CATEGORY_VALUES, DEFAULT_QUERY.category),
    status: normalizeSelectValue(normalized.status, STATUS_VALUES, DEFAULT_QUERY.status),
    needsUpdate: normalizeSelectValue(normalized.needsUpdate, NEEDS_UPDATE_VALUES, DEFAULT_QUERY.needsUpdate),
    sort: normalizeSelectValue(normalized.sort, SORT_VALUES, DEFAULT_QUERY.sort),
  };
}

export function filterWorkspaceProducts(products, query) {
  const normalizedQuery = normalizeWorkspaceProductQuery(query);
  const keyword = toLower(normalizedQuery.keyword);

  const filtered = products.filter((product) => {
    if (normalizedQuery.category !== "all" && product.category !== normalizedQuery.category) {
      return false;
    }

    if (normalizedQuery.status !== "all" && product.status !== normalizedQuery.status) {
      return false;
    }

    if (normalizedQuery.needsUpdate !== "all") {
      const needsUpdate = normalizedQuery.needsUpdate === "yes";
      if (Boolean(product.needsUpdate) !== needsUpdate) {
        return false;
      }
    }

    if (keyword.length > 0 && !productKeywordText(product).includes(keyword)) {
      return false;
    }

    return true;
  });

  return sortProducts(filtered, normalizedQuery.sort);
}

export function getWorkspaceProductSummary(products) {
  const summary = {
    total: products.length,
    activeCount: 0,
    draftCount: 0,
    archivedCount: 0,
    needsUpdateCount: 0,
    categoryCounts: {
      flagship: 0,
      device: 0,
      space: 0,
      hot: 0,
    },
  };

  for (const product of products) {
    if (product.status === "active") summary.activeCount += 1;
    if (product.status === "draft") summary.draftCount += 1;
    if (product.status === "archived") summary.archivedCount += 1;
    if (product.needsUpdate) summary.needsUpdateCount += 1;
    if (summary.categoryCounts[product.category] !== undefined) {
      summary.categoryCounts[product.category] += 1;
    }
  }

  return summary;
}

export default {
  filterWorkspaceProducts,
  getWorkspaceProductSummary,
  normalizeWorkspaceProductQuery,
};
