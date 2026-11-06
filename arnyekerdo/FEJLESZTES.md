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
- **Grafika:** rizsföldek (vízzel elárasztott parcellák, palántasorok), rétek, japán parasztházak, cédrusok, lombos fák (néhány vörös juhar), bambuszligetek, távíróoszlopok vezetékkel, töltés kavicsos vállal, dombok, piros rácsos acélhíd, vasúti átjáró villogó lámpákkal és várakozó autókkal, távoli hósapkás hegyek, felhők. A csempék közös geometriákat használnak (`G2`, `M2`). Belül: függönyök, fali lámpák, sárgaréz csomagtartók, napfényfoltok a padlón (az alagútban kialszanak, a fali lámpák felerősödnek). Az alagút bordás betonfalú, lámpákkal.
- **Pecsétek:** Árnyék (nem volt riasztás), Tiszta kéz (senki sem halt meg), Gyors (7 percen belül).
- **Teszt:** `?palya=vonat&aetest`, `window.AE_VONAT`.

## 2f. Magyar szinkron (Piper TTS)

- A szereplők mondatai előre legenerált hangfájlok: `hang/<hang>-<hash>.mp3` (a hash a magyar szöveg FNV-1a kódja), a lista a `src/hang_lista.js` (`window.AE_HANG`). Kb. 100 fájl, 1 MB.
- Hangok: `g` őrök és rendőrök (Imre), `f` tanítványok és a kalauz (Anna), `m` a mester (Imre, mélyebb és lassabb), `b` Kuroda és Mori (Imre, kissé mélyebb). Az őrök hangmagassága személyenként kicsit más (lejátszási sebesség), és térben szól (bal–jobb).
- A pálya indulásakor a játék betölti az adott pályához kellő hangokat (`preloadHang`). Ha egy mondat nincs meg (vagy még nem töltődött be), a böngésző felolvasója szól helyette (`speak`).
- **Új vagy módosított mondat után** újra kell generálni: `python3 arnyekerdo/src/hangok.py /mappa/a/modellekkel` (a `hu_HU-imre-medium.onnx` és `hu_HU-anna-medium.onnx` + `.json` a huggingface.co/rhasspy/piper-voices oldalról; a repóban nincsenek). Kell hozzá `pip install piper-tts` és `ffmpeg`. Csak a hiányzó fájlokat készíti el, és újraírja a listát; utána `build.py`.

## 3. Fájlok

A `GZDirect/jatekok` repóban minden játék külön mappában van. A GitHub Pages a `main` ágból közvetlenül szolgálja ki őket.

```
arnyekerdo/
  index.html      ← GENERÁLT, ezt szolgálja ki a GitHub Pages. Kézzel ne szerkeszd.
  LICENSE, README.md, FEJLESZTES.md
  nyitokep.jpg, nyitokep-kicsi.jpg  ← a nyitókép
  hang/           ← a szereplők magyar hangfájljai (generált, lásd 2f)
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
    hangok.py     ← a hangfájlok generálása Piperrel (lásd 2f)
    hang_lista.js ← GENERÁLT: a meglévő hangfájlok listája
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


## 2g. Csomagolás és offline mód

- A three.js (`three.min.js`) és a betűtípusok (`fonts/`, EB Garamond és IBM Plex Sans, latin + latin-ext) a repóban vannak, a játék semmit nem tölt be más oldalról.
- Ikonok: `favicon-32.png`, `icon-180/192/512.png`, `icon-512-maskable.png`; megosztási kép: `social-preview.jpg` (1200×630).
- A `build.py` a `src/sw_minta.js` alapján legenerálja az `sw.js`-t: az előre letöltött fájlok listája (benne a `hang/` összes mp3-ja) és a tár neve (a tartalom ujjlenyomata) automatikusan frissül. Az oldal netről töltődik, ha van net, a többi fájl a tárból jön.

## 2h. Érintős irányítás (2026. november)

- Bal hüvelykujj: joystick. Kis kitérés lopakodás, nagyobb séta, előre a FUT ívig (80 px, visszafelé 64 px-ig tart) futás; elengedve a futás megszűnik. Kifulladás után 25-ös erőig nem lehet futni (`P.tired`).
- Jobb hüvelykujj: nézelődés bárhol a jobb oldalon. Az akciógomb (`#bUse`) lenyomásra használ, és ugyanazzal az ujjal tovább húzva forgatja a kamerát.
- Az akciógomb körül: Guggol, Ugrás (`#bJump`, a fán: Le), eszközgomb (`#bTool`). Az eszközgomb koppintásra nyitja a legyezőt (`body.fan`, a `#tools` 4×2-es rácsként), vagy az ujjat a kívánt eszközre csúsztatva választ.
- A Fut gomb megszűnt; gépen a Q és a Shift ugyanúgy működik.

