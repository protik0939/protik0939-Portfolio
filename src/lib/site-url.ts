/**
 * Canonical origin of the site, used for metadataBase, sitemap, robots and structured data.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com). On Vercel it falls back to the
 * production domain automatically.
 */
function normalize(raw: string) {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return normalize(explicit);
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return normalize(vercelProduction);
  }

  return "http://localhost:3000";
}

export const SITE_NAME = "Sadat Alam Protik";

export const SOCIAL_PROFILES = [
  "https://github.com/protik0939",
  "https://linkedin.com/in/protik0939",
  "https://x.com/protik0939",
  "https://facebook.com/protik0939",
];

export const DEFAULT_SITE_DESCRIPTION =
  "Portfolio of Sadat Alam Protik, a Full Stack Developer from Dhaka, Bangladesh building production-level web apps with Next.js, React, Node.js and PostgreSQL.";

/**
 * Meta descriptions shorter than this are almost certainly placeholders (e.g. "Read More") and hurt
 * click-through in search results, so they are replaced by the default. Google shows ~120-160 chars.
 */
const MIN_DESCRIPTION_LENGTH = 50;

export function pickSeoDescription(candidate: string | null | undefined) {
  const text = candidate?.replace(/\s+/g, " ").trim() ?? "";
  return text.length >= MIN_DESCRIPTION_LENGTH ? text : DEFAULT_SITE_DESCRIPTION;
}
