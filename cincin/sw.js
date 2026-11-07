// The Littlest Lodger – offline support.
// The title screen and the first room (the attic) are stored on install; every other painting is stored
// the first time it is shown (cache first, refreshed quietly in the background).
// Raise CACHE with every release: the old cache is then removed.
const CACHE = 'cincin-v0.13.6';
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "fonts/fell.woff", "fonts/fell-italic.woff", "fonts/fell-sc.woff", "fonts/figtree.woff", "fonts/lodgermono.woff", "art/attic_back.jpg", "art/c_cheese.webp", "art/c_seed.webp", "art/c_yarn.webp", "art/cat_alert.webp", "art/cat_pounce.webp", "art/cat_sleep.webp", "art/cat_stalk.webp", "art/f_drop.webp", "art/f_splash.webp", "art/h_dark.webp", "art/h_lit.webp", "art/ic_check.webp", "art/ic_cheese.webp", "art/ic_hole.webp", "art/ic_lock.webp", "art/ic_retry.webp", "art/ic_seed.webp", "art/ic_watch.webp", "art/k_blue.webp", "art/k_door.webp", "art/k_knob.webp", "art/k_lever.webp", "art/k_plate.webp", "art/k_pulley.webp", "art/k_red.webp", "art/k_wall.webp", "art/kk_cracker.webp", "art/kk_cracker_br.webp", "art/line_post.webp", "art/m_atlas.webp", "art/mh_back.webp", "art/mh_bed.webp", "art/mh_boy.webp", "art/mh_candle.webp", "art/mh_capshelf.webp", "art/mh_domino.webp", "art/mh_girl.webp", "art/mh_gpa_sit.webp", "art/mh_gpa_stand.webp", "art/mh_gpa_wave.webp", "art/mh_hammock.webp", "art/mh_kids.webp", "art/mh_ladder.webp", "art/mh_lift.webp", "art/mh_sc1.webp", "art/mh_sc2.webp", "art/mh_sc3.webp", "art/mh_sc4.webp", "art/mh_sc5.webp", "art/mh_spool.webp", "art/mh_thimble.webp", "art/mh_tin.webp", "art/o_basket.webp", "art/o_beam.webp", "art/o_bench.webp", "art/o_block_blue.webp", "art/o_block_green.webp", "art/o_block_red.webp", "art/o_block_yellow.webp", "art/o_bookcase.webp", "art/o_books.webp", "art/o_box.webp", "art/o_bracket.webp", "art/o_bucket.webp", "art/o_case1.webp", "art/o_case2.webp", "art/o_chest.webp", "art/o_crate.webp", "art/o_drawer.webp", "art/o_gramophone.webp", "art/o_horse.webp", "art/o_lantern.webp", "art/o_lid.webp", "art/o_matchbox.webp", "art/o_plank.webp", "art/o_pulley.webp", "art/o_radio.webp", "art/o_sheet.webp", "art/o_soldier0.webp", "art/o_soldier1.webp", "art/o_spool.webp", "art/o_table.webp", "art/o_trapbar.webp", "art/o_trapbase.webp", "art/o_trunk.webp", "art/o_wardrobe.webp", "art/p_cage.webp", "art/p_chairs.webp", "art/p_clock.webp", "art/p_hatboxes.webp", "art/p_mannequin.webp", "art/p_mirror.webp", "art/p_rug.webp", "art/p_sheet.webp", "art/p_sled.webp", "art/pp_roach_a.webp", "art/pp_roach_b.webp", "art/pp_roach_flip.webp", "art/r_body.webp", "art/r_crawl.webp", "art/r_fist.webp", "art/r_hand.webp", "art/r_shoe.webp", "art/s_frame.webp", "art/s_pipe.webp", "art/s_rug.webp", "art/sock_g.webp", "art/sock_r.webp", "art/sock_y.webp", "art/st_1.webp", "art/st_2.webp", "art/st_3.webp", "art/st_4.webp", "art/t_bird.webp", "art/t_clock.webp", "art/tl_floor.webp", "art/tl_joist.webp", "art/tl_wall.webp", "art/ui_banner.webp", "art/ui_btn.webp", "art/ui_btn2.webp", "art/ui_btn_dn.webp", "art/ui_btn_off.webp", "art/ui_fs.webp", "art/ui_help.webp", "art/ui_house.webp", "art/ui_knob.webp", "art/ui_logo.webp", "art/ui_panel.webp", "art/ui_pause.webp", "art/ui_plate.webp", "art/ui_title.webp", "art/ui_track.webp", "art/fx_atlas.webp", "art/bx_atlas.webp", "art/ui_home.webp"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('cincin-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(nav ? 'index.html' : req, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => { if (res && res.ok) c.put(nav ? 'index.html' : req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    const res = await fresh; return res || (nav ? c.match('./') : Response.error());
  }));
});
