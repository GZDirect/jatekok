# Upistry

**Játék / Play:** https://gzdirect.github.io/jatekok/upistry/

Egyérintéses toronyépítő 30 világon át (korábbi neve: Égig érő). Magyar böngészőben magyarul, minden más nyelvű böngészőben angolul indul. A nyelv a Beállításokban átállítható.

## Játék
- Egy elem ide-oda csúszik a torony fölött, koppintásra leesik, ami lelóg, az leesik. A pontos illesztés nem fogyasztja a tornyot, három pontos után pedig nőni kezd.
- 30 világ, mindegyiknek saját célmagassága van (10–155 emelet). A cél elérésekor a játék nem áll meg: jelzi a teljesítést, menti a csillagokat, feloldja a következő világot, és a menet folytatódik.
- Csillagok: cél elérése, 3 tökéletes, 6 tökéletes illesztés.
- MASTER kihívás minden világhoz (ugyanaz a pálya, nehezebb feltétel), 20 teljesítmény, játékosprofil építői ranggal.
- Menet közben szaggatott vonal mutatja a korábbi rekord magasságát.
- Sky Journey: a környezet a torony magasságával változik (föld közelében → felhők között → felhők felett → világűr → csillagködök → mélyűr), madarakkal, repülőkkel, hőlégballonokkal, műholdakkal, UFO-kkal és ritka eseményekkel 10, 25, 40, 60, 85, 100, 125, 150, 175 és 200 emeletnél. Atlantisz, a Holdbázis, a Felhőváros, a Csillagkapu és az Univerzum tornya saját zónasort kap. A világtérkép mutatja, melyik zónáig jutottál el az adott világban.
- A napi kihívás mindig egy még lezárt világban játszódik.
- Mentőpont a 9. világtól, csak a feloldáshoz, rekordot nem ír.
- Napi kihívás a dátumból számolt feladattal.
- Rekordkártya képként, megosztható.
- Hangok és dinamikus zene Web Audio API-val, világonként eltérő anyaghangokkal. Rezgés a támogatott eszközökön. Külön hangerő, zene, rezgés és „kevesebb mozgás” beállítás.
- Telepíthető alkalmazásként (PWA), offline is fut.

## Grafika
- Minden kép a játék saját kódjából rajzolódik, vektoros illusztrációként: nincs letöltött vagy külső kép. Így minden kijelzőn éles, és a játék egyetlen fájl marad.
- Világonként három parallax háttérréteg (pl. kikötői daruk és konténerhajók, maja lépcsős piramis, japán pagodák, jéghegyek, neonváros, csillagkapu), saját talaj és talapzat.
- Az építőelemek háromrészes csempék (bal vég, ismétlődő közép, jobb vég), soha nincsenek nyújtva. Minden 10. emelet arany változatot kap. Néhány stílus él: izzik a láva, villog a neon, járnak az órák és a műszerek mutatói.
- A rajzok világváltáskor egyszer készülnek el gyorsítótárba, menet közben csak másolódnak, ezért a teljesítmény nem romlik.
- Az alkalmazásikon is ezekből az elemekből készült.

## Irányítás
Koppintás vagy kattintás, számítógépen szóköz. Szünet: bal felső gomb vagy Esc. A játék csak akkor áll meg, ha az alkalmazás a háttérbe kerül.

## Fejlesztőknek
- Saját hangfájlok: a `SOUND_FILES` objektumban eseményenként megadható fájl (pl. `perfect`, `place`, `triple`, `grow`, `miss`, `complete`).
- Rajzolt grafika: háttérrétegek az `LP`, építőelemek a `TS`, talapzatok a `PEDS`, talajok a `GROUNDS` objektumban, világonkénti eltérések az `ARTMAP` táblában. Az `?art=0` paraméter a régi, egyszerű lapos stílust mutatja.
- Saját képes grafika: világonként `art:{block:'fajl.webp',cap:24}` háromrészes (bal vég, közép, jobb vég) képpel, ez elsőbbséget kap a rajzolt elemekkel szemben.
- MASTER-feltételek: `MASTER_RULES`, vagy világonként `master:{floors,perfects,streak}`.
- Teljesítmények: az `ACH` lista adat alapú (`stat`, `min`).
- Magassági zónák és események: `ZONES_DEFAULT`, `EVENTS_DEFAULT`, világonkénti eltérés a `JOURNEYS` objektumban; háttérobjektumok a `KINDS` táblában; saját sprite-ok a `SKY_SPRITES` objektumban.
- Mentés: `egig-save` kulcs, 3-as verzió, a 2-es és az 1-es (régi rekord) mentést automatikusan átveszi. A tárolás a `STORE` adapteren megy át, ez később felhőmentésre cserélhető. A Beállításokban a mentés kódként kimásolható és visszatölthető.

## Betűtípusok
Bungee és Outfit (SIL Open Font License 1.1), Google Fonts.

© 2026 Fejes Géza. Minden jog fenntartva. Részletek: [LICENSE](LICENSE).
