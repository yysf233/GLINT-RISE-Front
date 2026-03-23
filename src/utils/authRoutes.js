const KNOWN_ROLES = new Set(["employee", "director", "developer"]);

export function isKnownRole(role) {
  return KNOWN_ROLES.has(role);
}

export function getDefaultWorkspaceRoute(role) {
  if (role === "developer") {
    return "/workspace/content";
  }

  if (isKnownRole(role)) {
    return "/workspace/dashboard";
  }

  return "/workspace/forbidden";
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

  return false;
}
