const CACHE_VERSION = "najibzadeh-pwa-v1";
const PRECACHE = `${CACHE_VERSION}-precache`;
const PAGES = `${CACHE_VERSION}-pages`;
const ASSETS = `${CACHE_VERSION}-assets`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/pwa/icon-192x192.png",
  "/pwa/icon-512x512.png",
  "/pwa/maskable-512x512.png",
  "/pwa/apple-touch-icon.png",
];
const STATIC_DESTINATIONS = new Set(["font", "image", "script", "style"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const activeCaches = new Set([PRECACHE, PAGES, ASSETS]);

  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) =>
                key.startsWith("najibzadeh-pwa-") && !activeCaches.has(key),
              )
              .map((key) => caches.delete(key)),
          ),
        ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isPrivatePath(pathname) {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    ["/admin", "/auth", "/customer-dashboard", "/account", "/checkout"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function canCache(response) {
  if (!response || !response.ok || response.type === "opaque") return false;

  const cacheControl = response.headers.get("Cache-Control") || "";
  return !/(no-store|private)/i.test(cacheControl);
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);

  try {
    const response = await fetch(request);
    if (canCache(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match(OFFLINE_URL));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (canCache(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || LOCAL_HOSTS.has(self.location.hostname)) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivatePath(url.pathname)) return;
  if (request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
