import { listWorkspaceProducts } from "../mockWorkspaceProductsService";
import { listWorkspaceSuppliers } from "./mockWorkspaceSuppliersService";
import { applySupplierVisibility, resolveSupplierViewerName } from "../../utils/workspaceSupplierVisibility";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.exports;
const FIXED_DELAY_MS = 5;
const ALLOWED_FORMATS = new Set(["pdf", "pptx", "xlsx", "csv"]);
const ALLOWED_VERSIONS = new Set(["public", "priced"]);
const DEFAULT_ROLE_NAMES = {
  employee: "内部员工",
  director: "部门总监",
  developer: "开发人员",
};

let cachedStore = null;

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, FIXED_DELAY_MS);
  });
}

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function getStorage() {
  if (typeof globalThis.localStorage !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  const memory = (globalThis.__GLINT_WORKSPACE_EXPORT_MEMORY__ ||= new Map());

  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(String(key), String(value));
    },
    removeItem(key) {
      memory.delete(String(key));
    },
  };
}

function nowIso() {
  return new Date().toISOString();
}

function text(value) {
  return String(value ?? "").trim();
}

function normalizeIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => text(item)).filter(Boolean))]
    : [];
}

function resolveViewerName(viewer = {}) {
  return resolveSupplierViewerName(viewer) || DEFAULT_ROLE_NAMES[text(viewer.role)] || "";
}

function isExportRoleAllowed(viewer = {}) {
  return ["employee", "director"].includes(text(viewer.role));
}

function isDirector(viewer = {}) {
  return text(viewer.role) === "director";
}

function createInitialStore() {
  return {
    version: 1,
    nextSequence: 1,
    items: [],
  };
}

function readStoreFromStorage() {
  const raw = getStorage().getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialStore();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      return createInitialStore();
    }

    return {
      version: Number(parsed.version) || 1,
      nextSequence: Number(parsed.nextSequence) || 1,
      items: clone(parsed.items),
    };
  } catch {
    return createInitialStore();
  }
}

function persistStore(store) {
  getStorage().setItem(STORAGE_KEY, JSON.stringify(store));
  invalidateWorkspaceStorageCache(STORAGE_KEY);
}

function getStore() {
  if (!cachedStore) {
    cachedStore = readStoreFromStorage();
    persistStore(cachedStore);
  }

  return cachedStore;
}

function saveStore(store) {
  cachedStore = store;
  persistStore(store);
}

function generateUniqueId(store) {
  let sequence = Number(store.nextSequence) || 1;
  let candidate = `workspace-export-${String(sequence).padStart(3, "0")}`;

  while (store.items.some((item) => item.id === candidate)) {
    sequence += 1;
    candidate = `workspace-export-${String(sequence).padStart(3, "0")}`;
  }

  store.nextSequence = sequence + 1;
  return candidate;
}

function slugify(value) {
  const normalized = text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "workspace-export";
}

function normalizePayload(input = {}) {
  return {
    title: text(input.title),
    version: text(input.version) || "public",
    format: text(input.format).toLowerCase() || "pdf",
    productIds: normalizeIds(input.productIds),
    supplierIds: normalizeIds(input.supplierIds),
    includeContacts: input.includeContacts === true,
    riskAcknowledged: input.riskAcknowledged,
    notes: text(input.notes),
  };
}

function validatePayload(payload, viewer = {}) {
  if (!payload.title) {
    return createError("INVALID_EXPORT_INPUT", "Export title is required.");
  }

  if (!ALLOWED_VERSIONS.has(payload.version)) {
    return createError("INVALID_EXPORT_INPUT", `Unsupported export version: ${payload.version}`);
  }

  if (!ALLOWED_FORMATS.has(payload.format)) {
    return createError("INVALID_EXPORT_INPUT", `Unsupported export format: ${payload.format}`);
  }

  if (payload.productIds.length + payload.supplierIds.length === 0) {
    return createError("INVALID_EXPORT_INPUT", "At least one product or supplier must be selected.");
  }

  if (payload.version === "priced" && !isDirector(viewer)) {
    return createError("EXPORT_FORBIDDEN", "Only directors can export priced materials.");
  }

  if (payload.version === "priced" && payload.riskAcknowledged === false) {
    return createError("EXPORT_RISK_UNCONFIRMED", "Priced exports require explicit risk acknowledgement.");
  }

  return null;
}

function sortBySelection(items, ids) {
  const orderMap = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort((left, right) => (orderMap.get(left.id) ?? 0) - (orderMap.get(right.id) ?? 0));
}

async function resolveSelectedProducts(productIds) {
  const result = await listWorkspaceProducts({});
  const items = Array.isArray(result?.items) ? result.items : [];
  return sortBySelection(
    items.filter((item) => productIds.includes(text(item.id))),
    productIds,
  );
}

