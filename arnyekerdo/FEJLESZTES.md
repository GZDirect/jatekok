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
  - **Beszéd:** mindenki magyarul beszél: alul felirat, és a böngésző magyar hanggal felolvassa (`say`, `sayLine`, `showSub`, `speak`). A szövegtömbökben megmaradt a japán eredeti is (0. és 1. elem), de nem jelenik meg; csak a 2. elem, a magyar szöveg számít. Géza kérése: japán szöveg ne legyen.
  - **Riasztásjelző a fejük fölött:** kérdőjel, ami a gyanúval narancsra telik; keresés közben teli; riadóban vörös felkiáltójel (`makeMark`, `drawMark`).
  - **Zseblámpa:** látható fénykúp sodródó porszemekkel, és fénykör a talajon, ahol a tengelye földet ér (`makePool`, `beamHit` az actors.js-ben). A fény a talajt és a tárgyakat is megvilágítja (a legközelebbi 6 rendőr lámpája a shaderben).
  - **Ütközés:** a rendőrök és a játékos sem mehet át fán, óriásfa gyökerén (`col`), sziklán (0,42 m-től), farönkön, a rendőrautón, a lámpaoszlopon és az italautomatán; a rendőrök egymáson és a játékoson sem.
- **Eszközök** (váltás: 1–8):
  - *Tantó*: hátulról egy csapással öl.
  - *Tekko*: hátulról csak leüt.
  - *Kampó*: célozz egy sűrű lombú óriásfára. Ha a lomb halványan felderül, fel tudsz kapaszkodni.
  - *Karmok*: az óriásfa törzsén felmászhatsz.
  - *Kavics* (Normálon 6 db): a koppanása 16 m-en belül odacsalja a nem riasztott rendőröket (`throwStone`, `stoneLand`).
  - Tüskék (makibishi, 6): állva előre dobod (ív, mint a kavics), futás közben magad mögé szórod. Aki belelép, 4,5 mp-re megáll, és addig nem is kap el (`useSpikes`, `stepSpikes`, `SPK`).
  - Köpőcső (fukiya, 7): altatónyíl, egyenes, gyors lövedék 30 m-ig. Akit eltalál, 1,3 mp múlva elalszik (nem öl; a rendőr 55 mp-ig alszik). Ha a célkereszt felderül, talál (`blowDart`, `stepDart`, `dartTarget`, `DART`).
  - Shuriken (dobócsillag, 8): gyors, enyhén íves dobás. Találatonként 1 életpontot visz le (a rendőrnek 3 van, a 3. találat leteríti; a faluban nem öl). Ha nem talál, a csattanása 10 m-ről odacsalja az őröket, a földön marad, és rálépve visszaveheted (`throwStar`, `stepStars`, `STARS`).
  - Készlet nehézségenként: tüske 3/2/2, nyíl 4/3/2, dobócsillag 6/5/4 (`DIFF`). A falu vizsgáján 5 csillag jár.
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
  - Számítógép: W A S D; jobb egérgomb = guggolás (vagy C), Q = futás be/ki (vagy Shift nyomva), görgő = eszközváltás. Gépen a jobb oldali érintőgombok (Guggol, Fut, Füst, Szúr, Húz) el vannak rejtve (`body.desk`). a játéktérre kattintva az egér rögzül (pointer lock), onnan húzás nélkül nézel körül, kattintás = használat, Esc elengedi (rögzítés nélkül húzással is megy). Az egér érzékenysége az ujjénak 0,42-szerese (`MOUSE_K`), a kamera pedig 30 ms körüli simítással követi a nézést (`VIEW`). Enter: bemutató, Tovább. C guggolás, kattintás vagy E a használat, 1–8 eszközváltás, G húzás, szóköz leugrás, F füst.
  - Telefonon és tableten csak fekvő helyzetben játszható. Az első érintésre teljes képernyőre vált, és fekvőre rögzít (Androidon). Álló helyzetben a „Fordítsd el a telefont” jelzés takarja, és a játék megáll. iPhone-on a Safari ezt nem engedi; ott a „Hozzáadás a főképernyőhöz” után indítva teljes képernyős (`manifest.webmanifest`, ikonok, `apple-mobile-web-app-capable`).
