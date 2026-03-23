import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authApi from "../services/authApi";
import { clearPersistedSession, loadPersistedSession, persistSession } from "../utils/sessionStorage";
import { useNotice } from "./useNotice";

const INVALID_SESSION_NOTICE = "登录状态已失效，请重新登录";

export const AuthContext = createContext(undefined);

function createBootstrappingState() {
  return {
    status: "bootstrapping",
    session: null,
  };
}

function createUnauthenticatedState() {
  return {
    status: "unauthenticated",
    session: null,
  };
}

function createAuthenticatedState(session) {
  return {
    status: "authenticated",
    session,
  };
}

function hasPersistedSessionEntry(storage = window.localStorage) {
  return storage.getItem("auth-session") !== null;
}

export function resolveBootstrapAuthPlan({
  hasPersistedSessionEntry,
  persistedSession,
  sessionResult,
}) {
  if (!persistedSession) {
    return {
      shouldClearStorage: hasPersistedSessionEntry,
      shouldShowInvalidNotice: hasPersistedSessionEntry,
      shouldPersistSession: false,
      status: "unauthenticated",
      session: null,
    };
  }

  if (sessionResult?.session) {
    return {
      shouldClearStorage: false,
      shouldShowInvalidNotice: false,
      shouldPersistSession: true,
      status: "authenticated",
      session: sessionResult.session,
    };
  }

  return {
    shouldClearStorage: true,
    shouldShowInvalidNotice: true,
    shouldPersistSession: false,
    status: "unauthenticated",
    session: null,
  };
}

export function AuthProvider({ children }) {
  const { showNotice } = useNotice();
  const [authState, setAuthState] = useState(() => createBootstrappingState());

  useEffect(() => {
    let isActive = true;

    const bootstrapAuth = async () => {
      const hadPersistedSession = hasPersistedSessionEntry();
      const persistedSession = loadPersistedSession();
      let sessionResult = null;

      if (persistedSession) {
        try {
          sessionResult = await authApi.getSession({ token: persistedSession.token });
        } catch {
          if (!isActive) {
            return;
          }
        }
      }

      const plan = resolveBootstrapAuthPlan({
        hasPersistedSessionEntry: hadPersistedSession,
        persistedSession,
        sessionResult,
      });

      if (!isActive) {
        return;
      }

      if (plan.shouldClearStorage) {
        clearPersistedSession();
      }

      if (plan.shouldShowInvalidNotice) {
        showNotice(INVALID_SESSION_NOTICE);
      }

      if (plan.shouldPersistSession) {
        persistSession(plan.session);
        setAuthState(createAuthenticatedState(plan.session));
        return;
      }

      setAuthState(createUnauthenticatedState());
    };

    bootstrapAuth();

    return () => {
      isActive = false;
    };
  }, [showNotice]);

  const login = useCallback(async (identifier, password) => {
    const result = await authApi.login(identifier, password);

    if (!result?.session) {
      return result;
    }

    persistSession(result.session);
    setAuthState(createAuthenticatedState(result.session));
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearPersistedSession();
      setAuthState(createUnauthenticatedState());
    }
  }, []);

  const value = useMemo(
    () => ({
      status: authState.status,
      session: authState.session,
      user: authState.session?.user ?? null,
      isAuthenticated: authState.status === "authenticated",
      isBootstrapping: authState.status === "bootstrapping",
      login,
      logout,
    }),
    [authState, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
