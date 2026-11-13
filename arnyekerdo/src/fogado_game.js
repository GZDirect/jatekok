(function(){
/* Shinobi – 7. pálya: Fehér csend (a küldetés menete).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   A cég könyvelője (megfélemlített tanú, nem ellenség) a fogadó keleti szárnyában, az irodában bujkál.
   Ha észrevétlenül odaérsz, beszél veled, és önként átadja a pénzügyi iratokat; ha az őrök épp riadóznak, megijed, ilyenkor a ládából kell elvenni.
   A friss hóban lábnyomot hagysz: az őrök észreveszik és követik (a fán, kövön, verandán nem marad nyom). A gőzben guggolva nehezen látnak. */
const A=window.AE;if(A.LV!=='fogado')return;
const G=A.G,F=A.FOGADO,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('varos');

Object.assign(G.LINES,{
  spot:[['','','Ott van! Állj!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Keressétek!']],
  body:[['','','Valaki itt fekszik! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});
const SAY={
  prints:['g','','Lábnyomok… Valaki erre járt.'],
  acc:[['g','','Ki vagy? Ne bánts! Én csak a könyveket vezettem.'],['g','','Naruse cége fizette a hamisítást. Itt vannak a számlák, vidd el őket.'],['g','','Az eredeti birtokokmányok a hegyi templom archívumában vannak. A mestered neve is ott áll a régi lapokon.']],
  scared:['g','','Nem! Itt vannak az őrök… nem mondok semmit!']};

const T={docs:false,talked:false,refused:false,printSeen:false,steam:false,lastP:null,cp:null,fromCp:false,panelT:12,done:false,talkQ:-1,flipT:6};
const ORDER=['path','pools','front','door','east','back','north','west','south'],NACT={konnyu:6,normal:7,nehez:9};
function nact(){const d=G.D();return d===G.DIFF.konnyu?NACT.konnyu:d===G.DIFF.nehez?NACT.nehez:NACT.normal;}
const PARK={x:29,z:59};
function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false,safe:null,trail:null});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,H(x,z)+1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}
G.hooks.setup=()=>{const n=nact();ORDER.forEach((k,i)=>{const c=ALLCOPS[i];if(!c)return;const r=F.routes[k];
  if(i>=n)place(c,PARK.x,PARK.z,0,null,false);else place(c,r[0].x,r[0].z,0,r.map(p=>({x:p.x,z:p.z})),true);});};

/* ---------- a könyvelő: civil, az íróasztal mögött ül ---------- */
const ACC={x:18.6,z:-32.6,m:null};
{const m=A.buildPolice(77,{suit:true,civ:true});m.position.set(ACC.x,0.5,ACC.z);m.rotation.y=Math.PI;A.scene.add(m);ACC.m=m;const R=m.userData.R;if(R.lensGlow)R.lensGlow.visible=false;
  m.userData.anim(0,0,0,{st:'patrol',bp:0,sweep:0,shoot:0,fall:0,stagger:0});R.hips.position.y=0.55;R.legs.forEach(l=>{l.hp.rotation.x=-1.45;l.kn.rotation.x=1.45;});R.arms.forEach(a=>{a.sh.rotation.x=0.6;a.el.rotation.x=0.9;});
  const glasses=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.025,0.01),new THREE.MeshBasicMaterial({color:0x202020}));glasses.position.set(0,0.135,-0.12);R.neck.add(glasses);}
const CHEST={x:21.2,z:-33.8};

/* ---------- derült, hideg délelőtt ---------- */
G.setDaylight(true);A.scene.background.setHex(0xb4c2d2);A.scene.fog.color.setHex(0xbecad8);A.scene.fog.density=0.0105;
{const sky=A.sky.material.uniforms;sky.uHor.value=new THREE.Color(0xccd6e2);sky.uZen.value=new THREE.Color(0x6a82a4);}
A.moonLight.color.setHex(0xffead0);A.moonLight.intensity=1.05;A.hemi.color.setHex(0xc4d2ea);A.hemi.groundColor.setHex(0x7c889c);A.hemi.intensity=0.78;A.MOON_DIR.set(0.35,0.62,0.4).normalize();
G.hooks.hide=()=>P.crouch&&F.inSteam(P.x,P.z);

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{docs:false,talked:false,refused:false,printSeen:false,steam:false,lastP:null,panelT:12,done:false,talkQ:-1,flipT:6});F.clearPrints();
  if(T.fromCp&&T.cp){T.fromCp=false;T.docs=true;T.talked=T.cp.talked;P.x=T.cp.x;P.z=T.cp.z;P.yaw=0;G.showMsg('Folytatod: az iratok nálad vannak.');}
  else{T.fromCp=false;T.cp=null;P.yaw=0;G.showMsg('Friss hó a hegyi ösvényen. A fogadó északra van.');}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · Fehér csend';
  $('tutText').textContent='A cég könyvelője a fogadó keleti szárnyában, az irodában bujkál; ő nem ellenség, hanem megfélemlített tanú. Juss el hozzá észrevétlenül, és beszélj vele: önként odaadja az iratokat. A friss hóban lábnyomot hagysz, az őrök követik. A fapallón, a kövön és a verandán nem marad nyom. A medencék gőzében guggolva nehezen látnak. A hátsó kijárat északon van.';};

