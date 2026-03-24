function text(value) {
  return String(value ?? "").trim();
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = text(value).toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return fallback;
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(text(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeList(value) {
  return [...new Set(
    String(value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )];
}

function computeSupplierRating({ rating, fitScore, patentCount }) {
  const normalizedRating = text(rating).toUpperCase();
  if (["A", "B", "C"].includes(normalizedRating)) {
    return normalizedRating;
  }

  if (fitScore >= 85 || patentCount >= 10) {
    return "A";
  }

  if (fitScore >= 70 || patentCount >= 5) {
    return "B";
  }

  return "C";
}

function toLines(rawText) {
  return String(rawText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parsePipeRecord(line) {
  const parts = String(line ?? "").split("|");
  if (parts.length < 17) {
    return {
      supplier: null,
      warnings: ["供应商导入列数不足，至少需要 17 列。"],
    };
  }

  const [
    name,
    rating,
    cooperationHistory,
    companyArea,
    leadTimeBand,
    priceBand,
    tags,
    owner,
    isPrivate,
    contactName,
    contactPhone,
    contactEmail,
    fitScore,
    patentCount,
    capacitySummary,
    relatedProductIds,
    summary,
  ] = parts;

  const normalizedFitScore = normalizeNumber(fitScore);
  const normalizedPatentCount = normalizeNumber(patentCount);
  const supplier = {
    name: text(name),
    rating: computeSupplierRating({
      rating,
      fitScore: normalizedFitScore,
      patentCount: normalizedPatentCount,
    }),
    status: "draft",
    isPrivate: normalizeBoolean(isPrivate),
    owner: text(owner),
    companyArea: normalizeNumber(companyArea),
    leadTimeBand: text(leadTimeBand),
    priceBand: text(priceBand),
    cooperationHistory: text(cooperationHistory),
    fitScore: normalizedFitScore,
    patentCount: normalizedPatentCount,
    capacitySummary: text(capacitySummary),
    contactName: text(contactName),
    contactPhone: text(contactPhone),
    contactEmail: text(contactEmail),
    tags: normalizeList(tags),
    relatedProductIds: normalizeList(relatedProductIds),
    summary: text(summary),
  };

  const warnings = [];
  if (!supplier.name) warnings.push("缺少供应商名称");
  if (!supplier.cooperationHistory) warnings.push("缺少合作历史");
  if (!supplier.leadTimeBand) warnings.push("缺少交期区间");
  if (!supplier.priceBand) warnings.push("缺少价格带");
  if (!supplier.contactName) warnings.push("缺少联系人");
  if (!supplier.contactPhone) warnings.push("缺少联系电话");

  if (warnings.length > 0) {
    return {
      supplier: null,
      warnings,
    };
  }

  return {
    supplier,
    warnings: [],
  };
}

export function previewWorkspaceSupplierImport(rawText) {
  const lines = toLines(rawText);
  if (lines.length === 0) {
    return {
      preview: [],
      warnings: ["Import text is empty."],
    };
  }

  const preview = [];
  const warnings = [];

  lines.forEach((line, index) => {
    const parsed = parsePipeRecord(line);
    const rowWarnings = parsed.warnings.map((warning) => `Record ${index + 1}: ${warning}`);
    preview.push({
      index: index + 1,
      supplier: parsed.supplier,
      warnings: rowWarnings,
    });
    warnings.push(...rowWarnings);
  });

  return {
    preview,
    warnings,
  };
}

export default {
  previewWorkspaceSupplierImport,
};
