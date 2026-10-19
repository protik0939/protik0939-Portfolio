/* Service worker for the portfolio PWA: offline support + background sync + WiFi pre-caching. */
const VERSION = "v4";
const PAGES_CACHE = `portfolio-pages-${VERSION}`;
const ASSETS_CACHE = `portfolio-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/locales/en.json",
  "/locales/bn.json",
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
    return;
  }

  if (event.data && typeof event.data === "object" && event.data.type === "PRECACHE_ALL") {
    event.waitUntil(precacheFullSite(event.data.routes || [], event.data.images || []));
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

async function precacheFullSite(routes, images) {
  const pagesCache = await caches.open(PAGES_CACHE);
  const assetsCache = await caches.open(ASSETS_CACHE);

  // Helper to run promises in concurrent chunks
  async function runInPool(items, limit, fn) {
    const results = [];
    const executing = [];
    for (const item of items) {
      const p = Promise.resolve().then(() => fn(item));
      results.push(p);
      if (limit <= items.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }
    return Promise.allSettled(results);
  }

  // Pre-cache all site routes (including en/bn variants)
  const fullRouteList = [];
  for (const route of routes) {
    fullRouteList.push(route);
    if (!route.includes("?")) {
      fullRouteList.push(`${route}?lang=en`);
      fullRouteList.push(`${route}?lang=bn`);
    }
  }

  await runInPool(fullRouteList, 4, async (route) => {
    try {
      const req = new Request(route, { cache: "reload", credentials: "same-origin" });
      const res = await fetch(req);
      if (res && res.status === 200) {
        await pagesCache.put(req, res);
      }
    } catch {
      // Continue even if single route fetch fails
    }
  });

  // Pre-cache all image and media assets
  await runInPool(images, 6, async (imageUrl) => {
    try {
      const isCrossOrigin = /^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith(self.location.origin);
      const req = new Request(imageUrl, isCrossOrigin ? { mode: "no-cors" } : { cache: "reload" });
      const res = await fetch(req);
      if (res && (res.status === 200 || res.type === "opaque")) {
        await assetsCache.put(imageUrl, res);
      }
    } catch {
      // Continue even if single asset fails
    }
  });

  // Notify clients that WiFi pre-cache has completed
  const allClients = await self.clients.matchAll();
  for (const client of allClients) {
    client.postMessage({ type: "PRECACHE_COMPLETED", timestamp: Date.now() });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Cross-origin image caching
  if (url.origin !== self.location.origin) {
    if (
      request.destination === "image" ||
      /\.(?:png|jpe?g|gif|svg|webp|avif|ico)$/i.test(url.pathname)
    ) {
      event.respondWith(staleWhileRevalidate(request, ASSETS_CACHE));
    }
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

  // Next.js client-side navigation / RSC requests: always fetch fresh over network
  const isRsc = request.headers.get("rsc") === "1" || url.searchParams.has("_rsc");
  if (isRsc) {
    event.respondWith(handleRscRequest(request));
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

async function handleRscRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

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
      if (response && (response.status === 200 || response.type === "opaque")) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const network = await networkPromise;
  if (network) {
    return network;
  }

  // Fallback for Next.js image optimization URLs if offline
  const reqUrl = typeof request === "string" ? new URL(request, self.location.origin) : new URL(request.url);
  if (reqUrl.pathname.startsWith("/_next/image")) {
    const rawTarget = reqUrl.searchParams.get("url");
    if (rawTarget) {
      const fallback = (await cache.match(rawTarget)) || (await cache.match(new Request(rawTarget)));
      if (fallback) {
        return fallback;
      }
    }
  }

  return new Response("", { status: 504 });
}
