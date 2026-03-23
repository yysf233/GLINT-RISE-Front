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

export function AuthProvider({ children }) {
  const { showNotice } = useNotice();
  const [authState, setAuthState] = useState(() => createBootstrappingState());

  useEffect(() => {
    let isActive = true;

    const bootstrapAuth = async () => {
      const hadPersistedSession = hasPersistedSessionEntry();
      const persistedSession = loadPersistedSession();

      if (!persistedSession) {
        if (hadPersistedSession) {
          clearPersistedSession();
          showNotice(INVALID_SESSION_NOTICE);
        }

        if (isActive) {
          setAuthState(createUnauthenticatedState());
        }

        return;
      }

      try {
        const result = await authApi.getSession({ token: persistedSession.token });

        if (!isActive) {
          return;
        }

        if (result?.session) {
          persistSession(result.session);
          setAuthState(createAuthenticatedState(result.session));
          return;
        }
      } catch {
        if (!isActive) {
          return;
        }
      }

      clearPersistedSession();
      showNotice(INVALID_SESSION_NOTICE);
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
