"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, WifiOff } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync?: { register: (tag: string) => Promise<void> };
};

type NetworkInformation = EventTarget & {
  type?: string;
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
};

const BANNER_HEIGHT_PX = "32px";
const PRECACHE_STORAGE_KEY = "portfolio_wifi_precached_v4";
const PRECACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function isWifiConnection(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const conn =
    ((navigator as unknown as { connection?: NetworkInformation }).connection) ||
    ((navigator as unknown as { mozConnection?: NetworkInformation }).mozConnection) ||
    ((navigator as unknown as { webkitConnection?: NetworkInformation }).webkitConnection);

  if (!conn) {
    // If Network Information API is not supported (Safari/Firefox/desktop),
    // default to eligible when online unless navigator.onLine is false.
    return navigator.onLine !== false;
  }

  if (conn.saveData) {
    return false;
  }

  if (conn.type) {
    return conn.type === "wifi" || conn.type === "ethernet";
  }

  // On desktop Chrome, conn.type may be undefined; check effectiveType and non-metered
  return conn.effectiveType === "4g" || !conn.effectiveType;
}

export default function ServiceWorkerRegister() {
  const { t, setIsOfflineBannerVisible } = useAppUI();
  const router = useRouter();

  // Banner state: always starts "idle" on page load so it never falsely flashes "offline"
  const [bannerMode, setBannerMode] = useState<"idle" | "offline" | "back-online">("idle");
  const [isHiding, setIsHiding] = useState(false);

  const wasOffline = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const finishHideTimer = useRef<number | null>(null);
  const syncTimer = useRef<number | null>(null);

  // Sync banner offset CSS property on <html> and update React state so TopAppBar shifts down
  useEffect(() => {
    const isVisible = bannerMode !== "idle" && !isHiding;
    setIsOfflineBannerVisible(isVisible);

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--offline-banner-offset",
        isVisible ? BANNER_HEIGHT_PX : "0px",
      );
    }
  }, [bannerMode, isHiding, setIsOfflineBannerVisible]);

  // Clean up CSS custom property on unmount
  useEffect(() => {
    return () => {
      setIsOfflineBannerVisible(false);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--offline-banner-offset", "0px");
      }
    };
  }, [setIsOfflineBannerVisible]);

  // Register service worker on mount & handle WiFi whole-site pre-caching
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    let isDisposed = false;

    const triggerWifiPrecache = async () => {
      if (isDisposed || !isWifiConnection()) {
        return;
      }

      // Check if site was already pre-cached on WiFi recently
      try {
        const lastPrecache = localStorage.getItem(PRECACHE_STORAGE_KEY);
        if (lastPrecache && Date.now() - Number(lastPrecache) < PRECACHE_EXPIRY_MS) {
          return;
        }
      } catch {
        // Continue if localStorage is unavailable
      }

      try {
        const res = await fetch("/api/public/offline-manifest", { cache: "no-store" });
        if (!res.ok) {
          return;
        }

        const data: { routes?: string[]; images?: string[] } = await res.json();
        const routes = Array.isArray(data.routes) ? data.routes : [];
        const images = Array.isArray(data.images) ? data.images : [];

        // Also gather current runtime Next.js CSS stylesheets and core scripts
        const runtimeAssets: string[] = [];
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
          if (link.href && link.href.startsWith(window.location.origin)) {
            runtimeAssets.push(link.href);
          }
        });
        document.querySelectorAll<HTMLScriptElement>('script[src^="/_next/"]').forEach((script) => {
          if (script.src) {
            runtimeAssets.push(script.src);
          }
        });

        const combinedImages = Array.from(new Set([...images, ...runtimeAssets]));

        const registration = await navigator.serviceWorker.ready;
        const targetSw = registration.active || navigator.serviceWorker.controller;

        if (targetSw) {
          targetSw.postMessage({
            type: "PRECACHE_ALL",
            routes,
            images: combinedImages,
          });

          try {
            localStorage.setItem(PRECACHE_STORAGE_KEY, Date.now().toString());
          } catch {
            // Ignore storage errors
          }
        }
      } catch {
        // Silently catch background pre-cache issues
      }
    };

    // Attempt precache immediately if on WiFi
    void triggerWifiPrecache();

    // Listen for network connection changes (e.g., user connects to WiFi later)
    const conn =
      ((navigator as unknown as { connection?: NetworkInformation }).connection) ||
      ((navigator as unknown as { mozConnection?: NetworkInformation }).mozConnection) ||
      ((navigator as unknown as { webkitConnection?: NetworkInformation }).webkitConnection);

    const onConnectionChange = () => {
      void triggerWifiPrecache();
    };

    conn?.addEventListener?.("change", onConnectionChange);

    return () => {
      isDisposed = true;
      conn?.removeEventListener?.("change", onConnectionChange);
    };
  }, []);

  // Online / offline transition management with real network probe validation
  useEffect(() => {
    let isCancelled = false;

    // Probe the server to confirm true offline status (guards against false positives)
    const checkRealConnectivity = async (): Promise<boolean> => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        return true;
      }

      try {
        const probe = await fetch("/favicon.svg?_probe=" + Date.now(), {
          method: "HEAD",
          cache: "no-store",
        });
        return probe.ok || probe.status < 500;
      } catch {
        return false;
      }
    };

    const handleOffline = async () => {
      // Guard against momentary blips by verifying true connectivity
      const reachable = await checkRealConnectivity();
      if (isCancelled || reachable) {
        return;
      }

      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (finishHideTimer.current) {
        window.clearTimeout(finishHideTimer.current);
        finishHideTimer.current = null;
      }

      wasOffline.current = true;
      setIsHiding(false);
      setBannerMode("offline");
    };

    const handleOnline = () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (finishHideTimer.current) {
        window.clearTimeout(finishHideTimer.current);
        finishHideTimer.current = null;
      }

      if (!wasOffline.current) {
        // Was never actually offline; stay idle
        setBannerMode("idle");
        return;
      }

      wasOffline.current = false;
      setIsHiding(false);
      setBannerMode("back-online");

      // Trigger background sync & router refresh
      syncTimer.current = window.setTimeout(() => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.controller?.postMessage("REFRESH_CACHE");
          void navigator.serviceWorker.ready
            .then((registration) => (registration as SyncCapableRegistration).sync?.register("portfolio-sync"))
            .catch(() => {});
        }
        router.refresh();
      }, 400);

      // Keep "Back to online" visible for 2.4s, then slide out and hide
      hideTimer.current = window.setTimeout(() => {
        setIsHiding(true);

        finishHideTimer.current = window.setTimeout(() => {
          setBannerMode("idle");
          setIsHiding(false);
        }, 320);
      }, 2400);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Periodic safety check: if offline banner is active but internet has returned, automatically recover
    const interval = window.setInterval(async () => {
      if (wasOffline.current) {
        const reachable = await checkRealConnectivity();
        if (reachable) {
          handleOnline();
        }
      }
    }, 3500);

    return () => {
      isCancelled = true;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.clearInterval(interval);
      if (syncTimer.current) {
        window.clearTimeout(syncTimer.current);
      }
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
      if (finishHideTimer.current) {
        window.clearTimeout(finishHideTimer.current);
      }
    };
  }, [router]);

  if (bannerMode === "idle") {
    return null;
  }

  const isBackOnline = bannerMode === "back-online";

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 top-0 z-[100] flex h-8 w-full items-center justify-center px-4 font-headline text-xs font-semibold tracking-wide text-white shadow-md transition-all duration-300 ease-out select-none ${
        isBackOnline ? "bg-emerald-600 dark:bg-emerald-600" : "bg-red-600 dark:bg-red-600"
      } ${isHiding ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div className="flex items-center gap-1.5">
        {isBackOnline ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>{t("pwa.onlineBar", "Back to online")}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            <span>{t("pwa.offlineBar", "You're offline")}</span>
          </>
        )}
      </div>
    </aside>
  );
}