function nearCops(R){return COPS.some(c=>!c.down&&c.active!==false&&(c.st==='alert'||c.st==='search')&&Math.hypot(c.x-P.x,c.z-P.z)<R);}
G.hooks.ctx=()=>{if(T.docs)return null;
  if(Math.hypot(P.x-ACC.x,P.z-ACC.z)<2.9&&T.talkQ<0)return{label:'Beszélj',txt:'Szólítsd meg a könyvelőt (csendben)',act:talk};
  if(T.refused&&Math.hypot(P.x-CHEST.x,P.z-CHEST.z)<1.6)return{label:'Elvesz',txt:'Vedd ki az iratokat a ládából',act:()=>{T.docs=true;gotDocs();}};return null;};
function talk(){if(nearCops(16)||S.alarm>0){T.refused=true;G.sayLine(SAY.scared,ACC.x,ACC.z,1.05,'g');G.showMsg('A könyvelő megijedt. Az iratok a ládában vannak, a sarokban.');return;}
  T.talkQ=0;T.talkT=0;}
function gotDocs(){G.tone(0.08,700,1100,0.15);T.cp={x:P.x,z:P.z,talked:T.talked};G.showMsg(T.talked?'A könyvelő átadta a pénzügyi iratokat. Irány a hátsó kijárat északon!':'Megvannak a pénzügyi iratok. Irány a hátsó kijárat északon!');}

