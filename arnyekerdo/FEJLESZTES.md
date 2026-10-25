# Árnyékerdő – fejlesztői átadó

Ez a leírás annak szól, aki (ember vagy Claude) a játékot tovább fejleszti. Mindent tartalmaz, ami a munka folytatásához kell. Utoljára frissítve: 2026. október 25., a rendőrös küldetés után.

## 1. Mi ez

- Belső nézetes, lopakodós túlélőjáték egy éjszakai erdőben, elsősorban telefonra. Billentyűzettel és egérrel számítógépen is játszható.
- Fejes Géza saját szórakoztatására készül, nem eladásra. Géza nem fejlesztő: magyarul ír, és kész, kipróbálható eredményt szeretne látni, nem kódot. Képernyőképekkel érdemes megmutatni, mi változott.
- Állapot: játszható prototípus. Előbb a grafika lett feljavítva, aztán 2026. október 25-én a játék Tenchu-stílusú, rendőrös lopakodó küldetéssé alakult (lásd lent).
- Élő változat: https://gzdirect.github.io/jatekok/arnyekerdo/

## 2. A játékmenet most (Tenchu-stílusú rendőrös küldetés)

- **Helyzet:** éjszaka van a japán hegyekben, a rendőrség körbezárta a völgyet.
  - A játékos a völgy déli végéből indul, a forgó villogós rendőrautó mellől.
  - Cél: eljutni az északi hegyi útra, a kijárathoz (utcai nátriumlámpa, korlát, italautomata).
  - Az irányt egy iránytű mutatja. Az idő felfelé számol.
- **Hat rendőr** járja be a saját útvonalát, kezükben zseblámpa és revolver.
  - **Állapotaik:** őrjárat, gyanakvás, keresés, riadó.
  - **Látás:** a zseblámpa fénycsóvájában messzebbről, azon kívül közelről látnak. Guggolva és bokorban kevésbé.
  - **Hallás:** a játékos zajára (futás, sima járás) gyanakodni kezdenek.
  - **Leütött társ:** ha ilyet látnak, keresni kezdenek, és a többieket is riasztják.
  - **Kiütött rendőr:** kb. 75 másodperc múlva magához tér, és riaszt.
  - **Lövés:** riadóban lőnek. A játékosnak 100 életereje van, egy találat 18–26 pont.
  - **Beszéd:** japánul szólnak meg (a böngésző felolvasójával), alul magyar felirattal.
- **Eszközök** (váltás: 1–4):
  - *Tantó*: hátulról egy csapással öl.
  - *Tekko*: hátulról csak leüt.
  - *Kampó*: célozz egy sűrű lombú óriásfára. Ha a lomb halványan felderül, fel tudsz kapaszkodni.
  - *Karmok*: az óriásfa törzsén felmászhatsz.
- **Fán:** csak akkor látnak meg, ha rád világítanak. Leugrással felülről is támadhatsz (szóköz), ez erősebb csapás.
- **Füst** (2 db): elvakítja a közeli rendőröket, és eltakar.
- **Értékelés a végén:** a rang a riasztások és a leszámolt rendőrök számától függ. A legjobb az Árnyék (senki sem vett észre, és senkit sem bántottál). A további fokozatok: Csendes halál, Nagymester, Mester, Nindzsa, Tanonc, Útonálló. Kiírja az időt, az ölések, a leütések és a riasztások számát is.
- **Felület (HUD):** iránytű, ki-gyűrű, élet- és zajsávok, célkereszt felirattal, a kijárat jelölője, képernyőeffektek (vignetta, vörös veszély- és sérülésjelzés, zöld bokorkeret).
- **Irányítás:**
  - Telefon: bal hüvelykujj mozgás, jobb hüvelykujj körülnézés, gombok.
  - Számítógép: W A S D, egérrel húzva körülnézés, C guggolás, kattintás vagy E a használat, 1–4 eszközváltás, szóköz leugrás, F füst.
- **A régi ellenfelek** (szörny, nindzsa, szellem) beállításai és viselkedése az `src/parkolt.js`-ben vannak félretéve. A modelljeik az `actors.js`-ben maradtak, később visszakapcsolhatók.

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
    actors.js     ← modellek és animációk: japán rendőr (zseblámpa, revolver), a régi ellenfelek
                    (nindzsa, szörny, szellem), füst, kötél, a játékos kezei és eszközei. A window.AE-t bővíti.
    parkolt.js    ← a régi ellenfelek félretett beállításai és viselkedése (most nem fut)
    game.js       ← rendőrök érzékelése és viselkedése, eszközök, kampó, mászás, leugrás, irányítás,
                    feliratok és hangok, HUD, értékelés, képernyőeffektek, minőség-visszaszabályozás, fő ciklus.
                    Tesztelési horog: ?aetest címparaméterrel window.AE_TEST.
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