- **A régi ellenfelek** (szörny, nindzsa, szellem) beállításai és viselkedése az `src/parkolt.js`-ben vannak félretéve. A modelljeik az `actors.js`-ben maradtak, később visszakapcsolhatók.

## 2b. Második pálya: kiképzés a mester falujában (`?palya=falu`)

Történetben a rendőrös küldetés után jön: az idős mester rejtett hegyi falujába viszi a játékost, és ott tanítja meg rendesen az eszközöket. A kezdőképernyőn két gomb választ pályát (1 · Rendőrkordon, 2 · A mester faluja); a falu a `?palya=falu` címmel töltődik be. A `world.js` a `LV` változóból tudja, melyik pálya fut (kisebb, laposabb terep, nincs kijárati út és rendőrautó, a falu területén nincsenek véletlen fák és kövek).

Mintának a Tenchu kiképző küldetését (szobáról szobára, egy ötlet egy helyen, a végén rang), a Mark of the Ninja egyértelmű visszajelzéseit és vállalható pecsétjeit, a Sekiro Hanbeijét (gyakorlótárs, akihez vissza lehet menni) és a Shadow Tactics fokozatos, egyszerre egy eszközt bevezető pályáit vettük.

- **Felépítés:** a falu délről északra tizenkét udvarra oszlik (`ROOMS` a `falu.js`-ben), bambuszkerítésekkel és kapukkal. Az első kapu tórii. A kampós udvarban 3,3 m-es vakolt fal áll, kapu nélkül. Az északi végén a dódzsó (影道場), mellette kőlámpások, a kerítésen kívül falusi házak.
- **A mester** (`buildPolice(…,{master:true})`) minden próbánál máshol áll, a játékos felé fordul. Magyarul beszél (`sayLine`, hu-HU felolvasás, felirat). A feladat a felső panelen olvasható. Az iránytű és a térkép a mestert mutatja.
- **A tizenkét próba** (`ST` a `falu_game.js`-ben):
  1. Érkezés: odamenni a mesterhez. Bemutatkozik, és kinyitja a tóriit.
  2. Csend: egy háttal, csukott szemmel álló tanítvány (nem lát, nincs lámpafénye, `eyesClosed`) mellett guggolva elosonni; járva meghallja. Kavicsot (3 db) is lehet dobni: ha a koppanáshoz megy, az nem bukás, csak ha a játékost hallja meg.
  3. Bokor: lámpás járőr; bokorban guggolva, a ? jelet figyelve átjutni.
  4. Bábuk: három szalmabábu, csak hátulról lehet eltalálni őket (tantóval és tekkóval is). Szemből ütve a mester szól.
  5. Kampó: a falon fáról fára (A → B) jutni át, majd leugrani.
  6. Karmok: felmászni egy óriásfára, és a járőrre felülről ráugrani. A földről indított ütés nem számít.
  7. Kavics (3 db): elcsalni a kaput figyelő őrt.
  8. Test: egy földön fekvő tanítványt bokorba húzni, mielőtt a járőr (14 mp múlva indul) meglátja.
  9. Füst (2 db): két idősebb tanítvány azonnal rátámad. Meg kell várni, hogy közel érjenek, füstöt dobni, és közöttük a kapuig futni.
  10. Köpőcső (3 nyíl): a kaput figyelő őrt távolról elaltatni. Ha máshogy teszed ártalmatlanná, a mester újrakezdeti.
  11. Tüskék (2 db): egy idősebb tanítvány rátámad, a kapu zárva. Ha belelép a tüskékbe, kinyílik a kapu.
  12. Vizsga, nappal: elsötétül a kép („Másnap délben”), nappali fények (`setDay`), a tanítványoknál nincs lámpafény, de 1,45-ször messzebbre látnak (`G.day`). Három járőr között kell eljutni a mesterhez a dódzsó elé.
