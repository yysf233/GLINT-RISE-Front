import { applySupplierVisibility } from "./workspaceSupplierVisibility";

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? "").trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function slugify(value) {
  const normalized = text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "workspace-quote";
}

function parseKeywords(value) {
  const source = Array.isArray(value) ? value : text(value).split(",");
  return [...new Set(source.map((item) => text(item).toLowerCase()).filter(Boolean))];
}

function parseLeadTimeBand(value) {
  const matches = String(value ?? "").match(/\d+/g) || [];
  if (matches.length === 0) {
    return 0;
  }

  return Number(matches[0]) || 0;
}

function getPriceBandRank(value) {
  const normalized = text(value);
  if (!normalized) return 99;
  if (normalized.includes("低")) return 1;
  if (normalized === "中") return 2;
  if (normalized.includes("中高")) return 3;
  if (normalized.includes("高")) return 4;
  return 9;
}

function getRatingWeight(value) {
  const normalized = text(value).toUpperCase();
  if (normalized === "A") return 3;
  if (normalized === "B") return 2;
  if (normalized === "C") return 1;
  return 0;
}

function ensureRequirementId(requirement = {}, index = 0) {
  return text(requirement.id) || `quote-requirement-${index + 1}`;
}

function productSearchScore(product = {}, requirement = {}) {
  const tokens = parseKeywords(requirement.keywords);
  if (tokens.length === 0) {
    return product.status === "active" ? 10 : 0;
  }

  const name = text(product.name).toLowerCase();
  const category = text(product.category).toLowerCase();
  const summary = text(product.summary).toLowerCase();
  const tags = Array.isArray(product.tags) ? product.tags.map((item) => text(item).toLowerCase()) : [];

  return tokens.reduce((score, token) => {
    let nextScore = score;
    if (name.includes(token)) nextScore += 60;
    if (tags.some((tag) => tag.includes(token))) nextScore += 30;
    if (summary.includes(token)) nextScore += 15;
    if (category.includes(token)) nextScore += 10;
    return nextScore;
  }, product.status === "active" ? 5 : 0);
}

function buildTierPrice(unitPrice, factor) {
  return roundCurrency(unitPrice * factor);
}

export function createWorkspaceQuoteDraftDefaults(sessionUser = {}) {
  return {
    title: "",
    owner: text(sessionUser.name),
    currentStep: 1,
    requirements: [],
    matches: [],
    supplierSortBy: "score",
    supplierSelections: [],
    pricingEntries: [],
  };
}

export function normalizeWorkspaceQuoteRequirements(requirements = []) {
  return (Array.isArray(requirements) ? requirements : [])
    .map((requirement, index) => {
      const quantityText = text(requirement.quantity);
      const targetLeadDaysText = text(requirement.targetLeadDays);
      const quantity = quantityText ? toNumber(quantityText, 0) : 0;
      const targetLeadDays = targetLeadDaysText ? toNumber(targetLeadDaysText, 0) : 0;

      return {
        id: ensureRequirementId(requirement, index),
        name: text(requirement.name),
        keywords: parseKeywords(requirement.keywords),
        quantity,
        targetLeadDays,
        targetPriceBand: text(requirement.targetPriceBand),
        isCustom: requirement.isCustom === true,
        notes: text(requirement.notes),
      };
    })
    .filter((item) => item.name && item.quantity > 0 && item.targetLeadDays > 0);
}

export function buildWorkspaceQuoteMatches(requirements = [], products = [], existingMatches = []) {
  const productList = Array.isArray(products) ? products : [];
  const existingByRequirementId = new Map(
    (Array.isArray(existingMatches) ? existingMatches : [])
      .filter((item) => !item?.manualAdded && text(item.requirementId))
      .map((item) => [text(item.requirementId), item]),
  );

  const autoMatches = normalizeWorkspaceQuoteRequirements(requirements).map((requirement, index) => {
    const rankedProducts = [...productList]
      .map((product) => ({
        ...product,
        __score: productSearchScore(product, requirement),
      }))
      .sort((left, right) => right.__score - left.__score || text(left.name).localeCompare(text(right.name)));

    const fallbackProduct = rankedProducts[0] || productList[0];
    const existingMatch = existingByRequirementId.get(requirement.id);
    const isSkipped = existingMatch?.skipped === true;
    const existingProductId = text(existingMatch?.productId);
    const chosenProductId =
      isSkipped
        ? ""
        : (
      existingProductId && productList.some((product) => product.id === existingProductId)
        ? existingProductId
        : text(fallbackProduct?.id)
      );
    const candidateProductIds = [...new Set(
      rankedProducts
        .slice(0, 5)
        .map((product) => text(product.id))
        .filter(Boolean),
    )];

    if (chosenProductId && !candidateProductIds.includes(chosenProductId)) {
      candidateProductIds.unshift(chosenProductId);
    }

    return {
      id: text(existingMatch?.id) || `quote-match-${index + 1}`,
      requirementId: requirement.id,
      requirementName: requirement.name,
      productId: chosenProductId,
      candidateProductIds,
      manualAdded: false,
      skipped: isSkipped,
    };
  });

  const manualMatches = (Array.isArray(existingMatches) ? existingMatches : [])
    .filter((item) => item?.manualAdded)
    .map((item, index) => ({
      id: text(item.id) || `quote-match-manual-${index + 1}`,
      requirementId: text(item.requirementId) || `manual-requirement-${index + 1}`,
      requirementName: text(item.requirementName) || "手动补充产品",
      productId: text(item.productId),
      candidateProductIds: [...new Set(
        [text(item.productId), ...(Array.isArray(item.candidateProductIds) ? item.candidateProductIds.map((value) => text(value)) : [])]
          .filter(Boolean),
      )],
      manualAdded: true,
      skipped: item?.skipped === true,
    }))
    .filter((item) => item.productId || item.skipped);

  return [...autoMatches, ...manualMatches];
}

