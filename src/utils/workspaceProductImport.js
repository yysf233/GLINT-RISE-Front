const REQUIRED_FIELDS = ["name", "category", "status", "owner"];
const ALLOWED_CATEGORIES = new Set(["flagship", "device", "space", "hot"]);
const ALLOWED_STATUSES = new Set(["active", "draft", "archived"]);

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function toLines(rawText) {
  return String(rawText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");
}

function splitRecords(rawText) {
  const records = [];
  let current = [];

  for (const line of toLines(rawText)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---") {
      if (current.length > 0) {
        records.push(current);
        current = [];
      }
      continue;
    }

    if (!trimmed.includes(":") && trimmed.includes("|")) {
      if (current.length > 0) {
        records.push(current);
        current = [];
      }

      records.push([line]);
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    records.push(current);
  }

  return records;
}

function parseScalar(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  if (/^(true|yes)$/i.test(trimmed)) return true;
  if (/^(false|no)$/i.test(trimmed)) return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  return trimmed;
}

function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLogs(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [timestamp, action, message, actor] = entry.split("|").map((part) => part.trim());
      return {
        timestamp: timestamp || new Date().toISOString(),
        action: action || "import",
        message: message || "",
        actor: actor || "import",
      };
    });
}

function parsePipeDelimitedRecord(line) {
  const parts = String(line ?? "")
    .split("|")
    .map((item) => item.trim());

  if (parts.length < 10) {
    return null;
  }

  const [
    name,
    id,
    category,
    status,
    owner,
    retailPrice,
    internalCost,
    tags,
    needsUpdate,
    summary,
  ] = parts;

  return {
    product: {
      id,
      name,
      category,
      status,
      needsUpdate: parseScalar(needsUpdate) === true,
      owner,
      updatedAt: new Date().toISOString(),
      tags: parseTags(tags),
      retailPrice: Number(retailPrice),
      internalCost: Number(internalCost),
      summary,
      publicProductId: "",
      hero: "",
      progressSummary: "",
      supplierSummary: "",
      logs: [],
    },
    warnings: [],
  };
}

function parseRecordBlock(lines) {
  if (lines.length === 1 && !lines[0].includes(":") && lines[0].includes("|")) {
    return parsePipeDelimitedRecord(lines[0]) ?? {
      warnings: [`Unsupported pipe-delimited record: ${lines[0].trim()}`],
    };
  }

  const fields = {};
  const warnings = [];

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      warnings.push(`Ignored line without key/value separator: ${line.trim()}`);
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!key) {
      warnings.push(`Ignored empty import key in line: ${line.trim()}`);
      continue;
    }

    fields[key] = value;
  }

  const missingFields = REQUIRED_FIELDS.filter((field) => !String(fields[field] ?? "").trim());
  if (missingFields.length > 0) {
    return {
      warnings: [`Missing required fields: ${missingFields.join(", ")}`],
    };
  }

  if (!ALLOWED_CATEGORIES.has(String(fields.category).trim())) {
    return {
      warnings: [`Unsupported category: ${fields.category}`],
    };
  }

  if (!ALLOWED_STATUSES.has(String(fields.status).trim())) {
    return {
      warnings: [`Unsupported status: ${fields.status}`],
    };
  }

  const normalized = {
    id: String(fields.id ?? "").trim(),
    name: String(fields.name).trim(),
    category: String(fields.category).trim(),
    status: String(fields.status).trim(),
    needsUpdate: parseScalar(fields.needsUpdate) === true,
    owner: String(fields.owner).trim(),
    updatedAt: String(fields.updatedAt ?? "").trim() || new Date().toISOString(),
    tags: parseTags(fields.tags),
    retailPrice: Number(fields.retailPrice),
    internalCost: Number(fields.internalCost),
    summary: String(fields.summary ?? "").trim(),
    publicProductId: String(fields.publicProductId ?? "").trim(),
    hero: String(fields.hero ?? "").trim(),
    media: parseTags(fields.media).map((url, index) => ({
      id: `media-${index + 1}`,
      url,
    })),
    coverId: String(fields.coverId ?? "").trim(),
    progressSummary: String(fields.progressSummary ?? "").trim(),
    supplierSummary: String(fields.supplierSummary ?? "").trim(),
    logs: parseLogs(fields.logs),
  };

  if (!Number.isFinite(normalized.retailPrice)) {
    normalized.retailPrice = 0;
  }

  if (!Number.isFinite(normalized.internalCost)) {
    normalized.internalCost = 0;
  }

  return {
    product: normalized,
    warnings,
  };
}

