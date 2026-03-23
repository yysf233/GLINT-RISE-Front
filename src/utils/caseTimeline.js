function parseTimelineOrder(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value ?? "").trim();
  if (!text) return 0;

  const quarterMatch = text.match(/^(\d{4})\.Q([1-4])$/i);
  if (quarterMatch) {
    return Number(`${quarterMatch[1]}0${quarterMatch[2]}`);
  }

  const yearMatch = text.match(/^(\d{4})$/);
  if (yearMatch) {
    return Number(`${yearMatch[1]}00`);
  }

  return 0;
}

export function getCaseTimelineLabel(item) {
  return item.timelineLabel || item.year;
}

export function getCaseTimelineOrder(item) {
  return parseTimelineOrder(item.timelineOrder ?? item.timelineLabel ?? item.year);
}

export function buildCaseTimelineSections(items) {
  const sortedItems = [...items].sort((left, right) => {
    const orderDiff = getCaseTimelineOrder(right) - getCaseTimelineOrder(left);
    if (orderDiff !== 0) return orderDiff;
    return left.title.localeCompare(right.title, "zh-CN");
  });

  const sections = [];

  sortedItems.forEach((item) => {
    const label = getCaseTimelineLabel(item);
    const lastSection = sections[sections.length - 1];

    if (!lastSection || lastSection.label !== label) {
      sections.push({
        id: label,
        label,
        items: [item],
      });
      return;
    }

    lastSection.items.push(item);
  });

  return sections;
}
