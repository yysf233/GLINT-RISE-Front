const SESSION_STORAGE_KEY = "auth-session";
const KNOWN_ROLES = new Set(["employee", "director", "developer"]);

function isKnownRole(role) {
  return KNOWN_ROLES.has(role);
}

function isPersistableSession(session) {
  return (
    session != null &&
    typeof session === "object" &&
    typeof session.token === "string" &&
    session.token.length > 0 &&
    session.user != null &&
    typeof session.user === "object" &&
    isKnownRole(session.user.role)
  );
}

export function loadPersistedSession(storage = window.localStorage) {
  try {
    const rawSession = storage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession);

    if (!isPersistableSession(session)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function persistSession(session, storage = window.localStorage) {
  if (!isPersistableSession(session)) {
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearPersistedSession(storage = window.localStorage) {
  storage.removeItem(SESSION_STORAGE_KEY);
}
