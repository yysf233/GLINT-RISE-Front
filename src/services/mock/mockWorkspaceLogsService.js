import workspaceProductSeeds, { workspaceProductSeedState } from "../../data/workspaceProductSeeds";
import workspaceBannerSeeds, { workspaceBannerSeedState } from "../../data/workspace/workspaceBannerSeeds";
import workspaceLogSeeds, { workspaceLogSeedState } from "../../data/workspace/workspaceLogSeeds";
import workspaceProjectSeeds, { workspaceProjectSeedState } from "../../data/workspace/workspaceProjectSeeds";
import workspaceSiteSettingsSeeds from "../../data/workspace/workspaceSiteSettingsSeeds";
import workspaceSupplierSeeds, { workspaceSupplierSeedState } from "../../data/workspace/workspaceSupplierSeeds";
import workspaceUserSeeds, { workspaceUserSeedState } from "../../data/workspace/workspaceUserSeeds";
import { createWorkspaceStorage, readWorkspaceStorage, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.logs;
const FIXED_DELAY_MS = 5;
const ALLOWED_ROLES = new Set(["employee", "director"]);

const logsStorage = createWorkspaceStorage({
  key: STORAGE_KEY,
  seed: workspaceLogSeedState,
});

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, FIXED_DELAY_MS);
  });
}

function text(value) {
  return String(value ?? "").trim();
}

function nowIso() {
  return new Date().toISOString();
}

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function isAllowed(viewer = {}) {
  return ALLOWED_ROLES.has(text(viewer.role));
}

function isDirector(viewer = {}) {
  return text(viewer.role) === "director";
}

function hasFullAccess(viewer = {}) {
  return isDirector(viewer) || viewer?.permissions?.logAccess === true;
}

function compareByTimeDesc(left, right) {
  return new Date(right).getTime() - new Date(left).getTime();
}

function toLogLevel(action = "") {
  const normalized = text(action).toLowerCase();

  if (normalized.includes("approve")) return "success";
  if (normalized.includes("reject")) return "warning";
  if (normalized.includes("error") || normalized.includes("exception")) return "error";
  if (normalized.includes("export") || normalized.includes("generate")) return "warning";
  return "info";
}

function readModuleItems(key, seed, selector = (snapshot) => snapshot.items) {
  const snapshot = readWorkspaceStorage({ key, seed });
  const items = selector(snapshot);
  return Array.isArray(items) ? clone(items) : [];
}

function readLogsSnapshot() {
  const snapshot = logsStorage.read();
  if (Array.isArray(snapshot.items) && snapshot.items[0]) {
    return clone(snapshot.items[0]);
  }
  return clone(workspaceLogSeeds);
}

function writeLogsSnapshot(nextSnapshot) {
  return logsStorage.write({
    version: workspaceLogSeedState.version,
    items: [nextSnapshot],
    generatedAt: workspaceLogSeedState.generatedAt,
  });
}

function createUserLookup(users = []) {
  const lookup = new Map();
  users.forEach((item) => {
    const id = text(item.id);
    const name = text(item.name);
    const identifier = text(item.identifier);

    if (name) lookup.set(name, id);
    if (identifier) lookup.set(identifier, id);
  });
  return lookup;
}

function normalizeActivityLogs(records = [], options = {}, userLookup = new Map()) {
  const {
    module,
    moduleLabel,
    getEntityTitle = (item) => item.id,
    getOwnerId = (item) => item.ownerId,
    getOwnerName = (item) => item.owner,
  } = options;

  return records.flatMap((record) => {
    const entityId = text(record?.id);
    const entityTitle = text(getEntityTitle(record)) || entityId || moduleLabel;
    const ownerName = text(getOwnerName(record));
    const ownerId = text(getOwnerId(record)) || text(userLookup.get(ownerName));
    const logs = Array.isArray(record?.logs) ? record.logs : [];

    return logs.map((entry, index) => {
      const actor = text(entry?.actor) || ownerName || "system";
      return {
        id: `${module}-${entityId || "record"}-${index + 1}`,
        timestamp: text(entry?.timestamp) || nowIso(),
        module,
        moduleLabel,
        entityId,
        entityTitle,
        action: text(entry?.action) || "update",
        level: toLogLevel(entry?.action),
        actor,
        actorId: text(userLookup.get(actor)),
        ownerId,
        ownerName,
        message: text(entry?.message) || `${entityTitle} 发生了一次操作记录。`,
      };
    });
  });
}

