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
- **Nehézség** (a kezdőképernyőn): Könnyű 4, Normál 6, Nehéz 8 rendőr; a nehezebb szinten messzebbre látnak, élesebben hallanak, hamarabb gyanakszanak, és nagyobbat sebez a lövésük (`DIFF` a game.js-ben). A választást a böngésző megjegyzi.
- **Útvonalak:** minden körben újak (`genRoute`): a völgy délről északra sávokra oszlik, mindegyikben egy rendőr jár körbe négy ponton.
- **A rendőrök** járják a saját útvonalukat, kezükben zseblámpa és revolver.
  - **Állapotaik:** őrjárat, gyanakvás, keresés, riadó.
  - **Látás:** a zseblámpa fénycsóvájában messzebbről, azon kívül közelről látnak. Guggolva és bokorban kevésbé.
  - **Hallás:** a játékos zajára (futás, sima járás) gyanakodni kezdenek.
  - **Leütött társ:** ha ilyet látnak, keresni kezdenek, és a többieket is riasztják.
  - **Kiütött rendőr:** kb. 75 másodperc múlva magához tér, és riaszt.
  - **Lövés:** riadóban lőnek. A játékosnak 100 életereje van, egy találat 18–26 pont.
  - **Beszéd:** japánul szólnak meg (a böngésző felolvasójával), alul magyar felirattal.
  - **Riasztásjelző a fejük fölött:** kérdőjel, ami a gyanúval narancsra telik; keresés közben teli; riadóban vörös felkiáltójel (`makeMark`, `drawMark`).
  - **Zseblámpa:** látható fénykúp sodródó porszemekkel, és fénykör a talajon, ahol a tengelye földet ér (`makePool`, `beamHit` az actors.js-ben). A fény a talajt és a tárgyakat is megvilágítja (a legközelebbi 6 rendőr lámpája a shaderben).
  - **Ütközés:** a rendőrök és a játékos sem mehet át fán, óriásfa gyökerén (`col`), sziklán (0,42 m-től), farönkön, a rendőrautón, a lámpaoszlopon és az italautomatán; a rendőrök egymáson és a játékoson sem.
- **Eszközök** (váltás: 1–5):
  - *Tantó*: hátulról egy csapással öl.
  - *Tekko*: hátulról csak leüt.
  - *Kampó*: célozz egy sűrű lombú óriásfára. Ha a lomb halványan felderül, fel tudsz kapaszkodni.
  - *Karmok*: az óriásfa törzsén felmászhatsz.
  - *Kavics* (Normálon 6 db): a koppanása 16 m-en belül odacsalja a nem riasztott rendőröket (`throwStone`, `stoneLand`).
- **Test elrejtése:** a leütött vagy megölt rendőrt el lehet húzni (Húz gomb, G); ha bokorban engeded el, a társai nem találják meg (`hiddenBody`). Húzás közben lassú vagy.
- **Fán:** csak akkor látnak meg, ha rád világítanak. Leugrással felülről is támadhatsz (szóköz), ez erősebb csapás.
- **Füst** (2 db): elvakítja a közeli rendőröket, és eltakar.
- **Értékelés a végén:** a rang a riasztások és a leszámolt rendőrök számától függ. A legjobb az Árnyék (senki sem vett észre, és senkit sem bántottál). A további fokozatok: Csendes halál, Nagymester, Mester, Nindzsa, Tanonc, Útonálló. Kiírja az időt, az ölések, a leütések és a riasztások számát is.
- **Közeli térkép** (bal felső sarok, `drawRadar`): a nézési irány felfelé, 36 m sugarú környék; bokrok, óriásfák a lombjukkal, a kijárat iránya, füstfelhő, leütött rendőrök (×), és a kereső vagy riasztott rendőrök.
- **Bemutató:** az első körben (a kezdőképernyőn ki-be kapcsolható) nyolc lépés vezet végig a mozgáson, a kampón, a leugráson, a kavicson, a tantón és a test elrejtésén (`TUT`). Ha a játékos megcsinálja, amit a lépés kér, magától továbblép; a Tovább gombbal léptetni is lehet, a Kihagyom bezárja.
- **Hangok:** léptek talajonként más hanggal (avar, fű, bokor, aszfalt), a rendőrök léptei és rádiója térhatással, tücskök, bagoly, szél. A bokor megrezzen, ha átmész rajta, a fű elhajlik a játékos és a közeli rendőrök előtt.
- **Felület (HUD):** iránytű, ki-gyűrű, élet- és zajsávok, célkereszt felirattal, a kijárat jelölője, képernyőeffektek (vignetta, vörös veszély- és sérülésjelzés, zöld bokorkeret).
- **Irányítás:**
  - Telefon: bal hüvelykujj mozgás, jobb hüvelykujj körülnézés, gombok.
  - Számítógép: W A S D, egérrel húzva körülnézés, C guggolás, kattintás vagy E a használat, 1–5 eszközváltás, G húzás, szóköz leugrás, F füst.
  - Telefonon és tableten csak fekvő helyzetben játszható. Az első érintésre teljes képernyőre vált, és fekvőre rögzít (Androidon). Álló helyzetben a „Fordítsd el a telefont” jelzés takarja, és a játék megáll. iPhone-on a Safari ezt nem engedi; ott a „Hozzáadás a főképernyőhöz” után indítva teljes képernyős (`manifest.webmanifest`, ikonok, `apple-mobile-web-app-capable`).
