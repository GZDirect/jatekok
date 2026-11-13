(function(){
/* Shinobi – 5. pálya: Acélárnyak (a küldetés menete).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   Két tárgy kell: a belépési papírok a rókamaszkos ünnepségre (Naruse konténerében, NRSU 409217)
   és a rakományjegyzék (az irodakonténerben, a kerítés mögött). Utána ki a vízparti kerítésnél, északkeleten.
   Három út a kerítésen át: a daru terhén (fent), a kapun (az őr időnként megfordul), vagy oszlopról az iroda tetejére kampózva. */
const A=window.AE;if(A.LV!=='kikoto')return;
const G=A.G,K=A.KIKOTO,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('varos');

/* a biztonsági emberek magyarul szólnak (a meglévő szinkronsorokkal) */
Object.assign(G.LINES,{
  spot:[['','','Ott van! Állj!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Keressétek!']],
  body:[['','','Valaki itt fekszik! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});

const T={pass:false,man:false,cp:null,fromCp:false,rode:0,rideZ:null,rideTop:null,flipT:6,panelT:12,done:false};
/* nehézség szerint aktív útvonalak (az első a kapuőr, mindig áll) */
const ORDER=['gate','road','crane','quay','offW','maze','south','alley','office','offE'],NACT={konnyu:6,normal:8,nehez:10};
function nact(){const d=G.D();return d===G.DIFF.konnyu?NACT.konnyu:d===G.DIFF.nehez?NACT.nehez:NACT.normal;}
const PARK={x:-26.5,z:-59};

function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false,safe:null});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,H(x,z)+1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}
G.hooks.setup=()=>{const n=nact();ORDER.forEach((k,i)=>{const c=ALLCOPS[i],r=K.routes[k];if(!c)return;
  if(i<n){if(k==='gate')place(c,r[0].x,r[0].z,Math.PI,null,true);else if(k==='office')place(c,r[0].x,r[0].z,0,null,true);else place(c,r[0].x,r[0].z,0,r.map(p=>({x:p.x,z:p.z})),true);}else place(c,PARK.x,PARK.z,0,null,false);});};

/* ---------- reggeli fény: alacsony nap keletről, narancs fény, kékes köd ---------- */
function morning(){G.setDaylight(true);const sky=A.sky.material.uniforms;A.scene.background.setHex(0xd6c2b6);A.scene.fog.color.setHex(0xcbbcb8);A.scene.fog.density=0.0105;
  sky.uHor.value=new THREE.Color(0xf6b688);sky.uZen.value=new THREE.Color(0x56709e);A.moonLight.color.setHex(0xffb878);A.moonLight.intensity=1.3;
  A.hemi.color.setHex(0xa8bce0);A.hemi.groundColor.setHex(0x4a4240);A.hemi.intensity=0.72;A.MOON_DIR.set(0.85,0.24,0.3).normalize();}
morning();

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{pass:false,man:false,rode:0,rideZ:null,rideTop:null,flipT:6,panelT:12,done:false});
  K.PASS.m.visible=true;K.MAN.m.visible=true;Object.assign(K.CRANE,{z:K.CRANE.zS,lift:0,st:'wait',t:9,dir:1});K.stepCrane(0);
  if(T.fromCp&&T.cp){T.fromCp=false;Object.assign(T,T.cp.state);K.PASS.m.visible=!T.pass;K.MAN.m.visible=!T.man;P.x=T.cp.x;P.z=T.cp.z;P.yaw=Math.PI;G.showMsg('Folytatod a mentési pontról.');}
  else{T.fromCp=false;T.cp=null;P.yaw=0;G.showMsg('Kora reggel a kikötőben. Keresd meg az NRSU 409217-es konténert.');}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · Acélárnyak';
  $('tutText').textContent='A vonaton talált konténerszám ide vezetett. Két dolgot keresel: Naruse konténerében (NRSU 409217) a belépési papírokat a rókamaszkos ünnepségre, a kerítés mögötti irodakonténerben a rakományjegyzéket. A kerítésen háromféleképpen jutsz át: a nagy daru terhére kampózva, a kapun (az őr néha hátrafordul), vagy egy lámpaoszlopról az iroda tetejére. A végén a vízparti kerítésnél, északkeleten tűnj el.';};

function setCp(){T.cp={x:P.x,z:P.z,state:{pass:T.pass,man:T.man}};G.showMsg('Mentési pont.');}
function goal(){if(!T.pass&&!T.man){const dp=Math.hypot(P.x-K.PASS.x,P.z-K.PASS.z),dm=Math.hypot(P.x-K.MAN.x,P.z-K.MAN.z);return dp<dm?'pass':'man';}if(!T.pass)return'pass';if(!T.man)return'man';return'exit';}

G.hooks.update=dt=>{const t=S.time,C=K.CRANE;
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0||P.z<40)$('tut').hidden=true;}
  /* daru: ha a terhén ülsz, visz magával */
  const z0=C.z,top0=K.craneTop();K.stepCrane(dt);
  if(P.mode==='perch'&&P.tree===C.perch){const dz=C.z-z0,dy=K.craneTop()-top0;P.z+=dz;P.py+=dy;T.rode+=Math.abs(dz);
    if(Math.abs(dz)>0&&!T.rideMsg){T.rideMsg=true;G.showMsg('A daru visz. Ha a kerítésen túl leteszi, ugorj le.');}}else T.rideMsg=false;
  /* kapuőr: időnként hátrafordul az iroda felé (ez a kapu ablaka) */
  {const g=ALLCOPS[0];if(g&&!g.down&&g.active!==false&&g.st==='patrol'){T.flipT-=dt;if(T.flipT<=0){g.faceOff=!g.faceOff;T.flipT=g.faceOff?4.5:8+Math.random()*3;}g.ry+=G.wrapA((g.faceOff?0:Math.PI)-g.ry)*Math.min(1,dt*2.2);}}
  /* az irodában ülő őr a falat nézi (háttal az ajtónak), papírokat rendez */
  {const g=ALLCOPS[ORDER.indexOf('office')];if(g&&!g.down&&g.active!==false&&g.st==='patrol')g.ry+=G.wrapA(-Math.PI/2-g.ry)*Math.min(1,dt*3);}
  /* tárgyak */
  if(!T.pass&&P.mode==='ground'&&Math.hypot(P.x-K.PASS.x,P.z-K.PASS.z)<1.7){T.pass=true;K.PASS.m.visible=false;G.tone(0.08,700,1100,0.15);
    G.showMsg(T.man?'Megvannak a belépési papírok. Irány a vízparti kerítés északkeleten!':'Megvannak a belépési papírok a rókamaszkos ünnepségre. Most a rakományjegyzék az irodában, a kerítés mögött.');setCp();}
  if(!T.man&&P.mode==='ground'&&Math.hypot(P.x-K.MAN.x,P.z-K.MAN.z)<1.4){T.man=true;K.MAN.m.visible=false;G.tone(0.08,700,1100,0.15);
    G.showMsg(T.pass?'Megvan a rakományjegyzék. Irány a vízparti kerítés északkeleten!':'Megvan a rakományjegyzék: Naruse biztonsági cége szállította az iratokat. Most a konténer, NRSU 409217.');setCp();}
  const gl=goal(),E=K.EXIT;
  if(gl==='pass'){GOAL.x=K.PASS.x;GOAL.z=K.PASS.z;G.goalName='Konténer';G.station='Cél: NRSU 409217';}
  else if(gl==='man'){GOAL.x=K.MAN.x;GOAL.z=K.MAN.z;G.goalName='Iroda';G.station='Cél: rakományjegyzék';}
  else{GOAL.x=(E.x0+E.x1)/2;GOAL.z=E.z0;G.goalName='Kijárat';G.station='Menekülj: vízparti kerítés';}
  if(gl==='exit'&&P.mode==='ground'&&P.x>E.x0&&P.z<E.z1&&!T.done){T.done=true;finish();}
};

