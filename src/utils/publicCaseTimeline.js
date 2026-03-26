const QUARTER_INDEX = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
};

const PUBLISHED_STATUSES = new Set(["active", "published", "online"]);

function text(value) {
  return String(value ?? "").trim();
}

function normalizeQuarter(value) {
  const normalized = text(value).toUpperCase();
  return QUARTER_INDEX[normalized] ? normalized : "";
}

function parseOrderParts(order) {
  const normalized = Number(order);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  const year = Math.floor(normalized / 100);
  const quarterIndex = normalized % 100;
  if (!year || quarterIndex < 1 || quarterIndex > 4) {
    return null;
  }

  return {
    year: String(year),
    quarter: `Q${quarterIndex}`,
    order: normalized,
  };
}

export function derivePublicTimelineOrder(item = {}) {
  const explicit = parseOrderParts(item.timelineOrder);
  if (explicit) {
    return explicit.order;
  }

  const year = text(item.timelineYear);
  const quarter = normalizeQuarter(item.timelineQuarter);
  if (!year || !quarter) {
    return 0;
  }

  return Number(`${year}${String(QUARTER_INDEX[quarter]).padStart(2, "0")}`);
}

function buildTick(order) {
  const parts = parseOrderParts(order);
  if (!parts) {
    return null;
  }

  return {
    id: `${parts.year}-${parts.quarter}`,
    order,
    year: parts.year,
    quarter: parts.quarter,
    label: `${parts.year}.${parts.quarter}`,
  };
}

function buildTickRange(startOrder, endOrder) {
  const start = parseOrderParts(startOrder);
  const end = parseOrderParts(endOrder);
  if (!start || !end) {
    return [];
  }

  const ticks = [];
  let year = Number(start.year);
  let quarterIndex = QUARTER_INDEX[start.quarter];
  const endYear = Number(end.year);
  const endQuarterIndex = QUARTER_INDEX[end.quarter];

  while (year < endYear || (year === endYear && quarterIndex <= endQuarterIndex)) {
    ticks.push(buildTick(Number(`${year}${String(quarterIndex).padStart(2, "0")}`)));
    quarterIndex += 1;
    if (quarterIndex > 4) {
      quarterIndex = 1;
      year += 1;
    }
  }

  return ticks.filter(Boolean);
}

function normalizeSide(value) {
  return text(value) === "below" ? "below" : "";
}

function normalizeAccent(value) {
  return text(value) === "featured" ? "featured" : "normal";
}

function isPublishedProject(item) {
  const status = text(item.status).toLowerCase();
  return !status || PUBLISHED_STATUSES.has(status);
}

function sortCards(left, right) {
  const leftLinked = text(left.publicCaseId) ? 0 : 1;
  const rightLinked = text(right.publicCaseId) ? 0 : 1;
  if (leftLinked !== rightLinked) {
    return leftLinked - rightLinked;
  }

  const leftAccent = left.timelineAccent === "featured" ? 0 : 1;
  const rightAccent = right.timelineAccent === "featured" ? 0 : 1;
  if (leftAccent !== rightAccent) {
    return leftAccent - rightAccent;
  }

  return text(left.title).localeCompare(text(right.title), "zh-CN");
}

function resolveSides(items) {
  const usedAccent = new Set();
  const sideLoad = {
    above: 0,
    below: 0,
  };
  let lastAssignedSide = "";

  return items.map((item) => {
    let side = normalizeSide(item.timelineCardSide);

    if (!side) {
      side = lastAssignedSide === "above" ? "below" : "above";
    } else if (sideLoad[side] > 0) {
      side = side === "above" ? "below" : "above";
    }

    sideLoad[side] += 1;
    lastAssignedSide = side;

    let accent = normalizeAccent(item.timelineAccent);
    if (accent === "featured") {
      if (usedAccent.has(item.timelineOrder)) {
        accent = "normal";
      } else {
        usedAccent.add(item.timelineOrder);
      }
    }

    return {
      ...item,
      side,
      accent,
      disabled: !text(item.publicCaseId),
    };
  });
}

export function buildPublicCaseTimelineModel(projects = []) {
  const eligible = (Array.isArray(projects) ? projects : [])
    .filter(isPublishedProject)
    .map((item) => ({
      ...item,
      timelineYear: text(item.timelineYear),
      timelineQuarter: normalizeQuarter(item.timelineQuarter),
      timelineOrder: derivePublicTimelineOrder(item),
      timelineAccent: normalizeAccent(item.timelineAccent),
      title: text(item.title),
      summary: text(item.summary || item.short),
      category: text(item.category),
      industry: text(item.industry),
      publicCaseId: text(item.publicCaseId),
    }))
    .filter((item) => item.timelineOrder > 0)
    .sort((left, right) => left.timelineOrder - right.timelineOrder || sortCards(left, right));

  if (eligible.length === 0) {
    return {
      ticks: [],
      years: [],
      cards: [],
    };
  }

  const ticks = buildTickRange(eligible[0].timelineOrder, eligible[eligible.length - 1].timelineOrder);
  const yearMap = new Map();
  ticks.forEach((tick, index) => {
    if (!yearMap.has(tick.year)) {
      yearMap.set(tick.year, {
        year: tick.year,
        startIndex: index,
      });
    }
  });

  const groups = new Map();
  eligible.forEach((item) => {
    const key = String(item.timelineOrder);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  });

  const cards = [];
  ticks.forEach((tick) => {
    const group = (groups.get(String(tick.order)) ?? []).sort(sortCards);
    resolveSides(group).forEach((item) => {
      cards.push({
        ...item,
        tickOrder: tick.order,
      });
    });
  });

  return {
    ticks,
    years: Array.from(yearMap.values()),
    cards,
  };
}

export default {
  buildPublicCaseTimelineModel,
  derivePublicTimelineOrder,
};
