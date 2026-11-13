(function(){
/* Shinobi – 3. pálya: Üvegtorony (a küldetés menete).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   Kuroda a szomszéd torony penthouse-ában dolgozik, két személyi testőrrel; a tetőn járőrök és kamerák.
   Át kell jutni a darun és a víztornyon, elvinni az íróasztaláról a Mori vonatáról szóló iratokat, aztán a terasz sarkában lévő kábelen lecsúszni.
   Kurodát nem kell bántani: ha életben hagyod, a történet szerint Naruse emberei végeznek vele (ez nem számít bele a statisztikádba). */
const A=window.AE;if(A.LV!=='varos')return;
const G=A.G,V=A.VAROS,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
document.body.classList.add('varos');
G.setDaylight(true);

/* a testőrök magyarul szólnak */
Object.assign(G.LINES,{
  spot:[['','','Behatoló a tetőn!'],['','','Ott van! Állj!'],['','','Védjétek a főnököt!']],
  sus:[['','','Mi volt ez?'],['','','Van ott valaki?'],['','','Hm?']],
  lost:[['','','Hová tűnt?'],['','','Keressétek!']],
  body:[['','','Itt fekszik valaki! Riadó!'],['','','Leütötték! Erősítést!']],
  wake:[['','','A fenébe… hol van?']],
  smoke:[['','','Füst! Nem látok!'],['','','A szemem…!']]});

const T={doc:false,camSaw:false,killed:false,bodyFound:false,cp:false,fromCp:false,ph:0,phT:0,reinfT:-1,reinf:false,zip:null,ridePrev:null,rideT:0,briefT:0,callT:0,panelT:0};
const NP={konnyu:2,normal:3,nehez:4};
const boss=()=>ALLCOPS[0];
function npatrol(){const d=G.D();return d===G.DIFF.konnyu?NP.konnyu:d===G.DIFF.nehez?NP.nehez:NP.normal;}

/* ---------- útvonal a penthouse ajtóin át ---------- */
const PHI=(x,z)=>x>-8&&x<21.5&&z>-48&&z<-27;
function path(a,b){const out=[],ia=PHI(a.x,a.z),ib=PHI(b.x,b.z);
  const side=p=>p.x<7?0:1,preM=p=>p.z<-37.5?{x:9.5,z:-40.8}:{x:9.5,z:-34.4};/* a tárgyalóasztalt megkerülve */
  const fromM=p=>{out.push(preM(p),{x:9,z:-37},{x:5,z:-37});},toM=p=>{out.push({x:5,z:-37},{x:9,z:-37},preM(p));};
  if(ia&&ib){if(side(a)!==side(b)){if(side(a))fromM(a);else toM(b);}}
  else if(ia&&!ib){if(side(a))fromM(a);const n=b.z<-48;out.push({x:0.25,z:n?-46.6:-28.4},{x:0.25,z:n?-49.6:-25.4});}
  else if(!ia&&ib){const n=a.z<-48;out.push({x:0.25,z:n?-49.6:-25.4},{x:0.25,z:n?-46.6:-28.4});if(side(b))toM(b);}
  out.push({x:b.x,z:b.z});return out;}
function navTo(c,goal,face){c.nav={pts:path(c,goal),k:0,face};}
function stepNav(c){const n=c.nav;if(!n||c.st!=='patrol'||c.down)return;const p=n.pts[n.k];if(!p)return;c.tx=p.x;c.tz=p.z;c.route=[p];
  const d=Math.hypot(c.x-p.x,c.z-p.z);n.arrived=false;if(d<1.3&&n.k<n.pts.length-1){n.k++;c.wait=0;const q=n.pts[n.k];c.tx=q.x;c.tz=q.z;c.route=[q];}
  else if(d<1.3&&n.k===n.pts.length-1){n.arrived=true;if(n.face!=null)c.ry+=G.wrapA(n.face-c.ry)*0.08;c.wait=5;}}

/* ---------- elhelyezés ---------- */
function place(c,x,z,ry,route,active){Object.assign(c,{x,z,ry,route:route||[{x,z}],ri:0,tx:route?route[0].x:x,tz:route?route[0].z:z,st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,
  lostT:0,searchT:0,found:false,wait:2+Math.random()*3,blind:0,saidT:-99,hiddenBody:false,lookUpT:-8,active:active!==false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false,nav:null,unarmed:false});
  c.seenBody.clear();c.mesh.visible=active!==false;c.mark.visible=false;c.lens.set(x,1.3,z);c.dir.set(-Math.sin(ry),-0.35,-Math.cos(ry)).normalize();}
/* a tárgyaláson a testőrök a keleti ablakokat figyelik, Kuroda a vendégek felé fordul: ez az ablak az iratokhoz */
const PHASES=[{s:'desk',t:22},{s:'meet',t:26},{s:'desk',t:14},{s:'terrace',t:24}];
const POSTS={desk:[{x:-6,z:-40.5,ry:Math.PI},{x:3,z:-46.3,ry:Math.PI/2}],meet:[{x:9.5,z:-33.5,ry:-Math.PI/2},{x:19.6,z:-45.5,ry:-Math.PI/2}],terrace:[{x:0.25,z:-46.7,ry:Math.PI},{x:-3.5,z:-38.5,ry:Math.PI}]};
const STAIR_IN={x:-18.5,z:-20.5};
/* az iratok Kuroda íróasztalán: dosszié és egy kis fénylő jelölő */
const DOC={x:-0.8,z:-44.3,m:new THREE.Group()};
{const y=H(DOC.x,DOC.z)+0.79,f=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.035,0.25),new THREE.MeshLambertMaterial({color:0x7a1e1a}));f.position.set(0,y,0);f.rotation.y=0.25;DOC.m.add(f);
  const p=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.22),new THREE.MeshLambertMaterial({color:0xf2ede0}));p.position.set(0.015,y+0.026,0.01);p.rotation.y=0.32;DOC.m.add(p);
  DOC.m.position.set(DOC.x,0,DOC.z);A.scene.add(DOC.m);}
