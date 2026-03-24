export function replaceWorkspaceBannerTargetCover(targets, nextCover) {
  const list = Array.isArray(targets) ? [...targets] : [];
  const replacement = nextCover ? { ...nextCover, isCover: true } : null;

  const next = list.map((target) => ({
    ...target,
    isCover: false,
  }));

  if (!replacement) {
    return next;
  }

  const existingIndex = next.findIndex((target) => target?.id === replacement.id);

  if (existingIndex >= 0) {
    const existing = next[existingIndex] ?? {};
    next.splice(existingIndex, 1, {
      ...existing,
      ...replacement,
      isCover: true,
    });
    return next;
  }

  next.push(replacement);
  return next;
}

export function validateWorkspaceBannerTarget(target) {
  const value = String(target ?? "").trim();
  if (!value) {
    return { valid: false, message: "目标不能为空" };
  }

  if (value.startsWith("/")) {
    return { valid: true, normalized: value };
  }

  if (value.startsWith("#/")) {
    return { valid: true, normalized: value.slice(1) };
  }

  return { valid: false, message: "仅支持站内路由" };
}

export default {
  replaceWorkspaceBannerTargetCover,
  validateWorkspaceBannerTarget,
};
