function text(value) {
  return String(value ?? "").trim();
}

function slugify(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumber(value) {
  const normalized = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

function normalizeMetaEntry(entry) {
  if (!entry) return null;

  if (Array.isArray(entry)) {
    const [label, value] = entry;
    const normalizedLabel = text(label);
    const normalizedValue = text(value);
    return normalizedLabel && normalizedValue ? { label: normalizedLabel, value: normalizedValue } : null;
  }

  if (typeof entry === "object") {
    const normalizedLabel = text(entry.label);
    const normalizedValue = text(entry.value);
    return normalizedLabel && normalizedValue ? { label: normalizedLabel, value: normalizedValue } : null;
  }

  return null;
}

export function parseWorkspaceProductTags(value) {
  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseWorkspaceProductMetaText(value) {
  return text(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const delimiterIndex = line.search(/[:：]/);
      if (delimiterIndex === -1) {
        return null;
      }

      const label = text(line.slice(0, delimiterIndex));
      const metaValue = text(line.slice(delimiterIndex + 1));
      return label && metaValue ? { label, value: metaValue } : null;
    })
    .filter(Boolean);
}

export function stringifyWorkspaceProductMeta(value) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map(normalizeMetaEntry)
    .filter(Boolean)
    .map((item) => `${item.label}: ${item.value}`)
    .join("\n");
}

export function createWorkspaceProductFormDefaults(sessionUser = {}) {
  return {
    id: "",
    name: "",
    shortName: "",
    category: "flagship",
    status: "draft",
    owner: text(sessionUser.name),
    ownerTeam: text(sessionUser.team),
    publicProductId: "",
    retailPrice: "",
    internalCost: "",
    tagsText: "",
    displayTag: "",
    summary: "",
    publicMetaText: "",
    progressSummary: "",
    supplierSummary: "",
    hero: "",
    needsUpdate: true,
  };
}

export function mapWorkspaceProductToForm(product, sessionUser) {
  if (!product) {
    return createWorkspaceProductFormDefaults(sessionUser);
  }

  return {
    id: text(product.id),
    name: text(product.name),
    shortName: text(product.shortName),
    category: text(product.category) || "flagship",
    status: text(product.status) || "draft",
    owner: text(product.owner) || text(sessionUser?.name),
    ownerTeam: text(product.ownerTeam) || text(sessionUser?.team),
    publicProductId: text(product.publicProductId),
    retailPrice: product.retailPrice !== undefined && product.retailPrice !== null ? String(product.retailPrice) : "",
    internalCost: product.internalCost !== undefined && product.internalCost !== null ? String(product.internalCost) : "",
    tagsText: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    displayTag: text(product.displayTag),
    summary: text(product.summary),
    publicMetaText: stringifyWorkspaceProductMeta(product.publicMeta),
    progressSummary: text(product.progressSummary),
    supplierSummary: text(product.supplierSummary),
    hero: text(product.hero),
    needsUpdate: Boolean(product.needsUpdate),
  };
}

export function buildWorkspaceProductPayload(form) {
  const fallbackId = slugify(form.id) || slugify(form.name);

  return {
    id: fallbackId,
    name: text(form.name),
    shortName: text(form.shortName),
    category: text(form.category),
    status: text(form.status),
    owner: text(form.owner),
    ownerTeam: text(form.ownerTeam),
    publicProductId: text(form.publicProductId) || null,
    retailPrice: parseNumber(form.retailPrice),
    internalCost: parseNumber(form.internalCost),
    tags: parseWorkspaceProductTags(form.tagsText),
    displayTag: text(form.displayTag),
    summary: text(form.summary),
    publicMeta: parseWorkspaceProductMetaText(form.publicMetaText),
    progressSummary: text(form.progressSummary),
    supplierSummary: text(form.supplierSummary),
    hero: text(form.hero),
    needsUpdate: Boolean(form.needsUpdate),
  };
}

export function mapWorkspaceProductImportPreview(items = []) {
  return items.map((item) => ({
    id: text(item.id),
    name: text(item.name),
    status: text(item.status),
    owner: text(item.owner),
    category: text(item.category),
    tags: Array.isArray(item.tags) ? item.tags : [],
    summary: text(item.summary),
  }));
}
