export const PRIVATE_SUPPLIER_MASK_NAME = "私有供应商（受限）";

const DEFAULT_NAMES_BY_ROLE = {
  employee: "内部员工",
  director: "部门总监",
  developer: "开发人员",
};

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? "").trim();
}

export function resolveSupplierViewerName(viewer = {}) {
  return text(viewer.name) || DEFAULT_NAMES_BY_ROLE[text(viewer.role)] || "";
}

export function canViewFullSupplier(supplier = {}, viewer = {}) {
  const role = text(viewer.role);
  const viewerName = resolveSupplierViewerName(viewer);

  if (role === "director") {
    return true;
  }

  if (!supplier.isPrivate) {
    return true;
  }

  return Boolean(viewerName) && viewerName === text(supplier.owner);
}

export function canEditSupplier(supplier = {}, viewer = {}) {
  const role = text(viewer.role);
  const viewerName = resolveSupplierViewerName(viewer);

  if (!role) {
    return true;
  }

  if (role === "director") {
    return true;
  }

  if (role !== "employee") {
    return false;
  }

  if (!supplier.isPrivate) {
    return true;
  }

  return Boolean(viewerName) && viewerName === text(supplier.owner);
}

export function applySupplierVisibility(supplier = {}, viewer = {}) {
  const visible = clone(supplier);
  const fullAccess = canViewFullSupplier(visible, viewer);

  if (fullAccess) {
    return {
      ...visible,
      isMasked: false,
    };
  }

  return {
    ...visible,
    name: PRIVATE_SUPPLIER_MASK_NAME,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    isMasked: true,
  };
}

export default {
  PRIVATE_SUPPLIER_MASK_NAME,
  applySupplierVisibility,
  canEditSupplier,
  canViewFullSupplier,
  resolveSupplierViewerName,
};