function normalizeExportLogs(records = [], userLookup = new Map()) {
  return records.map((record) => {
    const actor = text(record.owner) || "system";
    const versionLabel = record.version === "priced" ? "带报价版" : "对外版";

    return {
      id: `exports-${text(record.id)}`,
      timestamp: text(record.createdAt) || nowIso(),
      module: "exports",
      moduleLabel: "导出中心",
      entityId: text(record.id),
      entityTitle: text(record.title) || text(record.filename) || "导出任务",
      action: "export",
      level: "warning",
      actor,
      actorId: text(record.ownerId) || text(userLookup.get(actor)),
      ownerId: text(record.ownerId),
      ownerName: actor,
      message: text(record.notes) || `生成了${versionLabel}导出文件。`,
    };
  });
}

function normalizeAccessLogs(users = [], shareLogs = []) {
  const loginLogs = users
    .filter((item) => text(item.lastLoginAt))
    .map((item) => ({
      id: `login-${text(item.id)}`,
      timestamp: text(item.lastLoginAt),
      type: "login",
      module: "auth",
      moduleLabel: "登录与会话",
      actor: text(item.name) || text(item.identifier) || "用户",
      actorId: text(item.id),
      channel: "后台登录",
      targetPath: "/workspace/dashboard",
      targetTitle: "后台工作台",
      status: item.status === "active" ? "success" : "blocked",
      message: `${text(item.name) || "用户"} 登录了后台。`,
    }));

  const normalizedShareLogs = shareLogs.map((item) => ({
    id: text(item.id),
    timestamp: text(item.createdAt) || nowIso(),
    type: text(item.type) || "share",
    module: text(item.sourceModule) || "public-site",
    moduleLabel: text(item.sourceModule) === "exports" ? "导出中心" : "公开站分享",
    actor: text(item.actor) || "访客",
    actorId: text(item.actorId),
    channel: text(item.channel) || "--",
    targetPath: text(item.targetPath),
    targetTitle: text(item.targetTitle) || text(item.sourceTitle) || "分享记录",
    status: text(item.status) || "opened",
    message: text(item.message) || "产生了一条分享或访问记录。",
  }));

  return [...loginLogs, ...normalizedShareLogs].sort((left, right) => compareByTimeDesc(left.timestamp, right.timestamp));
}

function normalizeAlerts(alerts = [], fullAccess = false) {
  return alerts
    .map((item) => ({
      id: text(item.id),
      title: text(item.title),
      severity: text(item.severity) || "low",
      status: text(item.status) || "active",
      category: text(item.category) || "runtime",
      module: text(item.module) || "public-site",
      source: text(item.source),
      owner: text(item.owner),
      occurrenceCount: Number(item.occurrenceCount) || 0,
      firstDetectedAt: text(item.firstDetectedAt),
      lastDetectedAt: text(item.lastDetectedAt),
      summary: text(item.summary),
      detail: fullAccess ? text(item.detail) : "",
      acknowledgedAt: text(item.acknowledgedAt),
      acknowledgedBy: fullAccess ? text(item.acknowledgedBy) : "",
    }))
    .sort((left, right) => compareByTimeDesc(left.lastDetectedAt, right.lastDetectedAt));
}

function filterByKeyword(items = [], keyword = "", fields = []) {
  const normalizedKeyword = text(keyword).toLowerCase();
  if (!normalizedKeyword) {
    return items;
  }

  return items.filter((item) =>
    fields
      .map((field) => text(item?.[field]).toLowerCase())
      .join(" ")
      .includes(normalizedKeyword),
  );
}

