# Cincin nagy kalandja

![Cincin a padláson](cover.jpg)

> ⚠️ **Design előtti verzió – v0.7 (2026. november 2.)**
> A játékmenet és mind a tíz pálya végigjátszható. Az első négy helyiség (a padlás, a gyerekszoba, a könyvtár és a fürdőszoba) már az új, festett grafikát kapta; a többi hat még ideiglenes, programmal rajzolt képekkel fut.

Cincin, a kis sálas egér egy hatalmas, régi házban lakik. A padlástól a kertig tíz helyiségen kell átjutnia, és mindegyik végén egy furfangos ellenfél vár rá: az alvó macska, a felhúzható óriásrobot, a bagoly, a szakács, a kutya, a patkány… Gyűjtsd a magokat, keresd meg minden szobában a rejtett sajtot, kússz be a bútorok alá, és találd ki, hogyan jutsz túl a szoba urán.

**A ház helyiségei:**
1. Padlás · 2. Gyerekszoba · 3. Könyvtár · 4. Fürdőszoba · 5. Konyha · 6. Kamra · 7. Nappali · 8. Garázs · 9. Pince · 10. Kert (finálé)

Minden teljesített helyiség megnyitja a következőt.

## Játék

**Játék:** https://gzdirect.github.io/jatekok/cincin/

Nyisd meg a játékot a böngészőben. Telefonon és tableten teljes képernyőn, érintéssel is játszható.

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

## Változások

- **v0.7** – A fürdőszoba festett grafikát kapott: új háttér, hatszögletű csempepadló, festett víz és hullámok, gumikacsa, szappanok, szivacs, buborékok, mosdó, kád, csapok, üvegcsék, zuhanyfüggöny-karikák, a vizes akna csempéi és a rézszelep. A könyvtár padlója is festett deszkát kapott.
- **v0.6** – A könyvtár festett grafikát kapott: új háttér, nyíló és morzsolódó könyvek, tintás polcok és tintacseppek, görgős létra, könyvmolyok, guruló földgömb, sámlik, bőrfotel, íróasztal zöld lámpával, kalitka – és az új bagoly.
- **v0.5.1** – Gyerekszoba-javítások: a háttér padlója most egy vonalban van a játék padlójával (a várudvar magjai már láthatóan elérhetők), az ablakpad rajza a helyére került, eltűnt a fölösleges második egérlyuk a robot előtt, sűrűbben gurulnak a golyók, a golyós polctorony festett kockákat és könyveket kapott, és gyorsabb, keményebb az óriásrobot.
- **v0.5** – A gyerekszoba festett grafikát kapott (háttér, játékok, babaház, ágy, óriásrobot). A képek külön fájlokba kerültek, a játék pályánként tölti be őket. A pályák sorban nyílnak meg. Új kezdőképernyő, nagyobb ugrógomb, ritkább golyók a polctornyon.
- **v0.4** – A padlás teljesen festett grafikát kapott; új egér (mozgó végtagokkal) és új macska; hibajavítások a mentőpontoknál és elérhetetlen magoknál.
- **v0.3** – Mobil- és tabletbarát, teljes képernyős változat menükkel, érintéses irányítással és teszt-naplóval.
- **v0.2** – Mind a tíz helyiség elkészült a főellenségekkel.
- **v0.1** – Első prototípus: mozgás, ugrás, kúszás, a padlás.

## Állapot

Egyfájlos HTML5 canvas prototípus. A végleges változat Godot 4-ben (GDScript) készül.

---

© 2026 Fejes Géza. Minden jog fenntartva. Lásd: [LICENSE](LICENSE).
