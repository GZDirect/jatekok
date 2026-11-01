# Cincin – Design előtti verzió

![Cincin a padláson](cover.jpg)

> ⚠️ **Design előtti verzió.** A játékmenet, a pályák és az irányítás játszható, de a grafika még ideiglenes: a végleges design ezután készül.

Cincin, a kis egér végigjárja a nagy házat a padlástól a kertig. 10 helyiség, mindegyik végén egy főellenféllel vagy csapdával:

1. Padlás · 2. Gyerekszoba · 3. Könyvtár · 4. Fürdőszoba · 5. Konyha · 6. Kamra · 7. Nappali · 8. Garázs · 9. Pince · 10. Kert (finálé)

## Játék

**Játék:** https://gzdirect.github.io/jatekok/cincin/

Nyisd meg az `index.html`-t böngészőben (vagy a GitHub Pages linket). Telefonon és tableten teljes képernyőn, érintéssel játszható.

| | Billentyűzet | Érintőképernyő |
|---|---|---|
| Futás | ← → / A D | bal kör oldalra húzva |
| Ugrás | Szóköz / W / ↑ (nyomva tartva magasabb) | jobb gomb |
| Guggolás, kúszás | ↓ / S | bal kör lefelé / ferdén |
| Lelépés platformról | ↓ + ugrás | |
| Vissza az egérlyukhoz | R | szünet menü |
| Szünet | Esc / P | ⏸ gomb |

Kontrollerrel is működik.

## Teszteléshez

A szünet menü **Teszt-adatok** gombja kimásolja, hol és mitől buktál el a legtöbbször – ezt küldd vissza a fejlesztőnek.

## Fájlok

- `index.html` – a játék
- `art/` – a képek (a játék pályánként tölti be őket, ezért ennek a mappának is fent kell lennie)

## Állapot

Egyfájlos HTML5 canvas prototípus. A végleges változat Godot 4-ben (GDScript) készül.

---

© 2026 Fejes Géza. Minden jog fenntartva. Lásd: [LICENSE](LICENSE).
