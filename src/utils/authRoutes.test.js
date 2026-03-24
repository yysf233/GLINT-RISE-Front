import { describe, expect, it } from "vitest";
import {
  canAccessWorkspaceRoute,
  getDefaultWorkspaceRoute,
  isKnownRole,
  resolvePostLoginRoute,
} from "./authRoutes";

describe("authRoutes", () => {
  it("recognizes known roles", () => {
    expect(isKnownRole("employee")).toBe(true);
    expect(isKnownRole("director")).toBe(true);
    expect(isKnownRole("developer")).toBe(true);
  });

  it("rejects unknown roles", () => {
    expect(isKnownRole("intern")).toBe(false);
    expect(canAccessWorkspaceRoute("intern", "/workspace/dashboard")).toBe(false);
    expect(getDefaultWorkspaceRoute("intern")).toBeUndefined();
  });

  it("returns dashboard for employee and director", () => {
    expect(getDefaultWorkspaceRoute("employee")).toBe("/workspace/dashboard");
    expect(getDefaultWorkspaceRoute("director")).toBe("/workspace/dashboard");
  });

  it("returns content for developer", () => {
    expect(getDefaultWorkspaceRoute("developer")).toBe("/workspace/content");
  });

  it("allows employee business routes", () => {
    expect(canAccessWorkspaceRoute("employee", "/workspace/dashboard")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/products")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/projects/wp-case-001/edit")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/suppliers/ws-public-001")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/quotes")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/exports")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/content")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/logs")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/users")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/users/new")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/users/user-employee")).toBe(true);
    expect(canAccessWorkspaceRoute("employee", "/workspace/settings/users/user-employee/edit")).toBe(true);
  });

  it("allows director business routes", () => {
    expect(canAccessWorkspaceRoute("director", "/workspace/dashboard")).toBe(true);
    expect(canAccessWorkspaceRoute("director", "/workspace/content/banners")).toBe(true);
    expect(canAccessWorkspaceRoute("director", "/workspace/suppliers/import")).toBe(true);
    expect(canAccessWorkspaceRoute("director", "/workspace/settings/logs")).toBe(true);
    expect(canAccessWorkspaceRoute("director", "/workspace/settings/users")).toBe(true);
    expect(canAccessWorkspaceRoute("director", "/workspace/settings/users/user-director")).toBe(true);
  });

  it("keeps developer on content routes only", () => {
    expect(canAccessWorkspaceRoute("developer", "/workspace/dashboard")).toBe(false);
    expect(canAccessWorkspaceRoute("developer", "/workspace/content")).toBe(true);
    expect(canAccessWorkspaceRoute("developer", "/workspace/forbidden")).toBe(true);
    expect(canAccessWorkspaceRoute("developer", "/workspace/products")).toBe(false);
    expect(canAccessWorkspaceRoute("developer", "/workspace/settings/content")).toBe(false);
    expect(canAccessWorkspaceRoute("developer", "/workspace/settings/logs")).toBe(false);
    expect(canAccessWorkspaceRoute("developer", "/workspace/settings/users")).toBe(false);
    expect(canAccessWorkspaceRoute("developer", "/workspace/settings/users/user-developer")).toBe(false);
  });

  it("returns requested route when state.from is allowed for the role", () => {
    expect(resolvePostLoginRoute("employee", "/workspace/settings/users")).toBe("/workspace/settings/users");
    expect(resolvePostLoginRoute("developer", "/workspace/content")).toBe("/workspace/content");
    expect(resolvePostLoginRoute("director", "/workspace/products")).toBe("/workspace/products");
  });

  it("falls back to default route when state.from is absent or denied", () => {
    expect(resolvePostLoginRoute("employee")).toBe("/workspace/dashboard");
    expect(resolvePostLoginRoute("developer", null)).toBe("/workspace/content");
    expect(resolvePostLoginRoute("employee", "/workspace/content")).toBe("/workspace/dashboard");
    expect(resolvePostLoginRoute("director", "/workspace/content")).toBe("/workspace/dashboard");
  });
});