- **Hiba esetén** (meghallották, meglátták, elkapták, megtalálták a testet) a mester megszólal, és a játékos az udvar elejéről kezdi újra. Az udvar tanítványai is visszaállnak.
- **Értékelés:** három pecsét jár. Árnyék, ha a vizsgán nem volt riasztás; Türelmes, ha egyszer sem kellett újrakezdeni; Gyors, ha 10 percen belül végzett. A rang a pecsétek számától függ: Tanítvány, Nindzsa, Mester, Árnyékmester.
- **Kapcsolat a játékkal:** a `game.js` a `window.AE.G` objektumon ad horgokat (`setup`, `newRound`, `update`, `caught`, `melee`, `rank`) és belső függvényeket. A falu nem öl: a tantó is csak leüt. A tanítványoknál a `c.active` jelző dönti el, hogy figyelnek-e; csak az aktuális udvar tanítványai aktívak.
- **Tesztelés:** `?palya=falu&aetest`, a `window.AE_FALU` horoggal (`startStation(i)`, `T`, `fail`). Headless teszttel mind a tizenkét próba végigment, a csend próbája járva elbukik, guggolva sikerül.

- **Teljes képernyő:** minden eszközön az első kattintásra/érintésre (a böngésző kattintás nélkül nem engedi).
- **Pályák sorrendje:** a 2. pálya gombja a kezdőképernyőn le van zárva, amíg az 1. pályát egyszer nem teljesítetted (`localStorage` `ae-l1-done`). Az 1. pálya sikeres vége után a záró képernyőn „Tovább: 2 · A mester faluja” gomb jelenik meg. A `?palya=falu` cím közvetlenül mindig működik.
- **Minőség:** ha 150 kép átlaga 30 ms fölött van, a játék lejjebb veszi a minőséget (pixelarány, fű, árnyék).

- **Nyitókép:** a játék neve **Shinobi** (a mappa és a link marad `arnyekerdo`). Induláskor a nyitókép jön (`#title`: `nyitokep.jpg` 2560×1440 nagy kijelzőre, `nyitokep-kicsi.jpg` 1280×720 telefonra), rajta a „Shinobi” cím, a Kezdés és a Mentések gomb. A kép egy kunyhó belseje a fegyvertartóval; a bal oldalra sötét átmenet kerül a felirat miatt. Ha a címben van `?palya=`, a nyitókép kimarad (például a Tovább gombnál).
- **Mentések:** három hely a böngészőben (`ae-save-1..3`, a kiválasztott: `ae-slot`). Tárolja, hogy kész-e az 1. és a 2. pálya, a legjobb rangot és a 2. pálya pecsétjeit (`saveProgress`, `loadSave`). A Kezdés a kiválasztott mentés szerint folytat: ha az 1. pálya kész, a 2. pálya kezdőképernyőjére visz. A régi `ae-l1-done` jelzést az 1. mentésbe veszi át.

## 2c. Harmadik pálya: Üvegtorony (`?palya=varos`)

Nappal, egy nagyváros közepén, két felhőkarcoló tetején. A cél Kuroda, a cégvezető, aki a rendőröket a játékosra küldte. A 2. pálya teljesítése után nyílik (mentés: `l3`, `r3`, `s3`).

A tervezésnél ezekre figyeltünk: Hitman (rövid, kiszámítható célpont-kör és „lehetőségek”), Dishonored 2 (logikus terek, több út), Mark of the Ninja (egyértelmű visszajelzés, gyors újrakezdés), Sekiro (jól jelölt kampópontok). Kerülendő volt a Tenchu: Shadow Assassins hibája (láthatatlan falak, holttestet nem vevő őrök) és az Aragami 2 ismétlődése.