## 2i. Felszerelés-választó, füstbomba, ugrás

- Az Indulás után a `#gear` képernyőn legfeljebb 4 féle eszköz választható (`gearMax()`; ha az aktuális mentésben bármelyik pálya Árnyék/Árnyékmester ranggal kész, 5). A választás pályánként megmarad (`ae-gear-<pálya>`). Kötelező eszköz: `GEAR_REQ` (az Üvegtoronyban a kampó). A falu kiképzésén és az első pálya bemutatójában nincs választás, minden nálad van (`GEAR=null`).
- A nem vitt fogyóeszközök (kavics, tüske, nyíl, csillag, füstbomba) száma 0, a gombjuk el van rejtve, a billentyű sem választja ki őket.
- A füstbomba a 9. eszköz (`fust`, billentyű: 9, az F közvetlenül dobja, ha nálad van).
- Ugrás: `P.jy`/`P.jv`, kb. 0,7 m-es szökkenés, földet éréskor zaj. Gépen szóköz.
- Grafika: a háttér `felszereles.jpg` (amíg nincs, a nyitókép látszik), az eszközképek `eszkozok/<id>.webp` (tanto, tekko, kampo, karom, kavics, tuske, fukiya, shuriken, fust); ha a `tanto.webp` betölthető, a kártyák képet kapnak.
- Ajánlott eszközök pályánként: `GEAR_HINT` (a kártyán „Ajánlott itt:” felirat). Pályaszabályok, amik erősítik őket:
  - Üvegtorony: a shuriken kiiktatja a kamerát (`G.hooks.starFly`, `c.dead`).
  - Hegyi expressz: a kocsiban dobott füstbomba az egész kocsit betölti, mindenki megvakul benne, aki nem a tetőn van (`G.hooks.smoke`).
- Ugrás közben (`P.jy>0.28`) a `low` jelölésű akadályok (rönk, kis kő, láda, ülés) nem állítanak meg: `pushOut(p,rad,air)`.
- Érintőn a legyező gombjai és az eszközgomb az eszközképet mutatják háttérként.

## 3. Közös rang- és pecsétrendszer (a 8 pályás terv 1. fázisa)

- `LEVELS` (game.js) a pályák listája; a választó, a „Tovább” gomb és a feloldás ebből épül. Új pálya = új sor.
- Mentés 2. formátum: `shinobi2-save-<n>` = `{t, lv:{<pálya>:{r:<legjobb rang>, s:[pecsétek]}}}`. A régi `ae-save-*` mentések szándékosan nem töltődnek be.
- Számlálók: `S.kills`, `S.kos` (leütés és altatás), `S.dets` (megerősített észlelés), `S.alarms` (riadó), `S.civ` (sérült civil: kalauz, mozdonyvezető).
- Rang (`rankOf`): Árnyék = 0 ölés, 0 leütés/altatás, 0 észlelés, 0 riadó, 0 civil. Mester = nem láttak meg, nem volt riadó. Nindzsa = legfeljebb 2 riadó. Különben Bérgyilkos. Időtől nem függ.
- A pálya a pecsétjeit `G.hooks.seals(stats)` adja: `[név, megvan?, feltétel]`. A falu a vizsga elejétől számol (`G.hooks.statBase`), a próbák leütései nem számítanak.
- Pálya vége: `G.finishLevel(cím, szöveg)` – összegző táblázat, pecsétek („új” jelöléssel), és hogy miért nem lett Árnyék.
- Árnyékok Mestere: ha minden `LEVELS` pálya Árnyék, ezüstpecsét a címképernyőn (`#masterSeal`).
- Üvegtorony új célja: Kuroda asztaláról elvinni az iratokat, aztán a kábel. Kurodát nem kell bántani; ha életben marad, a zárószöveg szerint Naruse emberei végeznek vele (nem a játékos statisztikája). A tárgyalás alatt (26 mp) a testőrök keletre néznek, Kuroda a vendégek felé: ez az ablak.
- Ellenőrzött Árnyék-útvonal (Üvegtorony, normál, a céltorony tetejéről): bokor (-3,-12) → a tárgyalás kezdetekor déli ajtó → nyugati fal mentén az asztalhoz → északi ajtó → terasz → kábel.

