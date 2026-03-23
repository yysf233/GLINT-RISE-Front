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

  it("returns dashboard for employee", () => {
    expect(getDefaultWorkspaceRoute("employee")).toBe("/workspace/dashboard");
  });

  it("returns dashboard for director", () => {
    expect(getDefaultWorkspaceRoute("director")).toBe("/workspace/dashboard");
  });

  it("returns content for developer", () => {
    expect(getDefaultWorkspaceRoute("developer")).toBe("/workspace/content");
  });

  it("allows employee dashboard access", () => {
    expect(canAccessWorkspaceRoute("employee", "/workspace/dashboard")).toBe(true);
  });

  it("rejects employee content access", () => {
    expect(canAccessWorkspaceRoute("employee", "/workspace/content")).toBe(false);
  });

  it("allows employee forbidden access", () => {
    expect(canAccessWorkspaceRoute("employee", "/workspace/forbidden")).toBe(true);
  });

  it("allows director dashboard access", () => {
    expect(canAccessWorkspaceRoute("director", "/workspace/dashboard")).toBe(true);
  });

  it("rejects director content access", () => {
    expect(canAccessWorkspaceRoute("director", "/workspace/content")).toBe(false);
  });

  it("allows director forbidden access", () => {
    expect(canAccessWorkspaceRoute("director", "/workspace/forbidden")).toBe(true);
  });

  it("rejects developer dashboard access", () => {
    expect(canAccessWorkspaceRoute("developer", "/workspace/dashboard")).toBe(false);
  });

  it("allows developer content access", () => {
    expect(canAccessWorkspaceRoute("developer", "/workspace/content")).toBe(true);
  });

  it("allows developer forbidden access", () => {
    expect(canAccessWorkspaceRoute("developer", "/workspace/forbidden")).toBe(true);
  });

  it("returns requested route when state.from is allowed for the role", () => {
    expect(resolvePostLoginRoute("employee", "/workspace/forbidden")).toBe("/workspace/forbidden");
    expect(resolvePostLoginRoute("developer", "/workspace/content")).toBe("/workspace/content");
  });

  it("falls back to default route when state.from is absent", () => {
    expect(resolvePostLoginRoute("employee")).toBe("/workspace/dashboard");
    expect(resolvePostLoginRoute("developer", null)).toBe("/workspace/content");
  });

  it("falls back to default route when state.from is not allowed for the role", () => {
    expect(resolvePostLoginRoute("employee", "/workspace/content")).toBe("/workspace/dashboard");
    expect(resolvePostLoginRoute("director", "/workspace/content")).toBe("/workspace/dashboard");
  });
});
