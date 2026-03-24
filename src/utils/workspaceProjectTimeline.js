export function moveWorkspaceProjectTimelineItem(items, itemId, direction) {
  const list = Array.isArray(items) ? [...items] : [];
  const index = list.findIndex((item) => item?.id === itemId);

  if (index < 0) {
    return list;
  }

  const targetIndex = direction === "up" ? index - 1 : direction === "down" ? index + 1 : index;

  if (targetIndex < 0 || targetIndex >= list.length || targetIndex === index) {
    return list;
  }

  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

export default {
  moveWorkspaceProjectTimelineItem,
};
