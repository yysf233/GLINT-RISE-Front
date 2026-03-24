import {
  getWorkspaceSiteSettings,
  resetWorkspaceSiteSettingsStore,
  updateWorkspaceSiteSettings,
} from "./mockWorkspaceSiteSettingsService";
import {
  listWorkspaceBanners,
  reorderWorkspaceBanners,
  resetWorkspaceBannersStore,
  updateWorkspaceBanner,
} from "./mockWorkspaceBannersService";
import {
  getWorkspaceProduct,
  listWorkspaceProducts,
  resetWorkspaceProductsStore,
  updateWorkspaceProduct,
} from "../mockWorkspaceProductsService";

function text(value) {
  return String(value ?? "").trim();
}

function splitDisplayTag(value) {
  return text(value)
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function isContentMaintainer(viewer = {}) {
  return text(viewer.role) === "developer" || viewer?.permissions?.contentMaintenance === true;
}

function ensureContentMaintainer(viewer = {}) {
  return isContentMaintainer(viewer)
    ? null
    : createError("WORKSPACE_CONTENT_FORBIDDEN", "当前账号无权访问内容管理台。");
}

function isPublishedProduct(item) {
  return new Set(["published", "active", "online"]).has(text(item?.status).toLowerCase());
}

function buildSummary(settings, banners = [], products = []) {
  const publicTags = new Set(
    products
      .flatMap((item) => splitDisplayTag(item.displayTag))
      .map((item) => text(item))
      .filter(Boolean),
  );

  return {
    brandName: text(settings?.brand?.name),
    onlineBannerCount: banners.filter((item) => item.status === "online").length,
    publishedProductCount: products.length,
    publicTagCount: publicTags.size,
  };
}

function sortProducts(items = []) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export async function getWorkspaceContentConsole(viewer = {}) {
  const forbidden = ensureContentMaintainer(viewer);
  if (forbidden) return forbidden;

  const [settingsResult, bannersResult, productsResult] = await Promise.all([
    getWorkspaceSiteSettings(viewer),
    listWorkspaceBanners(),
    listWorkspaceProducts({}),
  ]);

  if (settingsResult?.error) return settingsResult;
  if (bannersResult?.error) return bannersResult;
  if (productsResult?.error) return productsResult;

  const products = sortProducts((productsResult.items ?? []).filter((item) => isPublishedProduct(item) && text(item.publicProductId)));

  return {
    settings: settingsResult.settings,
    banners: bannersResult.items ?? [],
    products,
    summary: buildSummary(settingsResult.settings, bannersResult.items ?? [], products),
  };
}

export async function updateWorkspaceContentSettings(input = {}, viewer = {}) {
  const forbidden = ensureContentMaintainer(viewer);
  if (forbidden) return forbidden;

  return updateWorkspaceSiteSettings(input, viewer);
}

export async function reorderWorkspaceContentBanners(fromIndex, toIndex, viewer = {}) {
  const forbidden = ensureContentMaintainer(viewer);
  if (forbidden) return forbidden;

  return reorderWorkspaceBanners(fromIndex, toIndex);
}

export async function setWorkspaceContentBannerStatus(id, status, viewer = {}) {
  const forbidden = ensureContentMaintainer(viewer);
  if (forbidden) return forbidden;

  const bannersResult = await listWorkspaceBanners();
  if (bannersResult?.error) return bannersResult;

  const banner = (bannersResult.items ?? []).find((item) => text(item.id) === text(id));
  if (!banner) {
    return createError("BANNER_NOT_FOUND", "未找到对应轮播。");
  }

  return updateWorkspaceBanner(id, {
    ...banner,
    status: text(status),
  });
}

export async function updateWorkspaceContentProductDisplayTag(id, displayTag, viewer = {}) {
  const forbidden = ensureContentMaintainer(viewer);
  if (forbidden) return forbidden;

  const productResult = await getWorkspaceProduct(id);
  if (productResult?.error) return productResult;

  return updateWorkspaceProduct(
    id,
    {
      displayTag: text(displayTag),
    },
    viewer,
  );
}

export function resetWorkspaceContentStores() {
  resetWorkspaceSiteSettingsStore();
  resetWorkspaceBannersStore();
  resetWorkspaceProductsStore();
}

export const mockWorkspaceContentService = {
  getWorkspaceContentConsole,
  updateWorkspaceContentSettings,
  reorderWorkspaceContentBanners,
  setWorkspaceContentBannerStatus,
  updateWorkspaceContentProductDisplayTag,
  resetWorkspaceContentStores,
};

export default mockWorkspaceContentService;
