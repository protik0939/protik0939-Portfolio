"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { MonitorDown } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type StandaloneNavigator = Navigator & { standalone?: boolean };

type WindowWithPrompt = Window & { __deferredInstallPrompt?: BeforeInstallPromptEvent };

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

function subscribeIsMobile() {
  return () => {};
}

function getIsMobileSnapshot() {
  return /android|iphone|ipad|ipod|iemobile|opera mini|mobile/i.test(navigator.userAgent);
}

function getIsMobileServerSnapshot() {
  return false;
}

export default function PwaInstallButton() {
  const { t } = useAppUI();
  const isStandalone = useSyncExternalStore(subscribeDisplayMode, getStandaloneSnapshot, getStandaloneServerSnapshot);
  const isMobile = useSyncExternalStore(subscribeIsMobile, getIsMobileSnapshot, getIsMobileServerSnapshot);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const runPrompt = useCallback(async (event: BeforeInstallPromptEvent) => {
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "accepted") {
        setJustInstalled(true);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // On mobile, automatically trigger Chrome's native install dialog.
  const adoptEvent = useCallback(
    (event?: BeforeInstallPromptEvent | null) => {
      if (!event || justInstalled) {
        return;
      }

      if (getIsMobileSnapshot()) {
        void runPrompt(event).then((didShow) => {
          // Keep the event around for a manual retry button if the auto prompt failed.
          if (!didShow) {
            setPromptEvent(event);
          }
        });
        return;
      }

      setPromptEvent((current) => current ?? event);
    },
    [justInstalled, runPrompt],
  );

  useEffect(() => {
    const win = window as WindowWithPrompt;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      adoptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstallReady = () => {
      adoptEvent(win.__deferredInstallPrompt);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-install-ready", handleInstallReady);

    // The inline script in the layout may have captured the event before React mounted.
    const adoptTimer = window.setTimeout(handleInstallReady, 0);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-install-ready", handleInstallReady);
      window.clearTimeout(adoptTimer);
    };
  }, [adoptEvent]);

  const handleInstall = useCallback(() => {
    if (!promptEvent) {
      setShowHint((current) => !current);
      return;
    }

    const event = promptEvent;
    setPromptEvent(null);
    void runPrompt(event).then((didShow) => {
      if (!didShow) {
        setPromptEvent(event);
        setShowHint(true);
      }
    });
  }, [promptEvent, runPrompt]);

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const hintText = isIos
    ? t("pwa.iosInstallHint", "Tap Share, then choose \"Add to Home Screen\".")
    : t("pwa.installHint", "Open your browser menu and choose \"Install app\" or \"Add to Home screen\".");

  if (isStandalone || justInstalled) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition hover:brightness-110 active:scale-95"
        >
          <MonitorDown className="h-4 w-4" />
          {t("pwa.install", "Install App")}
        </button>
        {showHint ? <p className="max-w-xs text-center text-xs text-on-surface-variant">{hintText}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleInstall}
        className="flex max-w-xs items-center gap-2 text-center text-xs text-on-surface-variant transition hover:text-on-surface md:text-right"
      >
        <MonitorDown className="h-5 w-5 shrink-0 text-primary" />
        <span>{t("pwa.desktopHint", "Tap the icon for installing the app (Only works on supported browser)")}</span>
      </button>
      {showHint ? <p className="max-w-xs text-right text-xs text-on-surface-variant">{hintText}</p> : null}
    </div>
  );
}