/* ---------- vége ---------- */
G.hooks.seals=s=>[['Acélárnyék',T.rode>=8,'a daru terhén utazol'],['Érintetlen rakomány',!s.dets,'senki sem lát meg'],['Csendes kikötő',!s.kills,'senkit sem ölsz meg']];
function finish(){G.finishLevel('Kijutottál a kikötőből','A rakományjegyzék szerint a hamis iratokat Naruse biztonsági cége szállította. A belépési papírokon pedig ott a név: Mori is ott lesz a rókamaszkos ünnepségen, a kastélyparkban.');}

/* mentési pont: halál után onnan folytatható */
{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás a mentési pontról';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

/* ---------- kezdőképernyő ---------- */
$('startEyebrow').textContent='5. fejezet · Acélárnyak';
$('lead').textContent='Kora reggel, egy konténerkikötőben. Mori aktatáskájában egy konténerszám volt: NRSU 409217. A konténer Naruse biztonsági cégéé, a kikötőt az ő emberei őrzik. Keresd meg a konténert, aztán szerezd meg a rakományjegyzéket az irodából, a kerítés mögül. A nagy daru percenként átviszi a terhét a kerítés fölött.';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=NACT[k]+' őr a kikötőben';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='a konténerhalmok tetejére, a lámpaoszlopokra, az iroda tetejére és a daru terhére kapaszkodhatsz fel';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a lámpaoszlopokon felmászhatsz (1–9: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: NRSU 409217 és a rakományjegyzék, aztán ki északkeleten.';
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_KIKOTO={T,K,finish,morning};
})();