G.hooks.setup=()=>{const sp=V.spots;
  place(ALLCOPS[0],sp.desk.x,sp.desk.z,sp.desk.ry);Object.assign(ALLCOPS[0],{unarmed:true,safe:sp.safe,hp:2});
  place(ALLCOPS[1],POSTS.desk[0].x,POSTS.desk[0].z,POSTS.desk[0].ry);place(ALLCOPS[2],POSTS.desk[1].x,POSTS.desk[1].z,POSTS.desk[1].ry);
  const np=npatrol();for(let i=0;i<4;i++){const c=ALLCOPS[3+i],r=V.routes[i];if(i<np)place(c,r[0].x,r[0].z,0,r,true);else place(c,STAIR_IN.x,STAIR_IN.z,0,null,false);}
  place(ALLCOPS[7],STAIR_IN.x,STAIR_IN.z,0,null,false);place(ALLCOPS[8],STAIR_IN.x,STAIR_IN.z,0,null,false);};

/* ---------- Kuroda napirendje és a testőrök ---------- */
function setPhase(k){T.ph=k%PHASES.length;T.phT=PHASES[T.ph].t;const s=PHASES[T.ph].s,spot=V.spots[s],b=boss();
  if(!b.down)navTo(b,spot,spot.ry);[1,2].forEach((i,j)=>{const c=ALLCOPS[i],p=POSTS[s][j];if(!c.down)navTo(c,p,p.ry);});T.callT=s==='terrace'?4:0;}
const CALL=['Igen… Nem, a nindzsa halott. A rendőrség elintézte.','A völgyben? Senki nem jutott ki onnan élve.','A szerződést holnap aláírjuk. Ne aggódj.'];

