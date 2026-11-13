"""Shinobi – angol változat a build.py számára.
A JS szövegliteráljait és a shell.html szövegeit az en_szotar.py alapján cseréli.
Ami nincs a szótárban, az változatlan marad (ezért új magyar szöveg esetén a szótárat is bővíteni kell:
python3 angol.py --hianyzik kiírja, mi hiányzik).
© 2026 Mom’s Couch Studios. Minden jog fenntartva.
"""
import re, os
from en_szotar import D, CODE, CSS

def literals(s):
    """(kezdet, vég, idézőjel, tartalom) a JS-forrás szövegliteráljaira; a megjegyzéseket és a reguláris kifejezéseket átugorja."""
    i, n, prev, out = 0, len(s), '', []
    while i < n:
        c = s[i]
        if c == '/' and i + 1 < n and s[i + 1] == '/':
            j = s.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and s[i + 1] == '*':
            j = s.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c == '/' and prev in '(,=:[!&|?{};+':
            j, cls = i + 1, False
            while j < n:
                if s[j] == '\\': j += 2; continue
                if s[j] == '[': cls = True
                elif s[j] == ']': cls = False
                elif s[j] == '/' and not cls: break
                elif s[j] == '\n': break
                j += 1
            i, prev = j + 1, 'x'; continue
        if c in '\'"':
            j = i + 1
            while j < n and s[j] != c:
                if s[j] == '\\': j += 1
                j += 1
            out.append((i, j + 1, c, s[i + 1:j])); i, prev = j + 1, 'x'; continue
        if not c.isspace(): prev = c
        i += 1
    return out

def esc(t, q):
    return t.replace('\\', '\\\\').replace(q, '\\' + q).replace('\n', '\\n')

def js(src):
    for a, b in CODE:
        src = src.replace(a, b)
    parts, last = [], 0
    for a, b, q, t in literals(src):
        if t in D:
            parts.append(src[last:a]); parts.append(q + esc(D[t], q) + q); last = b
    parts.append(src[last:])
    return ''.join(parts)

def shell(s):
    for a, b in CSS:
        s = s.replace(a, b)
    s = s.replace('<a class="back" href="./">', '<a class="back" href="en.html">')
    s = s.replace('href="en.html" hreflang="en" lang="en">English</a>', 'href="./" hreflang="hu" lang="hu">Magyar</a>')
    head, body = s.split('</style>', 1)
    # szöveg a címkék között (szóközökkel együtt), hosszabb kulcs előbb
    def txt(m):
        t = m.group(2).strip()
        return m.group(1) + m.group(2).replace(t, D[t]) + m.group(3) if t in D else m.group(0)
    body = re.sub(r'(>)([^<>]+)(<)', txt, body)
    body = re.sub(r'((?:aria-label|title|alt|placeholder)=")([^"]+)(")', lambda m: m.group(1) + D.get(m.group(2), m.group(2)) + m.group(3), body)
    # a beágyazott <script> blokkok szövegei (ha vannak) a js() fordítón mennek át
    body = re.sub(r'(<script>)(.*?)(</script>)', lambda m: m.group(1) + js(m.group(2)) + m.group(3), body, flags=re.S)
    return head + '</style>' + body

DESC_HU = 'Lopakodó nindzsakaland a böngészőben, nyolc pályán, egy történettel: éjszakai erdő, a mester faluja, felhőkarcolók, száguldó vonat, kikötő, lampionos ünnep, havas fogadó és a hegyi templom. Magyar hangokkal, telefonon is.'
DESC_EN = 'A stealth ninja adventure in your browser: eight levels, one story – a night forest, the master\'s village, skyscrapers, a speeding train, a harbour, a lantern festival, a snowy inn and a mountain temple. Plays on phones too.'

def head(h):
    return (h.replace('<html lang="hu">', '<html lang="en">').replace(DESC_HU, DESC_EN)
             .replace('og:locale" content="hu_HU"', 'og:locale" content="en_US"')
             .replace('arnyekerdo/">', 'arnyekerdo/en.html">')
             .replace('© 2026 Mom’s Couch Studios. Minden jog fenntartva.', '© 2026 Mom’s Couch Studios. All rights reserved.'))

if __name__ == '__main__':
    import sys
    if '--hianyzik' in sys.argv:
        Dir = os.path.dirname(os.path.abspath(__file__))
        HU = re.compile(r'[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]')
        for f in sorted(os.listdir(Dir)):
            if f.endswith('.js') and f != 'sw_minta.js':
                for a, b, q, t in literals(open(os.path.join(Dir, f), encoding='utf-8').read()):
                    if HU.search(t) and t not in D: print(f, repr(t))
