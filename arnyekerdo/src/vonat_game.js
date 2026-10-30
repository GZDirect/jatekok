(function(){
/* Shinobi – 4. pálya: Hegyi expressz (a küldetés menete).
   © 2026 Fejes Géza. Minden jog fenntartva.
   Mori, Kuroda jobbkeze, a cég iratait a magánvonatán viszi északra. A hátsó kilátókocsiról indulsz,
   át kell jutni a vonaton a szalonkocsiig, el kell venni az aktatáskát, aztán a mozdonyban meghúzni a vészféket.
   Alagutak: a tehervagon tetején guggolni kell, különben lesodor; az alagútban sötét van, rosszabbul látnak. */
const A=window.AE;if(A.LV!=='vonat')return;
const G=A.G,V=A.VONAT,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('vonat');
G.setDaylight(true);
/* a távoli hegyek és erdők zöldebbek és lejjebb ülnek a síkság fölött */
[[A.ring1,0x3e5a36,-6],[A.ring2,0x5a7a52,-6],[A.ring3,0x7a9888,-28]].forEach(q=>{q[0].material.color.setHex(q[1]);q[0].position.y+=q[2];});

Object.assign(G.LINES,{
  spot:[['','','Behatoló a vonaton!'],['','','Ott van! Állj!'],['','','Védjétek Mori urat!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Nézzétek át a kocsikat!']],
  body:[['','','Valaki itt fekszik! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});

const T={cp:null,fromCp:false,caseT:-1,warned:false,boxSeen:false,tunT:40,dark:0,clack:0,brake:-1,resetT:0,reinfT:-1,reinf:false,ph:0,phT:0,flipT:0,falls:0};
const NP={konnyu:[7,9],normal:[9],nehez:[]};
const boss=()=>ALLCOPS[0];
function off(){const d=G.D();return d===G.DIFF.konnyu?NP.konnyu:d===G.DIFF.nehez?NP.nehez:NP.normal;}

/* ---------- elhelyezés ---------- */
function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false,safe:null});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,H(x,z)+1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}
const PARK={x:0,z:-49.6};
G.hooks.setup=()=>{const sp=V.spots,o=off();
  place(ALLCOPS[0],sp.desk.x,sp.desk.z,sp.desk.ry);Object.assign(ALLCOPS[0],{unarmed:true,safe:sp.safe,hp:2});
  place(ALLCOPS[1],-0.95,-23.7,0);
  place(ALLCOPS[2],0.3,-25,0,[{x:0.3,z:-25},{x:0.3,z:-34.5}]);
  place(ALLCOPS[3],0.2,70.5,Math.PI,[{x:0.2,z:70.5},{x:0.2,z:79}]);Object.assign(ALLCOPS[3],{unarmed:true,safe:{x:0.2,z:69}});
  place(ALLCOPS[4],1.15,25,Math.PI,[{x:1.15,z:25},{x:1.15,z:43}]);
  place(ALLCOPS[5],1.0,3.6,Math.PI,[{x:1.0,z:3.6},{x:1.0,z:12},{x:-1.0,z:12},{x:-1.0,z:20.6},{x:-1.0,z:12},{x:1.0,z:12}]);
  place(ALLCOPS[6],0,-2.5,0,[{x:0,z:-2.5},{x:0,z:-12.6}]);
  place(ALLCOPS[7],0.1,-15.9,Math.PI);
  place(ALLCOPS[8],0.6,-59.6,0);Object.assign(ALLCOPS[8],{unarmed:true,safe:{x:1.0,z:-56}});
  place(ALLCOPS[9],1.15,24.7,Math.PI);
  place(ALLCOPS[10],PARK.x,PARK.z,0,null,false);place(ALLCOPS[11],-PARK.x,PARK.z,0,null,false);
  o.forEach(i=>place(ALLCOPS[i],PARK.x,PARK.z-2,0,null,false));
  V.CASE.taken=false;V.CASE.m.visible=true;};

/* ---------- kocsiról kocsira: a cél felé az ajtókon át vezetjük az őröket ---------- */
const CL=Object.values(V.CARS).sort((a,b)=>a.z0-b.z0);
function carIdx(z){for(let i=0;i<CL.length;i++){if(z<=CL[i].z1+1&&z>=CL[i].z0-1)return i;}return z<CL[0].z0?0:CL.length-1;}
function midPoint(c,g){const ci=carIdx(c.z),gi=carIdx(g.z),car=CL[ci];if(ci===gi)return g;const fwd=gi<ci;
  if(car.id==='pass'&&c.x>0.7&&c.z>25.6&&c.z<42.4)return{x:1.15,z:fwd?25.4:42.6};
  if(car.id==='loco'&&Math.abs(c.x)>0.9&&c.z<-45.3&&c.z>-53.8)return{x:Math.sign(c.x)*1.3,z:fwd?-54.6:-45.0};
  if(car.id==='flat'&&c.z>2.4&&c.z<21.6){const side=c.z>14?-1.0:1.0;if(Math.abs(c.x-side)>0.3&&((c.z>14.6&&fwd)||(c.z<9.4&&!fwd)))return{x:side,z:c.z+(fwd?-0.5:0.5)};}
  if(fwd)return c.z>car.z0+0.9?{x:0,z:car.z0+0.4}:{x:0,z:car.z0-1.6};return c.z<car.z1-0.9?{x:0,z:car.z1-0.4}:{x:0,z:car.z1+1.6};}
function steerCops(){ALLCOPS.forEach(c=>{if(c.active===false||c.down||c===boss())return;if(c.st==='alert'&&c.sees){c._mid=null;return;}
  if(!c._mid||Math.abs(c.tx-c._mid.x)>0.01||Math.abs(c.tz-c._mid.z)>0.01){c.goal={x:c.tx,z:c.tz};}
  const m=midPoint(c,c.goal);if(m===c.goal){c._mid=null;c.tx=c.goal.x;c.tz=c.goal.z;return;}c._mid=m;c.tx=m.x;c.tz=m.z;
  if(Math.hypot(c.x-m.x,c.z-m.z)<1.7){c.wait=0;}});}

/* ---------- Mori napirendje: íróasztal ↔ ablak ---------- */
function navTo(c,pts,face){c.nav={pts,k:0,face};}
function stepNav(c){const n=c.nav;if(!n||c.st!=='patrol'||c.down)return;const p=n.pts[n.k];if(!p)return;c.tx=p.x;c.tz=p.z;c.route=[p];
  const d=Math.hypot(c.x-p.x,c.z-p.z);n.arrived=false;if(d<1.25&&n.k<n.pts.length-1){n.k++;const q=n.pts[n.k];c.tx=q.x;c.tz=q.z;c.route=[q];c.wait=0;}
  else if(d<1.25&&n.k===n.pts.length-1){n.arrived=true;if(n.face!=null)c.ry+=G.wrapA(n.face-c.ry)*0.08;c.wait=5;}}
const TO_WIN=[{x:-0.6,z:-39.3},{x:-0.3,z:-27.4},{x:-0.75,z:-26.0}],TO_DESK=[{x:-0.3,z:-27.4},{x:-0.6,z:-39.3},{x:1.1,z:-38.9}];
function setPhase(k,first){T.ph=k%2;T.phT=T.ph?14:28;const b=boss();if(b.down)return;if(first){navTo(b,[TO_DESK[2]],Math.PI);return;}if(T.ph)navTo(b,TO_WIN.slice(),Math.PI/2);else navTo(b,TO_DESK.slice(),Math.PI);}

/* ---------- alagút és sötétség ---------- */
const BASE={};
function applyDark(){const d=T.dark;if(!BASE.mi){BASE.mi=A.moonLight.intensity;BASE.hi=A.hemi.intensity;BASE.bg=A.scene.background.clone();BASE.fog=A.scene.fog.color.clone();}
  A.moonLight.intensity=BASE.mi*(1-0.95*d);A.hemi.intensity=BASE.hi*(1-0.72*d);const dk=new THREE.Color(0x0c0d0e);A.scene.background.copy(BASE.bg).lerp(dk,d);A.scene.fog.color.copy(BASE.fog).lerp(dk,d);
  G.visMul=1-0.45*d;V.SUNM.opacity=0.16*(1-d);V.SCONG.opacity=0.45+0.4*d;if(V.LIFE.clouds)V.LIFE.clouds.forEach(c=>c.visible=d<0.5);}
function failReset(why){if(T.resetT>0)return;T.resetTo=T.cp||(P.z<68?{x:0,z:68.9}:null);T.resetT=1.4;T.falls++;G.showMsg(why);G.thump(0.6);G.noiseHit(0.4,300,'lowpass',0.5,1);}
function doReset(){const cp=T.resetTo||T.cp||G.START;Object.assign(P,{x:cp.x,z:cp.z,yaw:0,pitch:0,mode:'ground',tree:null,anim:null,drag:null,crouch:true,run:false,pend:null,camY:0.95});A.setRope(0,0,0,0,0,0,false);
  S.alarm=0;S.smokeT=0;G.clearSpikes();ALLCOPS.forEach(c=>{if(!c.down&&c.active!==false&&(c.st==='alert'||c.st==='search'||c.st==='suspect')){c.st='patrol';c.aw=0;}});G.updateButtons();}

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{caseT:-1,warned:false,boxSeen:false,tunT:40,dark:0,brake:-1,resetT:0,reinfT:-1,reinf:false,ph:0,phT:28,flipT:8});
  V.LIFE.V=22;V.TUN.on=false;V.TUN.g.visible=false;applyDark();setPhase(0,true);G.goalName='Aktatáska';GOAL.x=V.CASE.x;GOAL.z=V.CASE.z;
  if(T.fromCp&&T.cp){T.fromCp=false;P.x=T.cp.x;P.z=T.cp.z;P.yaw=0;G.showMsg('Folytatás a mentési pontról.');}
  else{T.cp=null;P.yaw=0;G.showMsg('A kilátókocsi peronján vagy. Mori a szalonkocsiban ül, elöl.');}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · Hegyi expressz';
  $('tutText').textContent='Juss előre a vonaton a szalonkocsiig, és vedd el Mori aktatáskáját az íróasztaláról. Aztán a mozdonyban húzd meg a piros vészféket. A tehervagonon a tetején kell átmenned: ha alagút jön, guggolj le! Az alagútban sötét van, ott rosszabbul látnak. Az ülő utasok nem figyelnek rád.';T.panelT=14;};

G.hooks.noiseMul=(x,z)=>{const h=H(x,z);return (h>0.9?0.55:1)*(V.inTunnel(z)?0.7:1);};
G.hooks.caught=()=>{};

G.hooks.update=dt=>{const t=S.time,b=boss();
  V.stepLand(dt);
  /* a vonat ringása és zakatolása */
  G.camRoll=(Math.sin(t*1.9)*0.004+Math.sin(t*0.7)*0.003)*(V.LIFE.V/22);V.trainG.rotation.z=G.camRoll*0.6;
  T.clack-=dt*(V.LIFE.V/22);if(T.clack<=0&&V.LIFE.V>1){T.clack=1.05;const v=V.inTunnel(P.z)?0.09:0.05;G.noiseHit(v,700,'bandpass',0.05,1.2);setTimeout(()=>G.noiseHit(v*0.8,650,'bandpass',0.05,1.2),140);
    if(H(P.x,P.z)>0.9&&!V.inTunnel(P.z))G.noiseHit(0.04,500,'lowpass',0.9,0.6);}
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0)$('tut').hidden=true;}
  if(T.resetT>0){T.resetT-=dt;if(T.resetT<=0)doReset();return;}
  /* mentési pontok */
  if(!T.cp&&P.z<43.6&&H(P.x,P.z)<0.2){T.cp={x:0.2,z:43.4};G.showMsg('Mentési pont: a fülkés kocsi.');}
  if(T.cp&&T.cp.z>0&&P.z<-19.6){T.cp={x:0,z:-19.4};G.showMsg('Mentési pont: a szalonkocsi ajtaja.');}
  /* alagutak */
  const onRoof=H(P.x,P.z)>2.2;if(onRoof&&!T.boxSeen){T.boxSeen=true;if(T.tunT>2.5){T.tunT=2.5;T.forced=true;}}
  if(!V.TUN.on){T.tunT-=dt;if(T.tunT<=0&&T.brake<0){V.startTunnel();if(T.forced){T.forced=false;V.TUN.z0=-190;}T.tunT=48+Math.random()*20;T.warned=false;G.tone(0.18,180,160,1.6,'sawtooth');setTimeout(()=>G.tone(0.14,240,210,1.0,'sawtooth'),1700);
    G.showMsg(onRoof||H(P.x,P.z)>0.9?'Alagút jön! A tetőn guggolj le!':'Alagút jön: sötét lesz, kevésbé látnak.');}}
  const inT=V.inTunnel(P.z);T.dark+=((inT?1:0)-T.dark)*Math.min(1,dt*3);applyDark();
  if(inT&&((P.mode==='ground'&&onRoof&&!P.crouch)||P.mode==='perch'||P.mode==='hook')){failReset('Az alagút lesodort a tetőről. Guggolni kellett volna.');return;}
  /* Mori napirendje; az ajtónál álló testőr néha a bejárat felé fordul */
  if(!b.down&&b.st==='patrol'&&b.nav&&b.nav.arrived){T.phT-=dt;if(T.phT<=0)setPhase(T.ph+1);}
  if(!b.down&&b.st==='patrol')stepNav(b);
  steerCops();
  {const g=ALLCOPS[1];if(!g.down&&g.st==='patrol'){T.flipT-=dt;if(T.flipT<=0){T.flipT=7+Math.random()*4;g.faceDoor=!g.faceDoor;}g.ry+=G.wrapA((g.faceDoor?Math.PI:0)-g.ry)*Math.min(1,dt*2.5);}}
  /* aktatáska */
  if(!V.CASE.taken&&P.mode==='ground'&&Math.hypot(P.x-V.CASE.x,P.z-V.CASE.z)<1.25){V.CASE.taken=true;V.CASE.m.visible=false;G.tone(0.08,700,1100,0.15);G.showMsg('Megvan Mori aktatáskája! Irány a mozdony, a vészfék.');G.goalName='Vészfék';}
  if(V.CASE.taken&&!b.down&&b.st==='patrol'&&T.ph===0&&b.nav&&b.nav.arrived&&T.caseT<0){T.caseT=0;G.sayLine(['','','Az aktatáskám! Riadó!'],b.x,b.z,0.9);G.raiseAlarm(P.x,P.z);}
  if(V.CASE.taken){GOAL.x=V.BRAKE.x;GOAL.z=V.BRAKE.z;V.BRAKE.spr.material.opacity=0.4+0.3*Math.sin(t*5);}else{GOAL.x=V.CASE.x;GOAL.z=V.CASE.z;}
  G.station=V.CASE.taken?'Cél: vészfék a mozdonyban':'Cél: Mori aktatáskája';
  /* erősítés a gépteremből */
  if(!T.reinf&&S.alarms>0&&T.reinfT<0)T.reinfT=6;
  if(T.reinfT>0){T.reinfT-=dt;if(T.reinfT<=0){T.reinf=true;[10,11].forEach((i,k)=>{const c=ALLCOPS[i];place(c,k?-1.3:1.3,-47,Math.PI,[{x:0,z:-30},{x:0,z:-8}],true);c.st='search';c.searchT=40;c.tx=S.lastKnown.x;c.tz=S.lastKnown.z;c.aw=0.6;});G.showMsg('Erősítés jön a mozdony felől.');}}
  /* vészfék */
  if(T.brake<0&&P.mode==='ground'&&Math.hypot(P.x-V.BRAKE.x,P.z-V.BRAKE.z)<1.65){if(!V.CASE.taken){if(!T.noCaseMsg){T.noCaseMsg=true;G.showMsg('Előbb szerezd meg Mori aktatáskáját a szalonkocsiban.');}}
    else{T.brake=0;V.BRAKE.m.rotation.x=-0.6;G.showMsg('Meghúztad a vészféket!');G.noiseHit(0.35,2600,'bandpass',2.4,4);G.tone(0.12,1900,1500,2.2,'sawtooth');}}
  else if(Math.hypot(P.x-V.BRAKE.x,P.z-V.BRAKE.z)>2.2)T.noCaseMsg=false;
  if(T.brake>=0){T.brake+=dt;V.LIFE.V=Math.max(0,22*(1-T.brake/4.5));if(T.brake>5){finish();}}
};

