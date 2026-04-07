"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useMemo, useState } from "react";

type SliderMediaItem = {
  key: string;
  type: "image" | "youtube";
  src: string;
  thumbnailSrc: string;
  youtubeId?: string;
};

type BlogMediaSliderProps = {
  title: string;
  mediaUrls?: string[];
  coverImageUrl?: string | null;
  variant?: "card" | "detail";
};

function extractYoutubeId(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.slice(1) || null;
    }

    if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] || null;
      }

      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function toMediaItem(url: string, index: number): SliderMediaItem {
  const youtubeId = extractYoutubeId(url);

  if (youtubeId) {
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    return {
      key: `youtube-${youtubeId}-${index + 1}`,
      type: "youtube",
      src: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      thumbnailSrc: thumbnail,
      youtubeId,
    };
  }

  return {
    key: `image-${url}-${index + 1}`,
    type: "image",
    src: url,
    thumbnailSrc: url,
  };
}

type ActiveMediaPreviewProps = {
  active: SliderMediaItem;
  activeIndex: number;
  title: string;
  isCard: boolean;
  onPlayYoutube: () => void;
};

function ActiveMediaPreview({ active, activeIndex, title, isCard, onPlayYoutube }: Readonly<ActiveMediaPreviewProps>) {
  return (
    <button
      type="button"
      onClick={() => {
        if (active.type === "youtube") {
          onPlayYoutube();
        }
      }}
      className="group relative block h-full w-full"
      aria-label={active.type === "youtube" ? "Play video" : "Media image"}
    >
      {!isCard && active.type === "image" ? (
        <>
          <Image
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            src={active.thumbnailSrc}
            alt=""
            className="scale-110 object-cover blur-2xl brightness-75"
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/25" aria-hidden />
          <Image
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            src={active.thumbnailSrc}
            alt={`${title} media ${activeIndex + 1}`}
            className="object-contain"
          />
        </>
      ) : (
        <Image
          fill
          sizes={isCard ? "(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 94vw" : "(min-width: 1024px) 80vw, 100vw"}
          src={active.thumbnailSrc}
          alt={`${title} media ${activeIndex + 1}`}
          className="object-cover"
        />
      )}

      {active.type === "youtube" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
          <span className="inline-flex items-center justify-center rounded-full bg-white/90 p-3 text-black shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
      ) : null}
    </button>
  );
}

export default function BlogMediaSlider({
  title,
  mediaUrls = [],
  coverImageUrl = null,
  variant = "detail",
}: Readonly<BlogMediaSliderProps>) {
  const items = useMemo(() => {
    const merged = [coverImageUrl, ...mediaUrls]
      .filter((url): url is string => Boolean(url?.trim()))
      .map((url) => url.trim());

    const unique = Array.from(new Set(merged));
    return unique.map((url, index) => toMediaItem(url, index));
  }, [coverImageUrl, mediaUrls]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [playingYoutubeIndex, setPlayingYoutubeIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="grid h-56 place-items-center rounded-2xl bg-surface-container text-xs text-on-surface-variant">
        No media available
      </div>
    );
  }

  const active = items[activeIndex] ?? items[0];
  const canSlide = items.length > 1;
  const isCard = variant === "card";

  const shiftSlide = (direction: "prev" | "next") => {
    setPlayingYoutubeIndex(null);
    const directionOffset = direction === "prev" ? -1 : 1;
    setActiveIndex((previous) => (previous + directionOffset + items.length) % items.length);
  };

  return (
    <div className="space-y-2">
      <div className={`group/slider relative overflow-hidden rounded-2xl bg-surface-container ${isCard ? "h-48" : "h-64 sm:h-80 lg:h-104"}`}>
        {active.type === "youtube" && playingYoutubeIndex === activeIndex ? (
          <iframe
            src={`${active.src}&autoplay=1`}
            title={`${title} video ${activeIndex + 1}`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <ActiveMediaPreview
            active={active}
            activeIndex={activeIndex}
            title={title}
            isCard={isCard}
            onPlayYoutube={() => {
              setPlayingYoutubeIndex(activeIndex);
            }}
          />
        )}

        {canSlide ? (
          <>
            <button
              type="button"
              onClick={() => shiftSlide("prev")}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/55 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 focus-visible:opacity-100"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftSlide("next")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/55 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 focus-visible:opacity-100"
              aria-label="Next media"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {canSlide ? (
        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.key}
              onClick={() => {
                setPlayingYoutubeIndex(null);
                setActiveIndex(index);
              }}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border ${index === activeIndex ? "border-primary" : "border-outline-variant/40"}`}
              aria-label={`Go to media ${index + 1}`}
            >
              <Image
                fill
                sizes="80px"
                src={item.thumbnailSrc}
                alt={`${title} thumbnail ${index + 1}`}
                className="object-cover"
              />
              {item.type === "youtube" ? (
                <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
                  Video
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}