"use client";

import Link from "next/link";
import { ArrowLeft, Home, Languages, MoonStar, Sun } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAppUI } from "@/Components/AppUIProvider";

type SubpageTopBarProps = {
  language: "en" | "bn";
};

export default function SubpageTopBar({ language: languageFromServer }: Readonly<SubpageTopBarProps>) {
  const { language, theme, toggleLanguage, toggleTheme } = useAppUI();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLanguage = language === "bn" || language === "en" ? language : languageFromServer;

  const labels = useMemo(
    () => ({
      home: activeLanguage === "bn" ? "হোম" : "Home",
      back: activeLanguage === "bn" ? "পিছনে" : "Go Back",
      language: activeLanguage === "bn" ? "ভাষা" : "Language",
      theme: activeLanguage === "bn" ? "থিম" : "Theme",
    }),
    [activeLanguage],
  );

  const homeHref = `/?lang=${activeLanguage}`;

  const onGoBack = () => {
    if (globalThis.history.length > 1) {
      router.back();
      return;
    }

    router.push(homeHref);
  };

  const onToggleLanguage = () => {
    const nextLanguage = activeLanguage === "bn" ? "en" : "bn";
    toggleLanguage();

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLanguage);
    const nextQuery = params.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  return (
    <div className="glass-panel mb-8 rounded-2xl border border-outline-variant/30 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
          >
            <Home className="h-3.5 w-3.5" />
            {labels.home}
          </Link>

          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-2 text-xs font-semibold tracking-widest text-on-surface uppercase transition hover:border-primary/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {labels.back}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={labels.theme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-low text-on-surface transition-colors hover:border-primary/50"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={labels.language}
            className="inline-flex h-10 items-center gap-1 rounded-full border border-outline-variant/50 bg-surface-container-low px-3 text-xs font-semibold text-on-surface transition-colors hover:border-primary/50"
          >
            <Languages className="h-4 w-4" />
            {activeLanguage.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
