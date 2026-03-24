import workspaceUserSeeds, {
  workspaceUserSeedState,
} from "../../data/workspace/workspaceUserSeeds";
import { invalidateWorkspaceStorageCache, WORKSPACE_STORAGE_KEYS } from "./workspaceStorage";

const STORAGE_KEY = WORKSPACE_STORAGE_KEYS.users;
const FIXED_DELAY_MS = 5;
const TOKEN_PREFIX = "mock-session-token";

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

function text(value) {
  return String(value ?? "").trim();
}

function nowIso() {
  return new Date().toISOString();
}

function getStorage() {
  if (typeof globalThis.localStorage !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  const memory = (globalThis.__GLINT_WORKSPACE_USERS_MEMORY__ ||= new Map());

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

function createInitialStore() {
  return clone({
    version: workspaceUserSeedState.version,
    nextSequence: workspaceUserSeedState.nextSequence,
    nextRequestSequence: workspaceUserSeedState.nextRequestSequence,
    items: workspaceUserSeeds.items,
    requests: workspaceUserSeeds.requests,
  });
}

function readStoreFromStorage() {
  const raw = getStorage().getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialStore();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items) || !Array.isArray(parsed.requests)) {
      return createInitialStore();
    }

    return {
      version: Number(parsed.version) || workspaceUserSeedState.version,
      nextSequence: Number(parsed.nextSequence) || workspaceUserSeedState.nextSequence,
      nextRequestSequence: Number(parsed.nextRequestSequence) || workspaceUserSeedState.nextRequestSequence,
      items: clone(parsed.items),
      requests: clone(parsed.requests),
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

function ensureBusinessViewer(viewer = {}) {
  const role = text(viewer.role);
  if (role === "employee" || role === "director") {
    return null;
  }
  return createError("USER_ADMIN_FORBIDDEN", "当前账号无权访问权限与用户模块。");
}

function ensureDirector(viewer = {}) {
  return text(viewer.role) === "director"
    ? null
    : createError("USER_ADMIN_FORBIDDEN", "只有总监可以修改用户、权限和审批结果。");
}

function normalizePermissions(value = {}, base = {}) {
  return {
    contentMaintenance: Boolean(value.contentMaintenance ?? base.contentMaintenance),
    siteSettings: Boolean(value.siteSettings ?? base.siteSettings),
    supplierSensitive: Boolean(value.supplierSensitive ?? base.supplierSensitive),
    pricedExport: Boolean(value.pricedExport ?? base.pricedExport),
    userAdmin: Boolean(value.userAdmin ?? base.userAdmin),
    logAccess: Boolean(value.logAccess ?? base.logAccess),
  };
}

function normalizeDataScope(value = {}, base = {}) {
  return {
    products: text(value.products ?? base.products) || "self",
    suppliers: text(value.suppliers ?? base.suppliers) || "self",
    quotes: text(value.quotes ?? base.quotes) || "self",
  };
}

function normalizeUserPayload(input = {}, base = {}) {
  return {
    id: text(input.id ?? base.id),
    identifier: text(input.identifier ?? base.identifier),
    name: text(input.name ?? base.name),
    email: text(input.email ?? base.email),
    role: text(input.role ?? base.role) || "employee",
    status: text(input.status ?? base.status) || "active",
    department: text(input.department ?? base.department),
    title: text(input.title ?? base.title),
    notes: text(input.notes ?? base.notes),
    permissions: normalizePermissions(input.permissions, base.permissions),
    dataScope: normalizeDataScope(input.dataScope, base.dataScope),
    lastLoginAt: text(input.lastLoginAt ?? base.lastLoginAt),
  };
}

function validateUserPayload(payload, store, currentId = "") {
  if (!payload.identifier || !payload.name || !payload.email) {
    return createError("INVALID_USER_INPUT", "账号、姓名和邮箱为必填项。");
  }
  if (!["employee", "director", "developer"].includes(payload.role)) {
    return createError("INVALID_USER_INPUT", "不支持的角色类型。");
  }
  if (!["active", "disabled", "pending"].includes(payload.status)) {
    return createError("INVALID_USER_INPUT", "不支持的账号状态。");
  }

  const duplicated = store.items.find(
    (item) => item.identifier === payload.identifier && item.id !== currentId,
  );
  if (duplicated) {
    return createError("IDENTIFIER_CONFLICT", "该账号标识已存在。");
  }
  return null;
}

function generateUserId(store) {
  let sequence = Number(store.nextSequence) || 1;
  let id = `workspace-user-${String(sequence).padStart(3, "0")}`;
  while (store.items.some((item) => item.id === id)) {
    sequence += 1;
    id = `workspace-user-${String(sequence).padStart(3, "0")}`;
  }
  store.nextSequence = sequence + 1;
  return id;
}

function generateRequestId(store) {
  let sequence = Number(store.nextRequestSequence) || 1;
  let id = `permission-request-${String(sequence).padStart(3, "0")}`;
  while (store.requests.some((item) => item.id === id)) {
    sequence += 1;
    id = `permission-request-${String(sequence).padStart(3, "0")}`;
  }
  store.nextRequestSequence = sequence + 1;
  return id;
}

function appendLog(entity, actor, action, message) {
  return [
    ...(Array.isArray(entity.logs) ? entity.logs : []),
    {
      timestamp: nowIso(),
      actor: text(actor) || "system",
      action,
      message,
    },
  ];
}

function findUser(store, idOrIdentifier) {
  const target = text(idOrIdentifier);
  return store.items.find((item) => item.id === target || item.identifier === target) || null;
}

function filterUsers(items, query = {}) {
  const keyword = text(query.keyword).toLowerCase();
  const role = text(query.role);
  const status = text(query.status);

  return items.filter((item) => {
    if (role && role !== "all" && item.role !== role) {
      return false;
    }
    if (status && status !== "all" && item.status !== status) {
      return false;
    }
    if (!keyword) {
      return true;
    }

    return [
      item.identifier,
      item.name,
      item.email,
      item.department,
      item.title,
    ]
      .map((value) => text(value).toLowerCase())
      .join(" ")
      .includes(keyword);
  });
}

function filterRequests(items, query = {}) {
  const status = text(query.status);
  const keyword = text(query.keyword).toLowerCase();

  return items.filter((item) => {
    if (status && status !== "all" && item.status !== status) {
      return false;
    }
    if (!keyword) {
      return true;
    }

    return [
      item.userName,
      item.permissionLabel,
      item.reason,
      item.type,
    ]
      .map((value) => text(value).toLowerCase())
      .join(" ")
      .includes(keyword);
  });
}

function toAuthUser(user) {
  return {
    id: user.id,
    identifier: user.identifier,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    permissions: clone(user.permissions),
    dataScope: clone(user.dataScope),
  };
}

export async function listWorkspaceUsers(query = {}, viewer = {}) {
  await delay();
  const forbidden = ensureBusinessViewer(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const items = filterUsers(store.items, query).map((item) => clone(item));
  return {
    items,
    total: items.length,
  };
}

export async function getWorkspaceUser(id, viewer = {}) {
  await delay();
  const forbidden = ensureBusinessViewer(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const user = findUser(store, id);
  if (!user) {
    return createError("USER_NOT_FOUND", "未找到该用户。");
  }
  const requests = store.requests.filter((item) => item.userId === user.id);
  return {
    user: clone(user),
    requests: clone(requests),
  };
}

export async function createWorkspaceUser(input, viewer = {}) {
  await delay();
  const forbidden = ensureDirector(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const payload = normalizeUserPayload(input);
  const validationError = validateUserPayload(payload, store);
  if (validationError) return validationError;

  const user = {
    ...payload,
    id: generateUserId(store),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    logs: appendLog({}, viewer.name, "create", "创建了用户账号。"),
  };

  store.items.unshift(user);
  saveStore(store);

  return {
    user: clone(user),
  };
}

export async function updateWorkspaceUser(id, input, viewer = {}) {
  await delay();
  const forbidden = ensureDirector(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const index = store.items.findIndex((item) => item.id === text(id));
  if (index === -1) {
    return createError("USER_NOT_FOUND", "未找到该用户。");
  }

  const current = store.items[index];
  const payload = normalizeUserPayload(input, current);
  const validationError = validateUserPayload(payload, store, current.id);
  if (validationError) return validationError;

  const updated = {
    ...current,
    ...payload,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
    logs: appendLog(current, viewer.name, "update", "更新了用户信息与权限。"),
  };

  store.items[index] = updated;
  saveStore(store);

  return {
    user: clone(updated),
  };
}

export async function listWorkspacePermissionRequests(query = {}, viewer = {}) {
  await delay();
  const forbidden = ensureBusinessViewer(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const items = filterRequests(store.requests, query).map((item) => clone(item));
  return {
    items,
    total: items.length,
  };
}

export async function createWorkspacePermissionRequest(input, viewer = {}) {
  await delay();
  const store = getStore();
  const applicant = findUser(store, viewer.id || viewer.identifier || viewer.role);
  if (!applicant) {
    return createError("USER_NOT_FOUND", "无法定位当前申请人。");
  }

  const permissionKey = text(input?.permissionKey);
  const reason = text(input?.reason);
  if (!permissionKey || !reason) {
    return createError("INVALID_REQUEST_INPUT", "权限项和申请原因为必填项。");
  }

  const request = {
    id: generateRequestId(store),
    userId: applicant.id,
    userName: applicant.name,
    applicantRole: applicant.role,
    type: text(input?.type) || permissionKey,
    permissionKey,
    permissionLabel: text(input?.permissionLabel) || permissionKey,
    reason,
    status: "pending",
    comment: "",
    createdAt: nowIso(),
    reviewedAt: "",
    reviewerName: "",
  };

  store.requests.unshift(request);
  saveStore(store);

  return {
    request: clone(request),
  };
}

export async function approveWorkspacePermissionRequest(id, input, viewer = {}) {
  await delay();
  const forbidden = ensureDirector(viewer);
  if (forbidden) return forbidden;

  const store = getStore();
  const index = store.requests.findIndex((item) => item.id === text(id));
  if (index === -1) {
    return createError("REQUEST_NOT_FOUND", "未找到该权限申请。");
  }

  const request = store.requests[index];
  const decision = text(input?.decision) || "approved";
  if (!["approved", "rejected"].includes(decision)) {
    return createError("INVALID_REQUEST_INPUT", "审批结果不合法。");
  }

  const reviewedRequest = {
    ...request,
    status: decision,
    comment: text(input?.comment),
    reviewedAt: nowIso(),
    reviewerName: text(viewer.name) || "部门总监",
  };

  store.requests[index] = reviewedRequest;

  if (decision === "approved") {
    const userIndex = store.items.findIndex((item) => item.id === request.userId);
    if (userIndex >= 0) {
      const currentUser = store.items[userIndex];
      const updatedUser = {
        ...currentUser,
        permissions: {
          ...currentUser.permissions,
          [request.permissionKey]: true,
        },
        updatedAt: nowIso(),
        logs: appendLog(currentUser, viewer.name, "approve", `审批通过：${request.permissionLabel}`),
      };
      store.items[userIndex] = updatedUser;
    }
  }

  saveStore(store);
  return {
    request: clone(reviewedRequest),
  };
}

export async function getAuthUserByIdentifier(identifier) {
  await delay();
  const store = getStore();
  const user = findUser(store, identifier);
  if (!user) {
    return createError("USER_NOT_FOUND", "账号不存在。");
  }
  if (user.status !== "active") {
    return createError("USER_DISABLED", "该账号已被停用。");
  }
  return {
    user: toAuthUser(user),
  };
}

export async function getAuthUserByToken(token) {
  await delay();
  const raw = text(token);
  if (!raw.startsWith(`${TOKEN_PREFIX}:`)) {
    return createError("INVALID_SESSION", "登录状态已失效，请重新登录");
  }

  const suffix = raw.slice(`${TOKEN_PREFIX}:`.length);
  return getAuthUserByIdentifier(suffix);
}

export function resetWorkspaceUsersStore() {
  cachedStore = createInitialStore();
  persistStore(cachedStore);
}

export const mockWorkspaceUsersService = {
  approveWorkspacePermissionRequest,
  createWorkspacePermissionRequest,
  createWorkspaceUser,
  getAuthUserByIdentifier,
  getAuthUserByToken,
  getWorkspaceUser,
  listWorkspacePermissionRequests,
  listWorkspaceUsers,
  resetWorkspaceUsersStore,
  updateWorkspaceUser,
};

export default mockWorkspaceUsersService;
