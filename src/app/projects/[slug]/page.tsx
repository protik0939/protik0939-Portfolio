import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import SubpageTopBar from "@/Components/SubpageTopBar";
import {
  getPublishedProjectBySlug,
  getPublishedSkills,
  getPublishedTeamMembersByCodes,
  pickLocalized,
} from "@/lib/public-content";
import { resolveRequestLanguage } from "@/lib/request-language";

type ProjectDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: ProjectDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const language = await resolveRequestLanguage(query.lang);
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  const title = pickLocalized(language, project.titleEn, project.titleBn);
  const description = pickLocalized(language, project.detailsEn, project.detailsBn).slice(0, 160);
  const keywords = pickLocalized(language, project.technologiesEn, project.technologiesBn)
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: project.coverImageUrl ? [{ url: project.coverImageUrl }] : [],
      locale: language === "bn" ? "bn_BD" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.coverImageUrl ? [project.coverImageUrl] : [],
    },
  };
}

export default async function ProjectDetailsPage({ params, searchParams }: ProjectDetailsPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const language = await resolveRequestLanguage(query.lang);
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [skills, teamMembers] = await Promise.all([
    getPublishedSkills(),
    getPublishedTeamMembersByCodes(project.memberCodes),
  ]);

  const title = pickLocalized(language, project.titleEn, project.titleBn);
  const details = pickLocalized(language, project.detailsEn, project.detailsBn);
  const category = pickLocalized(language, project.categoryEn, project.categoryBn);
  const type = pickLocalized(language, project.typeEn, project.typeBn);
  const stacks = pickLocalized(language, project.technologiesEn, project.technologiesBn)
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const stackIconLookup = new Map<string, string>();
  for (const skill of skills) {
    if (!skill.logoUrl) {
      continue;
    }

    stackIconLookup.set(skill.nameEn.toLowerCase(), skill.logoUrl);
    stackIconLookup.set(skill.nameBn.toLowerCase(), skill.logoUrl);
  }

  const stackItems = stacks.map((name) => ({
    name,
    iconUrl: stackIconLookup.get(name.toLowerCase()) ?? null,
  }));

  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SubpageTopBar language={language} />
          <div className="mb-8 flex items-center justify-between">
            <Link href={`/projects?lang=${language}`} className="inline-flex rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10">
              {language === "bn" ? "সব প্রজেক্ট" : "All Projects"}
            </Link>
          </div>

          <article className="glass-panel overflow-hidden rounded-[2rem] border border-outline-variant/30">
            {project.coverImageUrl ? (
              <div className="relative h-64 w-full sm:h-80 lg:h-[26rem]">
                <Image
                  fill
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  src={project.coverImageUrl}
                  alt={title}
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            <div className="p-6 sm:p-10">
              <p className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">Case Study</p>
              <div className="mt-4 rounded-2xl py-4">
                {project.logoUrl ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-outline-variant/40 bg-white/90 p-2">
                      <Image
                        src={project.logoUrl}
                        alt={`${title} logo`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <p>{language === "bn" ? "লোগো পাওয়া যায়নি।" : "Logo is not available."}</p>
                )}
              </div>
              <h1 className="font-headline text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                <span>{type || "Project"}</span>
                <span>{project.level}</span>
                <span>{category}</span>
              </div>

              <div className="mt-8 whitespace-pre-line leading-relaxed text-on-surface-variant">{details}</div>

              {stackItems.length > 0 ? (
                <section className="mt-8">
                  <h2 className="mb-3 text-lg font-bold">{language === "bn" ? "টেক স্ট্যাক" : "Tech Stack"}</h2>
                  <div className="flex flex-wrap gap-2">
                    {stackItems.map((stack) => (
                      <span key={stack.name} className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1.5 text-[11px] tracking-wide text-on-surface-variant">
                        {stack.iconUrl ? (
                          <Image
                            src={stack.iconUrl}
                            alt={`${stack.name} icon`}
                            width={16}
                            height={16}
                            className="h-4 w-4 rounded object-cover"
                          />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-primary/70" />
                        )}
                        <span>{stack.name}</span>
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {teamMembers.length > 0 ? (
                <section className="mt-10">
                  <h2 className="mb-4 text-lg font-bold">{language === "bn" ? "টিম মেম্বারস" : "Team Members"}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {teamMembers.map((member) => {
                      const memberName = pickLocalized(language, member.nameEn, member.nameBn);

                      return (
                        <a
                          key={member.memberCode}
                          href={member.portfolioUrl ?? "#"}
                          target={member.portfolioUrl ? "_blank" : undefined}
                          rel={member.portfolioUrl ? "noreferrer" : undefined}
                          className={`flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3 transition ${member.portfolioUrl ? "hover:border-primary/60 hover:bg-surface-container-high" : "pointer-events-none opacity-80"}`}
                        >
                          {member.imageUrl ? (
                            <Image
                              src={member.imageUrl}
                              alt={memberName}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-container-high text-xs text-on-surface-variant">
                              {memberName.slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">{memberName}</p>
                            <p className="text-xs text-on-surface-variant">
                              {member.portfolioUrl ? (language === "bn" ? "পোর্টফোলিও দেখুন" : "Open portfolio") : (language === "bn" ? "পোর্টফোলিও নেই" : "No portfolio link")}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold tracking-widest text-primary uppercase transition hover:bg-primary/10"
                  >
                    {language === "bn" ? "লাইভ প্রজেক্ট" : "Live Project"}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
