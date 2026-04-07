"use client";

import Image from "next/image";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";

const GITHUB_USERNAME = "protik0939";
const GITHUB_HEATMAP_URL = `https://ghchart.rshah.org/${GITHUB_USERNAME}`;

export default function GithubContributionSection() {
  const { t } = useAppUI();

  return (
    <section className="px-8 py-24" id="github-contribution">
      <AnimatedReveal className="mx-auto max-w-7xl" delay={0.05}>
        <div className="mb-10 text-center" data-reveal>
          <h2 className="font-headline text-4xl font-bold tracking-tight">{t("sections.githubContribution", "GitHub Contribution")}</h2>
        </div>

        <div className="glass-panel rounded-3xl border border-outline-variant/30 p-6" data-reveal>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant">github.com/{GITHUB_USERNAME}</p>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("githubContribution.viewProfile", "View Profile")}
            </a>
          </div>

          <div className="relative min-h-[260px] w-full overflow-hidden rounded-2xl bg-surface-container-low">
            <Image
              fill
              unoptimized
              sizes="(min-width: 768px) 84vw, 95vw"
              src={GITHUB_HEATMAP_URL}
              alt="GitHub contribution heatmap"
              className="object-contain"
            />
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