- **Motor:** a tetők síkja y=0 (`H()=0`). A járható részek téglalapok (`VAROS.rects`). A `clampField` a legközelebbi tetőre húz vissza, így a mélybe nem lehet lesétálni. A mélység fölé nem lehet leugrani (`dropDown` megtagadja). Az erdő díszletei (terep, fű, fák, köd) ki vannak kapcsolva; a város a `varos.js`-ben épül (tornyok, utca a mélyben −150 m-en, autók).
- **Kampópontok:** a `giants` lista ezen a pályán daru (a szakadék fölött), víztorony (a céltorony tetején, karmokkal is mászható) és antenna (a penthouse tetején, az iroda fölött). A fák helyett ezek világítanak fel célzáskor (`A.glowGiant` felülírva).
- **Penthouse:** üvegfal (átlátni rajta, átmenni nem: `low` ütköző), redőny és beton (eltakar), belső fal ajtóval, íróasztal, tárgyalóasztal. Tetőablak az antenna mellett: onnan felülről lehet Kurodára ugrani.
- **Kuroda** (`buildPolice(…,{suit:true,boss:true})`, fegyvertelen): napirend íróasztal → tárgyaló → íróasztal → terasz (ott telefonál, a testőr az ajtóban háttal áll). Riadóra a biztonságos sarokba menekül. Az ajtókon át útvonalat számolunk (`path`, `navTo`).
- **Testőrök és járőrök:** két személyi testőr követi Kurodát; 2/3/4 járőr a tetőn (nehézség szerint); az első riadó után 8 mp-cel két erősítés jön a lépcsőházból.
- **Kamerák:** három pásztázó kamera; ha 1 mp körül látnak, riasztanak. A füst elvakítja őket, a sövény és a fedezék eltakar.
- **Ablakmosó kosár:** a keleti homlokzaton; ráállva elindul, a tárgyaló nyitható ablakához visz (és vissza).
- **Menekülés:** Kuroda halála után a terasz északkeleti sarkában lévő kábelen kell lecsúszni (`P.mode='zip'`).
- **Mentési pont:** ha a céltorony tetején lelőnek, a záró képernyőn „Folytatás a céltorony tetejéről”.
- **Pecsétek:** Árnyék (nem volt riasztás), Tiszta kéz (csak Kuroda halt meg), Rejtett (a testét nem találták meg). Rang: Bérgyilkos, Nindzsa, Mester, Árnyék.
- **Nappal:** a közös `G.setDaylight(on)` kapcsolja (a falu vizsgája is ezt használja).
- **Teszt:** `?palya=varos&aetest`, `window.AE_VAROS`.

## 2d. Grafikai részletek (falu és város)

- **Szereplők:** orr, fül, szemöldök, száj, nyak, hüvelykujj; a rendőrön gombok és zsebek, az öltönyön hajtóka és díszzsebkendő, a tanítványon öv. Az öltönyösök és a mester bal karja járás közben leng, a törzs ellentétesen fordul. Talpárnyék minden szereplő alatt (`BLOB`), gépen 2048-as árnyéktérkép.
- **Város:** valódi méretű ablakos homlokzatok (4 fajta), lépcsőzetes tetők, gépházak, antennák, felhők, rácsos daru, tetőlemez és napelemek, mozgó autók, madárraj, időnként helikopter (`stepLife`). A közeli tornyokon erkélyek, tetőkert medencével, felirat nélküli reklámtáblák, ablakmosó állvány. A penthouse üvege egyszer lefényképezi a környezetét (CubeCamera), abban tükröződik.
- **Falu:** cserép- és nádtetők, tornác, papír tolóajtók, lámpások, lépőkövek, bambuszligetek, új tórii, juhar- és cseresznyefák (rózsaszín hulló szirmok). Az érkezésnél koi-tó ívelt híddal és gereblyézett kavicskert: **a kavicson 1,7-szer hangosabbak a léptek** (`gravelAt`, `noiseMul`). A csend udvarán shishi-odoshi: koppanás után 1,6 mp-ig a léptek zaja negyedére csökken 18 m-en belül. A falu belsejében ritkább és alacsonyabb a fű.

## 2e. Negyedik pálya: Hegyi expressz (`?palya=vonat`)

Délben, a hegyek között. Kuroda jobbkeze, Mori, a cég iratait a magánvonatán viszi északra. A 3. pálya után nyílik (mentés: `l4`, `r4`, `s4`).

