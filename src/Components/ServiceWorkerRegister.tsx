"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, WifiOff } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync?: { register: (tag: string) => Promise<void> };
};

function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

export default function ServiceWorkerRegister() {
  const { t } = useAppUI();
  const router = useRouter();
  const isOnline = useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, getOnlineServerSnapshot);
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOffline = useRef(false);
  const syncTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }

    if (!wasOffline.current) {
      return;
    }

    wasOffline.current = false;

    // Give the network a moment to settle before resyncing caches and data.
    syncTimer.current = window.setTimeout(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.controller?.postMessage("REFRESH_CACHE");
        void navigator.serviceWorker.ready
          .then((registration) => (registration as SyncCapableRegistration).sync?.register("portfolio-sync"))
          .catch(() => {});
      }

      router.refresh();
      setIsSyncing(true);

      syncTimer.current = window.setTimeout(() => setIsSyncing(false), 2200);
    }, 400);

    return () => {
      if (syncTimer.current) {
        window.clearTimeout(syncTimer.current);
      }
    };
  }, [isOnline, router]);

  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-100 flex justify-center px-4"
    >
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur ${
          !isOnline
            ? "border-error/40 bg-error-container/90 text-on-error-container"
            : "border-primary/40 bg-surface-container-high/90 text-on-surface"
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            {t("pwa.offline", "You're offline. Showing saved content.")}
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("pwa.online", "Back online — syncing…")}
          </>
        )}
      </div>
    </div>
  );
}