function parseJsonInput(rawText) {
  const parsed = JSON.parse(String(rawText ?? ""));
  const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.products) ? parsed.products : Array.isArray(parsed?.items) ? parsed.items : null;

  if (!items) {
    return null;
  }

  return items.map((item) => {
    const normalized = {
      id: String(item.id ?? "").trim(),
      name: String(item.name ?? "").trim(),
      category: String(item.category ?? "").trim(),
      status: String(item.status ?? "").trim(),
      needsUpdate: Boolean(item.needsUpdate),
      owner: String(item.owner ?? "").trim(),
      updatedAt: String(item.updatedAt ?? "").trim() || new Date().toISOString(),
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).trim()).filter(Boolean) : parseTags(item.tags),
      retailPrice: Number(item.retailPrice),
      internalCost: Number(item.internalCost),
      summary: String(item.summary ?? "").trim(),
      publicProductId: String(item.publicProductId ?? "").trim(),
      hero: String(item.hero ?? "").trim(),
      media: Array.isArray(item.media) ? clone(item.media) : [],
      coverId: String(item.coverId ?? "").trim(),
      progressSummary: String(item.progressSummary ?? "").trim(),
      supplierSummary: String(item.supplierSummary ?? "").trim(),
      logs: Array.isArray(item.logs) ? clone(item.logs) : [],
    };

    if (!Number.isFinite(normalized.retailPrice)) {
      normalized.retailPrice = 0;
    }

    if (!Number.isFinite(normalized.internalCost)) {
      normalized.internalCost = 0;
    }

    return normalized;
  });
}

function normalizeImportRecord(product, index) {
  const warnings = [];

  if (!product.name) warnings.push("Missing required field: name");
  if (!product.owner) warnings.push("Missing required field: owner");
  if (!ALLOWED_CATEGORIES.has(product.category)) warnings.push(`Unsupported category: ${product.category || "(empty)"}`);
  if (!ALLOWED_STATUSES.has(product.status)) warnings.push(`Unsupported status: ${product.status || "(empty)"}`);

  if (warnings.length > 0) {
    return {
      index,
      product: null,
      warnings,
    };
  }

  return {
    index,
    product: {
      ...product,
      tags: [...new Set(product.tags.map((tag) => String(tag).trim()).filter(Boolean))],
    },
    warnings,
  };
}

function parseRawImportText(rawText) {
  const text = String(rawText ?? "").trim();
  if (!text) {
    return {
      preview: [],
      warnings: ["Import text is empty."],
    };
  }

  const preview = [];
  const warnings = [];

  try {
    const jsonProducts = parseJsonInput(text);
    if (jsonProducts) {
      jsonProducts.forEach((product, index) => {
        preview.push(normalizeImportRecord(product, index + 1));
      });
      return { preview, warnings };
    }
  } catch (error) {
    if (/^[\[{]/.test(text)) {
      warnings.push("JSON import parsing failed, falling back to line blocks.");
    }
  }

  const blocks = splitRecords(text);
  blocks.forEach((lines, index) => {
    const parsed = parseRecordBlock(lines);
    if (parsed.product) {
      preview.push(normalizeImportRecord(parsed.product, index + 1));
      if (parsed.warnings.length > 0) {
        warnings.push(...parsed.warnings.map((message) => `Record ${index + 1}: ${message}`));
      }
      return;
    }

    preview.push({
      index: index + 1,
      product: null,
      warnings: parsed.warnings.map((message) => `Record ${index + 1}: ${message}`),
    });
    warnings.push(...parsed.warnings.map((message) => `Record ${index + 1}: ${message}`));
  });

  return {
    preview,
    warnings,
  };
}

export function previewWorkspaceProductImport(rawText) {
  return parseRawImportText(rawText);
}

export function normalizeWorkspaceProductImportPreview(preview) {
  return clone(preview);
}

export default {
  previewWorkspaceProductImport,
};
