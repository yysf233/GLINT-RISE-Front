import {
  productSearchCategoryMap,
  productSearchCategoryOptions,
  productSearchTagOptions,
} from "../data/siteContent";

const ALL_CATEGORY_VALUES = new Set(["", "all", productSearchCategoryOptions[0]]);
const ALL_TAG_VALUES = new Set(["", "all", productSearchTagOptions[0]]);

export function getProductSearchCategory(item) {
  return productSearchCategoryMap[item.id] ?? productSearchCategoryOptions[0];
}

export function normalizeProductSearchCategory(value) {
  if (ALL_CATEGORY_VALUES.has(value ?? "")) {
    return productSearchCategoryOptions[0];
  }

  return productSearchCategoryOptions.includes(value) ? value : productSearchCategoryOptions[0];
}

export function normalizeProductSearchTag(value) {
  if (ALL_TAG_VALUES.has(value ?? "")) {
    return productSearchTagOptions[0];
  }

  return productSearchTagOptions.includes(value) ? value : productSearchTagOptions[0];
}

export function extractProductTags(item) {
  return item.tag
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function filterProducts(items, { keyword = "", category, tag }) {
  const normalizedCategory = normalizeProductSearchCategory(category);
  const normalizedTag = normalizeProductSearchTag(tag);
  const lowerKeyword = keyword.trim().toLowerCase();

  return items.filter((item) => {
    const productTags = extractProductTags(item);
    const searchableText = [
      item.name,
      item.shortName,
      item.tag,
      item.desc,
      getProductSearchCategory(item),
      ...productTags,
      ...item.meta.flat(),
    ]
      .join(" ")
      .toLowerCase();

    const keywordPass = !lowerKeyword || searchableText.includes(lowerKeyword);
    const categoryPass = normalizedCategory === productSearchCategoryOptions[0] || getProductSearchCategory(item) === normalizedCategory;
    const tagPass = normalizedTag === productSearchTagOptions[0] || productTags.includes(normalizedTag);

    return keywordPass && categoryPass && tagPass;
  });
}
