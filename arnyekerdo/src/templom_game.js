(function(){
/* Shinobi – 8. pálya: Az utolsó pecsét (a küldetés menete).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   1. A papírfolyosón át a szobákba: a megvilágított szakaszon a sziluetted a szoba felőli papírfalra vetül (a bent álló őr gyanút fog).
   2. A titkos archívum: két kapcsoló („A hold után kel a nap”): előbb a holdas tekercs (1. szoba), aztán a napos lámpás (4. szoba). Rossz sorrend: kattanás, zaj.
   3. Az archívumban az eredeti birtokokmányok; a főcsarnok oltárán a régi pecsétes tekercs (nem kötelező).
   4. Naruse a főcsarnokban vár. Nem kell legyőzni: kiosonhatsz (az árnyék útja), leütheted (a mester útja), vagy megölheted (a bosszú útja).
   Kijárat: a hátsó erdei ösvény északnyugaton. */
const A=window.AE;if(A.LV!=='templom')return;
const G=A.G,F=A.TEMPLOM,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('varos');

Object.assign(G.LINES,{
  spot:[['','','Ott van! Állj!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Keressétek!']],
  body:[['','','Valaki itt fekszik! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});
const SAY={
  shadow:['g','','Egy árnyék a papíron… Ki van ott?'],
  naruse:[['b','','Tudtam, hogy eljössz. Ugyanattól a mestertől tanultunk.'],['b','','Vidd az iratokat, ha ki tudsz jutni. Árnyék vagy, mint én voltam egykor.'],['b','','Kérdezd meg a mestert, miért mentem el. Hátha neked elmondja.']]};

const T={seq:[],open:false,docs:false,scroll:false,silSeen:false,nq:-1,nT:0,flipT:8,cp:null,fromCp:false,panelT:14,done:false,panelX:0};
const ORDER=['garden','front','room2','room3','court','hall','east','west','north'],NACT={konnyu:6,normal:7,nehez:9};
function nact(){const d=G.D();return d===G.DIFF.konnyu?NACT.konnyu:d===G.DIFF.nehez?NACT.nehez:NACT.normal;}
const PARK={x:29,z:59};
function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false,safe:null,seeMul:1,spdMul:1});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,H(x,z)+1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}
G.hooks.setup=()=>{const n=F.spots.naruse;place(ALLCOPS[0],n.x,n.z,n.ry,null,true);Object.assign(ALLCOPS[0],{hp:4,seeMul:1.15,spdMul:1.1});
  const k=nact();ORDER.forEach((key,i)=>{const c=ALLCOPS[1+i];if(!c)return;const r=F.routes[key];if(i>=k)place(c,PARK.x,PARK.z,0,null,false);else place(c,r[0].x,r[0].z,Math.PI,r.map(p=>({x:p.x,z:p.z})),true);});};
const naruse=()=>ALLCOPS[0];
/* Naruse sötét ruhát és vörös sálat visel */
{const R=naruse().mesh.userData.R;const sc=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.035,6,12),new THREE.MeshLambertMaterial({color:0x8a1a14}));sc.rotation.x=Math.PI/2;sc.position.y=-0.01;R.neck.add(sc);}

/* ---------- világos, csendes reggel ---------- */
G.setDaylight(true);A.scene.background.setHex(0xe6d2b4);A.scene.fog.color.setHex(0xdecaae);A.scene.fog.density=0.0095;
{const sky=A.sky.material.uniforms;sky.uHor.value=new THREE.Color(0xf6d0a0);sky.uZen.value=new THREE.Color(0x5a84bc);}
A.moonLight.color.setHex(0xffd096);A.moonLight.intensity=1.55;A.hemi.color.setHex(0xc8d4ec);A.hemi.groundColor.setHex(0x4a4030);A.hemi.intensity=0.72;A.MOON_DIR.set(0.72,0.3,0.45).normalize();

/* ---------- a titkos panel ---------- */
function setPanel(open){T.open=open;F.PANEL.cols.forEach(c=>c.off=open);}
function stepPanel(dt){const want=T.open?4.2:0;T.panelX+=(want-T.panelX)*Math.min(1,dt*1.6);F.PANEL.m.position.x=T.panelX;}
function useSwitch(k){T.seq.push(k);G.tone(0.06,k==='moon'?500:700,k==='moon'?400:900,0.12,'square');
  if(T.seq.length===1&&k==='moon'){G.showMsg('A holdas tekercs elfordul. Valahol halkan kattan valami.');return;}
  if(T.seq.length===2&&T.seq[0]==='moon'&&k==='sun'){setPanel(true);G.showMsg('A főcsarnok északi falán elhúzódik egy panel. Nyitva az archívum.');G.noiseHit(0.3,300,'lowpass',0.8,1);return;}
  T.seq=[];P.noiseBoost=Math.max(P.noiseBoost,10);G.noiseHit(0.35,1200,'bandpass',0.3,2);G.showMsg('Hangosan kattan, de semmi sem nyílik. Rossz sorrend: kezdd elölről.');}

/* ---------- közelségi műveletek ---------- */
G.hooks.ctx=()=>{const d=(o)=>Math.hypot(P.x-o.x,P.z-o.z);
  if(!T.open&&d(F.SWITCH.moon)<1.7)return{label:'Fordít',txt:'Fordítsd el a holdas tekercset',act:()=>useSwitch('moon')};
  if(!T.open&&d(F.SWITCH.sun)<1.7)return{label:'Gyújt',txt:'Gyújtsd meg a napos lámpást',act:()=>useSwitch('sun')};
  if(T.open&&!T.docs&&d(F.ARCH.chest)<1.9)return{label:'Elvesz',txt:'Vedd ki az eredeti birtokokmányokat',act:takeDocs};
  if(!T.scroll&&Math.hypot(P.x+7,P.z+37.6)<1.8)return{label:'Elvesz',txt:'Vedd el a régi pecsétes tekercset az oltárról',act:()=>{T.scroll=true;G.tone(0.05,900,1200,0.1);G.showMsg('A tekercsen a rend pecsétje, és két név: a mesteredé és Narusé.');}};
  return null;};
function takeDocs(){T.docs=true;G.tone(0.08,700,1100,0.15);T.cp={x:P.x,z:P.z,scroll:T.scroll};G.showMsg('Megvannak az eredeti birtokokmányok. Ki innen: a hátsó ösvény északnyugaton.');
  const n=naruse();if(!n.down){T.nq=0;T.nT=1.2;n.route=[{x:-9,z:-31},{x:9,z:-31}];n.ri=0;n.wait=4;}}

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{seq:[],docs:false,scroll:false,silSeen:false,nq:-1,nT:0,flipT:8,panelT:14,done:false,panelX:0});setPanel(false);F.PANEL.m.position.x=0;F.SIL.visible=false;
  if(T.fromCp&&T.cp){T.fromCp=false;setPanel(true);T.panelX=4.2;T.docs=true;T.scroll=T.cp.scroll;P.x=T.cp.x;P.z=T.cp.z;P.yaw=0;const n=naruse();n.route=[{x:-9,z:-31},{x:9,z:-31}];G.showMsg('Folytatod: az okmányok nálad vannak.');}
  else{T.fromCp=false;T.cp=null;P.yaw=0;G.showMsg('Reggel a hegyi templomnál. A kapu fölötti táblán: „A hold után kel a nap.”');}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · Az utolsó pecsét';
  $('tutText').textContent='Az eredeti birtokokmányok a templom titkos archívumában vannak, a főcsarnok északi fala mögött. A falpanelt két kapcsoló nyitja: a kapu fölötti tábla szerint „a hold után kel a nap”. A papírfolyosó megvilágított szakaszain a sziluetted a szobák papírfalára vetül. Naruse a főcsarnokban vár. Nem kell legyőznöd: elég, ha az okmányokkal észrevétlenül eltűnsz a hátsó ösvényen, északnyugaton.';};

