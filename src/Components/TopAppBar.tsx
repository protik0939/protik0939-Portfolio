"use client";

import Link from "next/link";
import { ChevronDown, FileText, Languages, MoonStar, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppUI } from "@/Components/AppUIProvider";

type TopBarSiteConfig = {
  siteTitleEn: string;
  siteTitleBn: string;
  navHomeEn: string;
  navHomeBn: string;
  navAboutEn: string;
  navAboutBn: string;
  navSkillsEn: string;
  navSkillsBn: string;
  navProjectsEn: string;
  navProjectsBn: string;
  navContactEn: string;
  navContactBn: string;
  navCvEn: string;
  navCvBn: string;
  cvUrl: string | null;
};

type TopAppBarProps = {
  siteConfig?: TopBarSiteConfig | null;
};

type TopNavItem = {
  href: string;
  label: string;
  sectionId: string;
};

export default function TopAppBar({ siteConfig }: Readonly<TopAppBarProps>) {
  const { language, theme, t, toggleLanguage, toggleTheme } = useAppUI();
  const [activeSectionId, setActiveSectionId] = useState("home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownCloseTimer = useRef<number | null>(null);

  const isBn = language === "bn";
  const brandLabel = siteConfig ? (isBn ? siteConfig.siteTitleBn : siteConfig.siteTitleEn) : t("brand", "DevPortfolio");
  const homeLabel = siteConfig ? (isBn ? siteConfig.navHomeBn : siteConfig.navHomeEn) : t("nav.home", "Home");
  const aboutLabel = siteConfig ? (isBn ? siteConfig.navAboutBn : siteConfig.navAboutEn) : t("nav.about", "About");
  const skillsLabel = siteConfig ? (isBn ? siteConfig.navSkillsBn : siteConfig.navSkillsEn) : t("nav.skills", "Skills");
  const educationExperienceLabel = isBn ? "শিক্ষা ও অভিজ্ঞতা" : "Education & Experience";
  const projectsLabel = siteConfig ? (isBn ? siteConfig.navProjectsBn : siteConfig.navProjectsEn) : t("nav.projects", "Projects");
  const blogsLabel = isBn ? "ব্লগ" : "Blogs";
  const githubLabel = isBn ? "গিটহাব" : "GitHub";
  const problemSolvingLabel = isBn ? "সমস্যা সমাধান" : "Problem Solving";
  const expertiseLabel = isBn ? "দক্ষতা" : "Expertise";
  const careerLabel = isBn ? "ক্যারিয়ার" : "Career";
  const contactLabel = siteConfig ? (isBn ? siteConfig.navContactBn : siteConfig.navContactEn) : t("nav.contact", "Contact");
  const cvLabel = siteConfig ? (isBn ? siteConfig.navCvBn : siteConfig.navCvEn) : t("nav.resume", "CV");
  const cvRoute = `/cv?lang=${language}`;

  const clearDropdownTimer = useCallback(() => {
    if (!dropdownCloseTimer.current) {
      return;
    }
    window.clearTimeout(dropdownCloseTimer.current);
    dropdownCloseTimer.current = null;
  }, []);

  const scheduleDropdownClose = useCallback(() => {
    clearDropdownTimer();
    dropdownCloseTimer.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 160);
  }, [clearDropdownTimer]);

  const navPrimaryItems = useMemo<TopNavItem[]>(
    () => [
      { href: "#home", label: homeLabel, sectionId: "home" },
      { href: "#about", label: aboutLabel, sectionId: "about" },
      { href: "#blogs", label: blogsLabel, sectionId: "blogs" },
      { href: "#contact", label: contactLabel, sectionId: "contact" },
    ],
    [aboutLabel, blogsLabel, contactLabel, homeLabel],
  );

  const expertiseItems = useMemo<TopNavItem[]>(
    () => [
      { href: "#skills", label: skillsLabel, sectionId: "skills" },
      { href: "#problem-solving", label: problemSolvingLabel, sectionId: "problem-solving" },
      { href: "#github-contribution", label: githubLabel, sectionId: "github-contribution" },
    ],
    [githubLabel, problemSolvingLabel, skillsLabel],
  );

  const careerItems = useMemo<TopNavItem[]>(
    () => [
      { href: "#education-experience", label: educationExperienceLabel, sectionId: "education-experience" },
      { href: "#projects", label: projectsLabel, sectionId: "projects" },
    ],
    [educationExperienceLabel, projectsLabel],
  );

  const navItems = useMemo<TopNavItem[]>(
    () => [
      { href: "#home", label: homeLabel, sectionId: "home" },
      { href: "#about", label: aboutLabel, sectionId: "about" },
      ...expertiseItems,
      ...careerItems,
      { href: "#blogs", label: blogsLabel, sectionId: "blogs" },
      { href: "#contact", label: contactLabel, sectionId: "contact" },
    ],
    [aboutLabel, blogsLabel, careerItems, contactLabel, expertiseItems, homeLabel],
  );

  const isExpertiseActive = expertiseItems.some((item) => item.sectionId === activeSectionId);
  const isCareerActive = careerItems.some((item) => item.sectionId === activeSectionId);

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = globalThis.scrollY + 140;
      let nextActive = navItems[0]?.sectionId ?? "home";

      for (const item of navItems) {
        const section = document.getElementById(item.sectionId);
        if (!section) {
          continue;
        }

        if (section.offsetTop <= scrollPosition) {
          nextActive = item.sectionId;
        }
      }

      setActiveSectionId(nextActive);
    };

    updateActiveSection();

    globalThis.addEventListener("scroll", updateActiveSection, { passive: true });
    globalThis.addEventListener("resize", updateActiveSection);

    return () => {
      globalThis.removeEventListener("scroll", updateActiveSection);
      globalThis.removeEventListener("resize", updateActiveSection);
    };
  }, [navItems]);

  useEffect(() => () => clearDropdownTimer(), [clearDropdownTimer]);

  return (
    <>
      <header className="fixed top-0 z-50 h-20 w-full border-b border-outline-variant/30 bg-linear-to-b from-background/85 to-background/35 px-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] backdrop-blur-lg sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
          <div className="max-w-44 truncate font-headline text-lg font-black tracking-tighter text-on-surface sm:max-w-none sm:text-xl">
            {brandLabel}
          </div>

          <nav className="custom-scrollbar relative hidden max-w-[60vw] items-center gap-1 overflow-visible rounded-full border border-outline-variant/40 bg-surface-container-low/80 p-1 font-headline text-sm font-medium tracking-tight lg:flex">
            {navPrimaryItems.slice(0, 2).map((item) => (
              <a
                key={item.href}
                onClick={() => {
                  setActiveSectionId(item.sectionId);
                  setOpenDropdown(null);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-all duration-200 active:scale-95 ${
                  activeSectionId === item.sectionId
                    ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(175,136,255,0.45)]"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
                href={item.href}
              >
                {item.label}
              </a>
            ))}

            <div
              className="relative"
              onMouseEnter={() => {
                clearDropdownTimer();
                setOpenDropdown("expertise");
              }}
              onMouseLeave={scheduleDropdownClose}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${openDropdown === "expertise" || isExpertiseActive ? "is-active" : ""}`}
                aria-haspopup="true"
                aria-expanded={openDropdown === "expertise"}
              >
                {expertiseLabel}
                <ChevronDown className="nav-dropdown-caret h-3.5 w-3.5" />
              </button>
              <div className="nav-dropdown-panel" data-state={openDropdown === "expertise" ? "open" : "closed"}>
                {expertiseItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setActiveSectionId(item.sectionId);
                      setOpenDropdown(null);
                    }}
                    className={`nav-dropdown-item ${
                      activeSectionId === item.sectionId ? "is-active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => {
                clearDropdownTimer();
                setOpenDropdown("career");
              }}
              onMouseLeave={scheduleDropdownClose}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${openDropdown === "career" || isCareerActive ? "is-active" : ""}`}
                aria-haspopup="true"
                aria-expanded={openDropdown === "career"}
              >
                {careerLabel}
                <ChevronDown className="nav-dropdown-caret h-3.5 w-3.5" />
              </button>
              <div className="nav-dropdown-panel" data-state={openDropdown === "career" ? "open" : "closed"}>
                {careerItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setActiveSectionId(item.sectionId);
                      setOpenDropdown(null);
                    }}
                    className={`nav-dropdown-item ${
                      activeSectionId === item.sectionId ? "is-active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {navPrimaryItems.slice(2).map((item) => (
              <a
                key={item.href}
                onClick={() => {
                  setActiveSectionId(item.sectionId);
                  setOpenDropdown(null);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-all duration-200 active:scale-95 ${
                  activeSectionId === item.sectionId
                    ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(175,136,255,0.45)]"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t("nav.language", "Language")}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-outline-variant/50 bg-surface-container-low px-2 text-xs font-semibold text-on-surface transition-colors hover:border-primary/50 sm:gap-2 sm:px-3"
            >
              <Languages className="h-4 w-4" />
              {language.toUpperCase()}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("nav.theme", "Theme")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-low text-on-surface transition-colors hover:border-primary/50"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>

            <Link
              href={cvRoute}
              className="hidden items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-medium text-on-primary-container transition-all duration-200 hover:brightness-110 active:scale-95 sm:inline-flex"
            >
              <FileText className="h-4 w-4" />
              {cvLabel}
            </Link>
          </div>
        </div>

      </header>
    </>
  );
}
