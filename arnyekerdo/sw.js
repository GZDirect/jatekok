// Shinobi – offline mód. © 2026 Fejes Géza. Minden jog fenntartva.
// Generált fájl (build), a CACHE neve minden kiadásnál változik, ilyenkor a régi tár törlődik.
// Az oldal mindig a netről töltődik, ha van net (így mindig a legújabb változat jön), egyébként a tárból.
// A többi fájl (three.js, betűk, képek, hangok) a tárból jön, és a háttérben frissül.
const CACHE = 'shinobi-84bc3190cc';
const PRE = ["./", "index.html", "en.html", "three.min.js", "manifest.webmanifest", "favicon-32.png", "icon-180.png", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "nyitokep.jpg", "nyitokep-kicsi.jpg", "fonts/eb-garamond-latin-500-normal.woff2", "fonts/eb-garamond-latin-700-normal.woff2", "fonts/eb-garamond-latin-ext-500-normal.woff2", "fonts/eb-garamond-latin-ext-700-normal.woff2", "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2", "fonts/ibm-plex-sans-latin-ext-400-normal.woff2", "fonts/ibm-plex-sans-latin-ext-500-normal.woff2", "fonts/ibm-plex-sans-latin-ext-600-normal.woff2", "hang/b-008780a3.mp3", "hang/b-287977d3.mp3", "hang/b-2ad3eed9.mp3", "hang/b-3168fe8b.mp3", "hang/b-3d94098f.mp3", "hang/b-4b8b509b.mp3", "hang/b-66db7e7d.mp3", "hang/b-778fb87d.mp3", "hang/b-954e42d8.mp3", "hang/b-993b5c88.mp3", "hang/b-a189d411.mp3", "hang/b-ac2f8cc2.mp3", "hang/b-b26b0cf1.mp3", "hang/b-b2d9228f.mp3", "hang/b-d377f1cc.mp3", "hang/f-15d8e9c4.mp3", "hang/f-167dec5b.mp3", "hang/f-246c0fc6.mp3", "hang/f-293818e6.mp3", "hang/f-2a404f4e.mp3", "hang/f-2df255bb.mp3", "hang/f-2f3dd29d.mp3", "hang/f-316f48e1.mp3", "hang/f-32a31ef4.mp3", "hang/f-52b06f88.mp3", "hang/f-52e74d16.mp3", "hang/f-61ac67d5.mp3", "hang/f-6a9bbb33.mp3", "hang/f-6bb3c922.mp3", "hang/f-6e0b6d98.mp3", "hang/f-72179605.mp3", "hang/f-7b2a749a.mp3", "hang/f-8c17e3c0.mp3", "hang/f-8ca80931.mp3", "hang/f-9c1877c6.mp3", "hang/f-9c531983.mp3", "hang/f-a4417321.mp3", "hang/f-a85a88fe.mp3", "hang/f-b44cd20a.mp3", "hang/f-bccaaf99.mp3", "hang/f-c89292e3.mp3", "hang/f-e09f4255.mp3", "hang/f-e54b3755.mp3", "hang/f-e964986e.mp3", "hang/f-f6a08648.mp3", "hang/f-f889a47b.mp3", "hang/f-fa9371bd.mp3", "hang/f-fcdc2d86.mp3", "hang/f-fd4a1404.mp3", "hang/g-15d8e9c4.mp3", "hang/g-167dec5b.mp3", "hang/g-1d348812.mp3", "hang/g-246c0fc6.mp3", "hang/g-293818e6.mp3", "hang/g-2a404f4e.mp3", "hang/g-2df255bb.mp3", "hang/g-32a31ef4.mp3", "hang/g-47850b5c.mp3", "hang/g-50c86056.mp3", "hang/g-52e74d16.mp3", "hang/g-5ba2a373.mp3", "hang/g-61ac67d5.mp3", "hang/g-632bd61e.mp3", "hang/g-6a9bbb33.mp3", "hang/g-6bb3c922.mp3", "hang/g-6e0b6d98.mp3", "hang/g-6ec374f3.mp3", "hang/g-6fc4d5fd.mp3", "hang/g-72179605.mp3", "hang/g-7b2a749a.mp3", "hang/g-8c17e3c0.mp3", "hang/g-8ca80931.mp3", "hang/g-97b7b9b8.mp3", "hang/g-9c531983.mp3", "hang/g-a4417321.mp3", "hang/g-b3544c77.mp3", "hang/g-b44cd20a.mp3", "hang/g-bccaaf99.mp3", "hang/g-e09f4255.mp3", "hang/g-e54b3755.mp3", "hang/g-f6a08648.mp3", "hang/g-f889a47b.mp3", "hang/g-fcdc2d86.mp3", "hang/g-fd4a1404.mp3", "hang/g-fd67fb05.mp3", "hang/m-11d979fe.mp3", "hang/m-121c390e.mp3", "hang/m-18c5e140.mp3", "hang/m-259273bb.mp3", "hang/m-263865ce.mp3", "hang/m-2fca2a3e.mp3", "hang/m-30410177.mp3", "hang/m-487733da.mp3", "hang/m-59fa12ee.mp3", "hang/m-661db476.mp3", "hang/m-68702ec0.mp3", "hang/m-6e0c61de.mp3", "hang/m-6e4276d6.mp3", "hang/m-714d0d5e.mp3", "hang/m-778fb87d.mp3", "hang/m-7c001bac.mp3", "hang/m-7d497e4a.mp3", "hang/m-889a0442.mp3", "hang/m-980b9933.mp3", "hang/m-9fad3041.mp3", "hang/m-a15ac05a.mp3", "hang/m-a1ad49c1.mp3", "hang/m-ade887b8.mp3", "hang/m-d2785c68.mp3", "hang/m-d402cdee.mp3", "hang/m-d8963559.mp3", "hang/m-ddd1b57e.mp3", "hang/m-e80cd9cc.mp3", "hang/m-ed55b7f5.mp3", "hang/m-ee2bcdf6.mp3", "hang/m-f065d53c.mp3", "modellek/rendor.glb", "felszereles.jpg", "eszkozok/fukiya.webp", "eszkozok/fust.webp", "eszkozok/kampo.webp", "eszkozok/karom.webp", "eszkozok/kavics.webp", "eszkozok/shuriken.webp", "eszkozok/tanto.webp", "eszkozok/tekko.webp", "eszkozok/tuske.webp"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('shinobi-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    const page = url.pathname.split('/').pop() || 'index.html';
    e.respondWith(fetch(req).then((res) => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(page, cp)); } return res; })
      .catch(() => caches.match(page, { ignoreSearch: true }).then((r) => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || Response.error();
  }));
});