G.hooks.update=dt=>{const t=S.time,n=naruse();
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0||P.z<30)$('tut').hidden=true;}
  stepPanel(dt);
  /* sziluett a papírfalon */
  {const z=P.z,inCorr=P.mode==='ground'&&z<-10&&z>-14,L=inCorr?F.LIT.find(l=>P.x>l.x0&&P.x<l.x1):null;F.SIL.visible=!!L;
    if(L){F.SIL.position.x=P.x;F.SIL.scale.set(1,P.crouch?0.62:1,1);F.SIL.position.y=P.crouch?0.9:1.25;
      COPS.forEach(c=>{if(c.down||c.active===false||c.st==='alert')return;const v=L.viewer;if(!(c.x>v.x0&&c.x<v.x1&&c.z>v.z0&&c.z<v.z1))return;
        const dx=P.x-c.x,dz=-14-c.z,d=Math.hypot(dx,dz),fx=-Math.sin(c.ry),fz=-Math.cos(c.ry);if(d>10||(dx*fx+dz*fz)/d<0.2)return;
        c.aw=Math.min(1.2,c.aw+dt*(P.moving?0.55:0.3)*(P.crouch?0.65:1));if(!T.silSeen&&c.aw>0.35){T.silSeen=true;}
        if(c.aw>0.35&&c.st==='patrol'){c.st='suspect';c.tx=P.x;c.tz=-15;if(t-(c.saidT||-99)>6){c.saidT=t;G.sayLine(SAY.shadow,c.x,c.z,0.95,'g');}}
        if(c.aw>=1)G.spotted(c);});}}
  /* Naruse: a főcsarnokban vár, időnként a panel felé és az ajtó felé fordul */
  if(!n.down&&n.st==='patrol'&&T.nq<0&&!T.docs){T.flipT-=dt;if(T.flipT<=0){n.look=((n.look||0)+1)%3;T.flipT=6+Math.random()*3;}const want=[Math.PI/2,0,Math.PI][n.look||0];n.ry+=G.wrapA(want-n.ry)*Math.min(1,dt*2);}
  if(T.nq>=0&&!n.down){T.nT-=dt;if(T.nT<=0){if(T.nq<SAY.naruse.length){const d=Math.hypot(P.x-n.x,P.z-n.z);G.sayLine(SAY.naruse[T.nq],n.x,n.z,Math.max(0.5,1-d/40),'b');T.nq++;T.nT=5.5;}else T.nq=-1;}}
  /* cél */
  const E=F.EXIT;
  if(!T.open){const m=F.SWITCH,first=T.seq.length===0;const s=first?m.moon:m.sun;GOAL.x=s.x;GOAL.z=s.z;G.goalName=first?'Hold':'Nap';G.station=first?'Cél: a holdas tekercs (1. szoba)':'Cél: a napos lámpás (4. szoba)';}
  else if(!T.docs){GOAL.x=F.ARCH.chest.x;GOAL.z=F.ARCH.chest.z;G.goalName='Archívum';G.station='Cél: az archívum ládája';}
  else{GOAL.x=(E.x0+E.x1)/2;GOAL.z=E.z0+1;G.goalName='Ösvény';G.station='Menekülj: hátsó ösvény';if(P.mode==='ground'&&P.x>E.x0&&P.x<E.x1&&P.z<E.z1&&!T.done){T.done=true;finish();}}
};