## 4. Az 5. pálya: Acélárnyak (kikötő, kora reggel)

- Fájlok: `src/kikoto.js` (díszlet, konténerek, daru, kerítés, iroda, útvonalak), `src/kikoto_game.js` (küldetés). Cím: `?palya=kikoto`.
- Sík terep; járható = a kikötő területe a tömör konténerek nélkül (`solids`, ezt rajzolja a radar is). A konténerek oldalán ütközőkörök takarják a kilátást.
- Cél: a belépési papírok Naruse konténerében (NRSU 409217, nyitott északi ajtó, -14,8; 8) és a rakományjegyzék az irodakonténerben (-18; -46,4), utána ki északkeleten (x>21, z<-56). Mindkét tárgy mentési pont.
- Kerítés a z=-34 vonalon (`tall`: átugorni nem lehet, átlátni igen), kapuval. A kapuőr 8–11 mp-enként 4,5 mp-re hátrafordul.
- Daru: a terhe kampópont (`CRANE.perch`), 11 mp-et vár a déli (z=-12) és az északi (z=-46) végén, közben 2 m-t emel. Ha a terhén ülsz, visz (Acélárnyék pecsét: legalább 8 m utazás). Leugrás: a nézés irányában keres szabad helyet (`dropDown`).
- Lámpaoszlopok: karmokkal mászhatók, kampóval elérhetők; az iroda teteje is kampópont, róla a falakon kívülre ugrasz (`dropR`).
- Őrök nehézség szerint: 6 / 8 / 10 (`ORDER`, `NACT`). Normálon nincs bent őr az irodában.
- Új általános szabály: fáról, tetőről csak akkor támadsz, ha tantó vagy tekko van a kezedben; különben csak leugrasz. Lapos pályán a földet érés zaja kisebb.
- Ellenőrzött Árnyék-útvonal (normál, élő őrökkel, 3-ból 2 próbán): nyugati sáv (x=-25,5) → keresztsor (z=16) → konténer → nyugati sáv a kerítésig → karmokkal az oszlopra (-24,8; -31) → kampó az iroda tetejére → le, bokor az iroda mögött (-10; -51) → iroda → bokrok (-1,5; -47), (10; -50), (16,5; -44), (25,2; -38) → keleti sáv → kijárat. Daruval is végigjátszva (őrök nélkül).

## 5. A 6. pálya: A rókák éjszakája (kastélypark, lampionos ünnep, alkonyattól sötétedésig)

