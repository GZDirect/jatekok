# Árnyékerdő – fejlesztői átadó

Ez a leírás annak szól, aki (ember vagy Claude) a játékot tovább fejleszti. Mindent tartalmaz, ami a munka folytatásához kell. Az utolsó átadás 2026. október 25-én volt.

## 1. Mi ez

- Belső nézetes, lopakodós túlélőjáték egy éjszakai erdőben, elsősorban telefonra. Billentyűzettel és egérrel számítógépen is játszható.
- Fejes Géza saját szórakoztatására készül, nem eladásra. Géza nem fejlesztő: magyarul ír, és kész, kipróbálható eredményt szeretne látni, nem kódot. Képernyőképekkel érdemes megmutatni, mi változott.
- Állapot: játszható prototípus. Az eddigi utolsó nagy kör a grafika feljavítása volt. Géza azt mondta, hogy „első körben” ezt kéri; a következő kör tartalma még nincs eldöntve.
- Élő változat: https://gzdirect.github.io/jatekok/arnyekerdo/

## 2. A játékmenet most

- **Két mód:**
  - *Célpont*: amikor lejár a 3 perc, a kék fénynél (jelzőfénynél) kell lenned.
  - *Túlélés*: élj túl 3 percet bárhol.
- **Pálya:**
  - Nagyjából 190 × 190 m-es erdő.
  - A játékos a déli szélen indul (z = 84), az ellenfél az északin (z = −84).
- **Az ellenfél minden körben véletlenül választódik.** Csak nyomokból derül ki, melyik az:
  - **Szörny:** rosszul lát, de mindent hall. Karmos nyomokat hagy.
  - **Nindzsa:** messzire lát, bokorban guggolva viszont nem lát meg. Nem hagy nyomot.
  - **Szellem:** csak a mozgást látja, gyorsabb nálad, és dérnyomot hagy. Ha mozdulatlan maradsz, elveszít.
- **Érzékelés:** látótávolság, látószög, hallás a játékos zajából, és takarás a fák mögött (`blocked()`).
- **Ellenfél viselkedése:** három állapota van: őrjárat, nyomozás, üldözés.
- **Játékos képességei:**
  - Guggolás: halk, és bokorban rejtve vagy.
  - Futás: erőt fogyaszt és zajos.
  - Füst (2 db): elvakítja a közeli üldözőt, és benne rejtve vagy.
- **Felület (HUD):**
  - Ki-gyűrű és állapot (Nyugodt stb.), az ellenfél neve, ha már felismerted.
  - Visszaszámláló, irány és távolság a célponthoz.
  - Erő- és zajsáv, „Rejtve” jelzés.
  - Képernyőeffektek: sötétebb képszélek (vignetta), veszély esetén vörös, bokorban zöld keret.
  - Szívdobogás-hang.
- **Irányítás:**
  - Telefon: bal hüvelykujj mozgás (megjelenő joystick), jobb hüvelykujj körülnézés, gombok: Guggol, Fut, Füst.
  - Számítógép: W A S D mozgás, Shift futás, C guggolás, F füst, egérrel húzva körülnézés.

## 3. Fájlok

A `GZDirect/jatekok` repóban minden játék külön mappában van. A GitHub Pages a `main` ágból közvetlenül szolgálja ki őket.

```
arnyekerdo/
  index.html      ← GENERÁLT, ezt szolgálja ki a GitHub Pages. Kézzel ne szerkeszd.
  LICENSE, README.md, FEJLESZTES.md
  src/
    shell.html    ← HTML, CSS, HUD, kezdő és záró képernyő; a /*@@JATEK@@*/ jelölő helyére kerül a JS
    world.js      ← terep (H() magasságfüggvény, JS-ben és GLSL-ben is), égbolt, hold, csillagok,
                    távoli sziluettek, fák (fenyő, nyír, száraz fa), farönkök, bokrok, páfrány, kövek,
                    avar, világító gombák, holdfény-csóvák, ködpadok, fű, szentjánosbogarak, hulló levelek.
                    Mindent a window.AE objektumon ad tovább.
    actors.js     ← ellenfelek modelljei és animációja (nindzsa, szörny, szellem), lábnyomok,
                    célpont-jelzőfény, füst, a játékos kezei belső nézetben. A window.AE-t bővíti.
    game.js       ← ellenféltípusok (TYPES), játékállapot, irányítás, érzékelés, mozgás, nyomok,
                    üzenetek, hangok, képernyőeffektek, minőség-visszaszabályozás, fő ciklus.
    build.py      ← összeállítja az index.html-t
```

Összeállítás a repó gyökeréből:

```
python3 arnyekerdo/src/build.py
python3 arnyekerdo/src/build.py --artifact /valahova/arnyekerdo.html   # claude.ai artifacthoz, HTML-váz nélkül
```

