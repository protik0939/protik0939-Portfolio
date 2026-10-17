export const RESUME_FILE_NAME = "Md. Sadat Alam Protik - Full Stack Developer Resume";

export function normalizeCvSource(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value || value === "#contact") {
    return null;
  }

  if (value.startsWith("data:")) {
    const commaIndex = value.indexOf(",");
    if (commaIndex < 0) {
      return value;
    }

    const prefix = value.slice(0, commaIndex + 1);
    const payload = value.slice(commaIndex + 1).replace(/\s+/g, "");
    return `${prefix}${payload}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  const compact = value.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/=]+$/.test(compact) && compact.length > 120) {
    const mimeType = compact.startsWith("JVBERi0") ? "application/pdf" : "application/octet-stream";
    return `data:${mimeType};base64,${compact}`;
  }

  return value;
}

export function isPdfSource(source: string | null | undefined): boolean {
  const value = source ?? "";
  return value.startsWith("data:application/pdf") || /\.pdf(\?|$)/i.test(value);
}

export function downloadResume(source: string | null | undefined, fileName = RESUME_FILE_NAME) {
  if (typeof window === "undefined") {
    return;
  }

  const value = source?.trim() ?? "";
  if (!value) {
    return;
  }

  const anchor = document.createElement("a");
  anchor.rel = "noreferrer";
  anchor.download = `${fileName}.pdf`;

  if (!value.startsWith("data:")) {
    anchor.href = value;
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  const commaIndex = value.indexOf(",");
  if (commaIndex < 0) {
    window.open(value, "_blank", "noreferrer");
    return;
  }

  const metadata = value.slice(0, commaIndex);
  const base64 = value.slice(commaIndex + 1);
  const mimeMatch = /data:([^;]+);base64/i.exec(metadata);
  const mimeType = mimeMatch?.[1] ?? "application/octet-stream";

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    anchor.href = blobUrl;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  } catch {
    window.open(value, "_blank", "noreferrer");
  }
}
