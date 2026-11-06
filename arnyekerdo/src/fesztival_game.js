(function(){
/* Shinobi – 6. pálya: A rókák éjszakája (a küldetés menete).
   © 2026 Fejes Géza. Minden jog fenntartva.
   Három rókamaszkos díszvendég sétál az udvaron; az egyik Mori. Mori sántít (a vonat óta) ÉS balkezes (a bal kezében a legyező).
   Az egyik csaló csak balkezes, a másik csak sántít: mindkét jelet meg kell figyelni. Ki-ki minden körben máshol áll.
   Moritól hátulról, észrevétlenül ki kell lopni a templom archívumának kulcsát (és egy gyufásdobozt a hegyi fogadóból), aztán ki a hátsó kapun.
   A díszvendégek a maszk miatt rövidebbre látnak (seeMul). Tűzijáték: kb. 40 mp-enként 12 mp-ig szól; ilyenkor a zajod alig hallatszik, de a látás ugyanúgy működik. Közben esteledik. */
const A=window.AE;if(A.LV!=='fesztival')return;
const G=A.G,F=A.FESZT,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('varos');

Object.assign(G.LINES,{
  spot:[['','','Ott van! Állj!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Keressétek!']],
  body:[['','','Valaki itt fekszik! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});
/* beszélgetések (a hang első betűje: b = Mori, g = testőr, vendég) */
const TALK={
  limp:[['g','','Mori úr, fáj még a lába a vonat óta?'],['b','','Ne kérdezd. Figyeld a kertet.']],
  guest:[['g','','Szép este. Mikor kezdődik a tűzijáték?'],['g','','Ez a szaké túl édes.'],['g','','Mori úr is itt van ma este, azt mondják.']],
  call:[['b','','Naruse úr, a papírok biztonságban vannak. A kulcs nálam van.'],['b','','A könyvelő a hegyi fogadóban bujkál. Holnap odamegyek.'],['b','','Nem, nem félek. Csak nem akarok úgy járni, mint Kuroda.']]};

const T={key:false,wrong:false,stolen:[],boom:false,heard:0,cp:null,fromCp:false,ph:0,phT:0,fw:0,fwOn:false,warned:false,talkT:6,callT:3,ci:0,done:false,panelT:12,dusk:0};
const VIPS=[0,1,2],ORDER=['body','court1','court2','shrine','tea','bamboo','pond'],NACT={konnyu:4,normal:5,nehez:7};
function nact(){const d=G.D();return d===G.DIFF.konnyu?NACT.konnyu:d===G.DIFF.nehez?NACT.nehez:NACT.normal;}
const PARK={x:29,z:59},SAFE={x:-2,z:-40};
const SP=[F.spots.stalls,F.spots.stage,F.spots.bridge],FACE=[Math.PI/2,0,Math.PI/2];/* a bódé felé (nyugat), a színpad felé (észak), a tó felé (nyugat) */
let MORI=0,ROLE=[];/* ROLE[i]: {left,limp} */

function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false,safe:null,spdMul:1});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,H(x,z)+1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}

/* ---------- díszvendégek: maszk egyszer, legyező és sántítás körönként ---------- */
const FANS=VIPS.map(i=>{const c=ALLCOPS[i],m=c.mesh,R=m.userData.R;R.neck.add(F.foxMask());
  const base=m.userData.anim;m.userData.anim=(t,spd,dt,o)=>{base(t,spd,dt,o);if(m.userData.limp&&spd>0.1&&!o.fall){const ph=m.userData.ph;R.hips.position.y-=0.06*Math.max(0,Math.sin(ph));R.hips.rotation.z=0.06*Math.sin(ph);R.legs[1].kn.rotation.x+=0.25*Math.max(0,Math.sin(ph));}};
  return F.fan();});
function dressVips(){MORI=Math.floor(Math.random()*3);const others=VIPS.filter(i=>i!==MORI);const leftOnly=others[Math.random()<0.5?0:1];
  VIPS.forEach(i=>{const c=ALLCOPS[i],R=c.mesh.userData.R,left=i===MORI||i===leftOnly,limp=i===MORI||(i!==leftOnly);ROLE[i]={left,limp};
    const f=FANS[i];if(f.parent)f.parent.remove(f);R.arms[left?0:1].el.add(f);c.mesh.userData.limp=limp;c.spdMul=limp?0.7:1;});}

G.hooks.setup=()=>{dressVips();VIPS.forEach(i=>{const s=SP[i];place(ALLCOPS[i],s.x+i*0.4,s.z,FACE[i],null,true);Object.assign(ALLCOPS[i],{unarmed:true,safe:SAFE,hp:2,spdMul:ROLE[i].limp?0.7:1,seeMul:0.45});/* a maszk szűkíti a látást */});
  const n=nact();ORDER.forEach((k,j)=>{const c=ALLCOPS[3+j];if(!c)return;const r=F.routes[k];
    if(j>=n)place(c,PARK.x,PARK.z,0,null,false);else if(k==='body'){const m=ALLCOPS[MORI];place(c,m.x+1.4,m.z+0.6,0,null,true);}
    else if(k==='tea')place(c,r[0].x,r[0].z,0,null,true);else place(c,r[0].x,r[0].z,0,r.map(p=>({x:p.x,z:p.z})),true);
    c.seeMul=0.8;/* a tömegben és a lampionfényben nehezebb kiszúrni egy guggoló alakot */});};

/* ---------- napirend: 24 mp-enként helycsere; minden harmadik körben Mori a teaházba megy telefonálni ---------- */
function navTo(c,pts,face){c.nav={pts,k:0,face};}
function stepNav(c){const n=c.nav;if(!n||c.st!=='patrol'||c.down)return;const p=n.pts[n.k];if(!p)return;c.tx=p.x;c.tz=p.z;c.route=[p];
  const d=Math.hypot(c.x-p.x,c.z-p.z);n.arrived=false;if(d<1.0&&n.k<n.pts.length-1){n.k++;c.wait=0;const q=n.pts[n.k];c.tx=q.x;c.tz=q.z;c.route=[q];}
  else if(d<1.0&&n.k===n.pts.length-1){n.arrived=true;if(n.face!=null)c.ry+=G.wrapA(n.face-c.ry)*0.1;c.wait=5;}}
const TEA_IN=[{x:19,z:-20.5},{x:19,z:-27.6}],TEA_OUT=[{x:19,z:-20.5}];
function setPhase(k){T.ph=k;T.phT=24;T.ci=0;
  VIPS.forEach(i=>{const c=ALLCOPS[i];if(c.down)return;const si=(i+k)%3;
    if(i===MORI&&k%3===2){navTo(c,TEA_IN.map(p=>({x:p.x,z:p.z})),0);T.phT=30;return;}
    const pts=[];if(c.z<-24&&c.x>13)pts.push(...TEA_OUT);pts.push({x:SP[si].x+(i-1)*0.5,z:SP[si].z});navTo(c,pts,FACE[si]);});}
const moriInTea=()=>{const m=ALLCOPS[MORI];return T.ph%3===2&&m.x>F.TEA.x0&&m.x<F.TEA.x1&&m.z>F.TEA.z0&&m.z<F.TEA.z1;};

/* ---------- alkony: a nappali fényből lampionos estébe ---------- */
const C0={bg:new THREE.Color(0xe8b890),fog:new THREE.Color(0xd8a88a),hor:new THREE.Color(0xf4b880),zen:new THREE.Color(0x6a80b8),sun:new THREE.Color(0xffb070)},
  C1={bg:new THREE.Color(0x2a3048),fog:new THREE.Color(0x2c3048),hor:new THREE.Color(0x6a5a78),zen:new THREE.Color(0x141c38),sun:new THREE.Color(0x8a7aa0)};
const TC=new THREE.Color();
function applyDusk(k){const sky=A.sky.material.uniforms;A.scene.background.copy(C0.bg).lerp(C1.bg,k);A.scene.fog.color.copy(C0.fog).lerp(C1.fog,k);A.scene.fog.density=0.006+0.004*k;
  sky.uHor.value.copy(C0.hor).lerp(C1.hor,k);sky.uZen.value.copy(C0.zen).lerp(C1.zen,k);A.moonLight.color.copy(C0.sun).lerp(C1.sun,k);A.moonLight.intensity=1.25-0.85*k;A.hemi.intensity=0.85-0.4*k;
  A.MOON_DIR.set(-0.7,0.22-0.12*k,0.3).normalize();G.visMul=0.9-0.3*k;F.paperGlow.emissiveIntensity=0.15+1.1*k;F.LANTERNS.forEach(s=>s.material.opacity=0.15+0.6*k);if(F.TEA.paper)F.TEA.paper.emissiveIntensity=0.15+0.6*k;}
G.setDaylight(true);{const sky=A.sky.material.uniforms;sky.uHor.value=new THREE.Color();sky.uZen.value=new THREE.Color();}A.hemi.color.setHex(0xd0d8f0);A.hemi.groundColor.setHex(0x5a4a3a);applyDusk(0);

/* ---------- tűzijáték: a zaj elnyelődik, a látás marad ---------- */
G.hooks.noiseMul=()=>T.fwOn?0.2:1;
function stepFw(dt){T.fw+=dt;const cyc=T.fw%42;const warn=cyc>27&&cyc<30,on=cyc>=30;
  if(warn&&!T.warned){T.warned=true;G.showMsg('Felszállnak az első rakéták… mindjárt kezdődik a tűzijáték.');G.tone(1.2,500,1800,0.06,'sine');}
  if(!warn&&!on)T.warned=false;
  if(on&&!T.fwOn){T.fwOn=true;G.showMsg('Tűzijáték! A durranások elnyelik a lépteidet.');}
  if(!on&&T.fwOn){T.fwOn=false;G.showMsg('Vége a tűzijátéknak. Újra hallják a lépteidet.');}
  F.stepFireworks(dt,T.fwOn);if(T.fwOn&&Math.random()<dt*1.6){G.thump(0.35);G.noiseHit(0.25,160,'lowpass',0.6,0.5);}}

/* ---------- zsebből lopás: hátulról, közelről, észrevétlenül ---------- */
function stealTarget(){for(const i of VIPS){const c=ALLCOPS[i];if(c.down||c.active===false||c.st==='alert'||T.stolen.indexOf(i)>=0)continue;
  const dx=P.x-c.x,dz=P.z-c.z,d=Math.hypot(dx,dz);if(d>1.45)continue;const fx=-Math.sin(c.ry),fz=-Math.cos(c.ry);if((dx*fx+dz*fz)/d>-0.35)continue;return c;}return null;}
G.hooks.ctx=()=>{const c=stealTarget();if(!c)return null;return{label:'Lop',txt:'Lopd ki a zsebéből (hátulról, csendben)',act:()=>steal(c)};};
function steal(c){T.stolen.push(c.id);G.tone(0.05,1600,2200,0.06);
  if(c.id===MORI){T.key=true;G.showMsg('Megvan: a templom archívumának kulcsa és egy gyufásdoboz a Hakuun hegyi fogadóból. Irány a hátsó kapu északnyugaton!');T.cp={x:P.x,z:P.z};}
  else{if(!T.key)T.wrong=true;G.showMsg('Csak egy névjegytartó. Ez nem Mori.');}}

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{key:false,wrong:false,stolen:[],boom:false,heard:0,ph:0,phT:0,fw:0,fwOn:false,warned:false,talkT:6,callT:3,ci:0,done:false,panelT:12,dusk:0});
  F.FW.forEach(f=>{f.t=9;f.p.material.opacity=0;});applyDusk(0);setPhase(0);
  if(T.fromCp&&T.cp){T.fromCp=false;T.key=true;T.stolen=[MORI];P.x=T.cp.x;P.z=T.cp.z;P.yaw=0;G.showMsg('Folytatod: a kulcs nálad van. Irány a hátsó kapu.');}
  else{T.fromCp=false;T.cp=null;P.yaw=0;G.showMsg('Alkonyodik. A rókamaszkos vendégek az udvaron vannak.');}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · A rókák éjszakája';
  $('tutText').textContent='Három rókamaszkos díszvendég sétál az udvaron, az egyik Mori. Két dologról ismered meg: sántít (a vonat óta), és balkezes, a bal kezében tartja a legyezőt. Az egyik csaló csak balkezes, a másik csak sántít. Lopd ki Mori zsebéből a templom archívumának kulcsát: hátulról, egészen közelről. Tűzijáték alatt a lépteid nem hallatszanak, de látnak. A végén a hátsó kapun, északnyugaton tűnj el.';};

G.hooks.update=dt=>{const t=S.time;
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0||P.z<42)$('tut').hidden=true;}
  T.dusk=clamp(t/300,0,1);applyDusk(T.dusk);stepFw(dt);F.stepVisitors(dt,t);
  /* napirend */
  T.phT-=dt;if(T.phT<=0)setPhase(T.ph+1);
  VIPS.forEach(i=>{const c=ALLCOPS[i];if(c.active===false||c.down)return;if(c.st==='patrol')stepNav(c);else c.nav=null;});
  /* Mori testőre mellette marad (jobbról, kifelé néz), a teaház ajtajánál vár */
  {const b=ALLCOPS[3],m=ALLCOPS[MORI];if(b&&b.active!==false&&!b.down&&b.st==='patrol'&&!m.down){let tx,tz,face;
    if(T.ph%3===2&&m.z<-18&&m.x>12){tx=17.2;tz=-21.6;face=0;}else{const rx=Math.cos(m.ry),rz=-Math.sin(m.ry);tx=m.x+rx*1.4;tz=m.z+rz*1.4;face=m.ry-Math.PI/2;}
    b.route=[{x:tx,z:tz}];b.tx=tx;b.tz=tz;b.ri=0;if(Math.hypot(b.x-tx,b.z-tz)<0.8){b.wait=1;b.ry+=G.wrapA(face-b.ry)*Math.min(1,dt*3);}}}
  /* a teaház őre a bejáratot figyeli, időnként oldalra néz */
  {const g=ALLCOPS[3+ORDER.indexOf('tea')];if(g&&g.active!==false&&!g.down&&g.st==='patrol'){g.ry+=G.wrapA(Math.PI+Math.sin(t*0.4)*0.7-g.ry)*Math.min(1,dt*2);}}
  /* beszélgetések: Mori és a testőr az álláshelyén, a vendégek */
  {T.talkT-=dt;const m=ALLCOPS[MORI],dm=Math.hypot(P.x-m.x,P.z-m.z);
    if(T.talkT<=0&&!m.down&&m.nav&&m.nav.arrived&&dm<9&&!moriInTea()){T.talkT=16;const b=ALLCOPS[3];G.sayLine(TALK.limp[0],b.x,b.z,0.95,'g');setTimeout(()=>{if(S.running)G.sayLine(TALK.limp[1],m.x,m.z,0.85,'b');},2600);}
    else if(T.talkT<=0){const v=VIPS.filter(i=>i!==MORI).map(i=>ALLCOPS[i]).find(c=>!c.down&&Math.hypot(P.x-c.x,P.z-c.z)<8);if(v){T.talkT=14;const l=TALK.guest[Math.floor(Math.random()*TALK.guest.length)];G.sayLine(l,v.x,v.z,0.95,'g');}}}
  /* telefon a teaházban: a papírfal mögül kihallgatható */
  if(moriInTea()){T.callT-=dt;const m=ALLCOPS[MORI],near=P.x>F.TEA.x0-4&&P.x<F.TEA.x1+4&&P.z>F.TEA.z0-4&&P.z<F.TEA.z1+4;
    if(T.callT<=0&&near){T.callT=7;const l=TALK.call[T.ci%TALK.call.length];T.ci++;T.heard++;G.sayLine(l,m.x,m.z,0.85,'b');}}
  /* a robaj árnyékában: zajos mozdulat tűzijáték alatt, őr közelében */
  if(T.fwOn&&!T.boom&&(P.running||P.noiseBoost>4)&&COPS.some(c=>!c.down&&c.active!==false&&Math.hypot(c.x-P.x,c.z-P.z)<12))T.boom=true;
  /* cél */
  if(!T.key){GOAL.x=0;GOAL.z=8;G.goalName='Udvar';G.station='Cél: Mori zsebe (melyik róka?)';}
  else{GOAL.x=(F.EXIT.x0+F.EXIT.x1)/2;GOAL.z=F.EXIT.z0+1;G.goalName='Hátsó kapu';G.station='Menekülj: hátsó kapu';
    if(P.mode==='ground'&&P.x>F.EXIT.x0&&P.x<F.EXIT.x1&&P.z<F.EXIT.z1&&!T.done){T.done=true;finish();}}
};

