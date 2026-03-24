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

export default {
  replaceWorkspaceBannerTargetCover,
};