/* ---------- kamerák ---------- */
function stepCams(dt,t){const ey=P.mode==='ground'?H(P.x,P.z)+P.camY:P.py;
  V.CAMS.forEach(c=>{if(c.dead){c.cone.visible=false;c.led.material.color.setHex(0x181010);c.head.rotation.x+=(0.55-c.head.rotation.x)*Math.min(1,dt*3);return;}
    c.yawNow=c.yaw+c.amp*Math.sin(t*Math.PI*2/c.per+c.ph);c.head.rotation.y=c.yawNow;
    const blindBySmoke=S.smokeT>0&&Math.hypot(S.sx-c.x,S.sz-c.z)<6;let see=false;
    if(!blindBySmoke&&S.running&&P.mode==='ground'&&!P.hidden){const dx=P.x-c.x,dz=P.z-c.z,d=Math.hypot(dx,dz);
      if(d<c.range&&d>0.5){const fx=-Math.sin(c.yawNow),fz=-Math.cos(c.yawNow),a=Math.acos(clamp((fx*dx+fz*dz)/d,-1,1));
        if(a<0.42&&!G.blocked(c.x,c.z,P.x,P.z)&&!G.smokeBlocks(c.x,c.z,P.x,P.z))see=true;}
      if(see)c.aw=Math.min(1.2,c.aw+dt*(1.3*(1-d/c.range)+0.45)*(P.moving?1.2:0.7)*(P.crouch?0.65:1));}
    if(!see)c.aw=Math.max(0,c.aw-dt*0.3);
    if(c.alarmT>0)c.alarmT-=dt;
    if(c.aw>=1&&!(c.alarmT>0)){c.alarmT=8;T.camSaw=true;c.aw=0.6;G.raiseAlarm(P.x,P.z);G.tone(0.12,1500,1500,0.3,'square');setTimeout(()=>G.tone(0.12,1500,1500,0.3,'square'),380);G.showMsg('A kamera észrevett! Riasztás.');}
    const k=c.alarmT>0?1:c.aw;c.cone.material.color.setHex(c.alarmT>0?0xff2010:k>0.05?0xffa030:0xff4030);c.cone.material.opacity=blindBySmoke?0.0:0.05+k*0.12;
    c.led.material.color.setHex(blindBySmoke?0x331010:(Math.sin(t*6)>0||k>0.05)?0xff2020:0x501010);});}

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{DOC.m.visible=true;Object.assign(T,{doc:false,camSaw:false,killed:false,bodyFound:false,ph:0,phT:0,reinfT:-1,reinf:false,zip:null,rideT:0,callT:0,panelT:12});
  V.GOND.z=V.GOND.z0;V.GOND.dir=0;V.stepGondola(0);V.CAMS.forEach(c=>{c.aw=0;c.alarmT=0;c.dead=false;c.cone.visible=true;c.head.rotation.x=0;});G.goalName='Iratok';V.ANCHOR.spr.material.opacity=0;
  setPhase(0);
  if(T.fromCp){T.fromCp=false;P.x=6.5;P.z=5;P.yaw=Math.PI*0.9;G.showMsg('A céltorony tetején vagy. Az iratok Kuroda íróasztalán vannak.');}
  else{T.cp=false;P.yaw=Math.PI;G.showMsg('Kuroda irodája a szomszéd torony tetején van. Kampózz át a darun.');P.yaw=0;}
  $('tut').hidden=false;$('tutStep').textContent='Küldetés · Üvegtorony';
  $('tutText').textContent='Kuroda, aki a rendőröket rád küldte, a szomszéd torony tetején lévő üvegfalú irodában dolgozik. Az íróasztalán vannak az iratok arról, merre viszi Mori a cég papírjait. Vidd el őket, amikor Kuroda nincs az asztalánál, aztán csússz le a kábelen a terasz sarkában. Kampóval jutsz át: a darura, onnan a víztoronyra. Az üvegen át mindenki lát. A kamerák pásztáznak, shurikennel kiiktathatók, füsttel vakíthatók. Kurodával nem kell végezned.';};

