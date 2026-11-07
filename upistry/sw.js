// Upistry – offline support. Cache first, refreshed quietly in the background.
// Raise CACHE with every release: the old cache is then removed.
const CACHE = 'upistry-v2.0.0';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('upistry-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  const nav = req.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const key = nav ? 'index.html' : req;
    const hit = await c.match(key, { ignoreSearch: !font });
    const fresh = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    const res = await fresh; return res || (nav ? c.match('./') : Response.error());
  }));
});
