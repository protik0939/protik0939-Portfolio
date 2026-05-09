"use client";

import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TechnologyFilter = {
  name: string;
  iconUrl: string | null;
};

type ProjectFiltersProps = {
  language: "en" | "bn";
  technologies: TechnologyFilter[];
  initialQuery: string;
  initialTechnologies: string[];
  initialType: string;
  initialCategory: string;
  initialLevel: string;
  types: string[];
  categories: string[];
  levels: string[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function ProjectFilters({
  language,
  technologies,
  initialQuery,
  initialTechnologies,
  initialType,
  initialCategory,
  initialLevel,
  types,
  categories,
  levels,
}: Readonly<ProjectFiltersProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(initialTechnologies);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedTechnologies(initialTechnologies);
  }, [initialTechnologies]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSelectedLevel(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    const root = document.createElement("div");
    root.className = "modal-root";
    document.body.appendChild(root);
    setModalRoot(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  const labels = useMemo(
    () => ({
      searchPlaceholder: language === "bn" ? "প্রজেক্ট খুঁজুন..." : "Search projects...",
      searchButton: language === "bn" ? "সার্চ" : "Search",
      searching: language === "bn" ? "সার্চ হচ্ছে..." : "Searching...",
      advancedFilters: language === "bn" ? "অ্যাডভান্স ফিল্টার" : "Advanced Filter",
      modalTitle: language === "bn" ? "অ্যাডভান্স ফিল্টার" : "Advanced Filters",
      techStackTitle: language === "bn" ? "টেক স্ট্যাক" : "Tech Stack",
      typeTitle: language === "bn" ? "টাইপ" : "Type",
      categoryTitle: language === "bn" ? "ক্যাটেগরি" : "Category",
      levelTitle: language === "bn" ? "লেভেল" : "Level",
      applyFilters: language === "bn" ? "ফিল্টার প্রয়োগ করুন" : "Apply Filters",
      clearFilters: language === "bn" ? "সব মুছুন" : "Clear All",
      close: language === "bn" ? "বন্ধ করুন" : "Close",
    }),
    [language],
  );

  const applyFilters = useCallback((
    nextQuery: string,
    nextTechnologies: string[],
    nextType: string,
    nextCategory: string,
    nextLevel: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);

    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery.length > 0) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    if (nextTechnologies.length > 0) {
      params.set("techs", nextTechnologies.join(","));
    } else {
      params.delete("techs");
    }

    if (nextType.trim().length > 0) {
      params.set("type", nextType);
    } else {
      params.delete("type");
    }

    if (nextCategory.trim().length > 0) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    if (nextLevel.trim().length > 0) {
      params.set("level", nextLevel);
    } else {
      params.delete("level");
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
    const timer = globalThis.setTimeout(() => {
      setIsDebouncing(false);
      applyFilters(query, selectedTechnologies, selectedType, selectedCategory, selectedLevel);
    }, 1000);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [applyFilters, query, initialQuery, selectedTechnologies, selectedType, selectedCategory, selectedLevel]);

  const onSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();
    setIsDebouncing(false);
    applyFilters(query, selectedTechnologies, selectedType, selectedCategory, selectedLevel);
  };

  const toggleTechnology = (technology: string) => {
    setSelectedTechnologies((current) => {
      const normalized = normalize(technology);
      const exists = current.some((item) => normalize(item) === normalized);
      if (exists) {
        return current.filter((item) => normalize(item) !== normalized);
      }
      return [...current, technology];
    });
  };

  const applyAdvancedFilters = () => {
    applyFilters(query, selectedTechnologies, selectedType, selectedCategory, selectedLevel);
    setIsModalOpen(false);
  };

  const clearAdvancedFilters = () => {
    setSelectedTechnologies([]);
    setSelectedType("");
    setSelectedCategory("");
    setSelectedLevel("");
    applyFilters(query, [], "", "", "");
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
              <div className="modal-panel glass-panel w-full max-w-4xl rounded-3xl border border-outline-variant/30 p-5 sm:p-6">
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

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-on-surface">{labels.typeTitle}</span>
                    <select
                      value={selectedType}
                      onChange={(event) => setSelectedType(event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                    >
                      <option value="">All</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-on-surface">{labels.categoryTitle}</span>
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                    >
                      <option value="">All</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-on-surface">{labels.levelTitle}</span>
                    <select
                      value={selectedLevel}
                      onChange={(event) => setSelectedLevel(event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                    >
                      <option value="">All</option>
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs tracking-[0.18em] text-on-surface-variant uppercase">{labels.techStackTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((technology) => {
                      const isActive = selectedTechnologies.some((item) => normalize(item) === normalize(technology.name));

                      return (
                        <button
                          key={technology.name}
                          type="button"
                          onClick={() => toggleTechnology(technology.name)}
                          className={`inline-flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap overflow-hidden rounded-full border px-3 py-1.5 text-xs leading-none font-semibold tracking-wide uppercase transition ${
                            isActive
                              ? "border-primary/60 bg-primary/20 text-primary"
                              : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
                          }`}
                        >
                          {technology.iconUrl ? (
                            <Image
                              src={technology.iconUrl}
                              alt={`${technology.name} icon`}
                              width={14}
                              height={14}
                              className="h-3.5 w-3.5 rounded object-cover"
                            />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
                          )}
                          <span className="min-w-0 max-w-44 truncate">{technology.name}</span>
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
