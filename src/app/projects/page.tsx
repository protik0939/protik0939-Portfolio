import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import ProjectFilters from "@/Components/ProjectFilters";
import SubpageTopBar from "@/Components/SubpageTopBar";
import { getPublishedProjects, getPublishedSkills, getSiteConfig, pickLocalized } from "@/lib/public-content";
import { resolveRequestLanguage } from "@/lib/request-language";

type ProjectsPageProps = {
  searchParams: Promise<{ lang?: string; tech?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: ProjectsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const siteConfig = await getSiteConfig();

  const projects = await getPublishedProjects();
  const firstImage = projects.find((project) => project.coverImageUrl)?.coverImageUrl ?? undefined;

  return {
    title: siteConfig
      ? `${pickLocalized(language, siteConfig.projectsSectionTitleEn, siteConfig.projectsSectionTitleBn)} | ${pickLocalized(language, siteConfig.siteTitleEn, siteConfig.siteTitleBn)}`
      : "Projects",
    description: siteConfig
      ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn)
      : "Project list",
    openGraph: {
      title: siteConfig
        ? `${pickLocalized(language, siteConfig.projectsSectionTitleEn, siteConfig.projectsSectionTitleBn)} | ${pickLocalized(language, siteConfig.siteTitleEn, siteConfig.siteTitleBn)}`
        : "Projects",
      description: siteConfig
        ? pickLocalized(language, siteConfig.siteDescriptionEn, siteConfig.siteDescriptionBn)
        : "Project list",
      type: "website",
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const language = await resolveRequestLanguage(params.lang);
  const selectedTechnology = (params.tech ?? "").trim();
  const query = (params.q ?? "").trim();
  const [projects, skills] = await Promise.all([getPublishedProjects(), getPublishedSkills()]);

  const parseTechnologies = (raw: string) =>
    raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

  const skillIconLookup = new Map<string, string>();
  for (const skill of skills) {
    if (!skill.logoUrl) {
      continue;
    }

    skillIconLookup.set(skill.nameEn.toLowerCase(), skill.logoUrl);
    skillIconLookup.set(skill.nameBn.toLowerCase(), skill.logoUrl);
  }

  const technologies: Array<{ name: string; iconUrl: string | null }> = [];
  const seenTechKeys = new Set<string>();

  for (const project of projects) {
    const stack = parseTechnologies(pickLocalized(language, project.technologiesEn, project.technologiesBn));

    for (const item of stack) {
      const key = item.toLowerCase();
      if (seenTechKeys.has(key)) {
        continue;
      }

      seenTechKeys.add(key);
      technologies.push({
        name: item,
        iconUrl: skillIconLookup.get(key) ?? null,
      });
    }
  }

  const sortedTechnologies = technologies.sort((left, right) =>
    left.name.localeCompare(right.name, language === "bn" ? "bn-BD" : "en-US", { sensitivity: "base" }),
  );

  const normalizedTechnology = selectedTechnology.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const title = pickLocalized(language, project.titleEn, project.titleBn);
    const type = pickLocalized(language, project.typeEn, project.typeBn);
    const details = pickLocalized(language, project.detailsEn, project.detailsBn);
    const category = pickLocalized(language, project.categoryEn, project.categoryBn);
    const stack = parseTechnologies(pickLocalized(language, project.technologiesEn, project.technologiesBn));

    const technologyMatched =
      normalizedTechnology.length === 0 || stack.some((item) => item.toLowerCase() === normalizedTechnology);

    if (!technologyMatched) {
      return false;
    }

    if (normalizedQuery.length === 0) {
      return true;
    }

    const searchableText = [title, type, details, category, ...stack].join(" ").toLowerCase();
    return searchableText.includes(normalizedQuery);
  });

  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-7xl">
        <SubpageTopBar language={language} />
        <section className="glass-panel mb-12 rounded-[2rem] border border-outline-variant/30 p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">Portfolio</p>
              <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">
                {language === "bn" ? "সব প্রজেক্ট" : "All Projects"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
                {language === "bn"
                  ? "প্রকাশিত প্রজেক্টগুলো সরাসরি CMS ডেটা থেকে দেখানো হচ্ছে।"
                  : "Published projects are loaded from the CMS with live details, stacks, and links."}
              </p>
            </div>

            <Link
              href={`/?lang=${language}`}
              className="inline-flex w-fit rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
            >
              {language === "bn" ? "হোমে ফিরুন" : "Back Home"}
            </Link>
          </div>
        </section>

        <ProjectFilters
          language={language}
          technologies={sortedTechnologies}
          initialTechnology={selectedTechnology}
          initialQuery={query}
        />

        <p className="mb-4 text-xs tracking-[0.14em] text-on-surface-variant uppercase">
          {language === "bn"
            ? `দেখাচ্ছে ${filteredProjects.length} / ${projects.length} টি প্রজেক্ট`
            : `Showing ${filteredProjects.length} of ${projects.length} projects`}
        </p>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const title = pickLocalized(language, project.titleEn, project.titleBn);
            const type = pickLocalized(language, project.typeEn, project.typeBn);
            const details = pickLocalized(language, project.detailsEn, project.detailsBn);
            const category = pickLocalized(language, project.categoryEn, project.categoryBn);
            const stack = pickLocalized(language, project.technologiesEn, project.technologiesBn)
              .split(",")
              .map((value) => value.trim())
              .filter((value) => value.length > 0)
              .slice(0, 3);

            return (
              <article key={project.id} className="glass-panel group flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/30 p-4">
                <div className="relative mb-4 h-48 overflow-hidden rounded-2xl bg-surface-container">
                  {project.coverImageUrl ? (
                    <Image
                      fill
                      sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 94vw"
                      src={project.coverImageUrl}
                      alt={title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-on-surface-variant">
                      {language === "bn" ? "কভার ইমেজ নেই" : "No cover image"}
                    </div>
                  )}

                  {project.logoUrl ? (
                    <div className="absolute top-3 right-3 rounded-xl border border-white/30 bg-black/35 p-2 shadow-lg backdrop-blur-sm">
                      <Image
                        src={project.logoUrl}
                        alt={`${title} logo`}
                        width={44}
                        height={44}
                        className="h-11 w-11 object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="mb-2 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{type || "Project"}</span>
                  <span>{project.level}</span>
                </div>

                <h2 className="mb-2 line-clamp-2 text-xl font-bold">{title}</h2>
                <p className="line-clamp-3 text-sm text-on-surface-variant">{details}</p>

                <p className="mt-3 text-xs text-on-surface-variant">{category}</p>

                {stack.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stack.map((item) => (
                      <span key={item} className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] tracking-wide text-on-surface-variant uppercase">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/projects/${project.slug}?lang=${language}`}
                    className="inline-flex w-fit rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
                  >
                    {language === "bn" ? "বিস্তারিত" : "Details"}
                  </Link>
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit rounded-full border border-secondary/40 px-4 py-2 text-xs font-semibold tracking-widest text-secondary uppercase transition hover:bg-secondary/10"
                    >
                      Live
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="glass-panel mt-6 rounded-3xl border border-outline-variant/30 p-8 text-center text-sm text-on-surface-variant">
            {language === "bn"
              ? "এই ফিল্টারে কোন প্রজেক্ট পাওয়া যায়নি।"
              : "No projects found for the selected filters."}
          </div>
        ) : null}
        </div>
      </main>
    </div>
  );
}
