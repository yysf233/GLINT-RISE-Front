const KNOWN_ROLES = new Set(["employee", "director", "developer"]);

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

  return false;
}
