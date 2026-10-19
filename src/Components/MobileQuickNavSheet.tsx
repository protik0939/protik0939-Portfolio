"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, type ComponentType, type CSSProperties } from "react";

export type MobileQuickNavTile = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
};

type MobileQuickNavSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  tiles: MobileQuickNavTile[];
  notchIndex: number;
};

export default function MobileQuickNavSheet({
  isOpen,
  onClose,
  title,
  closeLabel,
  tiles,
  notchIndex,
}: Readonly<MobileQuickNavSheetProps>) {
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

  return (
    <div className="lg:hidden" aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`quick-nav-backdrop fixed inset-0 z-60 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-lenis-prevent=""
        style={{ "--bottom-nav-notch-index": String(notchIndex) } as CSSProperties}
        className={`quick-nav-sheet fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-80 max-h-[calc(100svh-8rem)] overflow-hidden rounded-[1.75rem] border border-outline-variant/40 ${
          isOpen ? "is-open" : "pointer-events-none"
        }`}
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pt-3 pb-12">
          <span aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-outline-variant/60" />

          <div className="flex items-center justify-between gap-3">
            <p className="font-headline text-xs font-bold tracking-[0.22em] text-on-surface-variant uppercase">{title}</p>
            <button
              type="button"
              onClick={onClose}
              tabIndex={isOpen ? 0 : -1}
              aria-label={closeLabel}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface transition hover:bg-surface-container-high"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            data-lenis-prevent=""
            className="grid max-h-[62vh] grid-cols-3 gap-2.5 overflow-y-auto overscroll-contain pb-1"
          >
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              const tileClassName = `quick-nav-tile group flex flex-col items-center justify-start gap-2 rounded-2xl border px-1 py-3 text-center active:scale-95 ${
                tile.isActive
                  ? "border-primary/45 bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(175,136,255,0.28)]"
                  : "border-transparent bg-surface-container-low/70 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`;
              const iconClassName = `grid h-11 w-11 place-items-center rounded-2xl transition ${
                tile.isActive
                  ? "bg-primary/20 text-primary"
                  : "bg-surface-container-high/80 group-hover:bg-surface-container-high"
              }`;
              const style = { transitionDelay: isOpen ? `${60 + index * 24}ms` : "0ms" };

              const content = (
                <>
                  <span className={iconClassName}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] leading-tight font-semibold">{tile.label}</span>
                </>
              );

              if (tile.href) {
                return (
                  <Link
                    key={tile.key}
                    href={tile.href}
                    onClick={onClose}
                    style={style}
                    tabIndex={isOpen ? 0 : -1}
                    className={tileClassName}
                    aria-current={tile.isActive ? "true" : undefined}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={tile.key}
                  type="button"
                  onClick={tile.onClick}
                  style={style}
                  tabIndex={isOpen ? 0 : -1}
                  className={tileClassName}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
