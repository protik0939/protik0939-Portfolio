"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { ArrowRight } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type ProjectItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  typeEn: string;
  typeBn: string;
  detailsEn: string;
  detailsBn: string;
  coverImageUrl: string | null;
};

type SiteConfigSubset = {
  projectsSectionTitleEn: string;
  projectsSectionTitleBn: string;
};

type ProjectsSectionProps = {
  projects?: ProjectItem[];
  siteConfig?: SiteConfigSubset | null;
};

export default function ProjectsSection({ projects = [], siteConfig = null }: Readonly<ProjectsSectionProps>) {
  const { language, t } = useAppUI();

  const heading = language === "bn" ? siteConfig?.projectsSectionTitleBn : siteConfig?.projectsSectionTitleEn;

  const displayProjects = projects.length > 0
    ? projects.slice(0, 3)
    : [
        {
          id: "fallback-project",
          slug: "projects",
          titleEn: "Add your first project",
          titleBn: "আপনার প্রথম প্রজেক্ট যোগ করুন",
          typeEn: "Portfolio",
          typeBn: "পোর্টফোলিও",
          detailsEn: "Go to the admin panel and create project entries to populate this section.",
          detailsBn: "এই সেকশন পূরণ করতে অ্যাডমিন প্যানেল থেকে প্রজেক্ট এন্ট্রি তৈরি করুন।",
          coverImageUrl: "",
        },
      ];

  return (
    <section className="px-8 py-32" id="projects">
      <AnimatedReveal className="mx-auto mb-16 flex max-w-7xl flex-col items-end justify-between gap-6 md:flex-row" delay={0.05}>
        <div data-reveal>
          <span className="mb-2 block text-xs tracking-widest text-primary uppercase">{t("sections.selectedWork", "Selected Work")}</span>
          <h2 className="font-headline text-5xl font-bold tracking-tighter">{heading || t("sections.featuredProjects", "Featured Projects")}</h2>
        </div>
        <div className="flex max-w-md flex-col items-end gap-4" data-reveal>
          <p className="text-right text-on-surface-variant">
            {t("projects.summary", "A collection of production-ready applications focusing on user experience, performance, and scalability.")}
          </p>
          <Link
            href={`/projects?lang=${language}`}
            className="rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
          >
            {t("projects.showAll", "Show All Projects")}
          </Link>
        </div>
      </AnimatedReveal>

      <div className="mx-auto max-w-7xl space-y-32">
        {displayProjects.map((project, index) => {
          const reverse = index % 2 === 1;
          const title = language === "bn" ? project.titleBn : project.titleEn;
          const type = language === "bn" ? project.typeBn : project.typeEn;
          const details = language === "bn" ? project.detailsBn : project.detailsEn;

          return (
            <AnimatedReveal key={project.id} delay={0.08 + index * 0.04}>
              <div className="group grid grid-cols-1 items-center gap-12 md:grid-cols-2" data-reveal>
                <div className={`${reverse ? "order-2 md:order-1" : ""}`}>
                  <span className="mb-2 block text-sm text-secondary">{type}</span>
                  <h3 className="mb-4 font-headline text-3xl font-bold">{title}</h3>
                  <p className="mb-8 leading-relaxed text-on-surface-variant">{details}</p>
                  <Link href={project.slug === "projects" ? `/projects?lang=${language}` : `/projects/${project.slug}?lang=${language}`} className="group/btn flex items-center gap-2 font-bold text-primary">
                    {t("projects.viewDetails", "View Details")} <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>

                <div className={`relative aspect-video overflow-hidden rounded-3xl border border-white/5 bg-surface-container-high ${reverse ? "order-1 md:order-2" : ""}`}>
                  {project.coverImageUrl ? (
                    <Image
                      fill
                      sizes="(min-width: 768px) 44vw, 92vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:desaturate-[0.5]"
                      src={project.coverImageUrl}
                      alt={title}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm text-on-surface-variant">
                      {t("projects.noImage", "No cover image")}
                    </div>
                  )}
                </div>
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </section>
  );
}
