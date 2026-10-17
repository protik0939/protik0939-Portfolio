"use client";

import dynamic from "next/dynamic";
import { Download, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
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

type ResumeViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cvHref: string | null;
};

export default function ResumeViewerModal({ isOpen, onClose, cvHref }: Readonly<ResumeViewerModalProps>) {
  const { t } = useAppUI();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const title = t("nav.cvPreview", "CV Preview");
  const hasDocument = Boolean(cvHref);
  const canPreview = hasDocument && isPdfSource(cvHref);

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-surface-container sm:h-[90vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-outline-variant/30 sm:shadow-2xl"
        data-lenis-prevent=""
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/30 px-4 py-3 sm:px-6">
          <h2 className="font-headline text-base font-bold text-on-surface sm:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.close", "Close")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/50 text-on-surface transition hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-surface-container-low">
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

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-outline-variant/30 px-4 py-3 sm:px-6">
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
    </div>,
    document.body,
  );
}
