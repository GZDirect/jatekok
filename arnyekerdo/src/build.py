#!/usr/bin/env python3
"""Árnyékerdő összeállítása: src/shell.html + world.js + actors.js + falu.js + parkolt.js + game.js + falu_game.js + varos.js + varos_game.js + vonat.js + vonat_game.js -> ../index.html

Futtatás: python3 arnyekerdo/src/build.py   (bárhonnan)
Csak a src/ mappában dolgozz, az index.html generált fájl.
© 2026 Fejes Géza. Minden jog fenntartva.
"""
import os
D = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
shell = rd('shell.html')
js = '\n'.join(rd(n) for n in ('hang_lista.js', 'world.js', 'actors.js', 'falu.js', 'varos.js', 'vonat.js', 'kikoto.js', 'fesztival.js', 'parkolt.js', 'game.js', 'falu_game.js', 'varos_game.js', 'vonat_game.js', 'kikoto_game.js', 'fesztival_game.js')) + '\n'
# Tömörítés (a GitHub Pages-en kisebb, gyorsabban töltődik): terser, a © megjegyzés megmarad. --plain: tömörítés nélkül.
import subprocess, sys as _s, tempfile as _t
if '--plain' not in _s.argv:
    try:
        with _t.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(js); src = f.name
        r = subprocess.run(['npx', '-y', 'terser@5.31.0', src, '-c', 'passes=1', '-m', '--comments', '/©/'], capture_output=True, timeout=300)
        if r.returncode == 0 and len(r.stdout) > 1000:
            js = '/* Shinobi · © 2026 Fejes Géza. Minden jog fenntartva. */\n' + r.stdout.decode('utf-8') + '\n'
        else: print('terser hiba, tömörítés nélkül:', r.stderr.decode('utf-8')[:300])
    except Exception as e: print('tömörítés kihagyva:', e)
assert '/*@@JATEK@@*/' in shell, 'hiányzik a /*@@JATEK@@*/ jelölő a shell.html-ből'
page = shell.replace('/*@@JATEK@@*/', js)
# GitHub Pages-hez kell egy teljes HTML-váz (a claude.ai artifact ezt magától adja hozzá).
wrap_head = ('<!doctype html>\n<html lang="hu">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  '<meta name="author" content="Fejes Géza">\n'
  '<meta name="copyright" content="© 2026 Fejes Géza. Minden jog fenntartva.">\n'
  '<meta name="theme-color" content="#0a0f13">\n'
  '<meta name="mobile-web-app-capable" content="yes">\n'
  '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
  '<meta name="apple-mobile-web-app-title" content="Shinobi">\n'
  '<link rel="manifest" href="manifest.webmanifest">\n'
  '<link rel="apple-touch-icon" href="icon-180.png">\n'
  '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">\n'
  '<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n'
  '<meta name="description" content="Lopakodó nindzsakaland a böngészőben, négy pályán: éjszakai erdő, nappali vizsga a faluban, felhőkarcolók teteje és egy száguldó vonat. Magyar hangokkal, telefonon is.">\n'
  '<meta property="og:type" content="website">\n'
  '<meta property="og:title" content="Shinobi">\n'
  '<meta property="og:description" content="Lopakodó nindzsakaland a böngészőben, négy pályán: éjszakai erdő, nappali vizsga a faluban, felhőkarcolók teteje és egy száguldó vonat. Magyar hangokkal, telefonon is.">\n'
  '<meta property="og:url" content="https://gzdirect.github.io/jatekok/arnyekerdo/">\n'
  '<meta property="og:image" content="https://gzdirect.github.io/jatekok/arnyekerdo/social-preview.jpg">\n'
  '<meta property="og:image:width" content="1200">\n'
  '<meta property="og:image:height" content="630">\n'
  '<meta property="og:locale" content="hu_HU">\n'
  '<meta name="twitter:card" content="summary_large_image">\n'
  '<meta name="twitter:image" content="https://gzdirect.github.io/jatekok/arnyekerdo/social-preview.jpg">\n'
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
  '</head>\n<body>\n')
SWREG = ("<script>/* offline mód */if('serviceWorker' in navigator&&location.protocol!=='file:'){addEventListener('load',function(){try{navigator.serviceWorker.register('sw.js').catch(function(){})}catch(e){}})}</script>\n")
out = wrap_head + page + '\n' + SWREG + '</body>\n</html>\n'
open(os.path.join(D, '..', 'index.html'), 'w', encoding='utf-8').write(out)
# claude.ai artifactként közzétehető változat (váz nélkül): python3 build.py --artifact /utvonal/arnyekerdo.html
import sys
if '--artifact' in sys.argv:
    open(sys.argv[sys.argv.index('--artifact') + 1], 'w', encoding='utf-8').write(page.replace('<script src="three.min.js"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'))
# Offline mód: sw.js a minta alapján, a tár neve a tartalomból számolt ujjlenyomat.
import hashlib, glob, json
A = os.path.join(D, '..')
pre = ['./', 'index.html', 'three.min.js', 'manifest.webmanifest', 'favicon-32.png', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'nyitokep.jpg', 'nyitokep-kicsi.jpg']
pre += sorted('fonts/' + os.path.basename(p) for p in glob.glob(os.path.join(A, 'fonts', '*.woff2')))
pre += sorted('hang/' + os.path.basename(p) for p in glob.glob(os.path.join(A, 'hang', '*.mp3')))
pre += ['felszereles.jpg'] + sorted('eszkozok/' + os.path.basename(p) for p in glob.glob(os.path.join(A, 'eszkozok', '*.webp')))
hsh = hashlib.sha1()
for p in pre[1:]:
    fp = os.path.join(A, p)
    if os.path.exists(fp): hsh.update(open(fp, 'rb').read())
sw = rd('sw_minta.js').replace('@@NAME@@', 'Shinobi').replace('@@PREFIX@@', 'shinobi-').replace('@@CACHE@@', 'shinobi-' + hsh.hexdigest()[:10]).replace('@@PRE@@', json.dumps(pre))
open(os.path.join(A, 'sw.js'), 'w', encoding='utf-8').write(sw)
print('kész:', len(out), 'bájt; sw.js:', len(pre), 'fájl előre')
