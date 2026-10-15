"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

type ImageCropModalProps = {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => Promise<void> | void;
  isProcessing?: boolean;
};

const CROP_BOX_SIZE = 240; // 240px visual 1:1 crop square in viewport

export default function ImageCropModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
  isProcessing = false,
}: Readonly<ImageCropModalProps>) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load image object URL when file changes
  useEffect(() => {
    if (!imageFile) {
      setImageSrc("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImageSrc(objectUrl);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setError("");

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isProcessing, onClose]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isProcessing) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || isProcessing) return;
    setPan({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isProcessing || event.touches.length === 0) return;
    const touch = event.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || isProcessing || event.touches.length === 0) return;
    const touch = event.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const aspect = imageSize.width > 0 && imageSize.height > 0 ? imageSize.width / imageSize.height : 1;
  const baseWidth = aspect >= 1 ? CROP_BOX_SIZE * aspect : CROP_BOX_SIZE;
  const baseHeight = aspect >= 1 ? CROP_BOX_SIZE : CROP_BOX_SIZE / aspect;

  const handleCropAndSave = async () => {
    if (!imgRef.current || !containerRef.current) return;
    setError("");

    try {
      const img = imgRef.current;
      const cropContainer = containerRef.current;
      const cropRect = cropContainer.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      // Destination 150x150 canvas
      const canvas = document.createElement("canvas");
      canvas.width = 150;
      canvas.height = 150;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D canvas context.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Scale factor from crop viewport (240px) to destination canvas (150px)
      const scale = 150 / cropRect.width;
      const destX = (imgRect.left - cropRect.left) * scale;
      const destY = (imgRect.top - cropRect.top) * scale;
      const destWidth = imgRect.width * scale;
      const destHeight = imgRect.height * scale;

      // Draw the exact visual presentation
      ctx.drawImage(img, destX, destY, destWidth, destHeight);

      // Convert to WebP and ensure size is less than 50 KB
      const MAX_BYTES = 50 * 1024; // 50 KB
      let quality = 0.92;
      let blob: Blob | null = null;

      while (quality >= 0.2) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/webp", quality);
        });

        if (blob && blob.size <= MAX_BYTES) {
          break;
        }

        quality -= 0.1;
      }

      if (!blob || blob.size > MAX_BYTES) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/webp", 0.1);
        });
      }

      // Fallback if browser doesn't support webp
      if (!blob) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
        });
      }

      if (!blob) {
        throw new Error("Failed to generate cropped image.");
      }

      const fileName = `${(imageFile?.name ?? "experience-logo").replace(/\.[^.]+$/, "")}-150x150.webp`;
      const croppedFile = new File([blob], fileName, { type: "image/webp" });

      await onCropComplete(croppedFile);
    } catch (cropErr) {
      const msg = cropErr instanceof Error ? cropErr.message : "Failed to process image.";
      setError(msg);
    }
  };

  if (!isOpen || !imageSrc) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        className="modal-panel glass-panel flex w-full max-w-lg max-h-[90vh] flex-col rounded-3xl border border-outline-variant/30 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-on-surface">Crop Experience Logo (1:1)</h3>
            <p className="text-xs text-on-surface-variant">
              Output: 150×150 px • WebP format • &lt; 50 KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 rounded-full border border-outline-variant/50 px-3 py-1 text-xs font-semibold text-on-surface transition hover:bg-surface-variant disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            <span>Cancel</span>
          </button>
        </div>

        {/* Crop Viewport */}
        <div className="flex flex-1 flex-col items-center justify-center p-5 select-none">
          <div
            ref={containerRef}
            style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
            className="relative cursor-move overflow-hidden rounded-2xl border-2 border-primary bg-black/60 shadow-[0_0_25px_rgba(175,136,255,0.25)]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The source image manipulated by pan and zoom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                maxWidth: "none",
                maxHeight: "none",
              }}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none object-contain transition-transform duration-75"
            />

            {/* 1:1 grid overlay guidelines */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>

            {/* Corner brackets */}
            <div className="pointer-events-none absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-primary" />
            <div className="pointer-events-none absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-primary" />
            <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary" />
            <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary" />
          </div>

          <p className="mt-3 text-center text-[11px] text-on-surface-variant">
            Drag image to center • Use slider below to zoom in/out
          </p>

          {/* Controls: Zoom slider & Reset */}
          <div className="mt-4 flex w-full max-w-xs items-center gap-3">
            <ZoomOut className="h-4 w-4 text-on-surface-variant" aria-hidden />
            <input
              type="range"
              min={0.8}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
              disabled={isProcessing}
              className="flex-1 accent-primary cursor-pointer"
            />
            <ZoomIn className="h-4 w-4 text-on-surface-variant" aria-hidden />
            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing}
              className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-variant"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {error ? <p className="mt-3 text-xs text-red-500 text-center">{error}</p> : null}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/40 px-5 py-4 rounded-b-3xl">
          <div className="text-[11px] text-on-surface-variant">
            {imageSize.width > 0 ? `${imageSize.width}×${imageSize.height} source` : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-full border border-outline-variant/50 px-4 py-2 text-xs font-semibold text-on-surface transition hover:bg-surface-variant disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void handleCropAndSave();
              }}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase transition hover:brightness-110 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  <span>Crop & Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
