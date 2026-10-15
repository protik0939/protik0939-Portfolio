"use client";

import { ChevronDown, ChevronUp, Loader2, Search, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const INITIAL_VISIBLE_TAGS = 8;

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
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
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
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

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
      seeMore: language === "bn" ? "আরও দেখুন" : "See more",
      hideAll: language === "bn" ? "সব লুকান" : "Hide all",
    }),
    [language],
  );

  const hasMoreTags = categories.length > INITIAL_VISIBLE_TAGS;

  const visibleCategories = useMemo(() => {
    if (isTagsExpanded || !hasMoreTags) {
      return categories;
    }

    const initialSlice = categories.slice(0, INITIAL_VISIBLE_TAGS);
    const initialSet = new Set(initialSlice.map((tag) => normalize(tag)));

    const selectedOutsideInitial = categories.filter(
      (tag) => !initialSet.has(normalize(tag)) && selectedTags.some((selected) => normalize(selected) === normalize(tag)),
    );

    return [...initialSlice, ...selectedOutsideInitial];
  }, [categories, hasMoreTags, isTagsExpanded, selectedTags]);

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
          data-testid="open-advanced-filter-btn"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
        >
          {labels.advancedFilters}
        </button>
      </div>

      {isModalOpen && modalRoot
        ? createPortal(
            <div
              className="modal-backdrop"
              role="dialog"
              aria-modal="true"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setIsModalOpen(false);
                }
              }}
            >
              <div
                className="modal-panel glass-panel flex w-full max-w-2xl max-h-[85vh] flex-col rounded-3xl border border-outline-variant/30 shadow-2xl backdrop-blur-xl"
                onClick={(event) => event.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/20 px-5 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-on-surface">{labels.modalTitle}</h3>
                  <button
                    type="button"
                    data-testid="close-advanced-filter-btn"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:border-error/60 hover:bg-error/10 hover:text-error"
                    aria-label={labels.close}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    <span>{labels.close}</span>
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm">
                      <span className="font-medium text-on-surface">{labels.rangeStart}</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-2.5 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm">
                      <span className="font-medium text-on-surface">{labels.rangeEnd}</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-2.5 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-[0.18em] text-on-surface-variant uppercase">
                        {labels.tagsTitle}
                      </p>
                      {categories.length > 0 ? (
                        <span className="text-xs text-on-surface-variant">
                          {selectedTags.length > 0
                            ? language === "bn"
                              ? `${selectedTags.length}টি নির্বাচিত`
                              : `${selectedTags.length} selected`
                            : `${categories.length} ${language === "bn" ? "টি ট্যাগ" : "tags"}`}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {visibleCategories.map((tag) => {
                        const isActive = selectedTags.some((item) => normalize(item) === normalize(tag));
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleTag(tag);
                            }}
                            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
                              isActive
                                ? "border-primary/60 bg-primary/20 text-primary"
                                : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {hasMoreTags ? (
                      <div className="mt-3">
                        {isTagsExpanded ? (
                          <button
                            type="button"
                            data-testid="hide-all-tags-btn"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setIsTagsExpanded(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-low px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/10"
                          >
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                            <span>{labels.hideAll}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            data-testid="see-more-tags-btn"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setIsTagsExpanded(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/20"
                          >
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                            <span>{labels.seeMore}</span>
                            <span className="text-[10px] opacity-80">
                              (+{categories.length - INITIAL_VISIBLE_TAGS})
                            </span>
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 bg-surface-container-low/40 px-5 py-4 sm:px-6 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={clearAdvancedFilters}
                    className="rounded-full border border-outline-variant/50 px-4 py-2 text-xs font-semibold text-on-surface transition hover:border-outline hover:bg-surface-variant"
                  >
                    {labels.clearFilters}
                  </button>
                  <button
                    type="button"
                    onClick={applyAdvancedFilters}
                    className="rounded-full border border-primary/40 bg-primary/20 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/30"
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
