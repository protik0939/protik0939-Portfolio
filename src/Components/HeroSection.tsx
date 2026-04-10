"use client";

import Image from "next/image";
import { BookOpenText, BriefcaseBusiness, Code2, Languages } from "lucide-react";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";
import Link from "next/link";
import { SlSocialGithub, SlSocialLinkedin } from "react-icons/sl";
import { FaXTwitter } from "react-icons/fa6";

type HeroSiteConfig = {
  heroHelloEn: string;
  heroHelloBn: string;
  heroIamEn: string;
  heroIamBn: string;
  heroFirstNameEn: string;
  heroFirstNameBn: string;
  heroLastNameEn: string;
  heroLastNameBn: string;
  heroDescriptionEn: string;
  heroDescriptionBn: string;
  heroImageUrl: string | null;
  cvUrl: string | null;
};

type HeroSectionProps = {
  siteConfig?: HeroSiteConfig | null;
  stats?: {
    projectsCompleted: number;
    skillsCount: number;
    languagesCount: number;
    blogsCount: number;
  };
};

export default function HeroSection({ siteConfig, stats }: Readonly<HeroSectionProps>) {
  const { language, t } = useAppUI();
  const isBn = language === "bn";

  const heroHello = siteConfig ? (isBn ? siteConfig.heroHelloBn : siteConfig.heroHelloEn) : t("hero.based", "Based in San Francisco");
  const heroIam = siteConfig ? (isBn ? siteConfig.heroIamBn : siteConfig.heroIamEn) : isBn ? "আমি" : "I am";
  const heroNameTop = siteConfig ? (isBn ? siteConfig.heroFirstNameBn : siteConfig.heroFirstNameEn) : t("hero.title.top", "Full Stack");
  const heroNameBottom = siteConfig ? (isBn ? siteConfig.heroLastNameBn : siteConfig.heroLastNameEn) : t("hero.title.bottom", "Developer");
  const heroDescriptionRaw = siteConfig
    ? isBn
      ? siteConfig.heroDescriptionBn
      : siteConfig.heroDescriptionEn
    : t(
        "hero.description",
        "Crafting high-performance digital experiences with a focus on clean architecture and immersive UI/UX design.",
      );

  const normalizedDescription = heroDescriptionRaw.trim().toLowerCase();
  const isPlaceholderDescription =
    normalizedDescription.length < 18 ||
    ["read more", "readmore", "more", "test", "n/a", "na", "details", "আরও পড়ুন", "বিস্তারিত", "রিড মোর"].includes(normalizedDescription);

  const heroDescription = isPlaceholderDescription
    ? isBn
      ? "স্কেলেবল, দ্রুত এবং ব্যবহারকারী-কেন্দ্রিক ওয়েব সলিউশন তৈরি করি, যেখানে পরিষ্কার আর্কিটেকচার ও বাস্তবসম্মত সমস্যা সমাধানকে সর্বোচ্চ গুরুত্ব দিই।"
      : "I build scalable, high-performance web products focused on clean architecture, business impact, and delightful user experience."
    : heroDescriptionRaw;

  const heroBadge = `${heroHello}${heroIam ? ` • ${heroIam}` : ""}`;
  const heroImageUrl = siteConfig?.heroImageUrl?.trim()
    ? siteConfig.heroImageUrl
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuC1NiI6GYG8-JemI0BPPrJsRqw4YeIJA50jWLCUPLndXzbpP4-VcjPWYvOohYtXMlJuwI2lw9KG3oCT74RKpJUrnnnY-5NaYi_PQIrZqqzcxl3SfveEHG7pGw7aHzKgVFKsFpwfRrY7UkjFuT15-p4oSRFBvxM9ud81WmBaCqtHv8TVVItOGc_zWOBFCxfvx4fW0h8HIMz2UgHz1d6uM0VSGvKtWJKJ7tSFtPg5m2R7e4EVaUAN3BbQ2RjlzTwsA69joQ2dr4MbDSK8";
  const cvHref = siteConfig?.cvUrl && siteConfig.cvUrl.trim() ? siteConfig.cvUrl : "#contact";
  const cvTarget = cvHref.startsWith("http") || cvHref.startsWith("data:") ? "_blank" : undefined;
  const heroStats = [
    {
      id: "projects",
      icon: BriefcaseBusiness,
      value: stats?.projectsCompleted ?? 0,
      label: isBn ? "প্রজেক্ট সম্পন্ন" : "Projects Completed",
    },
    {
      id: "skills",
      icon: Code2,
      value: stats?.skillsCount ?? 0,
      label: isBn ? "দক্ষতা" : "Skills",
    },
    {
      id: "languages",
      icon: Languages,
      value: stats?.languagesCount ?? 0,
      label: isBn ? "প্রোগ্রামিং ভাষা" : "Programming Languages",
    },
    {
      id: "blogs",
      icon: BookOpenText,
      value: stats?.blogsCount ?? 0,
      label: isBn ? "প্রকাশিত ব্লগ" : "Published Blogs",
    },
  ];
  const hiringSnapshot = isBn
    ? `রিয়েল ডেটা অনুযায়ী ${heroStats[0].value}+ প্রজেক্ট, ${heroStats[2].value}+ ভাষা, ${heroStats[1].value}+ দক্ষতা নিয়ে কাজ করি।`
    : `Backed by live data: ${heroStats[0].value}+ projects, ${heroStats[2].value}+ languages, and ${heroStats[1].value}+ production-ready skills.`;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-8 md:px-20 sm:pt-0 pt-6" id="home">
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute right-0 bottom-1/4 -mr-20 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <AnimatedReveal className="z-10" delay={0.05}>
          <div data-reveal>
            <span className="mb-4 block text-sm tracking-widest text-secondary uppercase">{heroBadge}</span>
            <h1 className="mb-6 font-headline text-6xl leading-[0.9] font-extrabold tracking-tighter md:text-8xl">
              {heroNameTop} <br />
              <span className="font-light text-on-surface-variant italic">{heroNameBottom}</span>
            </h1>
            <p className="mb-6 max-w-lg text-lg leading-relaxed text-on-surface-variant">{heroDescription}</p>
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-on-surface-variant">{hiringSnapshot}</p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                className="rounded-full bg-linear-to-r from-primary to-primary-container px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(131,66,244,0.3)] transition-all hover:shadow-[0_0_30px_rgba(131,66,244,0.5)]"
                href="#projects"
              >
                {t("hero.primaryCta", "View Projects")}
              </Link>
              <Link
                className="rounded-full border border-outline-variant/30 px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-container-highest"
                href={cvHref}
                target={cvTarget}
                rel={cvTarget ? "noreferrer" : undefined}
              >
                {t("hero.secondaryCta", "Download Resume")}
              </Link>
            </div>

            <div className="mt-6 flex gap-6">
              <Link
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-surface-container-low text-on-surface-variant transition-all hover:border-primary/50 hover:text-primary"
                href="https://github.com/protik0939"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <SlSocialGithub className="h-5 w-5" />
              </Link>
              <Link
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-surface-container-low text-on-surface-variant transition-all hover:border-secondary/50 hover:text-secondary"
                href="https://www.linkedin.com/in/protik0939/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <SlSocialLinkedin className="h-5 w-5" />
              </Link>
              <Link
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-surface-container-low text-on-surface-variant transition-all hover:border-primary/50 hover:text-primary"
                href="https://x.com/protik0939"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FaXTwitter className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 lg:max-w-xl">
              {heroStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl border border-outline-variant/30 px-4 py-3"
                  >
                    <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black tracking-tight text-on-surface">{item.value}+</p>
                    <p className="text-[10px] tracking-[0.14em] text-on-surface-variant uppercase">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.2}>
          <div className="group relative" data-reveal>
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[90px] animate-[pulse_3.6s_ease-in-out_infinite]" />
            <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/20 blur-[70px] animate-[pulse_4.8s_ease-in-out_infinite]" />
            <div className="glass-panel relative aspect-4/5 overflow-hidden rounded-3xl p-4 mb-10">
              <Image
                fill
                priority
                sizes="(min-width: 1024px) 36vw, 88vw"
                className="h-full w-full rounded-2xl object-cover"
                src={heroImageUrl}
                alt="Developer portrait"
              />
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
