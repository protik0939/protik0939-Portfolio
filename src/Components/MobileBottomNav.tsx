"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  Cpu,
  FileText,
  FolderKanban,
  GraduationCap,
  House,
  Languages,
  Mail,
  Menu,
  MoonStar,
  Newspaper,
  Puzzle,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { SlSocialGithub } from "react-icons/sl";
import { useAppUI } from "@/Components/AppUIProvider";
import MobileQuickNavSheet, { type MobileQuickNavTile } from "@/Components/MobileQuickNavSheet";

type SectionLink = {
  key: string;
  labelKey: string;
  fallback: string;
  icon: ComponentType<{ className?: string }>;
};

type BottomNavTab = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
};

const SECTION_LINKS: SectionLink[] = [
  { key: "home", labelKey: "nav.home", fallback: "Home", icon: House },
  { key: "about", labelKey: "nav.about", fallback: "About", icon: UserRound },
  { key: "skills", labelKey: "nav.skills", fallback: "Skills", icon: Cpu },
  { key: "problem-solving", labelKey: "nav.problemSolving", fallback: "Problem Solving", icon: Puzzle },
  { key: "github-contribution", labelKey: "nav.github", fallback: "GitHub", icon: SlSocialGithub },
  {
    key: "education-experience",
    labelKey: "nav.experience",
    fallback: "Education & Experience",
    icon: GraduationCap,
  },
  { key: "projects", labelKey: "nav.projects", fallback: "Projects", icon: FolderKanban },
  { key: "blogs", labelKey: "nav.blogs", fallback: "Blogs", icon: Newspaper },
  { key: "contact", labelKey: "nav.contact", fallback: "Contact", icon: Mail },
];

export default function MobileBottomNav() {
  const { language, theme, t, toggleLanguage, toggleTheme } = useAppUI();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("home");

  const isHomePage = pathname === "/";
  const isHidden = pathname.startsWith("/admin");

  const resumeHref = `/resume?lang=${language}`;
  useEffect(() => {
    if (!isSheetOpen || !isHomePage) {
      return;
    }

    const updateActiveSection = () => {
      const scrollPosition = globalThis.scrollY + 140;
      let nextActive = SECTION_LINKS[0].key;

      for (const item of SECTION_LINKS) {
        const section = document.getElementById(item.key);
        if (!section) {
          continue;
        }

        if (section.offsetTop <= scrollPosition) {
          nextActive = item.key;
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
  }, [isHomePage, isSheetOpen]);

  const tabs = useMemo<BottomNavTab[]>(
    () => [
      { key: "resume", label: t("nav.resume", "Resume"), icon: FileText, href: `/resume?lang=${language}` },
      { key: "projects", label: t("nav.projects", "Projects"), icon: FolderKanban, href: `/projects?lang=${language}` },
      { key: "home", label: t("nav.home", "Home"), icon: House },
      { key: "blogs", label: t("nav.blogs", "Blogs"), icon: Newspaper, href: `/blogs?lang=${language}` },
      { key: "menu", label: t("nav.menu", "Menu"), icon: Menu },
    ],
    [language, t],
  );

  const routeIndex = useMemo(() => {
    if (pathname.startsWith("/resume")) {
      return 0;
    }

    if (pathname.startsWith("/projects")) {
      return 1;
    }

    if (isHomePage) {
      return 2;
    }

    if (pathname.startsWith("/blogs")) {
      return 3;
    }

    return -1;
  }, [isHomePage, pathname]);

  const menuTabIndex = tabs.findIndex((tab) => tab.key === "menu");
  const activeIndex = isSheetOpen ? menuTabIndex : routeIndex;
  const hasActiveTab = activeIndex >= 0;

  const activeSectionKey = useMemo(() => {
    if (isHomePage) {
      return activeSectionId;
    }

    if (pathname.startsWith("/resume")) {
      return "resume";
    }

    if (pathname.startsWith("/projects")) {
      return "projects";
    }

    if (pathname.startsWith("/blogs")) {
      return "blogs";
    }

    return "";
  }, [activeSectionId, isHomePage, pathname]);

  const sheetTiles = useMemo<MobileQuickNavTile[]>(
    () => [
      ...SECTION_LINKS.map((item) => ({
        key: item.key,
        label: t(item.labelKey, item.fallback),
        icon: item.icon,
        href: isHomePage ? `#${item.key}` : `/?lang=${language}#${item.key}`,
        isActive: activeSectionKey === item.key,
      })),
      {
        key: "resume",
        label: t("nav.resume", "Resume"),
        icon: FileText,
        href: resumeHref,
        isActive: activeSectionKey === "resume",
      },
      { key: "language", label: t("nav.language", "Language"), icon: Languages, onClick: toggleLanguage },
      { key: "theme", label: t("nav.theme", "Theme"), icon: theme === "dark" ? Sun : MoonStar, onClick: toggleTheme },
    ],
    [activeSectionKey, isHomePage, language, resumeHref, t, theme, toggleLanguage, toggleTheme],
  );

  const handleTabClick = useCallback(
    (tab: BottomNavTab, event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (tab.key !== "home" || !isHomePage) {
        return;
      }

      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [isHomePage],
  );

  const closeSheet = useCallback(() => setIsSheetOpen(false), []);
  const toggleSheet = useCallback(() => setIsSheetOpen((current) => !current), []);

  if (isHidden) {
    return null;
  }

  return (
    <>
      <div aria-hidden className="h-24 lg:hidden" />

      <nav
        aria-label={t("nav.quickNav", "Quick Navigation")}
        className="bottom-nav fixed inset-x-3 bottom-3 z-70 rounded-[1.75rem] lg:hidden"
        style={
          {
            marginBottom: "env(safe-area-inset-bottom)",
            "--bottom-nav-notch-index": String(hasActiveTab ? activeIndex : -2),
          } as CSSProperties
        }
      >
        <div
          aria-hidden
          className="bottom-nav-shell liquid-glass absolute inset-0 rounded-[1.75rem] border border-outline-variant/30"
        />
        <span aria-hidden className="bottom-nav-bump pointer-events-none" style={{ opacity: hasActiveTab ? 1 : 0 }} />

        <div className="bottom-nav-tabs relative z-10 flex items-stretch py-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = index === activeIndex;

            const label = <span className="text-[10px] leading-none font-semibold sm:text-[11px]">{tab.label}</span>;

            const commonClassName = `bottom-nav-item relative z-10 flex flex-1 basis-1/5 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors duration-300 active:scale-95 ${
              isActive ? "is-active text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`;

            if (tab.key === "menu") {
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={toggleSheet}
                  aria-label={tab.label}
                  aria-expanded={isSheetOpen}
                  className={commonClassName}
                >
                  <span className="bottom-nav-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href ?? `/?lang=${language}`}
                onClick={(event) => handleTabClick(tab, event)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={commonClassName}
              >
                <span className="bottom-nav-icon">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileQuickNavSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        title={t("nav.quickNav", "Quick Navigation")}
        closeLabel={t("nav.close", "Close")}
        tiles={sheetTiles}
        notchIndex={menuTabIndex}
      />
    </>
  );
}
