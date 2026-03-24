export const ALL_PRODUCT_CATEGORY_LABEL = "全部产品";
export const ALL_PRODUCT_TAG_LABEL = "全部标签";

function normalizeOptions(options, fallbackLabel) {
  return Array.isArray(options) && options.length > 0 ? options : [fallbackLabel];
}

export function getProductSearchCategory(item) {
  return String(item?.searchCategory ?? ALL_PRODUCT_CATEGORY_LABEL).trim() || ALL_PRODUCT_CATEGORY_LABEL;
}

export function normalizeProductSearchCategory(value, options = [ALL_PRODUCT_CATEGORY_LABEL]) {
  const normalizedOptions = normalizeOptions(options, ALL_PRODUCT_CATEGORY_LABEL);
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue || normalizedValue === "all" || normalizedValue === normalizedOptions[0]) {
    return normalizedOptions[0];
  }

  return normalizedOptions.includes(normalizedValue) ? normalizedValue : normalizedOptions[0];
}

export function normalizeProductSearchTag(value, options = [ALL_PRODUCT_TAG_LABEL]) {
  const normalizedOptions = normalizeOptions(options, ALL_PRODUCT_TAG_LABEL);
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue || normalizedValue === "all" || normalizedValue === normalizedOptions[0]) {
    return normalizedOptions[0];
  }

  return normalizedOptions.includes(normalizedValue) ? normalizedValue : normalizedOptions[0];
}

export function extractProductTags(item) {
  if (Array.isArray(item?.searchTags) && item.searchTags.length > 0) {
    return item.searchTags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(item?.tag ?? "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function filterProducts(items, { keyword = "", category, tag }, options = {}) {
  const categoryOptions = normalizeOptions(options.categoryOptions, ALL_PRODUCT_CATEGORY_LABEL);
  const tagOptions = normalizeOptions(options.tagOptions, ALL_PRODUCT_TAG_LABEL);
  const normalizedCategory = normalizeProductSearchCategory(category, categoryOptions);
  const normalizedTag = normalizeProductSearchTag(tag, tagOptions);
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
      ...(Array.isArray(item.meta) ? item.meta.flat() : []),
    ]
      .join(" ")
      .toLowerCase();

    const keywordPass = !lowerKeyword || searchableText.includes(lowerKeyword);
    const categoryPass =
      normalizedCategory === categoryOptions[0] || getProductSearchCategory(item) === normalizedCategory;
    const tagPass = normalizedTag === tagOptions[0] || productTags.includes(normalizedTag);

    return keywordPass && categoryPass && tagPass;
  });
}
