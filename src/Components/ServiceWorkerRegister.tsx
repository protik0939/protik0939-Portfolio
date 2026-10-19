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

const BANNER_HEIGHT_PX = "28px";
const PRECACHE_STORAGE_KEY = "portfolio_wifi_precached_v3";
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
    return navigator.onLine;
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
  const { t } = useAppUI();
  const router = useRouter();

  // Banner state: "idle" | "offline" | "back-online"
  const [bannerMode, setBannerMode] = useState<"idle" | "offline" | "back-online">(() =>
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "idle",
  );
  const [isHiding, setIsHiding] = useState(false);

  const wasOffline = useRef(typeof navigator !== "undefined" && !navigator.onLine);
  const hideTimer = useRef<number | null>(null);
  const finishHideTimer = useRef<number | null>(null);
  const syncTimer = useRef<number | null>(null);

  // Sync banner offset CSS property on <html> so TopAppBar and body never get covered
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (bannerMode === "idle" || isHiding) {
      document.documentElement.style.setProperty("--offline-banner-offset", "0px");
    } else {
      document.documentElement.style.setProperty("--offline-banner-offset", BANNER_HEIGHT_PX);
    }
  }, [bannerMode, isHiding]);

  // Clean up CSS custom property on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--offline-banner-offset", "0px");
      }
    };
  }, []);

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

    // Attempt precache immediately if already on WiFi
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

  // Online / offline transition management
  useEffect(() => {
    const handleOffline = () => {
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

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
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
      className={`fixed inset-x-0 top-0 z-100 flex h-[28px] w-full items-center justify-center px-4 font-headline text-xs font-semibold tracking-wide text-white shadow-md transition-all duration-300 ease-out select-none ${
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
