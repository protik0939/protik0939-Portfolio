"use client";

import Link from "next/link";
import { House, RotateCw, WifiOff } from "lucide-react";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import { useAppUI } from "@/Components/AppUIProvider";

export default function OfflinePage() {
  const { t } = useAppUI();

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-on-surface">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 flex max-w-md flex-col items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/15 text-primary">
          <WifiOff className="h-7 w-7" />
        </span>

        <h1 className="font-headline text-3xl font-black tracking-tight md:text-4xl">
          {t("pwa.offlineTitle", "You're offline")}
        </h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {t(
            "pwa.offlineMessage",
            "This page isn't available right now. Check your connection and try again — everything reconnects automatically once you're back online.",
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition hover:brightness-110 active:scale-95"
          >
            <RotateCw className="h-4 w-4" />
            {t("pwa.retry", "Try again")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 px-5 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high active:scale-95"
          >
            <House className="h-4 w-4" />
            {t("nav.home", "Home")}
          </Link>
        </div>
      </main>
    </div>
  );
}
