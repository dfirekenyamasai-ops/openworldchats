/* OpenWorld Admin — minimal service worker for installable PWA + offline shell */
const CACHE = "owc-admin-v1";
const SHELL = ["/admin/index.html"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match("/admin/index.html");
    })
  );
});
