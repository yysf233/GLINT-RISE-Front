function normalizeRoute(route) {
  return route.startsWith("/") ? route : `/${route}`;
}

export function getProductDetailRoute(id) {
  return `/product/${id}`;
}

export function getCaseDetailRoute(id) {
  return `/case/${id}`;
}

export function getProductShareRoute(id) {
  return `/share/product/${id}`;
}

export function getCaseShareRoute(id) {
  return `/share/case/${id}`;
}

export function getAbsoluteHashUrl(route, location = window.location) {
  return `${location.origin}${location.pathname}#${normalizeRoute(route)}`;
}