G.hooks.update=dt=>{const t=S.time;
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0||P.z<42)$('tut').hidden=true;}
  F.stepSteam(dt,t);F.stepFlakes(dt,P.x,P.z);F.stepPrints(t);
  /* lábnyom a hóban (a fapallón, kövön, verandán és a házban nem) */
  if(P.mode==='ground'&&P.moving&&!F.onHard(P.x,P.z)){if(!T.lastP||Math.hypot(P.x-T.lastP.x,P.z-T.lastP.z)>0.8){F.addPrint(P.x,P.z,P.yaw,t);T.lastP={x:P.x,z:P.z};}}
  /* az őrök észreveszik a friss nyomot, és követik */
  COPS.forEach(c=>{if(c.down||c.active===false)return;
    if(c.st==='patrol'||c.st==='suspect'){const fx=-Math.sin(c.ry),fz=-Math.cos(c.ry);let best=null;
      for(const p of F.PRINTS){if(!p.m.visible||t-p.t>F.PRINT_LIFE*0.8)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);if(d>7.5||d<0.5)continue;if((dx*fx+dz*fz)/d<0.55)continue;if(G.blocked(c.x,c.z,p.x,p.z))continue;if(!best||p.t>best.t)best=p;}
      if(best){c.st='search';c.searchT=14;c.trail=best;c.tx=best.x;c.tz=best.z;c.aw=Math.max(c.aw,0.55);if(!T.printSeen){T.printSeen=true;}if(t-(c.saidT||-99)>6){c.saidT=t;G.sayLine(SAY.prints,c.x,c.z,0.95,'g');}}}
    else if(c.st==='search'&&c.trail){const p0=c.trail;if(Math.hypot(c.x-p0.x,c.z-p0.z)<1.2){let nx=null;for(const p of F.PRINTS){if(!p.m.visible||p.t<=p0.t)continue;if(Math.hypot(p.x-p0.x,p.z-p0.z)<2.6&&(!nx||p.t<nx.t))nx=p;}
      if(nx){c.trail=nx;c.tx=nx.x;c.tz=nx.z;c.searchT=Math.max(c.searchT,8);}else c.trail=null;}}});
  /* a gőz szelleme: a gőzben guggolva egy őr elmegy melletted */
  if(!T.steam&&P.crouch&&F.inSteam(P.x,P.z)&&COPS.some(c=>!c.down&&c.active!==false&&c.st==='patrol'&&Math.hypot(c.x-P.x,c.z-P.z)<6))T.steam=true;
  /* a könyvelő beszél */
  if(T.talkQ>=0){T.talkT-=dt;if(T.talkT<=0){if(T.talkQ<SAY.acc.length){G.sayLine(SAY.acc[T.talkQ],ACC.x,ACC.z,1.05,'g');T.talkQ++;T.talkT=4.2;}else{T.talkQ=-1;T.talked=true;T.docs=true;gotDocs();}}}
  /* cél */
  const E=F.EXIT;
  if(!T.docs){GOAL.x=F.OFFICE.door.x;GOAL.z=F.OFFICE.door.z;G.goalName='Könyvelő';G.station='Cél: a könyvelő a keleti szárnyban';}
  else{GOAL.x=0;GOAL.z=E.z0+1;G.goalName='Kijárat';G.station='Menekülj: hátsó kijárat';if(P.mode==='ground'&&P.x>E.x0&&P.x<E.x1&&P.z<E.z1&&!T.done){T.done=true;finish();}}
};

G.hooks.seals=s=>[['Érintetlen hó',!T.printSeen,'egyik őr sem találja meg a lábnyomodat'],['A gőz szelleme',T.steam,'a gőzben guggolva elmegy melletted egy őr'],['Csendes vallomás',T.talked,'a könyvelő önként adja át az iratokat'],['Tiszta kéz',!s.kills,'senkit sem ölsz meg']];
function finish(){G.finishLevel('Eltűntél a hóban',(T.talked?'A könyvelő mindent elmondott: ':'Az iratokból kiderül: ')+'a földek megszerzését és a hamisítást Naruse finanszírozta. Az eredeti birtokokmányok a hegyi templom titkos archívumában vannak, és a régi lapokon ott a mestered neve is. Naruse és a mester valaha ugyanahhoz a rendhez tartozott.');}

{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás az iratokkal';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

$('startEyebrow').textContent='7. fejezet · Fehér csend';
$('lead').textContent='Derült, hideg délelőtt egy havas hegyi termálfogadónál. A Hakuun fogadóban bujkál a cég könyvelője: ő tudja, ki fizette a hamisítást. Naruse emberei őrzik. A friss hóban minden lépésed nyomot hagy; a fapallókon, a kövön és a verandán nem. A medencék gőze eltakar.';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=NACT[k]+' őr a fogadónál';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='a fenyőkre és a fogadó ereszére kapaszkodhatsz fel: a tetőn nem hagysz nyomot';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a havas fenyők törzsén felmászhatsz (1–9: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: a könyvelő a keleti szárnyban, aztán a hátsó kijárat.';
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_FOGADO={T,F,ACC,talk,finish};
})();