- **Motor:** a vonat áll, a táj mozog alatta (`LIFE.V` = 22 m/s, menetirány −z). A táj 60 m-es csempékből áll (rét, erdő, falu, folyó rácsos híddal), amelyek hátrafelé vándorolnak és elölről újraépülnek (`stepLand`). A sínek és a felsővezeték rövid darabokból állnak (a nagyon hosszú háromszögek átlátszottak a padlón).
- **Kocsik** hátulról előre (`VONAT_CARS` a `world.js`-ben, a padló magassága kocsinként: `trainH`): kilátókocsi (rajt a hátsó peronon, kalauz), tehervagon (csak a tetején lehet átmenni, létrával fel és le), fülkés személykocsi (folyosó jobb oldalt, 4 fülke rejtekhellyel), pőrekocsi két konténerrel (kampópont mindkettő tetején, `VONAT_GIANTS`), étkezőkocsi (magas támlás boxok takarnak, elöl konyha), szalonkocsi (Mori, két testőr), mozdony (gépterem két keskeny folyosóval, elöl a vezetőállás a vészfékkel). Az ajtók 1,7 m szélesek, hogy a játékos és az őrök is átférjenek.
- **Feladat:** az aktatáska elvétele Mori íróasztaláról, aztán a vészfék a mozdonyban. Mori napirendje: íróasztal (28 mp) ↔ ablak (14 mp). Ha visszaér, és az aktatáska hiányzik, riaszt. Az ajtó melletti testőr 7–11 mp-enként a bejárat felé fordul.
- **Alagutak:** időnként (az első rögtön, amikor a tehervagon tetejére érsz) dudaszó és felirat jelzi. A tetőn állva vagy a konténer tetején lesodor (visszaállás az utolsó mentési pontra, vagy a tehervagon aljára); guggolva átjutsz. Az alagútban sötét van: az őrök látótávolsága 55%-ra csökken (`G.visMul`).
- **Zajok:** a tetőn és a pőrekocsin a menetszél elnyomja a lépteket (0,55×), az alagútban a zakatolás (0,7×).
- **Őrök a kocsik között:** a `steerCops` a kocsi ajtóin át vezeti őket (fülkés kocsiban a folyosón, a mozdonyban a géptermen kívül), hogy keresés után vissza tudjanak térni a helyükre.
- **Mentési pontok:** a fülkés kocsi eleje és a szalonkocsi ajtaja. Halál után „Folytatás a mentési pontról”.
- **Ülő utasok:** díszlet, nem figyelnek (`civ:true`).
- **Pecsétek:** Árnyék (nem volt riasztás), Tiszta kéz (senki sem halt meg), Gyors (7 percen belül).
- **Teszt:** `?palya=vonat&aetest`, `window.AE_VONAT`.

## 3. Fájlok

A `GZDirect/jatekok` repóban minden játék külön mappában van. A GitHub Pages a `main` ágból közvetlenül szolgálja ki őket.

```
arnyekerdo/
  index.html      ← GENERÁLT, ezt szolgálja ki a GitHub Pages. Kézzel ne szerkeszd.
  LICENSE, README.md, FEJLESZTES.md
  nyitokep.jpg, nyitokep-kicsi.jpg  ← a nyitókép
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
    varos.js      ← a 3. pálya díszlete: tetők, város, daru, víztorony, antenna, penthouse, kamerák, ablakmosó kosár (AE.VAROS)
    varos_game.js ← a 3. pálya menete: Kuroda napirendje, testőrök, erősítés, kamerák, kosár, kábel, pecsétek
    vonat.js      ← a 4. pálya díszlete: kocsik, belső terek, mozdony, mozgó táj, alagút (AE.VONAT)
    vonat_game.js ← a 4. pálya menete: őrök, Mori napirendje, alagutak és sötétség, aktatáska, vészfék, pecsétek
    falu_game.js  ← a 2. pálya próbái, a mester szövegei, hiba és újrakezdés, pecsétek
    build.py      ← összeállítja az index.html-t (sorrend: world, actors, falu, varos, vonat, parkolt, game, falu_game, varos_game, vonat_game)
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