/* ---------- vége ---------- */
G.hooks.seals=s=>[['Róka szeme',T.key&&!T.wrong,'elsőre a jó vendéget lopod meg'],['A robaj árnyékában',T.boom,'tűzijáték alatt futsz vagy dobsz egy őr közelében'],['Láthatatlan vendég',!s.dets,'senki sem lát meg'],['Békés ünnep',!s.kills,'senkit sem ölsz meg']];
function finish(){G.finishLevel('Eltűntél az ünnepről',(T.heard>=2?'A teaházban hallottad: a könyvelő a hegyi fogadóban bujkál, és Mori fél Narusétól. ':'')+'A zsebedben a templom archívumának kulcsa és egy gyufásdoboz a Hakuun fogadóból, fent a havas hegyekben. Ott bujkál a cég könyvelője.');}

/* mentési pont: a kulcs megszerzése után */
{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás a kulccsal';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

/* ---------- kezdőképernyő ---------- */
$('startEyebrow').textContent='6. fejezet · A rókák éjszakája';
$('lead').textContent='Késő ősz, lampionos ünnep egy régi kastély parkjában. A belépési papírokkal bejutottál. Mori itt van, rókamaszkban, két másik díszvendég között. Ismerd fel: sántít, és balkezes. Lopd ki a zsebéből a templom archívumának kulcsát, aztán tűnj el a hátsó kapun. Esteledik; a tűzijáték alatt nem hallják a lépteidet.';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=NACT[k]+' testőr';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='a fenyőkre és a teaház tetejére kapaszkodhatsz fel';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a fenyők törzsén felmászhatsz (1–9: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: Mori zsebéből a kulcs, aztán a hátsó kapu.';
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_FESZT={T,F,setPhase,stealTarget,steal,get MORI(){return MORI;},ROLE,moriInTea};
})();
