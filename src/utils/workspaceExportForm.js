function text(value) {
  return String(value ?? "").trim();
}

function normalizeIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => text(item)).filter(Boolean))]
    : [];
}

function normalizeBoolean(value) {
  return value === true;
}

export function createWorkspaceExportFormDefaults() {
  return {
    title: "",
    version: "public",
    format: "pdf",
    productIds: [],
    supplierIds: [],
    includeContacts: false,
    riskAcknowledged: false,
    notes: "",
  };
}

export function buildWorkspaceExportPayload(values = {}) {
  return {
    title: text(values.title),
    version: text(values.version) || "public",
    format: text(values.format) || "pdf",
    productIds: normalizeIds(values.productIds),
    supplierIds: normalizeIds(values.supplierIds),
    includeContacts: normalizeBoolean(values.includeContacts),
    riskAcknowledged: normalizeBoolean(values.riskAcknowledged),
    notes: text(values.notes),
  };
}

export function buildWorkspaceExportPreview(values = {}, viewer = {}) {
  const payload = buildWorkspaceExportPayload(values);
  const warnings = [];
  const containsSensitiveData =
    payload.version === "priced" || (payload.includeContacts && payload.supplierIds.length > 0);

  if (!payload.title) {
    warnings.push("请输入导出任务名称。");
  }

  if (payload.productIds.length + payload.supplierIds.length === 0) {
    warnings.push("至少选择一个产品或供应商。");
  }

  if (payload.version === "priced" && viewer?.role !== "director") {
    warnings.push("当前账号无权导出带报价版资料。");
  }

  if (payload.version === "priced" && !payload.riskAcknowledged) {
    warnings.push("带报价版导出前必须确认风险提示。");
  }

  return {
    productCount: payload.productIds.length,
    supplierCount: payload.supplierIds.length,
    containsSensitiveData,
    canSubmit: warnings.length === 0,
    warnings,
  };
}

export default {
  buildWorkspaceExportPayload,
  buildWorkspaceExportPreview,
  createWorkspaceExportFormDefaults,
};
