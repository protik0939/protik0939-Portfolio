"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";

type SiteConfigSubset = {
  problemSolvingSummaryEn: string;
  problemSolvingSummaryBn: string;
};

type ProblemSolvingSectionProps = {
  siteConfig?: SiteConfigSubset | null;
};

type HeatmapValue = {
  date: string;
  count: number;
};

type HeatmapCellValue = {
  date: string | number | Date;
  count?: number;
  [key: string]: unknown;
};

type CodeforcesHeatmapResponse = {
  handle: string;
  values: HeatmapValue[];
  stats?: {
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    totalSubmissions: number;
    accepted: number;
    uniqueSolved: number;
  };
  error?: string;
};

const CODEFORCES_HANDLE = "protik0939";

export default function ProblemSolvingSection({ siteConfig = null }: Readonly<ProblemSolvingSectionProps>) {
  const { language, t } = useAppUI();
  const summary = language === "bn" ? siteConfig?.problemSolvingSummaryBn : siteConfig?.problemSolvingSummaryEn;
  const [heatmapValues, setHeatmapValues] = useState<HeatmapValue[]>([]);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(true);
  const [heatmapError, setHeatmapError] = useState("");
  const [stats, setStats] = useState<CodeforcesHeatmapResponse["stats"]>();

  const startDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, []);

  const endDate = useMemo(() => new Date(), []);

  useEffect(() => {
    let isActive = true;

    const loadHeatmap = async () => {
      setIsHeatmapLoading(true);
      setHeatmapError("");

      try {
        const response = await fetch(`/api/public/codeforces-heatmap?handle=${encodeURIComponent(CODEFORCES_HANDLE)}`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as CodeforcesHeatmapResponse;
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load Codeforces heatmap.");
        }

        if (isActive) {
          setHeatmapValues(Array.isArray(payload.values) ? payload.values : []);
          setStats(payload.stats);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : "Failed to load Codeforces heatmap.";
          setHeatmapError(message);
          setHeatmapValues([]);
          setStats(undefined);
        }
      } finally {
        if (isActive) {
          setIsHeatmapLoading(false);
        }
      }
    };

    void loadHeatmap();

    return () => {
      isActive = false;
    };
  }, []);

  const classForValue = (value: HeatmapCellValue | undefined) => {
    const count = value?.count ?? 0;
    if (count <= 0) return "color-empty";
    if (count <= 2) return "cf-level-1";
    if (count <= 5) return "cf-level-2";
    if (count <= 10) return "cf-level-3";
    return "cf-level-4";
  };

  return (
    <section className="bg-surface-container-low px-8 py-24" id="problem-solving">
      <AnimatedReveal className="mx-auto max-w-7xl" delay={0.05}>
        <div className="mb-10 text-center" data-reveal>
          <h2 className="font-headline text-4xl font-bold tracking-tight">{t("sections.problemSolving", "Problem Solving Skill")}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-on-surface-variant">
            {summary || t("problemSolving.placeholder", "Live Codeforces statistics and submission heatmap.")}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4" data-reveal>
          <div className="glass-panel rounded-2xl border border-outline-variant/30 p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-on-surface">Codeforces</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {t("problemSolving.current", "Current")}: {stats?.rating ?? 0}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t("problemSolving.max", "Max")}: {stats?.maxRating ?? 0}
            </p>
            <p className="text-sm text-on-surface-variant">Rank: {stats?.rank ?? "unrated"}</p>
            <p className="text-sm text-on-surface-variant">Max Rank: {stats?.maxRank ?? "unrated"}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Accepted</h3>
            <p className="mt-2 text-2xl font-bold text-on-surface">{stats?.accepted ?? 0}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Solved</h3>
            <p className="mt-2 text-2xl font-bold text-on-surface">{stats?.uniqueSolved ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6" data-reveal>
          <div className="glass-panel rounded-3xl border border-outline-variant/30 p-5">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Codeforces Heatmap</h4>
            {isHeatmapLoading ? (
              <div className="grid min-h-[260px] place-items-center text-sm text-on-surface-variant">
                {t("problemSolving.loadingCodeforces", "Loading Codeforces heatmap...")}
              </div>
            ) : heatmapError ? (
              <div className="grid min-h-[260px] place-items-center text-sm text-on-surface-variant">
                {heatmapError}
              </div>
            ) : heatmapValues.length > 0 ? (
              <div className="cf-heatmap-wrap">
                <p className="mb-3 text-xs text-on-surface-variant">
                  {t("problemSolving.handle", "Handle")}: {CODEFORCES_HANDLE}
                </p>
                <CalendarHeatmap
                  startDate={startDate}
                  endDate={endDate}
                  values={heatmapValues}
                  classForValue={classForValue}
                  showWeekdayLabels
                  titleForValue={(value) => {
                    if (!value || !value.date) {
                      return t("problemSolving.noSubmissionDay", "No submissions");
                    }

                    const countLabel = value.count === 1 ? "submission" : "submissions";
                    return `${value.date}: ${value.count} ${countLabel}`;
                  }}
                />
              </div>
            ) : (
              <div className="grid min-h-[260px] place-items-center text-sm text-on-surface-variant">
                {t("problemSolving.noCodeforces", "No Codeforces submissions found")}
              </div>
            )}
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
