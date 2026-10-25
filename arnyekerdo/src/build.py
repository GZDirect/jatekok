#!/usr/bin/env python3
"""Árnyékerdő összeállítása: src/shell.html + world.js + actors.js + parkolt.js + game.js -> ../index.html

Futtatás: python3 arnyekerdo/src/build.py   (bárhonnan)
Csak a src/ mappában dolgozz, az index.html generált fájl.
© 2026 Fejes Géza. Minden jog fenntartva.
"""
import os
D = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
shell = rd('shell.html')
js = '\n'.join(rd(n) for n in ('world.js', 'actors.js', 'parkolt.js', 'game.js')) + '\n'
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
  '<meta name="apple-mobile-web-app-title" content="Árnyékerdő">\n'
  '<link rel="manifest" href="manifest.webmanifest">\n'
  '<link rel="apple-touch-icon" href="icon-180.png">\n'
  '<link rel="icon" href="icon-192.png">\n'
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
  '</head>\n<body>\n')
out = wrap_head + page + '\n</body>\n</html>\n'
open(os.path.join(D, '..', 'index.html'), 'w', encoding='utf-8').write(out)
# claude.ai artifactként közzétehető változat (váz nélkül): python3 build.py --artifact /utvonal/arnyekerdo.html
import sys
if '--artifact' in sys.argv:
    open(sys.argv[sys.argv.index('--artifact') + 1], 'w', encoding='utf-8').write(page)
print('kész:', len(out), 'bájt')