- Fájlok: `src/fesztival.js` (díszlet: bambuszliget, bódésorok, színpad, koi-tó híddal, teaház, szentélykert, fenyők, tűzijáték, civil sétálók), `src/fesztival_game.js`. Cím: `?palya=fesztival`.
- Három rókamaszkos díszvendég (`vip`, ALLCOPS 0–2). Minden körben véletlenszerű, melyik Mori. Mori sántít ÉS balkezes (bal kezében a legyező); az egyik csaló csak balkezes, a másik csak sántít. A maszk miatt rövidebbre látnak (`c.seeMul`).
- 24 mp-enként helycsere (bódék, színpad, tó); minden 3. körben Mori a teaházba megy telefonálni (a papírfal mellől kihallgatható, 3 mondat). A testőre mellette marad, a teaház ajtajánál vár.
- Zsebből lopás: új általános horog `G.hooks.ctx()` → `{label, txt, act}`; az akciógomb ezt hajtja végre. Itt: hátulról, 1,45 m-en belül.
- Tűzijáték 42 mp-enként 12 mp-ig: `G.hooks.noiseMul` = 0,2 (csak a hallás, a látás marad). 3 mp-cel előtte jelez.
- Alkony: 5 perc alatt sötétedik, `G.visMul` 0,9 → 0,6, a lampionok világítanak.
- Pecsétek: Róka szeme (elsőre Morit lopod meg), A robaj árnyékában (tűzijáték alatt futás/dobás őr közelében), Láthatatlan vendég, Békés ünnep.
- Ellenőrizve: a teljes menet (lopás tűzijáték alatt, kijutás a hátsó kapun) Árnyék ranggal a díszvendégek élő figyelése mellett, a többi testőr nélkül. Élő testőrökkel a szkriptelt próba nem jutott át az udvaron; ezt valódi játékban kell kipróbálni.
- Új szinkronsorok (8): `hangok.py` most a hármas első elemét hangjelnek veszi (`['g','','…']` = testőr, `['b','','…']` = Mori).

## 6. A 7. pálya: Fehér csend (havas termálfogadó, derült délelőtt)

- Fájlok: `src/fogado.js`, `src/fogado_game.js`. Cím: `?palya=fogado`.
- Lábnyom: a hóban 0,8 m-enként egy jelölő (legfeljebb 70, 45 mp-ig látszik); fapallón, kövön, verandán, a házban nincs (`hard` téglalapok, `onHard`). Az őr, aki 7,5 m-en belül, maga előtt meglát egy friss nyomot, keresni kezd, és nyomról nyomra követi (`c.trail`). Ez önmagában nem rontja a rangot.
- Gőz: a medencék körüli ellipszisben guggolva rejtve vagy (új általános horog: `G.hooks.hide`).
- A könyvelő civil (nem őr), az irodában ül. „Beszélj” (`G.hooks.ctx`): ha nincs riadó és 16 m-en belül nem keres őr, három mondatban elmondja, és átadja az iratokat (Csendes vallomás). Különben megijed, és a ládából kell elvenni.
- Ellenőrizve: őrök nélkül a teljes menet Árnyék; élő őrökkel a szkriptelt próba a medencéknél lebukott, valódi játékban kell kipróbálni.

## 7. A 8. pálya: Az utolsó pecsét (hegyi templom, világos reggel)

- Fájlok: `src/templom.js`, `src/templom_game.js`. Cím: `?palya=templom`.
- Szerkezet: papírfolyosó (z -14..-10) → négy szoba (z -24..-14) → belső udvar → főcsarnok (z -40..-28, déli és keleti ajtó) → archívum (z -48..-40) az elhúzható panel mögött.
- Sziluett: a folyosó két megvilágított szakaszán (`LIT`) a játékos alakja megjelenik a z=-14 papírfalon (`SIL`); a szobában álló, a fal felé néző őr 10 m-en belül gyanút fog, és ha a figyelme eléri az 1-et, észlel.
- Kapcsolók: holdas tekercs (1. szoba), napos lámpás (4. szoba). Jó sorrend: hold, nap → a panel kinyílik (az ütközőkörök `off`). Rossz sorrend: zaj, újrakezdés.
- Naruse (ALLCOPS[0]) a főcsarnokban vár, háromféle irányba néz; az okmányok elvétele után beszél (3 mondat) és járőrözni kezd a csarnokban.
- Befejezések a zárószövegben: halott (a bosszú útja), leütve (a mester útja), észre sem vett (az árnyék útja). Ha az előző hét pálya mind Árnyék és ez is tiszta, a mester zárójelenete más (ezüst pecsét).
- Ellenőrizve: őrök és Naruse nélkül a teljes menet Árnyék; mindhárom befejezés szövege és a rang; az Árnyékok Mestere üzenet. Élő őrökkel a szkriptelt próba lebukott, valódi játékban kell kipróbálni.

