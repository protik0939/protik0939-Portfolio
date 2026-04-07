"use client";

import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TechnologyFilter = {
  name: string;
  iconUrl: string | null;
};

type ProjectFiltersProps = {
  language: "en" | "bn";
  technologies: TechnologyFilter[];
  initialTechnology: string;
  initialQuery: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function ProjectFilters({
  language,
  technologies,
  initialTechnology,
  initialQuery,
}: Readonly<ProjectFiltersProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [selectedTechnology, setSelectedTechnology] = useState(initialTechnology);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedTechnology(initialTechnology);
  }, [initialTechnology]);

  const labels = useMemo(
    () => ({
      searchPlaceholder: language === "bn" ? "প্রজেক্ট খুঁজুন..." : "Search projects...",
      searchButton: language === "bn" ? "সার্চ" : "Search",
      searching: language === "bn" ? "সার্চ হচ্ছে..." : "Searching...",
      allTechnologies: language === "bn" ? "সব টেকনোলজি" : "All Technologies",
      technologyTitle: language === "bn" ? "টেকনোলজি" : "Technologies",
    }),
    [language],
  );

  const applyFilters = useCallback((nextQuery: string, nextTechnology: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);

    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery.length > 0) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    if (nextTechnology.trim().length > 0) {
      params.set("tech", nextTechnology);
    } else {
      params.delete("tech");
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
      applyFilters(query, selectedTechnology);
    }, 1000);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [applyFilters, query, initialQuery, selectedTechnology]);

  const onSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();
    setIsDebouncing(false);
    applyFilters(query, selectedTechnology);
  };

  const onTechnologyChange = (technology: string) => {
    setSelectedTechnology(technology);
    applyFilters(query, technology);
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
        <p className="mb-2 text-xs tracking-[0.18em] text-on-surface-variant uppercase">{labels.technologyTitle}</p>
        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onTechnologyChange("")}
            className={`inline-flex max-w-full shrink-0 items-center whitespace-nowrap overflow-hidden rounded-full border px-3 py-1.5 text-xs leading-none font-semibold tracking-wide uppercase transition ${
              selectedTechnology.length === 0
                ? "border-primary/60 bg-primary/20 text-primary"
                : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
            }`}
          >
            <span className="truncate">{labels.allTechnologies}</span>
          </button>

          {technologies.map((technology) => {
            const isActive = normalize(selectedTechnology) === normalize(technology.name);

            return (
              <button
                key={technology.name}
                type="button"
                onClick={() => onTechnologyChange(technology.name)}
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
    </section>
  );
}
