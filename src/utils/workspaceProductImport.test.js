import { describe, expect, it } from "vitest";
import { previewWorkspaceProductImport } from "./workspaceProductImport";

const rawText = `
name: Aurora Rack
category: device
status: active
needsUpdate: no
owner: Maya
updatedAt: 2026-03-24T08:00:00.000Z
tags: hardware, rack
retailPrice: 2999
internalCost: 1800
summary: Edge device rack for pilot deployments
publicProductId: product-a
hero: /aurora.jpg
progressSummary: Ready for launch
supplierSummary: Supplier confirmed
logs: 2026-03-20T08:00:00.000Z | seed | Imported from plan

name: Broken Record
status: active
`;

describe("workspaceProductImport", () => {
  it("creates a preview for valid records and warnings for invalid records", () => {
    const result = previewWorkspaceProductImport(rawText);

    expect(result.preview).toHaveLength(2);
    expect(result.preview[0].product.name).toBe("Aurora Rack");
    expect(result.preview[0].product.tags).toEqual(["hardware", "rack"]);
    expect(result.preview[1].product).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("accepts pipe-delimited import rows", () => {
    const result = previewWorkspaceProductImport(
      [
        "Aurora Stage Grid|aurora-stage-grid|space|draft|Mina Wu|4600|3100|immersive, launch|yes|Spatial product grid for stage and gallery deployments.",
        "Signal Relay Mini|signal-relay-mini|device|active|Harper Lin|1580|940|compact, retail|no|Compact smart device for light operational rollouts.",
      ].join("\n"),
    );

    expect(result.preview).toHaveLength(2);
    expect(result.preview[0].product.name).toBe("Aurora Stage Grid");
    expect(result.preview[0].product.tags).toEqual(["immersive", "launch"]);
    expect(result.preview[1].product.name).toBe("Signal Relay Mini");
  });
});
