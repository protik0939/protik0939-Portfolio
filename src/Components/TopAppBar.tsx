"use client";

import { ChevronDown, Download, Languages, Menu, MoonStar, Sun, X } from "lucide-react";
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

export default function TopAppBar({ siteConfig }: Readonly<TopAppBarProps>) {
  const { language, theme, t, toggleLanguage, toggleTheme } = useAppUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const cvLabel = siteConfig ? (isBn ? siteConfig.navCvBn : siteConfig.navCvEn) : t("nav.downloadResume", "Download Resume");
  const cvHref = useMemo(() => normalizeCvSource(siteConfig?.cvUrl), [siteConfig?.cvUrl]);
  const hasCvDocument = Boolean(cvHref);
  const cvFileName = "Md. Sadat Alam Protik - Full Stack Developer Resume";
  const isPdfDocument = (cvHref ?? "").startsWith("data:application/pdf") || /\.pdf(\?|$)/i.test(cvHref ?? "");
  const isDataCv = (cvHref ?? "").startsWith("data:");

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

  const handleCvDownload = useCallback(() => {
    if (!cvHref) {
      return;
    }

    if (!isDataCv) {
      globalThis.open(cvHref, "_blank", "noreferrer");
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

  useEffect(() => {
    if (!isCvModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCvModalOpen]);

  const navPrimaryItems = useMemo<TopNavItem[]>(() => [
    { href: "#home", label: homeLabel, sectionId: "home" },
    { href: "#about", label: aboutLabel, sectionId: "about" },
    { href: "#blogs", label: blogsLabel, sectionId: "blogs" },
    { href: "#contact", label: contactLabel, sectionId: "contact" },
  ], [aboutLabel, blogsLabel, contactLabel, homeLabel]);

  const expertiseItems = useMemo<TopNavItem[]>(() => [
    { href: "#skills", label: skillsLabel, sectionId: "skills" },
    { href: "#problem-solving", label: problemSolvingLabel, sectionId: "problem-solving" },
    { href: "#github-contribution", label: githubLabel, sectionId: "github-contribution" },
  ], [githubLabel, problemSolvingLabel, skillsLabel]);

  const careerItems = useMemo<TopNavItem[]>(() => [
    { href: "#education-experience", label: educationExperienceLabel, sectionId: "education-experience" },
    { href: "#projects", label: projectsLabel, sectionId: "projects" },
  ], [educationExperienceLabel, projectsLabel]);

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

  const openCvModal = () => {
    if (!hasCvDocument) {
      globalThis.location.hash = "#contact";
      setIsMobileMenuOpen(false);
      return;
    }

    setIsCvModalOpen(true);
    setIsMobileMenuOpen(false);
  };

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

            <button
              type="button"
              onClick={openCvModal}
              className="hidden rounded-full bg-primary-container px-5 py-2.5 text-sm font-medium text-on-primary-container transition-all duration-200 hover:brightness-110 active:scale-95 sm:inline-flex"
            >
              {cvLabel}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-label={t("nav.menu", "Menu")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-low text-on-surface transition-colors hover:border-primary/50 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="absolute top-full right-4 left-4 mt-3 rounded-2xl border border-outline-variant/30 bg-surface-container p-3 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setActiveSectionId(item.sectionId);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    activeSectionId === item.sectionId
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={openCvModal}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container"
              >
                {cvLabel}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      {isCvModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/75 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={t("nav.cvPreview", "CV Preview")}>
          <div className="glass-panel mx-auto flex h-full max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-outline-variant/30">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3 sm:px-6">
              <h2 className="font-headline text-lg font-bold text-on-surface">{t("nav.cvPreview", "CV Preview")}</h2>
              <button
                type="button"
                onClick={() => setIsCvModalOpen(false)}
                aria-label={t("nav.close", "Close")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/50 text-on-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-surface-container-low">
              {cvHref ? (
                isPdfDocument ? (
                  <object data={cvHref} type="application/pdf" className="h-full w-full">
                    <div className="grid h-full place-items-center p-6 text-center">
                      <div>
                        <p className="mb-3 text-sm text-on-surface-variant">{t("nav.cvPreviewUnavailable", "CV preview is unavailable in this browser.")}</p>
                        <a
                          href={cvHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
                        >
                          <Download className="h-4 w-4" />
                          {t("nav.openInNewTab", "Open in new tab")}
                        </a>
                      </div>
                    </div>
                  </object>
                ) : (
                  <iframe
                    src={cvHref}
                    title={t("nav.cvPreview", "CV Preview")}
                    className="h-full w-full"
                  />
                )
              ) : (
                <div className="grid h-full place-items-center p-6 text-center">
                  <p className="text-sm text-on-surface-variant">{t("nav.cvNotAvailable", "CV is not available right now.")}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-outline-variant/30 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setIsCvModalOpen(false)}
                className="rounded-full border border-outline-variant/50 px-4 py-2 text-sm font-semibold text-on-surface"
              >
                {t("nav.close", "Close")}
              </button>
              {isDataCv ? (
                <button
                  type="button"
                  onClick={handleCvDownload}
                  className={`inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container ${!cvHref ? "pointer-events-none opacity-60" : ""}`}
                  disabled={!cvHref}
                >
                  <Download className="h-4 w-4" />
                  {t("nav.download", "Download")}
                </button>
              ) : (
                <a
                  href={cvHref ?? "#"}
                  download={`${cvFileName}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container ${!cvHref ? "pointer-events-none opacity-60" : ""}`}
                >
                  <Download className="h-4 w-4" />
                  {t("nav.download", "Download")}
                </a>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
