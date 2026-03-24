function text(value) {
  return String(value ?? "").trim();
}

function normalizePermissions(value = {}) {
  return {
    contentMaintenance: Boolean(value.contentMaintenance),
    siteSettings: Boolean(value.siteSettings),
    supplierSensitive: Boolean(value.supplierSensitive),
    pricedExport: Boolean(value.pricedExport),
    userAdmin: Boolean(value.userAdmin),
    logAccess: Boolean(value.logAccess),
  };
}

function normalizeDataScope(value = {}) {
  return {
    products: text(value.products) || "self",
    suppliers: text(value.suppliers) || "self",
    quotes: text(value.quotes) || "self",
  };
}

export function createWorkspaceUserFormDefaults(sessionUser = {}) {
  return {
    identifier: "",
    name: "",
    email: "",
    role: "employee",
    status: "active",
    department: "",
    title: "",
    notes: "",
    permissions: normalizePermissions({
      siteSettings: sessionUser?.role === "director",
    }),
    dataScope: normalizeDataScope({
      products: "team",
      suppliers: "self",
      quotes: "self",
    }),
  };
}

export function mapWorkspaceUserToForm(user) {
  if (!user) {
    return createWorkspaceUserFormDefaults();
  }

  return {
    identifier: text(user.identifier),
    name: text(user.name),
    email: text(user.email),
    role: text(user.role) || "employee",
    status: text(user.status) || "active",
    department: text(user.department),
    title: text(user.title),
    notes: text(user.notes),
    permissions: normalizePermissions(user.permissions),
    dataScope: normalizeDataScope(user.dataScope),
  };
}

export function buildWorkspaceUserPayload(values = {}) {
  return {
    identifier: text(values.identifier),
    name: text(values.name),
    email: text(values.email),
    role: text(values.role),
    status: text(values.status),
    department: text(values.department),
    title: text(values.title),
    notes: text(values.notes),
    permissions: normalizePermissions(values.permissions),
    dataScope: normalizeDataScope(values.dataScope),
  };
}

