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
                    },
                  ]
              ).map((item, index) => {
                const degree = language === "bn" ? item.degreeBn : item.degreeEn;
                const subject = language === "bn" ? item.subjectBn : item.subjectEn;
                const institution = language === "bn" ? item.institutionBn : item.institutionEn;
                const result = language === "bn" ? item.resultBn : item.resultEn;
                const details = language === "bn" ? item.detailsBn : item.detailsEn;

                return (
                  <div key={item.id} className="relative border-l-2 border-outline-variant/30 pl-8">
                    <div
                      className={`absolute top-0 -left-2.25 h-4 w-4 rounded-full ${
                        index === 0
                          ? "bg-primary shadow-[0_0_10px_rgba(175,136,255,0.5)]"
                          : "bg-outline"
                      }`}
                    />
                    {item.yearLabel ? <span className="mb-2 block text-sm text-on-surface-variant">{item.yearLabel}</span> : null}
                    <h4 className="mb-1 text-xl font-bold text-on-surface">{subject ? `${degree} (${subject})` : degree}</h4>
                    <p className="text-on-surface-variant">{institution}</p>
                    {result ? <p className="mt-1 text-sm text-on-surface-variant">{result}</p> : null}
                    {details ? <p className="mt-1 text-sm text-on-surface-variant">{details}</p> : null}
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
                    },
                  ]
              ).map((item, index) => {
                const title = language === "bn" ? item.titleBn : item.titleEn;
                const company = language === "bn" ? item.companyBn : item.companyEn;
                const period = language === "bn" ? item.periodBn : item.periodEn;
                const details = language === "bn" ? item.detailsBn : item.detailsEn;

                return (
                  <div key={item.id} className="group relative border-l-2 border-outline-variant/30 pl-8 transition-colors">
                    <div
                      className={`absolute top-0 -left-2.25 h-4 w-4 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                        index === 0
                          ? "bg-secondary shadow-[0_0_10px_rgba(60,221,199,0.5)]"
                          : "bg-outline group-hover:bg-secondary group-hover:shadow-[0_0_8px_rgba(60,221,199,0.4)]"
                      }`}
                    />
                    {period ? <span className="mb-2 block text-sm font-medium text-on-surface-variant">{period}</span> : null}

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