export function buildWorkspaceQuoteSupplierRecommendations(
  matches = [],
  suppliers = [],
  viewer = {},
  sortBy = "score",
) {
  const supplierList = Array.isArray(suppliers) ? suppliers : [];

  return (Array.isArray(matches) ? matches : []).map((match) => {
    if (!text(match.productId) || match.skipped) {
      return {
        matchId: text(match.id),
        productId: text(match.productId),
        items: [],
      };
    }

    const relatedSuppliers = supplierList.filter((supplier) =>
      Array.isArray(supplier.relatedProductIds) && supplier.relatedProductIds.includes(text(match.productId)),
    );
    const pool = relatedSuppliers.length > 0
      ? relatedSuppliers
      : supplierList.filter((supplier) => supplier.status === "active");

    const items = pool
      .map((supplier) => {
        const visibleSupplier = applySupplierVisibility(supplier, viewer);
        const leadTimeMinDays = parseLeadTimeBand(supplier.leadTimeBand);
        const capabilityScore = toNumber(supplier.fitScore, 0) + toNumber(supplier.patentCount, 0);
        const score =
          getRatingWeight(supplier.rating) * 40 +
          toNumber(supplier.fitScore, 0) +
          toNumber(supplier.patentCount, 0) -
          leadTimeMinDays;

        return {
          supplierId: supplier.id,
          supplierName: visibleSupplier.name,
          isMasked: Boolean(visibleSupplier.isMasked),
          rating: supplier.rating,
          status: supplier.status,
          leadTimeBand: supplier.leadTimeBand,
          leadTimeMinDays,
          priceBand: supplier.priceBand,
          priceRank: getPriceBandRank(supplier.priceBand),
          fitScore: toNumber(supplier.fitScore, 0),
          patentCount: toNumber(supplier.patentCount, 0),
          capabilityScore,
          score,
        };
      })
      .sort((left, right) => {
        if (sortBy === "price") {
          return left.priceRank - right.priceRank || right.score - left.score;
        }
        if (sortBy === "leadTime") {
          return left.leadTimeMinDays - right.leadTimeMinDays || right.score - left.score;
        }
        if (sortBy === "capability") {
          return right.capabilityScore - left.capabilityScore || right.score - left.score;
        }
        return right.score - left.score || left.priceRank - right.priceRank;
      });

    return {
      matchId: text(match.id),
      productId: text(match.productId),
      items,
    };
  });
}

