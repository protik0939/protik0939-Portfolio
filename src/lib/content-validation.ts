export function asString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

export function asOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

export function asBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

export function asNumber(value: unknown, field: string, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const converted = Number(value);
    if (Number.isFinite(converted)) {
      return converted;
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`${field} must be a number.`);
}

export function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

export function asDate(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid date.`);
  }

  return parsed;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
