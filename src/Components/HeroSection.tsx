"use client";

import Image from "next/image";
import { BookOpenText, BriefcaseBusiness, Code2, Languages } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";
import { calculateMonthsSince, formatExperienceDuration, toBengaliNumber } from "@/lib/experience";
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

type HeroOrbitSkill = {
  nameEn: string;
  nameBn: string;
  logoUrl?: string | null;
};

type HeroSectionProps = {
  siteConfig?: HeroSiteConfig | null;
  skills?: HeroOrbitSkill[];
  stats?: {
    projectsCompleted: number;
    skillsCount: number;
    languagesCount: number;
    blogsCount: number;
  };
};

function normalizeCvSource(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value || value === "#contact") {
    return null;
  }

  if (value.startsWith("data:")) {
    const commaIndex = value.indexOf(",");
    if (commaIndex < 0) {
      return value;
    }

    const prefix = value.slice(0, commaIndex + 1);
    const payload = value.slice(commaIndex + 1).replace(/\s+/g, "");
    return `${prefix}${payload}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  const compact = value.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/=]+$/.test(compact) && compact.length > 120) {
    const mimeType = compact.startsWith("JVBERi0") ? "application/pdf" : "application/octet-stream";
    return `data:${mimeType};base64,${compact}`;
  }

  return value;
}

export default function HeroSection({ siteConfig, skills, stats }: Readonly<HeroSectionProps>) {
  const { language, t } = useAppUI();
  const isBn = language === "bn";

  const formatNumber = (value: number) => (isBn ? toBengaliNumber(value) : String(value));

  const [showScrollCue, setShowScrollCue] = useState(true);

  useEffect(() => {
    const handleScroll = () => setShowScrollCue(window.scrollY < 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const experienceMonths = calculateMonthsSince(2026, 6);
  const experienceDuration = formatExperienceDuration(experienceMonths, isBn);
  const experienceSuffix = isBn ? "প্রফেশনাল অভিজ্ঞতা" : "of professional experience";

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
  const cvHref = normalizeCvSource(siteConfig?.cvUrl) ?? "#contact";
  const cvTarget = cvHref.startsWith("http") || cvHref.startsWith("data:") ? "_blank" : undefined;
  const isDataCv = cvHref.startsWith("data:");
  const cvFileName = "Md. Sadat Alam Protik - Full Stack Developer Resume";

  const handleCvDownload = useCallback(() => {
    if (!isDataCv) {
      return;
    }

    const commaIndex = cvHref.indexOf(",");
    if (commaIndex < 0) {
      return;
    }

    const metadata = cvHref.slice(0, commaIndex);
    const base64 = cvHref.slice(commaIndex + 1);
    const mimeMatch = /data:([^;]+);base64/i.exec(metadata);
    const mimeType = mimeMatch?.[1] ?? "application/octet-stream";

    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${cvFileName}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      globalThis.open(cvHref, "_blank", "noreferrer");
    }
  }, [cvFileName, cvHref, isDataCv]);
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
    ? `${formatNumber(heroStats[0].value)}+ প্রজেক্ট, ${formatNumber(heroStats[2].value)}+ ভাষা, ${formatNumber(heroStats[1].value)}+ দক্ষতা নিয়ে কাজ করি।`
    : `${heroStats[0].value}+ projects, ${heroStats[2].value}+ languages, and ${heroStats[1].value}+ production-ready skills.`;

  const orbitLogos = Array.from(
    new Set(
      (skills ?? [])
        .map((skill) => skill.logoUrl?.trim() ?? "")
        .filter((url) => url.length > 0),
    ),
  );

  const orbitRings = [
    { radius: 260, duration: 48, reverse: false, chip: 38, offset: 0 },
    { radius: 400, duration: 74, reverse: true, chip: 46, offset: 30 },
    { radius: 540, duration: 100, reverse: false, chip: 54, offset: 15 },
  ];
  const orbitPerRing = Math.max(1, Math.ceil(orbitLogos.length / orbitRings.length));


  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center min-[1260px]:items-stretch overflow-hidden px-8 min-[1260px]:px-20 pt-6 min-[1260px]:pt-8" id="home">
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute right-0 bottom-1/4 -mr-20 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 min-[1260px]:grid-cols-2">
        <AnimatedReveal className="z-10" delay={0.05}>
          <div data-reveal className="mx-auto flex w-full max-w-2xl flex-col justify-center min-[1260px]:h-full min-[1260px]:max-w-none">
            {/* Dynamic Highlighted Professional Experience Badge */}
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-on-surface shadow-[0_0_20px_rgba(60,221,199,0.18)] backdrop-blur-md transition-all hover:border-secondary/70 hover:shadow-[0_0_25px_rgba(60,221,199,0.3)]">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
              </span>
              <span>
                <strong className="font-extrabold text-secondary tracking-wide">{experienceDuration}</strong>{" "}
                <span className="text-on-surface font-medium">{experienceSuffix}</span>
              </span>
            </div>

            <span className="mb-4 block text-sm tracking-widest text-secondary uppercase">{heroBadge}</span>
            <h1 className="mb-5 font-headline text-6xl leading-[0.9] font-extrabold tracking-tighter lg:text-7xl min-[1260px]:text-8xl">
              {heroNameTop} <br />
              <span className="font-light text-on-surface-variant italic">{heroNameBottom}</span>
            </h1>
            <p className="mb-4 text-lg leading-relaxed text-on-surface-variant min-[1260px]:max-w-lg">{heroDescription}</p>
            <p className="mb-3 text-sm leading-relaxed text-on-surface-variant min-[1260px]:max-w-xl">{hiringSnapshot}</p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                className="rounded-full bg-linear-to-r from-primary to-primary-container px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(131,66,244,0.3)] transition-all hover:shadow-[0_0_30px_rgba(131,66,244,0.5)]"
                href="#projects"
              >
                {t("hero.primaryCta", "View Projects")}
              </Link>
              {isDataCv ? (
                <button
                  type="button"
                  onClick={handleCvDownload}
                  className="rounded-full border border-outline-variant/30 px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-container-highest"
                >
                  {t("hero.secondaryCta", "Download Resume")}
                </button>
              ) : (
                <Link
                  className="rounded-full border border-outline-variant/30 px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-container-highest"
                  href={cvHref}
                  target={cvTarget}
                  rel={cvTarget ? "noreferrer" : undefined}
                >
                  {t("hero.secondaryCta", "Download Resume")}
                </Link>
              )}
            </div>

            <div className="mt-5 flex gap-6">
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

            <div className="mt-7 grid grid-cols-2 gap-3 min-[1260px]:max-w-xl">
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
                    <p className="text-xl font-black tracking-tight text-on-surface">{formatNumber(item.value)}+</p>
                    <p className="text-[10px] tracking-[0.14em] text-on-surface-variant uppercase">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.2} className="h-full">
          <div className="group relative mx-auto mb-10 h-full w-full max-w-md min-[1260px]:mb-0 min-[1260px]:max-w-none" data-reveal>
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[90px] animate-[pulse_3.6s_ease-in-out_infinite]" />
            <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/20 blur-[70px] animate-[pulse_4.8s_ease-in-out_infinite]" />
            <div className="hero-image-veil relative z-10 h-full aspect-4/5 min-[1260px]:aspect-auto">
              <Image
                fill
                priority
                fetchPriority="high"
                quality={100}
                sizes="(min-width: 1260px) 50vw, (min-width: 1024px) 46vw, 90vw"
                className="pointer-events-none h-full w-full object-cover"
                src={heroImageUrl}
                alt="Developer portrait"
              />
            </div>

            {/* Cyclone of skill logos orbiting the portrait */}
            {orbitLogos.length > 0 ? (
              <div aria-hidden className="hero-tech-orbit">
                {orbitRings.map((ring, ringIndex) => {
                  const ringLogos = orbitLogos.slice(ringIndex * orbitPerRing, (ringIndex + 1) * orbitPerRing);
                  if (ringLogos.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={ringIndex}
                      className={`hero-tech-orbit__ring${ring.reverse ? " hero-tech-orbit__ring--reverse" : ""}`}
                      style={
                        {
                          "--orbit-duration": `${ring.duration}s`,
                          "--orbit-size": `${ring.chip}px`,
                        } as CSSProperties
                      }
                    >
                      {ringLogos.map((logo, index) => (
                        <div
                          key={`${ringIndex}-${index}`}
                          className="hero-tech-orbit__item"
                          style={
                            {
                              "--orbit-angle": `${ring.offset + (index / ringLogos.length) * 360}deg`,
                              "--orbit-radius": `${ring.radius}px`,
                            } as CSSProperties
                          }
                        >
                          <span className="hero-tech-orbit__icon">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logo} alt="" loading="lazy" decoding="async" fetchPriority="low" />
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Floating Dynamic Experience Highlight Tag */}
            <div className="glass-panel absolute right-4 bottom-8 z-10 flex items-center gap-2.5 rounded-xl border border-secondary/40 bg-surface/90 px-3.5 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <BriefcaseBusiness className="h-4 w-4 shrink-0 text-secondary" />
              <p className="text-xs font-bold text-on-surface">
                <span className="text-secondary font-extrabold">{experienceDuration}</span>{" "}
                <span>{isBn ? "অভিজ্ঞতা" : "Exp."}</span>
              </p>
            </div>
          </div>
        </AnimatedReveal>
      </div>

      {/* Scroll indicator — visible while at the top of the page */}
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 transition-all duration-500 ${
          showScrollCue ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-on-surface-variant/80 uppercase">
            {isBn ? "স্ক্রল করুন" : "Scroll"}
          </span>
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-outline-variant/50 bg-surface-container-low/40 p-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-[scroll-cue-dot_1.8s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
