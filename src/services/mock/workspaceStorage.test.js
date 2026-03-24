import { beforeEach, describe, expect, it, vi } from "vitest";

const createLocalStorage = () => {
  const storage = new Map();

  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(String(key), String(value));
    },
    removeItem(key) {
      storage.delete(String(key));
    },
    clear() {
      storage.clear();
    },
  };
};

describe("workspaceStorage", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
    vi.resetModules();
  });

  it("falls back to the seed when the stored module payload is corrupted", async () => {
    const { createWorkspaceStorage } = await import("./workspaceStorage");

    const key = "glint-rise.workspace.products.v1";
    globalThis.localStorage.setItem(key, "{not-valid-json");

    const storage = createWorkspaceStorage({
      key,
      seed: {
        version: 1,
        items: [{ id: "seed-product", status: "published" }],
      },
    });

    expect(storage.read()).toEqual({
      version: 1,
      items: [{ id: "seed-product", status: "published" }],
    });
  });

  it("falls back to the seed when the stored module payload is missing items", async () => {
    const { createWorkspaceStorage } = await import("./workspaceStorage");

    const key = "glint-rise.workspace.products.v1";
    globalThis.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
      }),
    );

    const storage = createWorkspaceStorage({
      key,
      seed: {
        version: 1,
        items: [{ id: "seed-product", status: "published" }],
      },
    });

    expect(storage.read()).toEqual({
      version: 1,
      items: [{ id: "seed-product", status: "published" }],
    });
  });

  it("keeps products, projects, and banners in separate storage keys", async () => {
    const { createWorkspaceStorage } = await import("./workspaceStorage");

    const products = createWorkspaceStorage({
      key: "glint-rise.workspace.products.v1",
      seed: { version: 1, items: [{ id: "seed-product" }] },
    });
    const projects = createWorkspaceStorage({
      key: "glint-rise.workspace.projects.v1",
      seed: { version: 1, items: [{ id: "seed-project" }] },
    });
    const banners = createWorkspaceStorage({
      key: "glint-rise.workspace.banners.v1",
      seed: { version: 1, items: [{ id: "seed-banner" }] },
    });

    products.write({
      version: 1,
      items: [{ id: "saved-product" }],
    });

    expect(products.read()).toEqual({
      version: 1,
      items: [{ id: "saved-product" }],
    });
    expect(projects.read()).toEqual({
      version: 1,
      items: [{ id: "seed-project" }],
    });
    expect(banners.read()).toEqual({
      version: 1,
      items: [{ id: "seed-banner" }],
    });
  });
});
