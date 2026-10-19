"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  House,
  MessageSquare,
  RotateCw,
  Terminal,
} from "lucide-react";
import { motion } from "motion/react";
import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";
import { useAppUI } from "@/Components/AppUIProvider";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useAppUI();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log the error to console or telemetry
    console.error("Application error:", error);
  }, [error]);

  const copyDetails = async () => {
    const details = [
      `Message: ${error.message || "Unknown error"}`,
      error.digest ? `Digest: ${error.digest}` : null,
      error.stack ? `Stack:\n${error.stack}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center text-on-surface sm:px-6 lg:px-8">
      <AnimatedBackgroundGlow />

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6">
        {/* Animated Warning Icon Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Ambient red/rose pulse glow */}
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute h-32 w-32 rounded-full bg-rose-500/30 blur-2xl"
          />

          <motion.div
            aria-hidden
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute h-28 w-28 rounded-full border border-dashed border-rose-500/40"
          />

          <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-rose-500/40 bg-surface-container-high/80 text-rose-400 shadow-2xl backdrop-blur-xl">
            <motion.div
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading & Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-rose-400 uppercase backdrop-blur-md">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("error.badge", "System Alert")}
          </span>

          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="font-headline text-5xl font-black tracking-tighter text-transparent select-none bg-linear-to-r from-rose-400 via-primary to-rose-400 bg-clip-text sm:text-7xl md:text-8xl"
          >
            500
          </motion.h1>

          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
            {t("error.heading", "Unexpected Glitch Detected")}
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-on-surface-variant sm:text-base">
            {t(
              "error.description",
              "An unexpected error interrupted this request. Don't worry, you can try again or return home safely.",
            )}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container shadow-[0_0_25px_rgba(131,66,244,0.35)] transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <RotateCw className="h-4 w-4" />
            {t("error.retry", "Try Again")}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-6 py-3 text-sm font-semibold text-on-surface transition-all duration-200 hover:border-primary/50 hover:bg-surface-container active:scale-95"
          >
            <House className="h-4 w-4" />
            {t("error.backHome", "Back to Home")}
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-5 py-3 text-sm font-semibold text-on-surface transition-all duration-200 hover:border-primary/50 hover:bg-surface-container active:scale-95"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            {t("error.contact", "Report Issue")}
          </Link>
        </motion.div>

        {/* Collapsible Technical Details for Diagnostics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full max-w-lg pt-4"
        >
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant/80 transition hover:text-on-surface"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>{t("error.detailsTitle", "Technical Details")}</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/90 p-4 text-left shadow-xl backdrop-blur-md"
            >
              <div className="mb-2 flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <span className="font-mono text-[11px] font-semibold text-primary">diagnostic.log</span>
                <button
                  type="button"
                  onClick={copyDetails}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface active:scale-95"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="custom-scrollbar max-h-48 overflow-y-auto font-mono text-xs leading-relaxed text-on-surface-variant">
                <p className="text-rose-400">{error.message || "An unexpected error occurred."}</p>
                {error.digest && (
                  <p className="mt-1 text-on-surface-variant/70">
                    <span className="text-primary/70">Digest:</span> {error.digest}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
