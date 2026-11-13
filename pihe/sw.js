// Pihe odúja – offline mód. © 2026 Mom’s Couch Studios. Minden jog fenntartva.
// Ha a three.js, a betűk vagy az ikonok változnak, emeld a CACHE számát: a régi tár ilyenkor törlődik.
// Az oldal mindig a netről töltődik, ha van net (így mindig a legújabb változat jön), egyébként a tárból.
// A többi fájl (three.js, betűk, képek, hangok) a tárból jön, és a háttérben frissül.
const CACHE = 'pihe-v2';
const PRE = ["./", "index.html", "three.min.js", "manifest.webmanifest", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "fonts/fredoka-latin-500-normal.woff2", "fonts/fredoka-latin-600-normal.woff2", "fonts/fredoka-latin-700-normal.woff2", "fonts/fredoka-latin-ext-500-normal.woff2", "fonts/fredoka-latin-ext-600-normal.woff2", "fonts/fredoka-latin-ext-700-normal.woff2", "fonts/nunito-latin-500-normal.woff2", "fonts/nunito-latin-700-normal.woff2", "fonts/nunito-latin-800-normal.woff2", "fonts/nunito-latin-ext-500-normal.woff2", "fonts/nunito-latin-ext-700-normal.woff2", "fonts/nunito-latin-ext-800-normal.woff2"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('pihe-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', cp)); } return res; })
      .catch(() => caches.match('index.html', { ignoreSearch: true }).then((r) => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || Response.error();
  }));
});
