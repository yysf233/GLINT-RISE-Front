const KNOWN_ROLES = new Set(["employee", "director", "developer"]);
const WORKSPACE_PRODUCT_ROUTE_PATTERN = /^\/workspace\/products(?:\/[^/]+)?(?:\/edit)?$/;
const WORKSPACE_PRODUCT_STATIC_ROUTES = new Set(["/workspace/products", "/workspace/products/new", "/workspace/products/import"]);

export function isKnownRole(role) {
  return KNOWN_ROLES.has(role);
}

export function getDefaultWorkspaceRoute(role) {
  if (!isKnownRole(role)) {
    return undefined;
  }

  if (role === "developer") {
    return "/workspace/content";
  }

  return "/workspace/dashboard";
}

export function canAccessWorkspaceRoute(role, pathname) {
  if (!isKnownRole(role)) {
    return false;
  }

  if (pathname === "/workspace/forbidden") {
    return true;
  }

  if (pathname === "/workspace/dashboard") {
    return role === "employee" || role === "director";
  }

  if (pathname === "/workspace/content") {
    return role === "developer";
  }

  if (WORKSPACE_PRODUCT_STATIC_ROUTES.has(pathname) || WORKSPACE_PRODUCT_ROUTE_PATTERN.test(pathname)) {
    return role === "employee" || role === "director";
  }

  return false;
}

export function resolvePostLoginRoute(role, fromPathname) {
  const defaultRoute = getDefaultWorkspaceRoute(role);

  if (!defaultRoute) {
    return undefined;
  }

  if (typeof fromPathname !== "string" || !canAccessWorkspaceRoute(role, fromPathname)) {
    return defaultRoute;
  }

  return fromPathname;
}
