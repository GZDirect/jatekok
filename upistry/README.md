# Upistry

**Játék / Play:** https://gzdirect.github.io/jatekok/upistry/

Egyérintéses toronyépítő 30 világon át (korábbi neve: Égig érő). Magyar böngészőben magyarul, minden más nyelvű böngészőben angolul indul. A nyelv a Beállításokban átállítható.

## Játék
- Egy elem ide-oda csúszik a torony fölött, koppintásra leesik, ami lelóg, az leesik. A pontos illesztés nem fogyasztja a tornyot, három pontos után pedig nőni kezd.
- 30 világ, mindegyiknek saját célmagassága van (10–155 emelet). A cél elérésekor a játék nem áll meg: jelzi a teljesítést, menti a csillagokat, feloldja a következő világot, és a menet folytatódik.
- Csillagok: cél elérése, 3 tökéletes, 6 tökéletes illesztés.
- MASTER kihívás minden világhoz (ugyanaz a pálya, nehezebb feltétel), 20 teljesítmény, játékosprofil építői ranggal.
- Menet közben szaggatott vonal mutatja a korábbi rekord magasságát.
- Mentőpont a 9. világtól, csak a feloldáshoz, rekordot nem ír.
- Napi kihívás a dátumból számolt feladattal.
- Rekordkártya képként, megosztható.
- Hangok és dinamikus zene Web Audio API-val, világonként eltérő anyaghangokkal. Rezgés a támogatott eszközökön. Külön hangerő, zene, rezgés és „kevesebb mozgás” beállítás.
- Telepíthető alkalmazásként (PWA), offline is fut.

## Irányítás
Koppintás vagy kattintás, számítógépen szóköz. Szünet: bal felső gomb vagy Esc. A játék csak akkor áll meg, ha az alkalmazás a háttérbe kerül.

## Fejlesztőknek
- Saját hangfájlok: a `SOUND_FILES` objektumban eseményenként megadható fájl (pl. `perfect`, `place`, `triple`, `grow`, `miss`, `complete`).
- Saját grafika: világonként `art:{block:'fajl.webp',cap:24}` háromrészes (bal vég, közép, jobb vég) képpel.
- MASTER-feltételek: `MASTER_RULES`, vagy világonként `master:{floors,perfects,streak}`.
- Teljesítmények: az `ACH` lista adat alapú (`stat`, `min`).
- Mentés: `egig-save` kulcs, 3-as verzió, a 2-es és az 1-es (régi rekord) mentést automatikusan átveszi. A tárolás a `STORE` adapteren megy át, ez később felhőmentésre cserélhető. A Beállításokban a mentés kódként kimásolható és visszatölthető.

## Betűtípusok
Bungee és Outfit (SIL Open Font License 1.1), Google Fonts.

© 2026 Fejes Géza. Minden jog fenntartva. Részletek: [LICENSE](LICENSE).