async function resolveSelectedSuppliers(supplierIds, viewer) {
  const result = await listWorkspaceSuppliers({}, viewer);
  const items = Array.isArray(result?.items) ? result.items : [];
  return sortBySelection(
    items
      .filter((item) => supplierIds.includes(text(item.id)))
      .map((item) => applySupplierVisibility(item, viewer)),
    supplierIds,
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function buildProductSection(products, payload) {
  if (products.length === 0) {
    return ["产品清单", "无"];
  }

  return [
    "产品清单",
    ...products.flatMap((product) => {
      const lines = [
        `- ${product.name} (${product.id})`,
        `  类别: ${product.category || "--"}`,
        `  状态: ${product.status || "--"}`,
        `  零售价: ${product.retailPrice || 0}`,
      ];

      if (payload.version === "priced") {
        lines.push(`  内部成本: ${product.internalCost || 0}`);
      }

      if (product.summary) {
        lines.push(`  摘要: ${product.summary}`);
      }

      return lines;
    }),
  ];
}

function buildSupplierSection(suppliers, payload) {
  if (suppliers.length === 0) {
    return ["供应商清单", "无"];
  }

  const includeContacts = payload.includeContacts || payload.version === "priced";

  return [
    "供应商清单",
    ...suppliers.flatMap((supplier) => {
      const lines = [
        `- ${supplier.name} (${supplier.id})`,
        `  评级: ${supplier.rating || "--"}`,
        `  状态: ${supplier.status || "--"}`,
        `  交期区间: ${supplier.leadTimeBand || "--"}`,
        `  价格带: ${supplier.priceBand || "--"}`,
      ];

      if (includeContacts) {
        lines.push(`  联系人: ${supplier.contactName || "--"}`);
        lines.push(`  联系电话: ${supplier.contactPhone || "--"}`);
        lines.push(`  联系邮箱: ${supplier.contactEmail || "--"}`);
      }

      if (supplier.summary) {
        lines.push(`  摘要: ${supplier.summary}`);
      }

      return lines;
    }),
  ];
}

function buildExportContent(payload, viewer, products, suppliers, createdAt) {
  const containsSensitiveData = payload.version === "priced" || suppliers.some((item) =>
    Boolean((payload.includeContacts || payload.version === "priced") && (item.contactName || item.contactPhone || item.contactEmail)),
  );

  return {
    containsSensitiveData,
    content: [
      `导出名称: ${payload.title}`,
      `导出版本: ${payload.version === "priced" ? "带报价版" : "对外版"}`,
      `导出格式: ${payload.format.toUpperCase()}`,
      `导出人: ${resolveViewerName(viewer) || "系统"}`,
      `生成时间: ${formatDate(createdAt)}`,
      `产品数量: ${products.length}`,
      `供应商数量: ${suppliers.length}`,
      payload.notes ? `备注: ${payload.notes}` : "",
      "",
      ...buildProductSection(products, payload),
      "",
      ...buildSupplierSection(suppliers, payload),
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function projectHistoryItem(item) {
  return {
    id: item.id,
    title: item.title,
    version: item.version,
    format: item.format,
    owner: item.owner,
    ownerId: item.ownerId,
    productIds: clone(item.productIds),
    supplierIds: clone(item.supplierIds),
    productCount: item.productCount,
    supplierCount: item.supplierCount,
    containsSensitiveData: Boolean(item.containsSensitiveData),
    createdAt: item.createdAt,
    notes: item.notes,
    filename: item.filename,
  };
}

export async function createWorkspaceExport(input, viewer = {}) {
  await delay();

  if (!isExportRoleAllowed(viewer)) {
    return createError("EXPORT_FORBIDDEN", "You do not have permission to access export center.");
  }

  const payload = normalizePayload(input);
  const validationError = validatePayload(payload, viewer);
  if (validationError) {
    return validationError;
  }

  const store = getStore();
  const [products, suppliers] = await Promise.all([
    resolveSelectedProducts(payload.productIds),
    resolveSelectedSuppliers(payload.supplierIds, viewer),
  ]);

  if (products.length + suppliers.length === 0) {
    return createError("INVALID_EXPORT_INPUT", "No valid product or supplier records were found.");
  }

  const createdAt = nowIso();
  const id = generateUniqueId(store);
  const owner = resolveViewerName(viewer) || "系统";
  const filename = `${slugify(payload.title)}-${payload.version}.${payload.format}`;
  const artifact = buildExportContent(payload, viewer, products, suppliers, createdAt);

  const exportJob = {
    id,
    title: payload.title,
    version: payload.version,
    format: payload.format,
    productIds: payload.productIds,
    supplierIds: payload.supplierIds,
    productCount: products.length,
    supplierCount: suppliers.length,
    owner,
    ownerId: text(viewer.id),
    ownerRole: text(viewer.role),
    containsSensitiveData: artifact.containsSensitiveData,
    createdAt,
    notes: payload.notes,
    filename,
    download: {
      filename,
      content: artifact.content,
      mimeType: "text/plain;charset=utf-8",
    },
  };

  store.items = [exportJob, ...store.items];
  saveStore(store);

  return {
    exportJob: projectHistoryItem(exportJob),
    download: clone(exportJob.download),
  };
}

export async function listWorkspaceExports(viewer = {}) {
  await delay();

  if (!isExportRoleAllowed(viewer)) {
    return createError("EXPORT_FORBIDDEN", "You do not have permission to access export center.");
  }

  const viewerId = text(viewer.id);
  const items = getStore().items.filter((item) => {
    if (isDirector(viewer)) {
      return true;
    }

    return item.ownerId === viewerId;
  });

  return {
    items: items.map(projectHistoryItem),
    total: items.length,
  };
}

export async function downloadWorkspaceExport(id, viewer = {}) {
  await delay();

  if (!isExportRoleAllowed(viewer)) {
    return createError("EXPORT_FORBIDDEN", "You do not have permission to access export center.");
  }

  const exportJob = getStore().items.find((item) => item.id === text(id));
  if (!exportJob) {
    return createError("EXPORT_NOT_FOUND", "Export artifact not found.");
  }

  if (!isDirector(viewer) && exportJob.ownerId !== text(viewer.id)) {
    return createError("EXPORT_FORBIDDEN", "You do not have permission to download this export artifact.");
  }

  return clone(exportJob.download);
}

export function resetWorkspaceExportsStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceExportsService = {
  createWorkspaceExport,
  downloadWorkspaceExport,
  listWorkspaceExports,
  resetWorkspaceExportsStore,
};

export default mockWorkspaceExportsService;
