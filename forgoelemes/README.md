# Forgóelemes játék

**Játék:** https://gzdirect.github.io/jatekok/forgoelemes/

Kétszemélyes logikai táblajáték a gép ellen. Egy hatszög alakú, lyukacsos táblán mindkét játékosnak két háromlyukú rúdja van. A rudat az egyik lyukánál rögzíted, és körülötte elforgatod.

## Szabályok
1. Te vagy a kék, a gép a réz. Felváltva léptek, te kezdesz.
2. Lépés: koppints a saját rudadra, majd annak egyik lyukára (ez lesz a tengely), és fordítsd el 60, 120 vagy 180 fokkal bármelyik irányba.
3. A rúd forgás közben nem haladhat át másik rúdon. Az új helyzetben legalább két lyukának a táblán kell lennie.
4. Ha a lépésed után az ellenfél valamelyik rúdja semmilyen irányban nem tud fordulni, nyertél. Ha a saját rudadat szorítod be, veszítesz.

## Funkciók
- Lépésről lépésre vezető útmutató a tábla mellett.
- Két nehézségi szint (Könnyű, Normál); a gép a háttérben gondolkodik, a képernyő közben nem akad meg.
- Visszalépés, új játék, és a rudak hátralévő lépésszámának kijelzése.

## Futtatás
Egyetlen önálló fájl: `index.html`. Böngészőben megnyitva azonnal játszható, internet nem kell hozzá. GitHub Pages-en a mappa linkjén érhető el.

## Háttér
Az ötlet egy lejárt magyar szabadalomból indult (HU 227005, „Logikai táblajáték kettő vagy több játékos részére”, díjfizetés hiányában megszűnt). A győzelmi szabály, a tábla mérete, a gépi ellenfél és a program saját fejlesztés.

## Betűtípusok
A betűk a fájlba ágyazva töltődnek be: Poppins (SIL Open Font License 1.1), TeX Gyre Adventor (GUST Font License).

© 2026 Fejes Géza. Minden jog fenntartva. Részletek: [LICENSE](LICENSE).
