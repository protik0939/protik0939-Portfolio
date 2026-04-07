"use client";

import AnimatedReveal from "@/Components/AnimatedReveal";
import { useAppUI } from "@/Components/AppUIProvider";
import Link from "next/link";

export default function SiteFooter() {
  const { t, language } = useAppUI();
  const currentYear = new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-US", { useGrouping: false }).format(new Date().getFullYear());

  return (
    <footer className="w-full border-t border-outline-variant/40 bg-surface-container-high/70">
      <AnimatedReveal className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 text-sm leading-relaxed md:flex-row" delay={0.05}>
        <p className="text-on-surface">
          {`@ ${currentYear} ${t("footer.copy", "Sadat Alam Protik | All rights reserved.")}`}
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" href="https://github.com/protik0939" target="_blank" rel="noreferrer">{t("footer.github", "GitHub")}</Link>
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" href="https://linkedin.com/in/protik0939" target="_blank" rel="noreferrer">{t("footer.linkedin", "LinkedIn")}</Link>
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" href="https://x.com/protik0939" target="_blank" rel="noreferrer">{t("footer.twitter", "Twitter")}</Link>
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" href="https://facebook.com/protik0939" target="_blank" rel="noreferrer">{t("footer.facebook", "Facebook")}</Link>
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" target="_blank" href="mailto:protik0939@gmail.com">protik0939@gmail.com</Link>
          <Link className="cursor-pointer text-on-surface-variant transition hover:text-primary hover:opacity-90" target="_blank" href="tel:+8801721846361">+880 1721 846361</Link>
        </div>
      </AnimatedReveal>
    </footer>
  );
}
