import { describe, expect, it, vi } from "vitest";
import { showAppMessage } from "./safeAppMessage";

describe("showAppMessage", () => {
  it("uses typed message methods when available", () => {
    const success = vi.fn();

    showAppMessage({ message: { success } }, "success", "已保存");

    expect(success).toHaveBeenCalledWith("已保存");
  });

  it("falls back to message.open when typed method is unavailable", () => {
    const open = vi.fn();

    showAppMessage({ message: { open } }, "error", "失败");

    expect(open).toHaveBeenCalledWith({
      type: "error",
      content: "失败",
    });
  });

  it("does nothing when the app context has no usable message api", () => {
    expect(() => showAppMessage({}, "success", "忽略")).not.toThrow();
  });
});
