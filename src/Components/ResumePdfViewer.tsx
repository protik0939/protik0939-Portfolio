"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MAX_PAGE_WIDTH = 1100;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 0.9;

export type ResumeViewerLabels = {
  loading: string;
  error: string;
  prevPage: string;
  nextPage: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
};

type ResumePdfViewerProps = {
  file: string;
  labels: ResumeViewerLabels;
};

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

function ViewerLoading({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
      <p className="text-xs text-on-surface-variant">{message}</p>
    </div>
  );
}

function ViewerButton({
  onClick,
  disabled,
  label,
  children,
}: Readonly<{ onClick: () => void; disabled?: boolean; label: string; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function ResumePdfViewer({ file, labels }: Readonly<ResumePdfViewerProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setContainerWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleDocumentLoad = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setPageNumber(1);
    setHasError(false);
  }, []);

  const handleDocumentError = useCallback(() => {
    setHasError(true);
  }, []);

  // The scroll area has p-3 (12px each side), so the page's usable width is the container minus 24px.
  const baseWidth = containerWidth > 0 ? Math.min(Math.max(containerWidth - 24, 0), MAX_PAGE_WIDTH) : 0;
  const pageWidth = baseWidth > 0 ? Math.max(180, Math.floor(baseWidth * zoom)) : 0;

  if (hasError) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <p className="text-sm text-on-surface-variant">{labels.error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 px-3 py-2">
        <div className="flex items-center gap-0.5">
          <ViewerButton
            label={labels.prevPage}
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </ViewerButton>
          <span className="min-w-16 text-center text-xs font-semibold text-on-surface-variant">
            {numPages > 0 ? `${pageNumber} / ${numPages}` : "–"}
          </span>
          <ViewerButton
            label={labels.nextPage}
            disabled={numPages === 0 || pageNumber >= numPages}
            onClick={() => setPageNumber((current) => Math.min(numPages || 1, current + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </ViewerButton>
        </div>

        <div className="flex items-center gap-0.5">
          <ViewerButton label={labels.zoomOut} disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((current) => clampZoom(current - 0.25))}>
            <Minus className="h-4 w-4" />
          </ViewerButton>
          <span className="min-w-12 text-center text-xs font-semibold text-on-surface-variant">{Math.round(zoom * 100)}%</span>
          <ViewerButton label={labels.zoomIn} disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((current) => clampZoom(current + 0.25))}>
            <Plus className="h-4 w-4" />
          </ViewerButton>
          <ViewerButton label={labels.resetZoom} disabled={zoom === DEFAULT_ZOOM} onClick={() => setZoom(DEFAULT_ZOOM)}>
            <RotateCcw className="h-4 w-4" />
          </ViewerButton>
        </div>
      </div>

      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" data-lenis-prevent="">
        <div className="h-full overflow-auto overscroll-contain p-3" data-lenis-prevent="">
          {pageWidth > 0 ? (
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoad}
              onLoadError={handleDocumentError}
              loading={<ViewerLoading message={labels.loading} />}
              error={<ViewerLoading message={labels.error} />}
              noData={<ViewerLoading message={labels.error} />}
              suspense={false}
            >
              {/* w-max + min-w-full: centred when the page is narrower than the viewport, but
                  grows with the page when zoomed so the left edge stays scrollable. */}
              <div className="flex w-max min-w-full justify-center">
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<ViewerLoading message={labels.loading} />}
                  error={<ViewerLoading message={labels.error} />}
                  suspense={false}
                  className="overflow-hidden rounded-lg bg-white shadow-lg"
                />
              </div>
            </Document>
          ) : (
            <ViewerLoading message={labels.loading} />
          )}
        </div>
      </div>
    </div>
  );
}
