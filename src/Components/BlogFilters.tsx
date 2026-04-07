"use client";

import { Loader2, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type BlogFiltersProps = {
  language: "en" | "bn";
  categories: string[];
  initialCategory: string;
  initialQuery: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function BlogFilters({ language, categories, initialCategory, initialQuery }: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const labels = useMemo(
    () => ({
      searchPlaceholder: language === "bn" ? "ব্লগ খুঁজুন..." : "Search blogs...",
      searchButton: language === "bn" ? "সার্চ" : "Search",
      searching: language === "bn" ? "সার্চ হচ্ছে..." : "Searching...",
      allCategories: language === "bn" ? "সব ক্যাটেগরি" : "All Categories",
      categoryTitle: language === "bn" ? "ক্যাটেগরি" : "Categories",
    }),
    [language],
  );

  const applyFilters = useCallback((nextQuery: string, nextCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);

    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery.length > 0) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    if (nextCategory.trim().length > 0) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }, [language, pathname, router, searchParams]);

  useEffect(() => {
    if (normalize(query) === normalize(initialQuery)) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = window.setTimeout(() => {
      setIsDebouncing(false);
      applyFilters(query, selectedCategory);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [applyFilters, query, initialQuery, selectedCategory]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDebouncing(false);
    applyFilters(query, selectedCategory);
  };

  const onCategoryChange = (category: string) => {
    setSelectedCategory(category);
    applyFilters(query, category);
  };

  return (
    <section className="glass-panel mb-8 rounded-3xl border border-outline-variant/30 p-4 sm:p-5">
      <form onSubmit={onSubmit} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-11 w-full rounded-full border border-outline-variant/40 bg-surface-container-low pr-4 pl-10 text-sm text-on-surface outline-none transition focus:border-primary/60"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-11 min-w-30 items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
        >
          {isDebouncing || isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              <span>{labels.searching}</span>
            </>
          ) : (
            labels.searchButton
          )}
        </button>
      </form>

      {isDebouncing || isPending ? (
        <p className="mb-4 text-xs text-on-surface-variant">{labels.searching}</p>
      ) : null}

      <div>
        <p className="mb-2 text-xs tracking-[0.18em] text-on-surface-variant uppercase">{labels.categoryTitle}</p>
        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onCategoryChange("")}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
              selectedCategory.length === 0
                ? "border-primary/60 bg-primary/20 text-primary"
                : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
            }`}
          >
            {labels.allCategories}
          </button>

          {categories.map((category) => {
            const isActive = normalize(selectedCategory) === normalize(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
                  isActive
                    ? "border-primary/60 bg-primary/20 text-primary"
                    : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
