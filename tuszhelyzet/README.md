# Túszhelyzet

Forgatható 3D dioráma-játék három pályával, ahol **csak a környezetet irányítod**. A túszok, a túszejtők és a kommandó maguktól döntenek: a túszok akkor szöknek, amikor alkalmat látnak, a kommandó akkor megy be, amikor jónak látja. A feladatod a megfelelő pillanatok megteremtése, úgy, hogy a feszültség ne szaladjon el.

**Játék:** https://gzdirect.github.io/jatekok/tuszhelyzet/

## Pályák

**1. Harmadik emelet** (`index.html`): éjszakai téglaház, egy túszejtő három tússzal a 2. emeleten. Menekülés a tűzlépcsőn vagy a lépcsőházon át. 14 változó: áram, eső, vihar, buli zene, reflektor, redőny, lift, tűzlétra, média, kommandó a tetőn, valamint telefon, pizza, kutya és tűzjelző.

**2. Duna Bank** (`bank.html`): nagy, egyszintes bankfiók alkonyatkor, ami játék közben besötétedik. Három rabló (Vezér, Fúrós, Őr), nyolc túsz, páncélterem 2:30-as időzárral. 22 változó, köztük kamerahurok, időzár, locsoló, vészajtó, sikátorzár, drón, redőny, riasztócsengő, központi ajtózár, pénzszállító és szirénás konvoj. Öt végkimenetel.

**3. C-blokk** (`borton.html`): börtönlázadás éjszaka. Három lázadó (Bika, Patkány, Csendes) öt embert tart fogva a cellablokk közös terében, közben létrát építenek a priccsek vázából, hogy átjussanak az udvar falán. Kijáratok: konyha, öltöző, udvar (őrtorony vagy főkapu felé). 20 változó: áram, cellaajtók, udvari reflektorok, toronyőr, köd, eső, sziréna, főkapu, konyhai szervizajtó, kamerahurok, börtönlelkész a hangosbemondón, kutyás őrjárat, kommandó, folyosói zárak, valamint telefon, ételkocsi, rabszállító busz, füstjelző, helikopter és orvosi vizit.

## Két játékos: Angyal és Démon

Indításkor választható. Az egyik játékos az **Angyal**, aki épségben kijutó túszokat és nyugalmat akar, a másik a **Démon**, aki minél nagyobb káoszt.

- Felváltva léptek, az Angyal kezd. Egy lépés: egy kapcsoló átállítása, egy esemény elindítása, vagy passz.
- Gondolkodás közben a világ megáll. Egy perc van a döntésre, utána a lépés elvész.
- Lépés után 12 másodpercig fut a szimuláció, így látszik, mit okozott.
- Amit az ellenfél épp most állított át, ahhoz a következő lépésben nem lehet nyúlni.
- 8 kör (16 lépés) után, vagy ha a helyzet előbb véget ér, a pontok döntenek.

**Pontozás**

| | Angyal | Démon |
|---|---|---|
| Kijutott túsz | +10 | |
| Lebukott szökési kísérlet | | +6 |
| Minden lépés után | +0–4 nyugalom (alacsony feszültség) | +0–4 káosz (magas feszültség) |
| Jó befejezés (minden túsz kint, a tettesek elfogva vagy megadják magukat) | +25 | |
| Kockázatos behatolás kritikus feszültségnél | +12 | +6 |
| A tettesek meglógnak | | +20 |
| A helyzet elfajul (feszültség 100, vagy sikertelen behatolás) | | +30 |
| A 8 kör végén bent maradt túszok | | +5 / fő |

## Irányítás

Forgatás a jobb oldali nyilakkal, húzással vagy Q/E billentyűvel · nagyítás görgővel vagy csípéssel · alul az ikonsor kapcsolói (kék) és eseményei (rózsaszín) · a felső sávra koppintva megnyílik a napló · hang az első koppintásra indul.

© 2026 Fejes Géza. Minden jog fenntartva. Lásd: [LICENSE](LICENSE).
