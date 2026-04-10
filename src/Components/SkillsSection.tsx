"use client";

import Image from "next/image";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { Database, Layers3, Wrench } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type SkillItem = {
  id: string;
  categoryKey: string;
  categoryTitleEn: string;
  categoryTitleBn: string;
  nameEn: string;
  nameBn: string;
  percentage: number;
  logoUrl?: string | null;
};

type SkillsSectionProps = {
  skills?: SkillItem[];
};

export default function SkillsSection({ skills = [] }: Readonly<SkillsSectionProps>) {
  const { language, t } = useAppUI();

  const grouped = skills.reduce<Record<string, SkillItem[]>>((accumulator, skill) => {
    if (!accumulator[skill.categoryKey]) {
      accumulator[skill.categoryKey] = [];
    }

    accumulator[skill.categoryKey].push(skill);
    return accumulator;
  }, {});

  const groups = Object.entries(grouped).map(([categoryKey, items]) => {
    const title = language === "bn" ? items[0]?.categoryTitleBn : items[0]?.categoryTitleEn;
    return {
      key: categoryKey,
      title: title || categoryKey,
      items: items,
    };
  });

  const iconSet = [Layers3, Database, Wrench];
  const accentSet = [
    { icon: "text-secondary", dot: "bg-secondary", border: "hover:border-secondary/20", glow: "bg-secondary/10 group-hover:bg-secondary/20" },
    { icon: "text-primary", dot: "bg-primary", border: "hover:border-primary/20", glow: "bg-primary/10 group-hover:bg-primary/20" },
    { icon: "text-tertiary", dot: "bg-tertiary", border: "hover:border-tertiary/20", glow: "bg-tertiary/10 group-hover:bg-tertiary/20" },
  ];

  const renderGroups = groups.length > 0 ? groups : [
    {
      key: "fallback",
      title: t("skills.tools", "Tools"),
      items: [
        {
          id: "fallback-1",
          categoryKey: "fallback",
          categoryTitleEn: "",
          categoryTitleBn: "",
          nameEn: "No skills data yet",
          nameBn: "এখনও কোনো স্কিলস ডেটা নেই",
          percentage: 0,
          logoUrl: null,
        },
      ],
    },
  ];

  return (
    <section className="px-8 py-32" id="skills">
      <AnimatedReveal className="mx-auto mb-20 max-w-7xl text-center" delay={0.05}>
        <div data-reveal>
          <h2 className="mb-4 font-headline text-4xl font-bold tracking-[0.2em] uppercase">{t("sections.masteredStack", "Mastered Stack")}</h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-primary to-secondary" />
        </div>
      </AnimatedReveal>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-3">
        {renderGroups.map((group, index) => {
          const Icon = iconSet[index % iconSet.length];
          const accent = accentSet[index % accentSet.length];

          return (
            <AnimatedReveal key={group.key} className="h-full" delay={0.08 + index * 0.06}>
              <div className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-surface-container-low p-8 transition-all ${accent.border}`} data-reveal>
                <div className={`absolute top-0 right-0 h-32 w-32 blur-[50px] transition-all ${accent.glow}`} />
                <Icon className={`mb-6 block h-10 w-10 transition-transform group-hover:scale-110 ${accent.icon}`} />
                <h3 className="mb-6 text-2xl font-bold">{group.title}</h3>
                <ul className="space-y-4 text-on-surface-variant">
                  {group.items.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        {skill.logoUrl ? (
                          <Image
                            width={20}
                            height={20}
                            className="h-5 w-5 rounded object-cover"
                            src={skill.logoUrl}
                            alt={language === "bn" ? skill.nameBn : skill.nameEn}
                          />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                        )}
                        {language === "bn" ? skill.nameBn : skill.nameEn}
                      </span>
                      <span className="text-xs text-on-surface">{skill.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </section>
  );
}
