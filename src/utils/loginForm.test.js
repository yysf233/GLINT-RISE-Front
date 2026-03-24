import { describe, expect, it } from "vitest";
import { getMockLoginProfile, loginProfiles, normalizeLoginPayload, validateLoginForm } from "./loginForm";

describe("loginForm helpers", () => {
  it("returns all approved mock login profiles", () => {
    expect(loginProfiles.map((profile) => profile.role)).toEqual(["employee", "director", "developer"]);
  });

  it("returns a prefilled credential pair for employee quick fill", () => {
    expect(getMockLoginProfile("employee")).toEqual({
      description: "进入员工工作台落点",
      identifier: "employee",
      label: "内部员工",
      password: "glintrise-123",
      role: "employee",
    });
  });

  it("returns undefined for unknown quick-fill roles", () => {
    expect(getMockLoginProfile("guest")).toBeUndefined();
  });

  it("requires identifier and password before submit", () => {
    expect(validateLoginForm({ identifier: "", password: "" })).toEqual({
      identifier: "请输入账号",
      password: "请输入密码",
    });
  });

  it("accepts a complete login payload", () => {
    expect(validateLoginForm({ identifier: "employee", password: "glintrise-123" })).toEqual({});
  });

  it("normalizes surrounding whitespace before submit", () => {
    expect(normalizeLoginPayload({ identifier: " employee ", password: " glintrise-123 " })).toEqual({
      identifier: "employee",
      password: "glintrise-123",
    });
  });
});