/* ---------- vége ---------- */
function seals(){const out=[];if(S.alarms===0)out.push('Árnyék');if(S.kills===0)out.push('Tiszta kéz');if(S.time<420)out.push('Gyors');return out;}
function finish(){if(T.done)return;T.done=true;const sl=seals();T.sl=sl;const rk=G.hooks.rank();G.saveProgress({l4:true,r4:rk[0],s4:sl});
  G.endGame(true,'Megállt a vonat','Mori iratai nálad vannak. Mire a testőrök kiértek, már eltűntél az erdőben.');$('endEyebrow').textContent='Küldetés teljesítve';}
G.hooks.rank=()=>{const sl=T.sl||seals(),names=['Bérgyilkos','Nindzsa','Mester','Árnyék'];
  const miss=['Árnyék (egyszer sem riasztottak)','Tiszta kéz (senkit sem öltél meg)','Gyors (7 percen belül)'].filter((s,k)=>!sl.includes(['Árnyék','Tiszta kéz','Gyors'][k]));
  return[names[sl.length],'',(sl.length?'Pecsétek: '+sl.join(' · ')+'.':'Nincs pecsét.')+(miss.length?' Még megszerezhető: '+miss.join(', ')+'.':' Minden pecsét a tiéd.')+' Idő: '+G.fmt(S.time)+' · Riasztások: '+S.alarms+'.'];};
{const _ng=G.hooks.newRound;G.hooks.newRound=()=>{T.done=false;_ng();};}

/* mentési pont: halál után onnan folytatható */
{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás a mentési pontról';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

/* ---------- kezdőképernyő ---------- */
$('startEyebrow').textContent='4. fejezet · Hegyi expressz';
$('lead').textContent='Délben, a hegyek között. Kuroda jobbkeze, Mori, a cég iratait a magánvonatán viszi északra. Egy felüljáróról a hátsó kilátókocsira ugrottál. Juss előre kocsiról kocsira a szalonkocsiig, vedd el az aktatáskát, aztán a mozdonyban húzd meg a vészféket. Vigyázz az alagutakkal!';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=(12-NP[k].length-2)+' ember a vonaton';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='a pőrekocsi két konténerének tetejére kapaszkodhatsz fel, onnan felülről támadhatsz';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a konténerek oldalán felmászhatsz (1–8: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: Mori aktatáskája, aztán a vészfék a mozdonyban.';
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_VONAT={T,V,setPhase,boss,finish,applyDark};
})();
