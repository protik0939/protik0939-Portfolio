/* Service worker for the portfolio PWA: offline support + background sync. */
const VERSION = "v1";
const PAGES_CACHE = `portfolio-pages-${VERSION}`;
const ASSETS_CACHE = `portfolio-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES_CACHE);
      await pages.add(new Request(OFFLINE_URL, { cache: "reload" })).catch(() => {});

      const assets = await caches.open(ASSETS_CACHE);
      await Promise.all(PRECACHE_ASSETS.map((url) => assets.add(url).catch(() => {})));

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("portfolio-") && !key.endsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data === "REFRESH_CACHE") {
    event.waitUntil(refreshCoreCache());
  }
});

/* Background Sync keeps the shell fresh once connectivity returns. */
self.addEventListener("sync", (event) => {
  if (event.tag === "portfolio-sync") {
    event.waitUntil(refreshCoreCache());
  }
});

async function refreshCoreCache() {
  const cache = await caches.open(PAGES_CACHE);
  await cache.add(new Request("/", { cache: "reload" })).catch(() => {});
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache API or admin traffic so data always reflects the server.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/locales/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|css|js|mjs|json)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, ASSETS_CACHE));
  }
});

async function handleNavigation(request) {
  const cache = await caches.open(PAGES_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
    if (cached) {
      return cached;
    }

    const offline = await cache.match(OFFLINE_URL);
    if (offline) {
      return offline;
    }

    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && (response.status === 200 || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const network = await networkPromise;
  return network || new Response("", { status: 504 });
}