Az `index.html` egy teljes HTML-vázba csomagolja a játékot (doctype, viewport, szerzői meta). A claude.ai artifactoknak ez a váz nem kell, nekik a `--artifact` kimenet való.

A repó gyökerében az `index.html` a játékválasztó nyitóoldal. Ha új funkció kerül a játékba, érdemes ott a leírását is frissíteni.

## 4. Technika és csapdák

- **Three.js r128**, a cdnjs-ről: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. Nincs build-eszköz és nincs npm, minden egyetlen HTML-fájl.
- r128-ban a `BufferGeometry`-nek nincs `applyQuaternion` metódusa: `applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q))` kell helyette.
- A `world.js` `merge()` függvénye vertexszínes geometriákat fűz össze; a sok fát, bokrot, követ `InstancedMesh` rajzolja, `frustumCulled=false` beállítással.
- A fű egyedi shader (`onBeforeCompile`): egy 40 m-es csempe vándorol a kamerával. A pozíció képlete: `wp=aRoot+uTile*floor((uCam-aRoot)/uTile+0.5)`. A terepmagasság a GLSL-ben ugyanaz a `hgt()`, mint a JS-ben a `H()`. Ha a terepet módosítod, mindkettőt egyformán kell átírni.
- Az árnyékkamera lépésekben követi a játékost, a minőség-visszaszabályozás pedig magától dolgozik: ha 150 kép átlaga 40 ms fölött van, csökken a pixelarány és a fű sűrűsége.
- **Teljesítménykeret:** nagyjából 425 ezer háromszög. Volt már 910 ezer, és az túl sok volt telefonra.
- **Korábbi hibák, amiket ne hozz vissza:**
  - A nyírfa koronáját nem egyenletes skálázás torzította; méterben épül, egyenletes skálával.
  - A kezek egyszer óriásiak lettek.
  - Az avar négyzetesnek tűnt; `alphaTest` levéltextúra kell hozzá.
  - A nindzsa túl sötét volt.
  - A szellem feje láthatatlan volt; külön anyaga van.
- **Valódi eszközön még nem volt tesztelve.** Az eddigi teszteket a felhőben futó headless Chromium végezte.

## 5. Tesztelés

Headless Chromium és Playwright, szoftveres WebGL-lel. A Three.js-t érdemes helyben kiszolgálni, mert a CDN-t a homokozó gyakran nem éri el.

```
chromium args: --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist
```

- Egy kis Node HTTP-szerver kiszolgálja a mappát. A `three.min.js`-t helyi fájlra kell cserélni az oldalban.
- Képernyőkép kell telefon- (390×844) és fekvő méretben is.
- A szoftveres renderelés lassú (pár kép másodpercenként), ezért a játékidővel számoló tesztek ott lassan futnak.
- Ha a játékállapotba kell belenyúlni, a teszt idejére egy `window.AE_TEST={P,E,S}` horog jól bevált. Az élő változatból ki kell venni.

## 6. Szabályok

- **Szerzői jog:** minden fájlban maradjon meg a „© 2026 Fejes Géza. Minden jog fenntartva.” jelölés: a HTML-kommentben, a kezdő és a záró képernyőn, és a LICENSE fájlban. A kisvakond repóhoz ne nyúlj.
- **Commit szerzője:** Fejes Géza (az e-mail címet Géza adja meg, a repóban ne szerepeljen). Csak akkor commitolj és pusholj, ha Géza kéri.
- **Nyelv:** a felület magyar. Ha angol is kell, a Pihe odúja (`pihe/`) szótáras fordítását érdemes átvenni (`EN_X`, `tr()`, MutationObserver).
- **Hangulat:**
  - Éjszakai, holdfényes, ködös erdő; a felület vékony, a sarkokba húzódó, tusrajz-hatású.
  - Betűk: EB Garamond (címek), IBM Plex Sans (felület), Noto Serif JP (a 気 jel).
  - A hangsúlyszínek és a többi szín a `shell.html` `:root` blokkjában vannak.
- **Hangvétel Géza felé:** rövid, magyar, eredményközpontú üzenetek, képernyőképpel. Ha valamit nem tudsz tesztelni (például valódi telefonon), mondd ki.

## 7. Lehetséges következő lépések

Ezek csak ötletek, Géza még egyiket sem döntötte el.

- Több ellenféltípus vagy kettő egyszerre; nehézségi szintek.
- Gazdagabb hangok: ellenfélenként saját hang, lépteknek más hangja avaron és fűben.
- Térkép vagy iránytű, többféle célpont, több kör egymás után (pontszám, legjobb idő).
- Időjárás (eső, sűrűbb köd), ami a látást és a hallást is befolyásolja.
- Rejtőzési lehetőségek: fára mászás, magas fű, víz.
- Valódi telefonos teljesítményteszt, és ha kell, finomhangolás.