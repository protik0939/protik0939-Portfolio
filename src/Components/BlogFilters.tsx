"use client";

import { Loader2, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type BlogFiltersProps = {
  language: "en" | "bn";
  categories: string[];
  initialQuery: string;
  initialTags: string[];
  initialStartDate: string;
  initialEndDate: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function BlogFilters({
  language,
  categories,
  initialQuery,
  initialTags,
  initialStartDate,
  initialEndDate,
}: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement("div");
    root.className = "modal-root";
    document.body.appendChild(root);
    setModalRoot(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    setStartDate(initialStartDate);
  }, [initialStartDate]);

  useEffect(() => {
    setEndDate(initialEndDate);
  }, [initialEndDate]);

  const labels = useMemo(
    () => ({
      searchPlaceholder: language === "bn" ? "ব্লগ খুঁজুন..." : "Search blogs...",
      searchButton: language === "bn" ? "সার্চ" : "Search",
      searching: language === "bn" ? "সার্চ হচ্ছে..." : "Searching...",
      rangeStart: language === "bn" ? "শুরুর তারিখ" : "Start Date",
      rangeEnd: language === "bn" ? "শেষ তারিখ" : "End Date",
      advancedFilters: language === "bn" ? "অ্যাডভান্স ফিল্টার" : "Advanced Filter",
      modalTitle: language === "bn" ? "অ্যাডভান্স ফিল্টার" : "Advanced Filters",
      tagsTitle: language === "bn" ? "ট্যাগ বাছাই করুন" : "Select Tags",
      applyFilters: language === "bn" ? "ফিল্টার প্রয়োগ করুন" : "Apply Filters",
      clearFilters: language === "bn" ? "সব মুছুন" : "Clear All",
      close: language === "bn" ? "বন্ধ করুন" : "Close",
    }),
    [language],
  );

  const applyFilters = useCallback((nextQuery: string, nextTags: string[], nextStart: string, nextEnd: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);

    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery.length > 0) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    if (nextStart.trim().length > 0) {
      params.set("start", nextStart);
    } else {
      params.delete("start");
    }

    if (nextEnd.trim().length > 0) {
      params.set("end", nextEnd);
    } else {
      params.delete("end");
    }

    if (nextTags.length > 0) {
      params.set("tags", nextTags.join(","));
    } else {
      params.delete("tags");
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
      applyFilters(query, selectedTags, startDate, endDate);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [applyFilters, query, initialQuery, selectedTags, startDate, endDate]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDebouncing(false);
    applyFilters(query, selectedTags, startDate, endDate);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => {
      const normalizedTag = normalize(tag);
      const exists = current.some((item) => normalize(item) === normalizedTag);
      if (exists) {
        return current.filter((item) => normalize(item) !== normalizedTag);
      }
      return [...current, tag];
    });
  };

  const applyAdvancedFilters = () => {
    applyFilters(query, selectedTags, startDate, endDate);
    setIsModalOpen(false);
  };

  const clearAdvancedFilters = () => {
    setSelectedTags([]);
    setStartDate("");
    setEndDate("");
    applyFilters(query, [], "", "");
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
        >
          {labels.advancedFilters}
        </button>
      </div>

      {isModalOpen && modalRoot
        ? createPortal(
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-panel glass-panel w-full max-w-3xl rounded-3xl border border-outline-variant/30 p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-on-surface">{labels.modalTitle}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-outline-variant/50 px-4 py-2 text-xs font-semibold text-on-surface"
              >
                {labels.close}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-on-surface">{labels.rangeStart}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-on-surface">{labels.rangeEnd}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs tracking-[0.18em] text-on-surface-variant uppercase">{labels.tagsTitle}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((tag) => {
                  const isActive = selectedTags.some((item) => normalize(item) === normalize(tag));
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
                        isActive
                          ? "border-primary/60 bg-primary/20 text-primary"
                          : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={clearAdvancedFilters}
                className="rounded-full border border-outline-variant/50 px-4 py-2 text-xs font-semibold text-on-surface"
              >
                {labels.clearFilters}
              </button>
              <button
                type="button"
                onClick={applyAdvancedFilters}
                className="rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
              >
                {labels.applyFilters}
              </button>
            </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}
    </section>
  );
}