- **A régi ellenfelek** (szörny, nindzsa, szellem) beállításai és viselkedése az `src/parkolt.js`-ben vannak félretéve. A modelljeik az `actors.js`-ben maradtak, később visszakapcsolhatók.

## 2b. Második pálya: kiképzés a mester falujában (`?palya=falu`)

Történetben a rendőrös küldetés után jön: az idős mester rejtett hegyi falujába viszi a játékost, és ott tanítja meg rendesen az eszközöket. A kezdőképernyőn két gomb választ pályát (1 · Rendőrkordon, 2 · A mester faluja); a falu a `?palya=falu` címmel töltődik be. A `world.js` a `LV` változóból tudja, melyik pálya fut (kisebb, laposabb terep, nincs kijárati út és rendőrautó, a falu területén nincsenek véletlen fák és kövek).

Mintának a Tenchu kiképző küldetését (szobáról szobára, egy ötlet egy helyen, a végén rang), a Mark of the Ninja egyértelmű visszajelzéseit és vállalható pecsétjeit, a Sekiro Hanbeijét (gyakorlótárs, akihez vissza lehet menni) és a Shadow Tactics fokozatos, egyszerre egy eszközt bevezető pályáit vettük.

- **Felépítés:** a falu délről északra tíz udvarra oszlik (`ROOMS` a `falu.js`-ben), bambuszkerítésekkel és kapukkal. Az első kapu tórii. A kampós udvarban 3,3 m-es vakolt fal áll, kapu nélkül. Az északi végén a dódzsó (影道場), mellette kőlámpások, a kerítésen kívül falusi házak.
- **A mester** (`buildPolice(…,{master:true})`) minden próbánál máshol áll, a játékos felé fordul. Japánul beszél beszédszintézissel (`sayLine`, ja-JP), magyar felirattal. A feladat a felső panelen olvasható. Az iránytű és a térkép a mestert mutatja.
- **A tíz próba** (`ST` a `falu_game.js`-ben):
  1. Érkezés: odamenni a mesterhez. Bemutatkozik, és kinyitja a tóriit.
  2. Csend: egy háttal álló tanítvány mellett guggolva elosonni. Ha járva megy el mellette, meghallja.
  3. Bokor: lámpás járőr; bokorban guggolva, a ? jelet figyelve átjutni.
  4. Bábuk: három szalmabábu, csak hátulról lehet eltalálni őket (tantóval és tekkóval is). Szemből ütve a mester szól.
  5. Kampó: a falon fáról fára (A → B) jutni át, majd leugrani.
  6. Karmok: felmászni egy óriásfára, és a járőrre felülről ráugrani. A földről indított ütés nem számít.
  7. Kavics (3 db): elcsalni a kaput figyelő őrt.
  8. Test: egy földön fekvő tanítványt bokorba húzni, mielőtt a járőr (14 mp múlva indul) meglátja.
  9. Füst (2 db): két idősebb tanítvány azonnal rátámad. Meg kell várni, hogy közel érjenek, füstöt dobni, és közöttük a kapuig futni.
  10. Vizsga: három járőr között eljutni a mesterhez a dódzsó elé.
