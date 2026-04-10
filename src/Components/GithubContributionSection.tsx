"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";

const GITHUB_USERNAME = "protik0939";

type HeatmapValue = {
  date: string;
  count: number;
  level?: number;
};

type HeatmapCellValue = {
  date: string | number | Date;
  count?: number;
  level?: number;
  [key: string]: unknown;
};

type TopRepository = {
  nameWithOwner: string;
  url: string;
  stars: number;
  totalContributions: number;
  commitContributions: number;
  pullRequestContributions: number;
  issueContributions: number;
};

type GithubHeatmapResponse = {
  username: string;
  values: HeatmapValue[];
  years: number[];
  selectedYear?: number | null;
  profile?: {
    name: string | null;
    avatarUrl: string;
    url: string;
  };
  stats?: {
    followers: number;
    following: number;
    publicRepos: number;
    starredRepos: number;
    totalContributions: number;
    commitContributions: number;
    pullRequestContributions: number;
    issueContributions: number;
    repositoryContributions: number;
  };
  topRepositories?: TopRepository[];
  error?: string;
};

type GithubStats = NonNullable<GithubHeatmapResponse["stats"]>;

export default function GithubContributionSection() {
  const { t } = useAppUI();
  const [heatmapValues, setHeatmapValues] = useState<HeatmapValue[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedUsername, setResolvedUsername] = useState(GITHUB_USERNAME);
  const [baseStats, setBaseStats] = useState<GithubStats>();
  const [baseTopRepositories, setBaseTopRepositories] = useState<TopRepository[]>([]);
  const [yearHeatmapValuesByYear, setYearHeatmapValuesByYear] = useState<Partial<Record<number, HeatmapValue[]>>>({});
  const [yearStatsByYear, setYearStatsByYear] = useState<Partial<Record<number, GithubStats>>>({});
  const [yearTopReposByYear, setYearTopReposByYear] = useState<Partial<Record<number, TopRepository[]>>>({});
  const [isYearMetricsLoading, setIsYearMetricsLoading] = useState(false);
  const [yearMetricsError, setYearMetricsError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadGithubHeatmap = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/public/github-heatmap?username=${encodeURIComponent(GITHUB_USERNAME)}`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as GithubHeatmapResponse;
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load GitHub contribution data.");
        }

        if (!isActive) {
          return;
        }

        setHeatmapValues(Array.isArray(payload.values) ? payload.values : []);
        setAvailableYears(Array.isArray(payload.years) ? payload.years : []);
        setResolvedUsername(payload.username || GITHUB_USERNAME);
        setBaseStats(payload.stats);
        setBaseTopRepositories(Array.isArray(payload.topRepositories) ? payload.topRepositories : []);
        setYearHeatmapValuesByYear({});
        setYearStatsByYear({});
        setYearTopReposByYear({});
        setYearMetricsError("");
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "Failed to load GitHub contribution data.";
        setError(message);
        setHeatmapValues([]);
        setAvailableYears([]);
        setBaseStats(undefined);
        setBaseTopRepositories([]);
        setYearHeatmapValuesByYear({});
        setYearStatsByYear({});
        setYearTopReposByYear({});
        setYearMetricsError("");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadGithubHeatmap();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setYearMetricsError("");
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(null);
      return;
    }

    if (
      yearHeatmapValuesByYear[selectedYear] &&
      yearStatsByYear[selectedYear] &&
      yearTopReposByYear[selectedYear]
    ) {
      return;
    }

    if (isLoading || !!error) {
      return;
    }

    const yearKey = selectedYear;
    if (!yearKey) {
      return;
    }

    let isActive = true;

    const loadYearMetrics = async () => {
      setIsYearMetricsLoading(true);
      setYearMetricsError("");

      try {
        const response = await fetch(
          `/api/public/github-heatmap?username=${encodeURIComponent(GITHUB_USERNAME)}&year=${yearKey}`,
          {
            cache: "no-store",
          },
        );

        const payload = (await response.json()) as GithubHeatmapResponse;
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load year-wise GitHub metrics.");
        }

        if (!isActive) {
          return;
        }

        setYearHeatmapValuesByYear((previous) => ({
          ...previous,
          [yearKey]: Array.isArray(payload.values) ? payload.values : [],
        }));

        if (payload.stats) {
          setYearStatsByYear((previous) => ({
            ...previous,
            [yearKey]: payload.stats,
          }));
        }

        setYearTopReposByYear((previous) => ({
          ...previous,
          [yearKey]: Array.isArray(payload.topRepositories) ? payload.topRepositories : [],
        }));
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "Failed to load year-wise GitHub metrics.";
        setYearMetricsError(message);
      } finally {
        if (isActive) {
          setIsYearMetricsLoading(false);
        }
      }
    };

    void loadYearMetrics();

    return () => {
      isActive = false;
    };
  }, [availableYears, selectedYear, yearHeatmapValuesByYear, yearStatsByYear, yearTopReposByYear, isLoading, error]);

  const activeStats = useMemo(() => {
    if (!selectedYear) {
      return baseStats;
    }

    return yearStatsByYear[selectedYear] ?? baseStats;
  }, [selectedYear, yearStatsByYear, baseStats]);

  const activeTopRepositories = useMemo(() => {
    if (!selectedYear) {
      return baseTopRepositories;
    }

    return yearTopReposByYear[selectedYear] ?? baseTopRepositories;
  }, [selectedYear, yearTopReposByYear, baseTopRepositories]);

  const activeHeatmapValues = useMemo(() => {
    if (!selectedYear) {
      return heatmapValues;
    }

    return yearHeatmapValuesByYear[selectedYear] ?? [];
  }, [heatmapValues, selectedYear, yearHeatmapValuesByYear]);

  const startDate = useMemo(() => {
    if (!selectedYear) {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 364);
      return start;
    }

    return new Date(selectedYear, 0, 1);
  }, [selectedYear]);

  const endDate = useMemo(() => {
    if (!selectedYear) {
      return new Date();
    }

    const now = new Date();
    if (selectedYear === now.getFullYear()) {
      return now;
    }

    return new Date(selectedYear, 11, 31);
  }, [selectedYear]);

  const classForValue = (value: HeatmapCellValue | undefined) => {
    const level = value?.level;
    if (typeof level === "number") {
      if (level <= 0) return "color-empty";
      if (level === 1) return "gh-level-1";
      if (level === 2) return "gh-level-2";
      if (level === 3) return "gh-level-3";
      return "gh-level-4";
    }

    const count = value?.count ?? 0;
    if (count <= 0) return "color-empty";
    if (count <= 1) return "gh-level-1";
    if (count <= 3) return "gh-level-2";
    if (count <= 6) return "gh-level-3";
    return "gh-level-4";
  };

  let heatmapContent: ReactNode;

  if (isLoading) {
    heatmapContent = (
      <div className="grid min-h-65 place-items-center text-sm text-on-surface-variant">
        {t("githubContribution.loading", "Loading GitHub contribution heatmap...")}
      </div>
    );
  } else if (error) {
    heatmapContent = <div className="grid min-h-65 place-items-center text-sm text-on-surface-variant">{error}</div>;
  } else if (selectedYear && isYearMetricsLoading && !yearHeatmapValuesByYear[selectedYear]) {
    heatmapContent = (
      <div className="grid min-h-65 place-items-center text-sm text-on-surface-variant">
        {t("githubContribution.loadingYear", "Loading selected year heatmap...")}
      </div>
    );
  } else if (activeHeatmapValues.length > 0) {
    heatmapContent = (
      <div className="gh-heatmap-wrap">
        {availableYears.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {availableYears.map((year) => {
              const isActive = year === selectedYear;

              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear((previous) => (previous === year ? null : year))}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant/60 bg-surface-container text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                  }`}
                  aria-pressed={isActive}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : null}

        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={activeHeatmapValues}
          classForValue={classForValue}
          showWeekdayLabels
          titleForValue={(value) => {
            if (!value?.date) {
              return t("githubContribution.noContributionDay", "No contributions");
            }

            const count = value.count ?? 0;
            const countLabel = count === 1 ? "contribution" : "contributions";
            return `${value.date}: ${count} ${countLabel}`;
          }}
        />
      </div>
    );
  } else {
    heatmapContent = (
      <div className="grid min-h-65 place-items-center text-sm text-on-surface-variant">
        {t("githubContribution.noData", "No GitHub contribution data found")}
      </div>
    );
  }

  return (
    <section className="px-8 py-24" id="github-contribution">
      <AnimatedReveal className="mx-auto max-w-7xl" delay={0.05}>
        <div className="mb-10 text-center" data-reveal>
          <h2 className="font-headline text-4xl font-bold tracking-tight">{t("sections.githubContribution", "GitHub Contribution")}</h2>
        </div>

        <div className="glass-panel rounded-3xl border border-outline-variant/30 p-6" data-reveal>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant">github.com/{resolvedUsername}</p>
            <a
              href={`https://github.com/${resolvedUsername}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("githubContribution.viewProfile", "View Profile")}
            </a>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Followers</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeStats?.followers ?? 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Following</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeStats?.following ?? 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Public Repos</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeStats?.publicRepos ?? 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Starred Repos</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeStats?.starredRepos ?? 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Commits</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeStats?.commitContributions ?? 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
              <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">PRs + Issues</p>
              <p className="mt-1 text-lg font-bold text-on-surface">{(activeStats?.pullRequestContributions ?? 0) + (activeStats?.issueContributions ?? 0)}</p>
            </div>
          </div>

          <p className="mb-4 text-xs text-on-surface-variant">
            {selectedYear ? `Showing metrics for ${selectedYear}` : "Showing metrics for last 365 days"}
            {selectedYear && isYearMetricsLoading ? " (updating...)" : ""}
          </p>

          <div className="rounded-2xl bg-surface-container-low p-4">{heatmapContent}</div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Top Repositories by Contributions</h3>
            <div className="space-y-2">
              {activeTopRepositories.length > 0 ? (
                activeTopRepositories.map((repo) => (
                  <a
                    key={repo.nameWithOwner}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 transition hover:border-primary/50"
                  >
                    <span className="truncate pr-3 text-sm font-medium text-on-surface">{repo.nameWithOwner}</span>
                    <span className="shrink-0 text-xs text-on-surface-variant">
                      {repo.totalContributions} contributions • {repo.stars} stars
                    </span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">
                  {t("githubContribution.noRepoStats", "Repository contribution insights are unavailable right now.")}
                </p>
              )}
            </div>

            {yearMetricsError ? <p className="mt-2 text-xs text-on-surface-variant">{yearMetricsError}</p> : null}

            <p className="mt-3 text-xs text-on-surface-variant">
              {t("githubContribution.totalContributions", "Total Contributions")}: {activeStats?.totalContributions ?? 0} •
              {" "}
              {t("githubContribution.repositoriesContributed", "Repositories Contributed")}: {activeStats?.repositoryContributions ?? 0}
            </p>
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
