"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type StandaloneNavigator = Navigator & { standalone?: boolean };

function subscribeDisplayMode(callback: () => void) {
  const queries = [
    window.matchMedia("(display-mode: standalone)"),
    window.matchMedia("(display-mode: minimal-ui)"),
  ];

  queries.forEach((query) => query.addEventListener("change", callback));

  return () => {
    queries.forEach((query) => query.removeEventListener("change", callback));
  };
}

function getStandaloneSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as StandaloneNavigator).standalone === true
  );
}

function getStandaloneServerSnapshot() {
  return false;
}

export default function PwaInstallButton() {
  const { t } = useAppUI();
  const isStandalone = useSyncExternalStore(subscribeDisplayMode, getStandaloneSnapshot, getStandaloneServerSnapshot);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setJustInstalled(true);
      setPromptEvent(null);
      setShowHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstall = useCallback(async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setJustInstalled(true);
      }
      setPromptEvent(null);
      return;
    }

    setShowHint((current) => !current);
  }, [promptEvent]);

  if (isStandalone || justInstalled) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 md:items-end">
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition hover:brightness-110 active:scale-95"
      >
        <Download className="h-4 w-4" />
        {t("pwa.install", "Install App")}
      </button>

      {showHint ? (
        <p className="flex items-center gap-1.5 text-center text-xs text-on-surface-variant md:text-right">
          {isIos ? <Share className="h-3.5 w-3.5 shrink-0" /> : <Smartphone className="h-3.5 w-3.5 shrink-0" />}
          {isIos
            ? t("pwa.iosInstallHint", "Tap Share, then choose \"Add to Home Screen\".")
            : t("pwa.installHint", "Open your browser menu and choose \"Install app\" or \"Add to Home screen\".")}
        </p>
      ) : null}
    </div>
  );
}