- **Hiba esetén** (meghallották, meglátták, elkapták, megtalálták a testet) a mester megszólal, és a játékos az udvar elejéről kezdi újra. Az udvar tanítványai is visszaállnak.
- **Értékelés:** három pecsét jár. Árnyék, ha a vizsgán nem volt riasztás; Türelmes, ha egyszer sem kellett újrakezdeni; Gyors, ha 10 percen belül végzett. A rang a pecsétek számától függ: Tanítvány, Nindzsa, Mester, Árnyékmester.
- **Kapcsolat a játékkal:** a `game.js` a `window.AE.G` objektumon ad horgokat (`setup`, `newRound`, `update`, `caught`, `melee`, `rank`) és belső függvényeket. A falu nem öl: a tantó is csak leüt. A tanítványoknál a `c.active` jelző dönti el, hogy figyelnek-e; csak az aktuális udvar tanítványai aktívak.
- **Tesztelés:** `?palya=falu&aetest`, a `window.AE_FALU` horoggal (`startStation(i)`, `T`, `fail`). Headless teszttel mind a tíz próba végigment, a csend próbája járva elbukik, guggolva sikerül.

## 3. Fájlok

A `GZDirect/jatekok` repóban minden játék külön mappában van. A GitHub Pages a `main` ágból közvetlenül szolgálja ki őket.

```
arnyekerdo/
  index.html      ← GENERÁLT, ezt szolgálja ki a GitHub Pages. Kézzel ne szerkeszd.
  LICENSE, README.md, FEJLESZTES.md
  manifest.webmanifest, icon-180/192/512.png  ← főképernyőre tett webalkalmazás (fekvő, teljes képernyő)
  src/
    shell.html    ← HTML, CSS, HUD, kezdő és záró képernyő; a /*@@JATEK@@*/ jelölő helyére kerül a JS
    world.js      ← terep (H() magasságfüggvény, JS-ben és GLSL-ben is), égbolt, hold, csillagok,
                    távoli sziluettek, fák (fenyő, nyír, száraz fa), farönkök, bokrok, páfrány, kövek,
                    avar, világító gombák, holdfény-csóvák, ködpadok, fű, szentjánosbogarak, hulló levelek.
                    Mindent a window.AE objektumon ad tovább.
    actors.js     ← modellek és animációk: japán rendőr (zseblámpa, revolver), a régi ellenfelek
                    (nindzsa, szörny, szellem), füst, kötél, a játékos kezei és eszközei. A window.AE-t bővíti.
    falu.js       ← a 2. pálya díszlete: kerítések, kapuk, fal, házak, dódzsó, kőlámpások, szalmabábuk,
                    a mester és a tanítványok helye (AE.FALU). Csak ?palya=falu címmel fut.
    parkolt.js    ← a régi ellenfelek félretett beállításai és viselkedése (most nem fut)
    game.js       ← rendőrök érzékelése és viselkedése, eszközök, kampó, mászás, leugrás, irányítás,
                    feliratok és hangok, HUD, értékelés, képernyőeffektek, minőség-visszaszabályozás, fő ciklus.
                    Tesztelési horog: ?aetest címparaméterrel window.AE_TEST.
    falu_game.js  ← a 2. pálya próbái, a mester szövegei, hiba és újrakezdés, pecsétek
    build.py      ← összeállítja az index.html-t (sorrend: world, actors, falu, parkolt, game, falu_game)
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

Ezek csak ötletek, Géza még nem döntötte el őket.

- Valódi telefonos és tabletes teljesítményteszt, és ha kell, finomhangolás (a 8 rendőrös Nehéz szint a legterhelőbb).
- A régi ellenfelek (`parkolt.js`) visszahozása külön küldetésként.
- Harmadik pálya a kiképzés után, pontszám és legjobb idő mentése, a pecsétek megőrzése.
- Időjárás (eső, sűrűbb köd), ami a látást és a hallást is befolyásolja.
- Többféle rejtekhely: magas fű, víz, barlang.

---

© 2026 Fejes Géza. Minden jog fenntartva. A játék és a leírás engedély nélkül nem másolható, nem terjeszthető és nem értékesíthető.