G.hooks.update=dt=>{const t=S.time,b=boss();
  V.stepGondola(dt);stepCams(dt,t);V.stepLife(dt,t);
  if(T.panelT>0){T.panelT-=dt;if(T.panelT<=0||P.z<8)$('tut').hidden=true;}
  /* mentési pont: a céltorony teteje */
  if(!T.cp&&P.mode==='ground'&&P.z<8.2){T.cp=true;G.showMsg('Mentési pont: a céltorony teteje.');}
  /* Kuroda napirendje */
  if(!b.down&&b.st==='patrol'&&b.nav&&b.nav.arrived){T.phT-=dt;if(T.phT<=0)setPhase(T.ph+1);}
  ALLCOPS.forEach(c=>{if(c.active===false||c.down)return;if(c.st==='patrol'){if(!c.nav&&(c.id===0||c.id===1||c.id===2))setPhase(T.ph);stepNav(c);}else c.nav=null;});
  /* telefonbeszélgetés a teraszon */
  if(!b.down&&PHASES[T.ph].s==='terrace'&&b.st==='patrol'&&Math.hypot(b.x-V.spots.terrace.x,b.z-V.spots.terrace.z)<1.5){T.callT-=dt;if(T.callT<=0){T.callT=9;if(Math.hypot(P.x-b.x,P.z-b.z)<16)G.sayLine(['','',CALL[Math.floor(Math.random()*CALL.length)]],b.x,b.z,0.85);}}
  /* erősítés a lépcsőházból az első riadó után */
  if(!T.reinf&&S.alarms>0&&T.reinfT<0)T.reinfT=8;
  if(T.reinfT>0){T.reinfT-=dt;if(T.reinfT<=0){T.reinf=true;[7,8].forEach((i,k)=>{const c=ALLCOPS[i];place(c,-18.5+k*1.2,-24.6,Math.PI,[{x:-14,z:-30},{x:-14,z:-8},{x:12,z:-8},{x:12,z:-24}],true);
      c.st='search';c.searchT=40;c.tx=S.lastKnown.x;c.tz=S.lastKnown.z;c.aw=0.6;});G.showMsg('Erősítés érkezett a lépcsőházból.');}}
  /* a holttestet megtalálták? */
  if(b.down&&!T.bodyFound&&ALLCOPS.some(c=>c!==b&&c.seenBody.has(b.id)))T.bodyFound=true;
  /* Kuroda halála */
  if(b.dead&&!T.killed){T.killed=true;G.showMsg(T.doc?'Kuroda halott. Irány a kábel a terasz északkeleti sarkában!':'Kuroda halott. Az iratok még az íróasztalán vannak.');}
  else if(b.down&&!b.dead&&!T.koMsg){T.koMsg=true;G.showMsg('Kuroda eszméletlen.');}
  if(!b.down)T.koMsg=false;
  if(!T.doc&&P.mode==='ground'&&Math.hypot(P.x-DOC.x,P.z-DOC.z)<1.5){T.doc=true;DOC.m.visible=false;G.tone(0.08,700,1100,0.15);G.showMsg('Megvannak az iratok: Mori vonatának menetrendje. Irány a kábel a terasz sarkában!');G.goalName='Kábel';}
  if(T.doc){GOAL.x=V.ANCHOR.x;GOAL.z=V.ANCHOR.z;V.ANCHOR.spr.material.opacity=0.45+0.3*Math.sin(t*4);G.station='Menekülj: kábel';}else{GOAL.x=DOC.x;GOAL.z=DOC.z;G.station='Cél: az iratok';}
  /* ablakmosó kosár */
  {const r=V.rects[2],on=P.mode==='ground'&&P.x>r.x0&&P.x<r.x1&&P.z>r.z0&&P.z<r.z1;
    if(!on)T.mustLeave=false;
    if(on&&V.GOND.dir===0&&!T.mustLeave){T.rideT+=dt;if(T.rideT>0.7){T.rideT=0;const atS=Math.abs(V.GOND.z-V.GOND.z0)<0.1;V.GOND.dir=atS?1:-1;T.ridePrev=V.GOND.z;G.showMsg(atS?'Az ablakmosó kosár elindul észak felé.':'A kosár visszaindul.');}}else if(!on)T.rideT=0;
    if(T.ridePrev!=null){const dz=V.GOND.z-T.ridePrev;if(on||V.GOND.dir!==0){if(on)P.z+=dz;}T.ridePrev=V.GOND.z;if(V.GOND.dir===0){T.ridePrev=null;T.mustLeave=true;if(Math.abs(V.GOND.z-V.GOND.z1)<0.1&&on)G.showMsg('Az ablak nyitva: beléphetsz a tárgyalóba.');}}}
  /* menekülés a kábelen */
  if(T.zip){const z=T.zip;z.t+=dt;const k=Math.min(1,z.t/3.4),e=k*k;P.x=z.a.x+(z.b.x-z.a.x)*e;P.z=z.a.z+(z.b.z-z.a.z)*e;P.py=z.a.y+(z.b.y-z.a.y)*e;
    if(k>=1){T.zip=null;finish();}return;}
  if(T.doc&&P.mode==='ground'&&Math.hypot(P.x-V.ANCHOR.x,P.z-V.ANCHOR.z)<1.9){P.mode='zip';P.anim={t:0};P.drag=null;
    T.zip={t:0,a:{x:V.ANCHOR.x,y:2.0,z:V.ANCHOR.z},b:{x:66,y:V.DEEP+111.5,z:-126}};G.showMsg('Lecsúszol a kábelen…');G.noiseHit(0.2,900,'bandpass',0.6,1);}
};

