import { normalizeWorkspaceQuoteRequirements } from "./workspaceQuoteFlow";

export function getWorkspaceQuoteImportTemplate() {
  return "需求名称|关键词|数量|目标交期|目标价格带|是否定制|备注";
}

function text(value) {
  return String(value ?? "").trim();
}

function toBoolean(value) {
  const normalized = text(value).toLowerCase();
  return ["是", "true", "yes", "1"].includes(normalized);
}

export function previewWorkspaceQuoteImport(rawText = "") {
  const lines = String(rawText ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const warnings = [];
  const preview = lines.map((line, index) => {
    const [name, keywords, quantity, targetLeadDays, targetPriceBand, isCustom, notes] = line.split("|");
    const requirement = normalizeWorkspaceQuoteRequirements([
      {
        id: `quote-import-${index + 1}`,
        name,
        keywords,
        quantity,
        targetLeadDays,
        targetPriceBand,
        isCustom: toBoolean(isCustom),
        notes,
      },
    ])[0];

    if (!requirement) {
      const warning = `Record ${index + 1}: invalid requirement row, missing name, quantity, or targetLeadDays.`;
      warnings.push(warning);
      return {
        index: index + 1,
        requirement: null,
        warnings: [warning],
      };
    }

    return {
      index: index + 1,
      requirement,
      warnings: [],
    };
  });

  return {
    preview,
    warnings,
  };
}

export default {
  getWorkspaceQuoteImportTemplate,
  previewWorkspaceQuoteImport,
};