function applyDashboardFilters(data, query = {}) {
  const module = text(query.module);
  const level = text(query.level);
  const severity = text(query.severity);
  const alertStatus = text(query.alertStatus);
  const accessType = text(query.accessType);
  const keyword = text(query.keyword);

  let activityLogs = filterByKeyword(data.activityLogs, keyword, ["moduleLabel", "entityTitle", "action", "actor", "message"]);
  let accessLogs = filterByKeyword(data.accessLogs, keyword, ["moduleLabel", "actor", "targetTitle", "channel", "message"]);
  let alerts = filterByKeyword(data.alerts, keyword, ["title", "module", "summary", "detail", "owner"]);

  if (module && module !== "all") {
    activityLogs = activityLogs.filter((item) => item.module === module);
    accessLogs = accessLogs.filter((item) => item.module === module || item.type === module);
    alerts = alerts.filter((item) => item.module === module);
  }

  if (level && level !== "all") {
    activityLogs = activityLogs.filter((item) => item.level === level);
  }

  if (severity && severity !== "all") {
    alerts = alerts.filter((item) => item.severity === severity);
  }

  if (alertStatus && alertStatus !== "all") {
    alerts = alerts.filter((item) => item.status === alertStatus);
  }

  if (accessType && accessType !== "all") {
    accessLogs = accessLogs.filter((item) => item.type === accessType);
  }

  return {
    activityLogs,
    accessLogs,
    alerts,
  };
}

function buildSummary(activityLogs = [], accessLogs = [], alerts = []) {
  return {
    totalActivityLogs: activityLogs.length,
    totalAccessLogs: accessLogs.length,
    activeAlerts: alerts.filter((item) => item.status === "active").length,
    criticalAlerts: alerts.filter((item) => item.severity === "high" && item.status !== "resolved").length,
  };
}

function collectDashboardData(viewer = {}) {
  const usersSnapshot = readWorkspaceStorage({
    key: WORKSPACE_STORAGE_KEYS.users,
    seed: {
      version: workspaceUserSeedState.version,
      nextSequence: workspaceUserSeedState.nextSequence,
      nextRequestSequence: workspaceUserSeedState.nextRequestSequence,
      items: workspaceUserSeeds.items,
      requests: workspaceUserSeeds.requests,
    },
  });
  const users = Array.isArray(usersSnapshot.items) ? clone(usersSnapshot.items) : [];
  const userLookup = createUserLookup(users);
  const fullAccess = hasFullAccess(viewer);
  const viewerId = text(viewer.id);
  const viewerName = text(viewer.name);
  const logsSnapshot = readLogsSnapshot();

  const products = readModuleItems(
    WORKSPACE_STORAGE_KEYS.products,
    {
      version: workspaceProductSeedState.version,
      nextSequence: workspaceProductSeedState.nextSequence,
      items: workspaceProductSeeds,
    },
  );
  const projects = readModuleItems(
    WORKSPACE_STORAGE_KEYS.projects,
    {
      version: workspaceProjectSeedState.version,
      nextSequence: workspaceProjectSeedState.nextSequence,
      items: workspaceProjectSeeds,
    },
  );
  const banners = readModuleItems(
    WORKSPACE_STORAGE_KEYS.banners,
    {
      version: workspaceBannerSeedState.version,
      nextSequence: workspaceBannerSeedState.nextSequence,
      items: workspaceBannerSeeds,
    },
  );
  const suppliers = readModuleItems(
    WORKSPACE_STORAGE_KEYS.suppliers,
    {
      version: workspaceSupplierSeedState.version,
      nextSequence: workspaceSupplierSeedState.nextSequence,
      items: workspaceSupplierSeeds,
    },
  );
  const quotes = readModuleItems(WORKSPACE_STORAGE_KEYS.quotes, { version: 1, items: [] });
  const exports = readModuleItems(WORKSPACE_STORAGE_KEYS.exports, { version: 1, items: [] });
  const siteSettings = readModuleItems(WORKSPACE_STORAGE_KEYS.siteSettings, {
    version: 1,
    items: [workspaceSiteSettingsSeeds],
  });

  const activityLogs = [
    ...normalizeActivityLogs(
      products,
      {
        module: "products",
        moduleLabel: "产品管理",
        getEntityTitle: (item) => item.name,
        getOwnerName: (item) => item.ownerName || item.owner,
      },
      userLookup,
    ),
    ...normalizeActivityLogs(
      projects,
      {
        module: "projects",
        moduleLabel: "项目管理",
        getEntityTitle: (item) => item.title,
        getOwnerName: (item) => item.owner,
      },
      userLookup,
    ),
    ...normalizeActivityLogs(
      banners,
      {
        module: "banners",
        moduleLabel: "轮播管理",
        getEntityTitle: (item) => item.title,
      },
      userLookup,
    ),
    ...normalizeActivityLogs(
      suppliers,
      {
        module: "suppliers",
        moduleLabel: "供应商管理",
        getEntityTitle: (item) => item.name,
        getOwnerName: (item) => item.owner,
      },
      userLookup,
    ),
    ...normalizeActivityLogs(
      quotes,
      {
        module: "quotes",
        moduleLabel: "询报价流程",
        getEntityTitle: (item) => item.title,
        getOwnerId: (item) => item.ownerId,
        getOwnerName: (item) => item.owner,
      },
      userLookup,
    ),
    ...normalizeExportLogs(exports, userLookup),
    ...normalizeActivityLogs(
      users,
      {
        module: "users",
        moduleLabel: "权限与用户",
        getEntityTitle: (item) => item.name,
        getOwnerId: (item) => item.id,
        getOwnerName: (item) => item.name,
      },
      userLookup,
    ),
    ...normalizeActivityLogs(
      siteSettings,
      {
        module: "site-settings",
        moduleLabel: "站点配置",
        getEntityTitle: () => "站点配置",
      },
      userLookup,
    ),
  ].sort((left, right) => compareByTimeDesc(left.timestamp, right.timestamp));

  const accessLogs = normalizeAccessLogs(users, Array.isArray(logsSnapshot.shareLogs) ? logsSnapshot.shareLogs : []);
  const alerts = normalizeAlerts(Array.isArray(logsSnapshot.alerts) ? logsSnapshot.alerts : [], fullAccess);

  const scopedActivityLogs = fullAccess
    ? activityLogs
    : activityLogs.filter(
        (item) =>
          item.actorId === viewerId ||
          item.actor === viewerName ||
          item.ownerId === viewerId ||
          item.ownerName === viewerName,
      );

  const scopedAccessLogs = fullAccess ? accessLogs : accessLogs.filter((item) => item.actorId === viewerId);

  return {
    accessLevel: fullAccess ? "full" : "limited",
    activityLogs: scopedActivityLogs,
    accessLogs: scopedAccessLogs,
    alerts,
  };
}

