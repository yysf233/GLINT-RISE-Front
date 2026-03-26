function text(value) {
  return String(value ?? "").trim();
}

function numberOrBlank(value) {
  const normalized = text(value);
  if (!normalized) {
    return "";
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : "";
}

function normalizeTimeline(timeline) {
  return Array.isArray(timeline)
    ? timeline
        .map((item, index) => ({
          id: text(item.id) || `timeline-${index + 1}`,
          label: text(item.label),
          order: Number(item.order ?? index + 1),
          description: text(item.description),
        }))
        .filter((item) => item.label)
    : [];
}

function normalizeRelatedProducts(items) {
  return Array.isArray(items)
    ? items.map((item) => ({
        id: text(item.id),
        publicProductId: text(item.publicProductId),
      }))
    : [];
}

function normalizeTimelineCardSide(value) {
  return text(value) === "below" ? "below" : "above";
}

function normalizeTimelineAccent(value) {
  return text(value) === "featured" ? "featured" : "normal";
}

export function createWorkspaceProjectFormDefaults(sessionUser = {}) {
  return {
    id: "",
    title: "",
    status: "draft",
    owner: text(sessionUser.name),
    industry: "",
    year: "",
    category: "Case Study",
    publicCaseId: "",
    timelineYear: "",
    timelineQuarter: "",
    timelineOrder: "",
    timelineCardSide: "above",
    timelineAccent: "normal",
    summary: "",
    short: "",
    hero: "",
    timeline: [],
    relatedProducts: [],
  };
}

export function mapWorkspaceProjectToForm(project, sessionUser) {
  if (!project) {
    return createWorkspaceProjectFormDefaults(sessionUser);
  }

  return {
    id: text(project.id),
    title: text(project.title),
    status: text(project.status) || "draft",
    owner: text(project.owner) || text(sessionUser?.name),
    industry: text(project.industry),
    year: text(project.year),
    category: text(project.category) || "Case Study",
    publicCaseId: text(project.publicCaseId),
    timelineYear: text(project.timelineYear),
    timelineQuarter: text(project.timelineQuarter),
    timelineOrder: text(project.timelineOrder),
    timelineCardSide: normalizeTimelineCardSide(project.timelineCardSide),
    timelineAccent: normalizeTimelineAccent(project.timelineAccent),
    summary: text(project.summary),
    short: text(project.short),
    hero: text(project.hero),
    timeline: normalizeTimeline(project.timeline),
    relatedProducts: normalizeRelatedProducts(project.relatedProducts),
  };
}

export function buildWorkspaceProjectPayload(values = {}) {
  return {
    id: text(values.id),
    title: text(values.title),
    status: text(values.status),
    owner: text(values.owner),
    industry: text(values.industry),
    year: text(values.year),
    category: text(values.category),
    publicCaseId: text(values.publicCaseId),
    timelineYear: text(values.timelineYear),
    timelineQuarter: text(values.timelineQuarter),
    timelineOrder: numberOrBlank(values.timelineOrder),
    timelineCardSide: normalizeTimelineCardSide(values.timelineCardSide),
    timelineAccent: normalizeTimelineAccent(values.timelineAccent),
    summary: text(values.summary),
    short: text(values.short),
    hero: text(values.hero),
    timeline: normalizeTimeline(values.timeline),
    relatedProducts: normalizeRelatedProducts(values.relatedProducts),
  };
}
