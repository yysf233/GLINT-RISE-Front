import { validateWorkspaceBannerTarget } from "./workspaceBannerTargets";

function text(value) {
  return String(value ?? "").trim();
}

function normalizeImages(images) {
  return Array.isArray(images) ? images.map((item) => text(item)).filter(Boolean) : [];
}

export function createWorkspaceBannerFormDefaults() {
  return {
    title: "",
    status: "offline",
    target: "/products",
    hero: "",
    images: [],
  };
}

export function mapWorkspaceBannerToForm(banner = {}) {
  return {
    title: text(banner.title),
    status: text(banner.status) || "offline",
    target: text(banner.target) || "/products",
    hero: text(banner.hero),
    images: normalizeImages(banner.images),
  };
}

export function buildWorkspaceBannerPayload(values = {}) {
  const targetValidation = validateWorkspaceBannerTarget(values.target);
  const hero = text(values.hero);
  const images = normalizeImages(values.images);

  return {
    title: text(values.title),
    status: text(values.status) || "offline",
    target: targetValidation.valid ? targetValidation.normalized : text(values.target),
    hero,
    images: images.length > 0 ? images : hero ? [hero] : [],
  };
}

export default {
  buildWorkspaceBannerPayload,
  createWorkspaceBannerFormDefaults,
  mapWorkspaceBannerToForm,
};