export async function getWorkspaceLogsDashboard(query = {}, viewer = {}) {
  await delay();

  if (!isAllowed(viewer)) {
    return createError("WORKSPACE_LOGS_FORBIDDEN", "当前账号无权访问日志与监控模块。");
  }

  const dashboard = collectDashboardData(viewer);
  const filtered = applyDashboardFilters(dashboard, query);

  return {
    accessLevel: dashboard.accessLevel,
    activityLogs: filtered.activityLogs,
    accessLogs: filtered.accessLogs,
    alerts: filtered.alerts,
    summary: buildSummary(filtered.activityLogs, filtered.accessLogs, filtered.alerts),
  };
}

export async function acknowledgeWorkspaceMonitorAlert(id, viewer = {}) {
  await delay();

  if (!isAllowed(viewer) || !isDirector(viewer)) {
    return createError("WORKSPACE_LOGS_FORBIDDEN", "只有总监可以确认监控告警。");
  }

  const snapshot = readLogsSnapshot();
  const alerts = Array.isArray(snapshot.alerts) ? clone(snapshot.alerts) : [];
  const index = alerts.findIndex((item) => text(item.id) === text(id));

  if (index === -1) {
    return createError("WORKSPACE_ALERT_NOT_FOUND", "未找到对应的监控告警。");
  }

  alerts[index] = {
    ...alerts[index],
    status: "acknowledged",
    acknowledgedAt: nowIso(),
    acknowledgedBy: text(viewer.name) || "部门总监",
  };

  writeLogsSnapshot({
    ...snapshot,
    alerts,
    updatedAt: nowIso(),
  });

  return {
    alert: normalizeAlerts([alerts[index]], true)[0],
  };
}

export function resetWorkspaceLogsStore() {
  logsStorage.reset();
}

export const mockWorkspaceLogsService = {
  acknowledgeWorkspaceMonitorAlert,
  getWorkspaceLogsDashboard,
  resetWorkspaceLogsStore,
};

export default mockWorkspaceLogsService;
