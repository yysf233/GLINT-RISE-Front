export function reorderWorkspaceProjectTimeline(nodes, fromIndex, toIndex) {
  const list = Array.isArray(nodes) ? [...nodes] : [];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }

  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  return list;
}

export default {
  reorderWorkspaceProjectTimeline,
};
