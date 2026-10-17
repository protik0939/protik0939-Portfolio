"use client";

import dynamic from "next/dynamic";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";
import { downloadResume, isPdfSource, RESUME_FILE_NAME } from "@/lib/cv";

const ResumePdfViewer = dynamic(() => import("@/Components/ResumePdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
    </div>
  ),
});

type ResumeWorkspaceProps = {
  cvHref: string | null;
};

export default function ResumeWorkspace({ cvHref }: Readonly<ResumeWorkspaceProps>) {
  const { t } = useAppUI();

  const hasDocument = Boolean(cvHref);
  const canPreview = hasDocument && isPdfSource(cvHref);

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] border border-outline-variant/30">
      <div className="flex flex-col gap-5 border-b border-outline-variant/30 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </span>
          <div>
            <p className="mb-1 text-xs tracking-[0.2em] text-primary uppercase">Portfolio</p>
            <h1 className="font-headline text-3xl font-black tracking-tight md:text-4xl">{t("nav.resume", "Resume")}</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasDocument ? (
            <a
              href={cvHref ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
            >
              <ExternalLink className="h-4 w-4" />
              {t("nav.openInNewTab", "Open in new tab")}
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => downloadResume(cvHref, RESUME_FILE_NAME)}
            disabled={!hasDocument}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {t("nav.download", "Download")}
          </button>
        </div>
      </div>

      <div className="h-[68vh] min-h-96 bg-surface-container-low">
        {!hasDocument ? (
          <div className="grid h-full place-items-center p-6 text-center">
            <p className="text-sm text-on-surface-variant">{t("nav.cvNotAvailable", "CV is not available right now.")}</p>
          </div>
        ) : canPreview ? (
          <ResumePdfViewer
            file={cvHref ?? ""}
            labels={{
              loading: t("nav.cvLoading", "Loading resume..."),
              error: t("nav.cvPreviewUnavailable", "CV preview is unavailable in this browser."),
              prevPage: t("nav.prevPage", "Previous page"),
              nextPage: t("nav.nextPage", "Next page"),
              zoomIn: t("nav.zoomIn", "Zoom in"),
              zoomOut: t("nav.zoomOut", "Zoom out"),
              resetZoom: t("nav.resetZoom", "Reset zoom"),
            }}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <p className="text-sm text-on-surface-variant">{t("nav.cvPreviewUnavailable", "CV preview is unavailable in this browser.")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