export function buildWorkspaceQuotePricingPreview(
  {
    requirements = [],
    matches = [],
    supplierSelections = [],
    pricingEntries = [],
  } = {},
  {
    products = [],
    suppliers = [],
    viewer = {},
  } = {},
) {
  const requirementMap = new Map(
    normalizeWorkspaceQuoteRequirements(requirements).map((requirement) => [requirement.id, requirement]),
  );
  const productMap = new Map((Array.isArray(products) ? products : []).map((product) => [text(product.id), product]));
  const supplierMap = new Map((Array.isArray(suppliers) ? suppliers : []).map((supplier) => [text(supplier.id), supplier]));
  const selectionMap = new Map(
    (Array.isArray(supplierSelections) ? supplierSelections : [])
      .map((item) => [text(item.matchId), text(item.supplierId)])
      .filter(([, supplierId]) => supplierId),
  );
  const pricingMap = new Map(
    (Array.isArray(pricingEntries) ? pricingEntries : []).map((item) => [text(item.matchId), item]),
  );
  const fallbackRecommendations = buildWorkspaceQuoteSupplierRecommendations(matches, suppliers, viewer, "score");
  const fallbackSelectionMap = new Map(
    fallbackRecommendations.map((item) => [item.matchId, text(item.items[0]?.supplierId)]),
  );

  const items = (Array.isArray(matches) ? matches : []).map((match) => {
    if (!text(match.productId) || match.skipped) {
      return null;
    }

    const requirement = requirementMap.get(text(match.requirementId));
    const product = productMap.get(text(match.productId));
    const pricingEntry = pricingMap.get(text(match.id)) || {};
    const supplierId = selectionMap.get(text(match.id)) || fallbackSelectionMap.get(text(match.id)) || "";
    const supplier = supplierMap.get(supplierId);
    const visibleSupplier = supplier ? applySupplierVisibility(supplier, viewer) : null;
    const quantity = Math.max(1, toNumber(requirement?.quantity, 1));
    const markupRate = Math.max(0, toNumber(pricingEntry.markupRate, 0));
    const toolingFee = Math.max(0, toNumber(pricingEntry.toolingFee, 0));
    const leadTimeBufferDays = Math.max(0, toNumber(pricingEntry.leadTimeBufferDays, 0));
    const baseUnitCost = toNumber(product?.internalCost, 0) || roundCurrency(toNumber(product?.retailPrice, 0) * 0.55);
    const outwardUnitPrice = roundCurrency(baseUnitCost * (1 + markupRate / 100) + toolingFee / quantity);
    const leadTimeDays = parseLeadTimeBand(supplier?.leadTimeBand) + leadTimeBufferDays;

    return {
      matchId: text(match.id),
      requirementId: text(match.requirementId),
      requirementName: text(match.requirementName),
      productId: text(product?.id),
      productName: text(product?.name) || text(match.productId),
      quantity,
      supplierId,
      supplierName: text(visibleSupplier?.name) || "--",
      supplierIsMasked: Boolean(visibleSupplier?.isMasked),
      markupRate,
      toolingFee,
      leadTimeBufferDays,
      leadTimeDays,
      targetLeadDays: Math.max(0, toNumber(requirement?.targetLeadDays, 0)),
      targetPriceBand: text(requirement?.targetPriceBand),
      procurementMode: requirement?.isCustom ? "定制" : "现采",
      baseUnitCost,
      baseUnitCostVisible: text(viewer?.role) === "director" ? baseUnitCost : null,
      outwardUnitPrice,
      outwardLineTotal: roundCurrency(outwardUnitPrice * quantity),
    };
  }).filter(Boolean);

  return {
    items,
    totals: {
      lineCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalToolingFee: roundCurrency(items.reduce((sum, item) => sum + item.toolingFee, 0)),
      totalAmount: roundCurrency(items.reduce((sum, item) => sum + item.outwardLineTotal, 0)),
    },
  };
}

export function buildWorkspaceQuoteSheetArtifact({ quote = {}, pricingPreview = {} } = {}, viewer = {}) {
  const lines = Array.isArray(pricingPreview.items) ? pricingPreview.items : [];
  const filename = `${text(quote.id) || slugify(quote.title)}-quote.xlsx`;
  const showCost = text(viewer?.role) === "director";

  const content = [
    "标准报价单",
    `询价单号: ${text(quote.id) || "--"}`,
    `询价标题: ${text(quote.title) || "--"}`,
    `负责人: ${text(quote.owner) || "--"}`,
    "",
    ...lines.flatMap((line, index) => {
      const tier1 = buildTierPrice(line.outwardUnitPrice, 1);
      const tier2 = buildTierPrice(line.outwardUnitPrice, 0.95);
      const tier3 = buildTierPrice(line.outwardUnitPrice, 0.9);

      return [
        `#${index + 1} ${line.productName}`,
        `需求: ${line.requirementName}`,
        `数量: ${line.quantity}`,
        `供应商: ${line.supplierName}`,
        `采购模式: ${line.procurementMode}`,
        `现采起订量/工期/阶梯报价: 50 / ${Math.max(1, line.leadTimeDays - 2)}天 / 1-99:${tier1} 100+:${tier2}`,
        `定制起订量/工期/阶梯报价: 200 / ${Math.max(1, line.leadTimeDays)}天 / 200+:${tier3}`,
        `模具费与工期: ${line.toolingFee} / +${line.leadTimeBufferDays}天`,
        `对外总工期: ${line.leadTimeDays}天`,
        `对外单价: ${line.outwardUnitPrice}`,
        `对外总价: ${line.outwardLineTotal}`,
        showCost ? `内部成本: ${line.baseUnitCost}` : "",
        "",
      ].filter(Boolean);
    }),
  ].join("\n");

  return {
    filename,
    content,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export default {
  buildWorkspaceQuoteMatches,
  buildWorkspaceQuotePricingPreview,
  buildWorkspaceQuoteSheetArtifact,
  buildWorkspaceQuoteSupplierRecommendations,
  createWorkspaceQuoteDraftDefaults,
  normalizeWorkspaceQuoteRequirements,
};