## 7b. Grafikai réteg (grafika.js, 2026. november)
- Közös fájl a sík pályákhoz, a build sorrendjében utolsó. Nagy léptékű foltosság a talajon (egy átlátszó sík), sötét talajárnyék-sáv az A.ROOF.rects téglalapok tövében (egyetlen összevont geometria; a templomnál az épület körvonala), pályánként színezett képszél (#fxVig, body.lv-<pálya>).
- Élő díszletek az A.FX listán (a game.js minden képkockában meghívja): kikötő – sirályok, párafátyol, hullámzó víz, villogó jelzőfény a darun; fesztivál – felszálló égi lámpások, füst a bódék fölött; templom – hulló juharlevelek, füstölő a belső udvaron.
- Ruhák (setup-horog): kikötő – láthatósági mellény, sisak; fogadó – sál, kötött sapka; templom – sötét hakama, fejpánt; fesztivál – vörös karszalag, fülhallgató.
- Fények: kikötő ködös rózsás hajnal; fesztivál 0,3-as alkonyról indul; fogadó borult, kékesszürke; templom aranyló kora reggel, alacsony nap.
- A középre írt üzenet megvárja, amíg a küldetéskártya bezárul (nem csúsznak egymásra). Gyenge telefonon (≤3 GB memória vagy ≤4 mag) eleve a középső minőségen indul.

## 7c. Angol változat (2026. november)
- `en.html` ugyanabban a mappában, a build készíti: `angol.py` a JS szövegliteráljait és a shell.html szövegeit cseréli az `en_szotar.py` alapján (pontos egyezés; a szórendet igénylő helyekre kódcsere a CODE listában). Új magyar szöveg után: `python3 src/angol.py --hianyzik`.
- Külön mentés (`shinobi2en-save-`), nincs magyar hangfájl-betöltés (AE_HANG_HU), a felolvasás a készülék angol hangján megy. Angol Piper-hanghoz az en_US modellek kellenének (pl. ryan, amy), a hangok.py-t akkor angol fájllistára kell bővíteni.
- A service worker a navigációt oldalanként tárolja (index.html / en.html), hogy offline is a megfelelő nyelv jöjjön.

## 7d. Valósághű szereplők (Blender + MPFB 2, 2026. november)
- A modellek a `modellek/*.glb` fájlok (egyenként kb. 1 MB, 9–13 ezer háromszög, csontváz: MPFB „game_engine”, UE-stílusú csontnevek). Forrás: `blender/gyar.py` (közös eszközök: ember létrehozása, ruha átszínezése, sapka, sisak, kötött sapka, fejpánt, mellény, öv, rókamaszk, szemüveg, karszalag, sál, könnyítés, kimentés) és `blender/szereplok.py` (receptek). Blenderben: a gyar.py, majd a szereplok.py betöltése után `build("testor")`.
- Felhasznált MakeHuman-csomagok: system assets, suits01, shoes01, hats01 – mind CC0, a vele készült figurák szabadon felhasználhatók (Steamen is).
- A játékban: `src/modellek.js` (+ `vendor_GLTFLoader.js`, `vendor_SkeletonUtils.js`, three r128). A régi, kódból rakott figura pivotjai maradnak, a régi anim() mozgatja őket; minden képkockában a pivotok forgását átmásoljuk a csontokra (helyi = nyugalmi_szülő⁻¹ · pivot · nyugalmi_csont, a karoknál A-póz → lelógó kar korrekcióval). A régi testrészek láthatatlanok, de a találatvizsgálat rajtuk fut. A kézben tartott tárgyak (zseblámpa, revolver, legyező, lámpás, bot) a régi alkaron maradnak, de minden képkockában az új kézhez igazodnak.
- Kiosztás: erdo → rendor; falu → tanitvany, a mester → mester; varos → kuroda + testor; vonat → mori, kalauz (kalauz, mozdonyvezető), testor; kikoto → testor_kikoto (mellény, sisak); fesztival → vip_roka (rókamaszk), testor_fesztival (karszalag); fogado → testor_fogado (sapka, sál), a könyvelő → konyvelo; templom → naruse, testor_templom (fejpánt); civilek (utasok, vendégek) → civil_a / civil_b.
- A modellek nincsenek az előtöltésben: pályánként csak a szükséges töltődik le, a service worker futás közben eltárolja. Ha nem töltődik be, a régi figura marad.

## 7e. Akkumulátorkímélés (2026. november)
- Telefonon 30 kép/s felső határ (`?fps=60` kikapcsolja), menüben és szünetben 10 kép/s; az árnyéktérkép minden második képkockán frissül (`shadowMap.autoUpdate=false`). Az automatikus minőségcsökkentés küszöbe 30 kép/s mellett 45 ms.
- Telefonon nincs filmszemcse-réteg (teljes képernyős `mix-blend-mode`).
- A valósághű modellt kapott szereplők régi, gyerek nélküli testrészei kikerülnek a jelenetből.
- `src/optim.js`: indulás után 4,5 másodpercig figyeli a pályaelemeket; a mozdulatlanokat szülő és anyag-kinézet szerint összevonja (≥3 darab). Az eredetik a 30-as rétegre kerülnek (nem rajzolódnak), és fél másodpercenként ellenőrzi őket: ha bármelyik mozdul, eltűnik vagy anyagszínt vált, a csoport visszaáll. Mérés (rajzolási hívás): vonat 1333 → 654, falu 942 → 673, varos 444 → 306, kikötő 314 → 208, templom 271 → 197.

## 7f. Saját kéz, eszközök, élőbb mozgás (2026. november)
- `modellek/kez.glb` (blender/kez.py): a részletes MPFB-alaptestből kivágott ököl + alkar, ruhaujj, csuklópólya; a régi gömb-ököl és henger-alkar rejtve. `modellek/fegyverek.glb` (blender/fegyverek.py): tantó (fonott markolat, tsuba, ívelt penge hamonnal), tekko, kampó (+ bal kézben kötéltekercs), shuriken, köpőcső, füstbomba; a fémek Phong-anyagot kapnak. Kavics, tüske, karom maradt kódból.
- modellek.js `life()`: járás közben csípő- és ellentétes vállfordulás, a lábfej a talajjal párhuzamos, álló helyzetben légzés és lassú fejmozgás.

## 7g. Valódi anyagok és égbolt (2026. november)
- `anyagok/*.jpg` (512 px, ambientCG CC0): padlo (WoodFloor051), deszka (Planks037A), beton (Concrete034), aszfalt (Asphalt033), ho (Snow010A), ko (Rock064), tatami (Tatami001), bordaslemez (CorrugatedSteel007A, szürkére normálva, hogy a konténerszín megmaradjon). `A.realTex(tex,név,forgatás)` a kódból rajzolt textúra képét cseréli (a klónokét is), a csempézés marad.
- Égbolt (Poly Haven CC0 puresky, 1024×512 jpg, Blenderben tónusleképezve): eg_derult (város, vonat, templom), eg_hajnal (kikötő), eg_naplemente (fesztivál, az alkonyattal halványul), eg_borult (fogadó). `A.skyImage(név,erősség)`: az égbolt-shader a képet a horizonton a köd színébe keveri.
- A nyers letöltések a gépen: Dokumentumok\Shinobi-karakterek\letoltes\anyagok.

## 8. Mi maradt hátra (2026. november)

- A 6–8. pályán élő őrökkel nincs végigjátszott, igazolt Árnyék-útvonal (a szkriptelt próbabot nem tud nézni). Valódi játékban kell kipróbálni, és szükség szerint lazítani (őrök útvonala, látótávolság `seeMul`, búvóhelyek).
- A régi `ae-save-*` mentések nem töltődnek be (szándékosan).
