import { describe, expect, it } from "vitest";
import {
  buildWorkspaceSupplierPayload,
  createWorkspaceSupplierFormDefaults,
  mapWorkspaceSupplierToForm,
} from "./workspaceSupplierForm";

describe("workspaceSupplierForm helpers", () => {
  it("builds default form values using the session user", () => {
    expect(
      createWorkspaceSupplierFormDefaults({
        name: "内部员工",
      }),
    ).toEqual({
      name: "",
      rating: "B",
      status: "draft",
      isPrivate: false,
      owner: "内部员工",
      companyArea: "",
      leadTimeBand: "",
      priceBand: "",
      cooperationHistory: "",
      fitScore: "",
      patentCount: "",
      capacitySummary: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      tagsText: "",
      relatedProductIds: [],
      summary: "",
    });
  });

  it("maps supplier values into editable form data", () => {
    expect(
      mapWorkspaceSupplierToForm({
        id: "ws-public-001",
        name: "Mika Lighting",
        rating: "A",
        status: "active",
        isPrivate: true,
        owner: "内部员工",
        companyArea: 3200,
        leadTimeBand: "10-15天",
        priceBand: "中高",
        cooperationHistory: "Retail lighting",
        fitScore: 89,
        patentCount: 10,
        capacitySummary: "Lighting and wiring",
        contactName: "Mika",
        contactPhone: "13800000001",
        contactEmail: "mika@test",
        tags: ["lighting", "retail"],
        relatedProductIds: ["wp-smart-hub", "wp-lumina-arc"],
        summary: "Trusted partner",
      }),
    ).toEqual({
      name: "Mika Lighting",
      rating: "A",
      status: "active",
      isPrivate: true,
      owner: "内部员工",
      companyArea: "3200",
      leadTimeBand: "10-15天",
      priceBand: "中高",
      cooperationHistory: "Retail lighting",
      fitScore: "89",
      patentCount: "10",
      capacitySummary: "Lighting and wiring",
      contactName: "Mika",
      contactPhone: "13800000001",
      contactEmail: "mika@test",
      tagsText: "lighting, retail",
      relatedProductIds: ["wp-smart-hub", "wp-lumina-arc"],
      summary: "Trusted partner",
    });
  });

  it("builds a normalized supplier payload", () => {
    expect(
      buildWorkspaceSupplierPayload({
        name: " Atlas Supplier ",
        rating: "A",
        status: "active",
        isPrivate: true,
        owner: "内部员工",
        companyArea: "2400",
        leadTimeBand: "15-20天",
        priceBand: "高",
        cooperationHistory: "Retail launch",
        fitScore: "92",
        patentCount: "14",
        capacitySummary: "Precision metal",
        contactName: "Mina",
        contactPhone: "13800000009",
        contactEmail: "mina@test",
        tagsText: "lighting, retail, lighting",
        relatedProductIds: ["wp-smart-hub", "", "wp-interface-neo"],
        summary: " Primary supplier ",
      }),
    ).toEqual({
      name: "Atlas Supplier",
      rating: "A",
      status: "active",
      isPrivate: true,
      owner: "内部员工",
      companyArea: 2400,
      leadTimeBand: "15-20天",
      priceBand: "高",
      cooperationHistory: "Retail launch",
      fitScore: 92,
      patentCount: 14,
      capacitySummary: "Precision metal",
      contactName: "Mina",
      contactPhone: "13800000009",
      contactEmail: "mina@test",
      tags: ["lighting", "retail"],
      relatedProductIds: ["wp-smart-hub", "wp-interface-neo"],
      summary: "Primary supplier",
    });
  });
});