/* ---------- vége: három befejezés ---------- */
G.hooks.seals=s=>{const n=naruse();return[['Papírárnyék',!T.silSeen,'egyik őr sem vesz észre a papírfalon át'],['Az eredeti pecsét',T.docs&&T.scroll,'az okmányok mellett az oltár tekercsét is elhozod'],['A mester öröksége',!n.dead,'Naruse életben marad'],['Tökéletes árnyék',!s.kills&&!s.alarms&&!s.dets&&!s.kos,'nem ölsz, nem ütsz le senkit, nem látnak meg, nincs riadó']];};
function finish(){const n=naruse(),s=G.missionStats(),clean=!s.kills&&!s.kos&&!s.dets&&!s.alarms&&!s.civ,sv=G.loadSave();
  const allPrev=['erdo','falu','varos','vonat','kikoto','fesztival','fogado'].every(k=>sv.lv&&sv.lv[k]&&sv.lv[k].r==='Árnyék');
  const way=n.dead?'A bosszú útja. Naruse halott. A szerződést nem írják alá, de a hegyen sokáig emlegetik, mit tettél.':n.down?'A mester útja. Naruse eszméletlenül feküdt a csarnokban, amikor a rendőrség az okmányok alapján érte jött. Élve vitték el.':'Az árnyék útja. Naruse nem látott meg többé. Az okmányok nélkül az ügylet összeomlott, ő pedig eltűnt, ahogy egykor a faluból is.';
  const home=allPrev&&clean?' Hazatérsz a faluba. A mester sokáig nézi a pecsétet a tekercsen, aztán egy fekete lakkdobozt vesz elő, amit sosem nyitott ki előtted. „Ilyet csak annak adok, akit egyszer sem láttak meg.” A dobozban egy ezüst pecsét van, és egy térkép, rajta egy hely, ahol még sosem jártál.'
    :' Hazatérsz a faluba. A mester a tekercsre néz, és bólint. Egy régi faládából előveszi a következő feladatod jelét: egy térképet, rajta egy hely, ahol még sosem jártál.';
  G.finishLevel('Az utolsó pecsét',way+home,'Történet vége');}

{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás az okmányokkal';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

$('startEyebrow').textContent='8. fejezet · Az utolsó pecsét';
$('lead').textContent='Világos reggel egy ősi hegyi templomnál. Az archívumban vannak az eredeti birtokokmányok, amelyek bizonyítják a hamisítást; holnap írnák alá a szerződést. Naruse, a mestered egykori tanítványa, már vár rád. Nem kell legyőznöd: a te döntésed, mi lesz vele.';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=NACT[k]+' őr és Naruse';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='a fenyőkre és a templom tetőire kapaszkodhatsz fel';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a fenyők törzsén felmászhatsz (1–9: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: két kapcsoló, az archívum, aztán a hátsó ösvény.';
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_TEMPLOM={T,F,useSwitch,takeDocs,finish,setPanel};
})();
