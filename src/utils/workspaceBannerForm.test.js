import { describe, expect, it } from "vitest";
import {
  buildWorkspaceBannerPayload,
  createWorkspaceBannerFormDefaults,
  mapWorkspaceBannerToForm,
} from "./workspaceBannerForm";

describe("workspaceBannerForm helpers", () => {
  it("builds default banner form values", () => {
    expect(createWorkspaceBannerFormDefaults()).toEqual({
      title: "",
      status: "offline",
      target: "/products",
      hero: "",
      images: [],
    });
  });

  it("maps workspace banner values into editable form data", () => {
    expect(
      mapWorkspaceBannerToForm({
        id: "wb-001",
        title: "首页主视觉",
        status: "online",
        target: "/products",
        hero: "/banner-hero-01.jpg",
        images: ["/banner-hero-01.jpg", "/banner-hero-02.jpg"],
      }),
    ).toEqual({
      title: "首页主视觉",
      status: "online",
      target: "/products",
      hero: "/banner-hero-01.jpg",
      images: ["/banner-hero-01.jpg", "/banner-hero-02.jpg"],
    });
  });

  it("builds a normalized payload while preserving image order", () => {
    expect(
      buildWorkspaceBannerPayload({
        title: " 首页主视觉 ",
        status: "online",
        target: "#/cases",
        hero: " /banner-hero-02.jpg ",
        images: [" /banner-hero-02.jpg ", "", "/banner-hero-03.jpg"],
      }),
    ).toEqual({
      title: "首页主视觉",
      status: "online",
      target: "/cases",
      hero: "/banner-hero-02.jpg",
      images: ["/banner-hero-02.jpg", "/banner-hero-03.jpg"],
    });
  });

  it("falls back to hero as the first image when image list is empty", () => {
    expect(
      buildWorkspaceBannerPayload({
        title: "新品轮播",
        status: "offline",
        target: "/products",
        hero: "/hero.jpg",
        images: [],
      }),
    ).toEqual({
      title: "新品轮播",
      status: "offline",
      target: "/products",
      hero: "/hero.jpg",
      images: ["/hero.jpg"],
    });
  });
});
