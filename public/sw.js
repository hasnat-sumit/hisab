// হিসাব-Hisab service worker.
//
// It only keeps files that are the same for everyone: the app's code, styles,
// fonts and icons. Pages and API answers hold personal money data, so they are
// never stored here; they always come from the network. If the network is gone
// when a page is opened, a small offline page is shown instead.

const VERSION = "v1";
const STATIC_CACHE = `hisab-static-${VERSION}`;
const SHELL_CACHE = `hisab-shell-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const SHELL_FILES = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];
// Old builds leave old files behind; keep the cache from growing forever.
const MAX_STATIC_ENTRIES = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, SHELL_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => !keep.has(name)).map((name) => caches.delete(name)),
      );
      // Starts the page request while the worker itself is still waking up.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkOrOfflinePage(event));
    return;
  }

  // Built files have a content hash in their name, so a stored copy is never stale.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (/^\/(icon-[\w-]+\.png|apple-icon\.png|icon\.svg|hisab-logo\.png)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event));
  }
  // Everything else (pages' data, API calls, uploads) goes straight to the network.
});

async function networkOrOfflinePage(event) {
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;
    return await fetch(event.request);
  } catch {
    const offline = await caches.match(OFFLINE_URL);
    return offline ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
    trimCache(cache);
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then((response) => {
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) ?? Response.error();
}

async function trimCache(cache) {
  const keys = await cache.keys();
  // Keys come back oldest first.
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_STATIC_ENTRIES))) {
    await cache.delete(key);
  }
}
