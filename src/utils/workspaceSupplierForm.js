function text(value) {
  return String(value ?? "").trim();
}

function normalizeTags(value) {
  return [...new Set(String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))];
}

function normalizeRelatedProductIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => text(item)).filter(Boolean))]
    : [];
}

function numberText(value) {
  const normalized = text(value);
  return normalized ? normalized : "";
}

function numberValue(value) {
  const normalized = text(value);
  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function createWorkspaceSupplierFormDefaults(sessionUser = {}) {
  return {
    name: "",
    rating: "B",
    status: "draft",
    isPrivate: false,
    owner: text(sessionUser.name),
    companyArea: "",
    leadTimeBand: "",
    priceBand: "",
    cooperationHistory: "",
    fitScore: "",
    patentCount: "",
    capacitySummary: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    tagsText: "",
    relatedProductIds: [],
    summary: "",
  };
}

export function mapWorkspaceSupplierToForm(supplier, sessionUser) {
  if (!supplier) {
    return createWorkspaceSupplierFormDefaults(sessionUser);
  }

  return {
    name: text(supplier.name),
    rating: text(supplier.rating) || "B",
    status: text(supplier.status) || "draft",
    isPrivate: Boolean(supplier.isPrivate),
    owner: text(supplier.owner) || text(sessionUser?.name),
    companyArea: numberText(supplier.companyArea),
    leadTimeBand: text(supplier.leadTimeBand),
    priceBand: text(supplier.priceBand),
    cooperationHistory: text(supplier.cooperationHistory),
    fitScore: numberText(supplier.fitScore),
    patentCount: numberText(supplier.patentCount),
    capacitySummary: text(supplier.capacitySummary),
    contactName: text(supplier.contactName),
    contactPhone: text(supplier.contactPhone),
    contactEmail: text(supplier.contactEmail),
    tagsText: Array.isArray(supplier.tags) ? supplier.tags.join(", ") : "",
    relatedProductIds: normalizeRelatedProductIds(supplier.relatedProductIds),
    summary: text(supplier.summary),
  };
}

export function buildWorkspaceSupplierPayload(values = {}) {
  return {
    name: text(values.name),
    rating: text(values.rating) || "B",
    status: text(values.status) || "draft",
    isPrivate: Boolean(values.isPrivate),
    owner: text(values.owner),
    companyArea: numberValue(values.companyArea),
    leadTimeBand: text(values.leadTimeBand),
    priceBand: text(values.priceBand),
    cooperationHistory: text(values.cooperationHistory),
    fitScore: numberValue(values.fitScore),
    patentCount: numberValue(values.patentCount),
    capacitySummary: text(values.capacitySummary),
    contactName: text(values.contactName),
    contactPhone: text(values.contactPhone),
    contactEmail: text(values.contactEmail),
    tags: normalizeTags(values.tagsText),
    relatedProductIds: normalizeRelatedProductIds(values.relatedProductIds),
    summary: text(values.summary),
  };
}

export default {
  buildWorkspaceSupplierPayload,
  createWorkspaceSupplierFormDefaults,
  mapWorkspaceSupplierToForm,
};
