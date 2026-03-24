import { describe, expect, it } from "vitest";
import {
  buildWorkspaceExportPayload,
  buildWorkspaceExportPreview,
  createWorkspaceExportFormDefaults,
} from "./workspaceExportForm";

describe("workspaceExportForm helpers", () => {
  it("builds default export form values", () => {
    expect(createWorkspaceExportFormDefaults()).toEqual({
      title: "",
      version: "public",
      format: "pdf",
      productIds: [],
      supplierIds: [],
      includeContacts: false,
      riskAcknowledged: false,
      notes: "",
    });
  });

  it("builds a normalized export payload", () => {
    expect(
      buildWorkspaceExportPayload({
        title: " Retail Deck ",
        version: "priced",
        format: "xlsx",
        productIds: ["wp-smart-hub", "", "wp-smart-hub"],
        supplierIds: ["ws-public-001", "ws-private-foreign", "ws-public-001"],
        includeContacts: true,
        riskAcknowledged: true,
        notes: " Director use only ",
      }),
    ).toEqual({
      title: "Retail Deck",
      version: "priced",
      format: "xlsx",
      productIds: ["wp-smart-hub"],
      supplierIds: ["ws-public-001", "ws-private-foreign"],
      includeContacts: true,
      riskAcknowledged: true,
      notes: "Director use only",
    });
  });

  it("builds a preview that blocks unauthorized priced exports", () => {
    expect(
      buildWorkspaceExportPreview(
        {
          title: "Priced Sheet",
          version: "priced",
          format: "pdf",
          productIds: ["wp-smart-hub"],
          supplierIds: ["ws-private-foreign"],
          includeContacts: true,
          riskAcknowledged: false,
        },
        {
          role: "employee",
          name: "内部员工",
        },
      ),
    ).toEqual({
      productCount: 1,
      supplierCount: 1,
      containsSensitiveData: true,
      canSubmit: false,
      warnings: [
        "当前账号无权导出带报价版资料。",
        "带报价版导出前必须确认风险提示。",
      ],
    });
  });
});
