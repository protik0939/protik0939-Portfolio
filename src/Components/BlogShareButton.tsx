"use client";

import { useState } from "react";

type BlogShareButtonProps = {
  title: string;
  text: string;
};

export default function BlogShareButton({ title, text }: Readonly<BlogShareButtonProps>) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleShare();
      }}
      className="rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
    >
      {copied ? "Link Copied" : "Share"}
    </button>
  );
}
