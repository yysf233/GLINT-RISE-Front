import { describe, expect, it } from "vitest";
import { resolveBootstrapAuthPlan } from "./AuthContext";

describe("AuthContext bootstrap helpers", () => {
  it("treats corrupted persisted data as recovery when storage entry exists", () => {
    expect(
      resolveBootstrapAuthPlan({
        hasPersistedSessionEntry: true,
        persistedSession: null,
      }),
    ).toEqual({
      shouldClearStorage: true,
      shouldShowInvalidNotice: true,
      shouldPersistSession: false,
      status: "unauthenticated",
      session: null,
    });
  });

  it("treats missing storage as plain unauthenticated state", () => {
    expect(
      resolveBootstrapAuthPlan({
        hasPersistedSessionEntry: false,
        persistedSession: null,
      }),
    ).toEqual({
      shouldClearStorage: false,
      shouldShowInvalidNotice: false,
      shouldPersistSession: false,
      status: "unauthenticated",
      session: null,
    });
  });

  it("restores authenticated state when getSession returns a valid session", () => {
    const session = {
      token: "mock-session-token:employee",
      user: {
        id: "user-employee",
        role: "employee",
      },
    };

    expect(
      resolveBootstrapAuthPlan({
        hasPersistedSessionEntry: true,
        persistedSession: session,
        sessionResult: { session },
      }),
    ).toEqual({
      shouldClearStorage: false,
      shouldShowInvalidNotice: false,
      shouldPersistSession: true,
      status: "authenticated",
      session,
    });
  });

  it("treats invalid getSession responses as recovery", () => {
    const persistedSession = {
      token: "bad-token",
      user: {
        id: "user-employee",
        role: "employee",
      },
    };

    expect(
      resolveBootstrapAuthPlan({
        hasPersistedSessionEntry: true,
        persistedSession,
        sessionResult: {
          error: {
            code: "INVALID_SESSION",
          },
        },
      }),
    ).toEqual({
      shouldClearStorage: true,
      shouldShowInvalidNotice: true,
      shouldPersistSession: false,
      status: "unauthenticated",
      session: null,
    });
  });
});
