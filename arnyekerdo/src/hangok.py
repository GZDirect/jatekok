#!/usr/bin/env python3
"""Shinobi – a szereplők magyar hangjának legenerálása (Piper TTS, offline).
© 2026 Fejes Géza. Minden jog fenntartva.

Használat:  python3 hangok.py /mappa/a/hangmodellekkel
A mappában kell lennie: hu_HU-imre-medium.onnx(.json) és hu_HU-anna-medium.onnx(.json)
(innen: huggingface.co/rhasspy/piper-voices, hu/hu_HU). A modellek nincsenek a repóban (60 MB-osak).
Kell hozzá: pip install piper-tts, és ffmpeg.

A forrásfájlokból kigyűjti a mondatokat (['japán','átírás','magyar'] hármasok és a CALL lista),
hangonként mp3-at készít az ../hang/ mappába, és megírja a hang_lista.js-t (ebből tudja a játék, mi van meg).
Hangok:  g = őrök, rendőrök (Imre)  ·  f = tanítványok, kalauz (Anna)  ·  m = a mester (Imre, mélyebb, lassabb)  ·  b = Kuroda, Mori (Imre, mélyebb)
"""
import os, re, sys, subprocess, tempfile
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, '..', 'hang'); os.makedirs(OUT, exist_ok=True)
MODELS = sys.argv[1] if len(sys.argv) > 1 else '.'
rd = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
TRI = re.compile(r"\[\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\]")

def fnv(t):
    h = 0x811c9dc5
    for ch in t:
        h ^= ord(ch); h = (h * 0x01000193) & 0xffffffff
    return '%08x' % h

need = {}  # (voice, text)
def add(v, t):
    t = t.strip()
    if t: need[(v, t)] = 1
def block(src, start):
    i = src.find(start)
    if i < 0: return ''
    j = src.find('});', i); return src[i:j]
g = rd('game.js')
for m in TRI.finditer(block(g, 'const LINES={')): add('g', m.group(3)); add('f', m.group(3))
f = rd('falu_game.js'); fl = block(f, 'Object.assign(G.LINES')
for m in TRI.finditer(fl): add('f', m.group(3))
for m in TRI.finditer(f.replace(fl, '')): add('m', m.group(3))
for n in ('varos_game.js', 'vonat_game.js', 'kikoto_game.js', 'fesztival_game.js', 'fogado_game.js', 'templom_game.js'):
    s = rd(n); lb = block(s, 'Object.assign(G.LINES')
    for m in TRI.finditer(lb): add('g', m.group(3)); add('f', m.group(3))
    # a többi mondat: ha az első elem egy hang betűje (g, f, m, b), azzal; különben Kuroda/Mori hangja (b)
    for m in TRI.finditer(s.replace(lb, '')): add(m.group(1) if m.group(1) in ('g', 'f', 'm', 'b') else 'b', m.group(3))
    c = re.search(r"const CALL=\[(.*?)\];", s)
    if c:
        for t in re.findall(r"'([^']*)'", c.group(1)): add('b', t)

VOICE = {'g': ('imre', 1.0, 1.0), 'f': ('anna', 0.95, 1.0), 'm': ('imre', 1.18, 0.86), 'b': ('imre', 1.05, 0.92)}
keys = []
for (v, t) in sorted(need):
    key = v + '-' + fnv(t); keys.append(key); dst = os.path.join(OUT, key + '.mp3')
    if os.path.exists(dst): continue
    model, ls, pitch = VOICE[v]
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        subprocess.run([sys.executable, '-m', 'piper', '-m', os.path.join(MODELS, 'hu_HU-%s-medium.onnx' % model), '--length-scale', str(ls), '-f', wav], input=t.encode('utf-8'), check=True, capture_output=True)
        af = 'asetrate=22050*%s,aresample=22050,atempo=%s,' % (pitch, 1 / pitch) if pitch != 1 else ''
        af += 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '40k', dst], check=True)
    print(key, t)
open(os.path.join(D, 'hang_lista.js'), 'w', encoding='utf-8').write(
    '/* generált: python3 hangok.py — a meglévő hangfájlok listája (hang/<hang>-<fnv hash>.mp3) */\nwindow.AE_HANG={' + ','.join("'%s':1" % k for k in keys) + '};\n')
print(len(keys), 'hangfájl')
