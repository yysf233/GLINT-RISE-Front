import { describe, expect, it } from "vitest";
import {
  clearPersistedSession,
  loadPersistedSession,
  persistSession,
} from "./sessionStorage";

function createStorageStub() {
  const entries = new Map();

  return {
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      entries.set(key, String(value));
    },
    removeItem(key) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
}

describe("sessionStorage", () => {
  it("saves a valid session payload", () => {
    const storage = createStorageStub();
    const session = {
      token: "token-123",
      user: { role: "employee" },
    };

    persistSession(session, storage);

    expect(storage.getItem("auth-session")).toBe(JSON.stringify(session));
  });

  it("restores a valid session payload", () => {
    const storage = createStorageStub();
    const session = {
      token: "token-123",
      user: { role: "director" },
    };

    storage.setItem("auth-session", JSON.stringify(session));

    expect(loadPersistedSession(storage)).toEqual(session);
  });

  it("returns null for missing token", () => {
    const storage = createStorageStub();

    storage.setItem(
      "auth-session",
      JSON.stringify({
        user: { role: "employee" },
      }),
    );

    expect(loadPersistedSession(storage)).toBeNull();
  });

  it("returns null for missing user.role", () => {
    const storage = createStorageStub();

    storage.setItem(
      "auth-session",
      JSON.stringify({
        token: "token-123",
        user: {},
      }),
    );

    expect(loadPersistedSession(storage)).toBeNull();
  });

  it("returns null for unknown role", () => {
    const storage = createStorageStub();

    storage.setItem(
      "auth-session",
      JSON.stringify({
        token: "token-123",
        user: { role: "intern" },
      }),
    );

    expect(loadPersistedSession(storage)).toBeNull();
  });

  it("clears the persisted session", () => {
    const storage = createStorageStub();

    storage.setItem(
      "auth-session",
      JSON.stringify({
        token: "token-123",
        user: { role: "developer" },
      }),
    );

    clearPersistedSession(storage);

    expect(storage.getItem("auth-session")).toBeNull();
  });
});
