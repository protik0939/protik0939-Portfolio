import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function resolvePdfjsRoot() {
  try {
    return dirname(dirname(require.resolve("pdfjs-dist")));
  } catch {
    // pdfjs-dist is not resolvable through Node, fall back to node_modules layout.
  }

  const direct = join(rootDir, "node_modules", "pdfjs-dist");
  return existsSync(direct) ? direct : null;
}

const pdfjsRoot = resolvePdfjsRoot();
const source = pdfjsRoot ? join(pdfjsRoot, "build", "pdf.worker.min.mjs") : null;

if (!source || !existsSync(source)) {
  console.warn("[pdf-worker] pdfjs worker not found; skipping copy. Run `npm install` first.");
  process.exit(0);
}

const targetDir = join(rootDir, "public");
mkdirSync(targetDir, { recursive: true });

const target = join(targetDir, "pdf.worker.min.mjs");
copyFileSync(source, target);
console.log(`[pdf-worker] Copied pdfjs worker -> public/pdf.worker.min.mjs`);
