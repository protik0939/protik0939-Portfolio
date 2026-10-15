"use client";

import AnimatedReveal from "@/Components/AnimatedReveal";
import { Briefcase, ExternalLink, GraduationCap } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type EducationItem = {
  id: string;
  degreeEn: string;
  degreeBn: string;
  subjectEn: string;
  subjectBn: string;
  yearLabel: string;
  resultEn: string;
  resultBn: string;
  institutionEn: string;
  institutionBn: string;
  detailsEn: string;
  detailsBn: string;
  imageUrl?: string | null;
  link?: string | null;
  isCurrent?: boolean | null;
};

type ExperienceItem = {
  id: string;
  titleEn: string;
  titleBn: string;
  companyEn: string;
  companyBn: string;
  periodEn: string;
  periodBn: string;
  detailsEn: string;
  detailsBn: string;
  imageUrl?: string | null;
  link?: string | null;
  isCurrent?: boolean | null;
};

type EducationExperienceSectionProps = {
  educations?: EducationItem[];
  experiences?: ExperienceItem[];
};

export default function EducationExperienceSection({ educations = [], experiences = [] }: Readonly<EducationExperienceSectionProps>) {
  const { language, t } = useAppUI();

  const visibleEducations = educations.slice(0, 4);
  const visibleExperiences = experiences.slice(0, 4);

  return (
    <section className="bg-surface-container-low px-8 py-32" id="education-experience">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-2">
        <AnimatedReveal delay={0.05}>
          <div data-reveal>
            <h2 className="mb-12 flex items-center gap-4 font-headline text-4xl font-bold">
              <GraduationCap className="h-9 w-9 text-primary" /> {t("sections.education", "Education")}
            </h2>
            <div className="space-y-12">
              {(visibleEducations.length > 0
                ? visibleEducations
                : [
                    {
                      id: "fallback-education",
                      degreeEn: "No education data yet",
                      degreeBn: "এখনও শিক্ষাগত তথ্য যোগ করা হয়নি",
                      subjectEn: "",
                      subjectBn: "",
                      yearLabel: "",
                      resultEn: "",
                      resultBn: "",
                      institutionEn: "Update from admin panel",
                      institutionBn: "অ্যাডমিন প্যানেল থেকে আপডেট করুন",
                      detailsEn: "",
                      detailsBn: "",
                      imageUrl: null,
                      link: null,
                      isCurrent: false,
                    },
                  ]
              ).map((item) => {
                const degree = language === "bn" ? item.degreeBn : item.degreeEn;
                const subject = language === "bn" ? item.subjectBn : item.subjectEn;
                const institution = language === "bn" ? item.institutionBn : item.institutionEn;
                const result = language === "bn" ? item.resultBn : item.resultEn;
                const details = language === "bn" ? item.detailsBn : item.detailsEn;
                const isStudyingCurrent = Boolean(item.isCurrent);
                const title = subject ? `${degree} (${subject})` : degree;

                return (
                  <div key={item.id} className="group relative border-l-2 border-outline-variant/30 pl-8 transition-colors">
                    {/* Status Dot: colored and glowing when currently studying, normal outline otherwise */}
                    <div
                      className={`absolute top-0 -left-2.25 h-4 w-4 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                        isStudyingCurrent
                          ? "bg-primary shadow-[0_0_12px_rgba(175,136,255,0.7)] animate-pulse"
                          : "bg-outline group-hover:bg-primary/60"
                      }`}
                    />

                    {/* Year Label + Currently Studying Badge */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {item.yearLabel ? <span className="text-sm font-medium text-on-surface-variant">{item.yearLabel}</span> : null}
                      {isStudyingCurrent ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          {language === "bn" ? "বর্তমান শিক্ষার্থী" : "Currently Studying"}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-start gap-3.5">
                      {item.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={institution || degree}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 text-xl font-bold text-on-surface">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-primary focus-visible:underline focus-visible:outline-none"
                              title={language === "bn" ? "নতুন ট্যাবে ওয়েবসাইট দেখুন" : "Visit website in new tab"}
                            >
                              <span className="transition-colors duration-200 hover:text-primary">{title}</span>
                              <ExternalLink className="h-4 w-4 shrink-0 opacity-60 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100 group-hover/link:text-primary" />
                            </a>
                          ) : (
                            <span className="transition-colors duration-200 hover:text-primary cursor-default">
                              {title}
                            </span>
                          )}
                        </h4>
                        <p className="text-on-surface-variant font-medium">{institution}</p>
                        {result ? <p className="mt-1 text-sm text-on-surface-variant">{result}</p> : null}
                      </div>
                    </div>

                    {details ? <p className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{details}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.12}>
          <div data-reveal>
            <h2 className="mb-12 flex items-center gap-4 font-headline text-4xl font-bold">
              <Briefcase className="h-9 w-9 text-secondary" /> {t("sections.experience", "Experience")}
            </h2>
            <div className="space-y-12">
              {(visibleExperiences.length > 0
                ? visibleExperiences
                : [
                    {
                      id: "fallback-experience",
                      titleEn: "No experience data yet",
                      titleBn: "এখনও অভিজ্ঞতার তথ্য যোগ করা হয়নি",
                      companyEn: "Update from admin panel",
                      companyBn: "অ্যাডমিন প্যানেল থেকে আপডেট করুন",
                      periodEn: "",
                      periodBn: "",
                      detailsEn: "",
                      detailsBn: "",
                      imageUrl: null,
                      link: null,
                      isCurrent: false,
                    },
                  ]
              ).map((item) => {
                const title = language === "bn" ? item.titleBn : item.titleEn;
                const company = language === "bn" ? item.companyBn : item.companyEn;
                const period = language === "bn" ? item.periodBn : item.periodEn;
                const details = language === "bn" ? item.detailsBn : item.detailsEn;
                const isWorkingCurrent = Boolean(item.isCurrent);

                return (
                  <div key={item.id} className="group relative border-l-2 border-outline-variant/30 pl-8 transition-colors">
                    {/* Status Dot: colored and glowing when currently working, normal outline otherwise */}
                    <div
                      className={`absolute top-0 -left-2.25 h-4 w-4 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                        isWorkingCurrent
                          ? "bg-secondary shadow-[0_0_12px_rgba(60,221,199,0.7)] animate-pulse"
                          : "bg-outline group-hover:bg-secondary group-hover:shadow-[0_0_8px_rgba(60,221,199,0.4)]"
                      }`}
                    />

                    {/* Period + Currently Working Badge */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {period ? <span className="text-sm font-medium text-on-surface-variant">{period}</span> : null}
                      {isWorkingCurrent ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                          {language === "bn" ? "বর্তমান কর্মস্থল" : "Currently Working"}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-start gap-3.5">
                      {item.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:border-secondary/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={company || title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 text-xl font-bold text-on-surface">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-secondary focus-visible:underline focus-visible:outline-none"
                              title={language === "bn" ? "নতুন ট্যাবে ওয়েবসাইট দেখুন" : "Visit website in new tab"}
                            >
                              <span className="transition-colors duration-200 hover:text-secondary">{title}</span>
                              <ExternalLink className="h-4 w-4 shrink-0 opacity-60 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100 group-hover/link:text-secondary" />
                            </a>
                          ) : (
                            <span className="transition-colors duration-200 hover:text-secondary cursor-default">
                              {title}
                            </span>
                          )}
                        </h4>
                        <p className="text-on-surface-variant font-medium">{company}</p>
                      </div>
                    </div>

                    {details ? <p className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{details}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
