"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, FileText, FolderGit2, House, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import { useAppUI } from "@/Components/AppUIProvider";

export default function NotFound() {
  const { t } = useAppUI();

  const quickLinks = [
    { href: "/", label: t("nav.home", "Home"), icon: House },
    { href: "/projects", label: t("nav.projects", "Projects"), icon: FolderGit2 },
    { href: "/blogs", label: t("nav.blogs", "Blogs"), icon: BookOpen },
    { href: "/cv", label: t("nav.resume", "CV"), icon: FileText },
  ];

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center text-on-surface sm:px-6 lg:px-8">
      <AnimatedBackgroundGlow />

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6">
        {/* Animated radar/compass orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Ambient pulse ring */}
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute h-32 w-32 rounded-full bg-primary/30 blur-xl"
          />

          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute h-28 w-28 rounded-full border border-dashed border-primary/40"
          />

          <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-outline-variant/40 bg-surface-container-high/80 text-primary shadow-2xl backdrop-blur-xl">
            <Compass className="h-10 w-10 animate-spin-[20s]" />
          </div>
        </motion.div>

        {/* 404 Floating Giant Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            {t("notFound.badge", "404 Error")}
          </span>

          <motion.h1
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="font-headline text-7xl font-black tracking-tighter text-transparent select-none bg-linear-to-r from-primary via-secondary to-primary-container bg-clip-text sm:text-8xl md:text-9xl drop-shadow-sm"
          >
            404
          </motion.h1>

          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
            {t("notFound.heading", "Lost in the Digital Void")}
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-on-surface-variant sm:text-base">
            {t(
              "notFound.description",
              "The page you are looking for may have been moved, renamed, or never existed in this realm.",
            )}
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container shadow-[0_0_25px_rgba(131,66,244,0.35)] transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <House className="h-4 w-4" />
            {t("notFound.backHome", "Back to Home")}
          </Link>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-6 py-3 text-sm font-semibold text-on-surface transition-all duration-200 hover:border-primary/50 hover:bg-surface-container active:scale-95"
          >
            <FolderGit2 className="h-4 w-4 text-primary" />
            {t("notFound.exploreProjects", "View Projects")}
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-5 py-3 text-sm font-semibold text-on-surface transition-all duration-200 hover:border-primary/50 hover:bg-surface-container active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("notFound.goBack", "Go Back")}
          </button>
        </motion.div>

        {/* Quick Destinations Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-6 flex flex-col items-center gap-3 border-t border-outline-variant/30 pt-6"
        >
          <span className="text-xs font-medium text-on-surface-variant">
            {t("notFound.quickLinks", "Explore other destinations:")}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface-container-low/70 px-3.5 py-1.5 text-xs font-medium text-on-surface transition-all hover:border-primary/50 hover:bg-surface-container hover:text-primary active:scale-95"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
