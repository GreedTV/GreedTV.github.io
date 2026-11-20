// Offline support for Arena of Elements.
// - Page + game code: network first (always get the newest version when online), cache as fallback.
// - Models, icons, and the three.js library from the CDN: cache first, refreshed in the background.
const CACHE = 'aoe-v12';
const CORE = [
  './', 'index.html', 'looks.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'models/quaternius/Anims.glb', 'models/quaternius/Superhero_Male_FullBody.glb', 'models/quaternius/Superhero_Female_FullBody.glb',
  'models/quaternius/Hair_Beard.glb', 'models/quaternius/Hair_Buns.glb', 'models/quaternius/Hair_Buzzed.glb',
  'models/quaternius/Hair_BuzzedFemale.glb', 'models/quaternius/Hair_Long.glb', 'models/quaternius/Hair_SimpleParted.glb',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = url.hostname === 'cdn.jsdelivr.net';
  if (!sameOrigin && !isCdn) return;

  const isCode = sameOrigin && (req.mode === 'navigate' || /\.(html|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/'));
  if (isCode) {
    // network first
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
    return;
  }
  // cache first, refresh in background
  e.respondWith(caches.match(req).then((cached) => {
    const net = fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