/* ---------- vége ---------- */
G.hooks.seals=s=>[['Üvegszellem',!s.dets,'senki sem lát meg'],['Kamera nélkül',!T.camSaw,'egyik kamera sem vesz észre'],['Tiszta kéz',!s.kills,'senkit sem ölsz meg, Kurodát sem']];
function finish(){G.finishLevel('Elvégezted',T.killed?'Kuroda halott, az iratok nálad vannak. '+G.fmt(S.time)+' után eltűntél a város fölött.':
  'Az iratok nálad vannak, Kuroda élve maradt az irodájában. Egy órával később a hírek bemondták: holtan találták. Nem te voltál. Valaki elhallgattatta, mielőtt beszélhetett volna.');}

/* mentési pont: halál után a céltorony tetejéről */
{const card=$('end').querySelector('.card'),btn=document.createElement('button');btn.id='cpBtn';btn.type='button';btn.textContent='Folytatás a céltorony tetejéről';btn.hidden=true;
  btn.style.cssText='padding:14px 16px;background:var(--goal);color:#0a0f13;border:0;border-radius:6px;font-family:var(--ui);font-size:16px;font-weight:600;cursor:pointer;';
  card.insertBefore(btn,$('again'));btn.addEventListener('click',()=>{T.fromCp=true;btn.hidden=true;G.startGame();});}
/* a játék a saját endGame-jét hívja a lövésnél: azt is figyeljük */
new MutationObserver(()=>{if(!$('end').hidden)$('cpBtn').hidden=!($('endEyebrow').textContent==='Vége'&&T.cp);}).observe($('end'),{attributes:true,attributeFilter:['hidden']});

/* ---------- kezdőképernyő ---------- */
$('startEyebrow').textContent='3. fejezet · Üvegtorony';
$('lead').textContent='Délben, egy nagyváros közepén. Egy felhőkarcoló tetején állsz; a szomszéd torony üvegfalú irodájában Kuroda ül, a cégvezető, aki a rendőröket rád küldte, mert a völgyet és a mester faluját akarja. Az asztalán vannak az iratok arról, merre viszi a jobbkeze, Mori, a cég papírjait. Két testőr vigyázza, a tetőn járőrök és kamerák. Nappal nincs sötétség: a sövények, a klímaberendezések és a füst rejtenek.';
document.querySelectorAll('#diff [data-d] small').forEach(s=>{const k=s.parentNode.dataset.d;s.textContent=NP[k]+' őr a tetőn';});
{const dts=document.querySelectorAll('.how dt');dts.forEach(dt=>{if(dt.textContent==='Kampó')dt.nextElementSibling.textContent='célozz egy kampópontra (daru, víztorony, antenna): ha felderül, átlendülsz rá';if(dt.textContent==='Karmok')dt.nextElementSibling.textContent='a víztorony lábán és az antenna oszlopán felmászhatsz (1–8: eszközváltás)';});}
$('go').querySelector('span').textContent='Cél: az iratok Kuroda asztalán. Utána a kábel a terasz sarkában.';
/* az üveg egyszer lefotózza a környezetét (tükröződés) */
try{const rt=new THREE.WebGLCubeRenderTarget(256,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const cc=new THREE.CubeCamera(0.5,900,rt);cc.position.set(6,2.2,-37);A.scene.add(cc);
  const gm=V.glassM,vis=gm.visible;gm.visible=false;ALLCOPS.forEach(c=>c.mesh.visible=false);cc.update(A.renderer,A.scene);gm.visible=vis;G.hooks.setup();
  gm.envMap=rt.texture;gm.reflectivity=0.55;gm.combine=THREE.MixOperation;gm.needsUpdate=true;}catch(e){}
/* dobócsillag a kamerába: a lencse betörik, a kamera lekonyul és vak marad */
G.hooks.starFly=k=>{for(const c of V.CAMS){if(c.dead)continue;if(Math.hypot(k.x-c.x,k.z-c.z)<0.5&&Math.abs(k.y-c.y)<0.45){c.dead=true;c.aw=0;c.alarmT=0;G.tone(0.06,2400,900,0.12,'square');G.showMsg('Kamera kiiktatva.');return true;}}return false;};
G.hooks.setup();
if(/[?&]aetest/.test(location.search))window.AE_VAROS={T,V,setPhase,boss,path,finish};
})();
