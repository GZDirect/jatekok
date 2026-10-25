(function(){
const A=window.AE,{$,clamp,H,scene,camera,renderer,grid,bgrid,near,moonLight,MOON_DIR}=A;

function pushOut(p,rad){
  near(grid,p.x,p.z,t=>{const dx=p.x-t.x,dz=p.z-t.z,d=Math.hypot(dx,dz),m=t.r+rad;if(d<m&&d>1e-4){p.x=t.x+dx/d*m;p.z=t.z+dz/d*m;}});
  p.x=clamp(p.x,-96,96);p.z=clamp(p.z,-96,96);
}
function blocked(ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),steps=Math.ceil(len/1.5);
  for(let i=1;i<steps;i++){const x=ax+dx*i/steps,z=az+dz*i/steps;let hit=false;
    near(grid,x,z,t=>{if(!hit&&!t.low&&Math.hypot(x-t.x,z-t.z)<t.r+0.55)hit=true;});if(hit)return true;}
  return false;
}
function inBush(x,z){let h=false;near(bgrid,x,z,b=>{if(!h&&Math.hypot(x-b.x,z-b.z)<b.r)h=true;});return h;}

/* ---------- Ellenfelek ---------- */
const TYPES={
  monster:{name:'Szörny',patrol:2.2,chase:5.3,range:14,fov:1.1,hear:1.8,motion:false,prints:'claw',
    clues:['Mély morgás valahol a fák között.','Friss, karmos nyomok a sárban. Valami nehéz járt erre.','Recsegnek az ágak. Valami nagy közeledik.'],
    reveal:'Szörny. Rosszul lát, de mindent hall. Maradj csendben.',tip:'A szörny hallásra vadászik. Guggolva, lassan szinte észrevétlen vagy.'},
  ninja:{name:'Nindzsa',patrol:3.0,chase:6.0,range:30,fov:0.75,hear:1.0,motion:false,prints:null,
    clues:['Túl nagy a csend. Még a madarak is elhallgattak.','Egy levágott ág, tiszta vágással.','Mintha egy árnyék mozdult volna a fák között.'],
    reveal:'Egy másik nindzsa. Messzire lát. Bújj el a bokrokban.',tip:'A nindzsa szeme a veszélyes. Bokorban guggolva nem lát meg, és futva le tudod hagyni.'},
  ghost:{name:'Szellem',patrol:2.6,chase:6.9,range:26,fov:Math.PI,hear:0,motion:true,prints:'frost',
    clues:['Hirtelen lehűl a levegő.','Sűrűsödik a köd, pedig nincs szél. Dér csillog a fűben.','Halk, éneklő hang, mintha a fákból jönne.'],
    reveal:'Szellem. Csak a mozgást látja. Ha jön, dermedj meg.',tip:'A szellem gyorsabb nálad, de ha mozdulatlan maradsz, elveszít.'}
};

/* ---------- Játékállapot ---------- */
const P={x:0,z:84,yaw:0,pitch:0,crouch:false,run:false,stam:100,camY:1.65,bob:0,noise:0,moving:false,hidden:false,running:false,lookDX:0};
const E={type:'ninja',cfg:TYPES.ninja,mesh:null,x:0,z:-84,ry:0,state:'patrol',tx:0,tz:0,ttimer:0,lost:0,look:0,blind:0,known:false,seenCount:0,spd:0,printD:0,side:1};
const S={running:false,mode:'goal',time:180,gx:0,gz:0,smoke:2,smokeT:0,sx:0,sz:0,clueT:6,clueI:0,beat:0,msgT:0,threat:0};

function newRound(mode){
  S.mode=mode;S.time=180;S.smoke=2;S.smokeT=0;S.clueT=8;S.clueI=0;S.beat=0;S.threat=0;
  P.x=0;P.z=84;P.yaw=0;P.pitch=0;P.crouch=false;P.run=false;P.stam=100;
  const keys=Object.keys(TYPES);E.type=keys[Math.floor(Math.random()*keys.length)];E.cfg=TYPES[E.type];
  if(E.mesh){scene.remove(E.mesh);if(E.mesh.userData.dispose)E.mesh.userData.dispose();}
  E.mesh=A.buildEnemy(E.type);E.mesh.traverse(o=>{if(o.isMesh)o.castShadow=o.material&&!o.material.transparent;});scene.add(E.mesh);
  E.x=(Math.random()*2-1)*25;E.z=-84;E.ry=Math.PI;E.state='patrol';E.lost=0;E.look=0;E.blind=0;E.known=false;E.seenCount=0;E.printD=0;
  A.clearPrints();pickPatrol();
  if(mode==='goal'){
    const g={x:(Math.random()*2-1)*65,z:-55+Math.random()*80};pushOut(g,2);S.gx=g.x;S.gz=g.z;
    A.beacon.position.set(S.gx,H(S.gx,S.gz),S.gz);A.beacon.visible=true;$('goalBox').hidden=false;
  }else{A.beacon.visible=false;$('goalBox').hidden=true;}
  $('foe').textContent='Ellenfél: ismeretlen';
  updateButtons();showMsg(mode==='goal'?'Juss el a kék fényhez, mielőtt lejár az idő.':'Élj túl három percet.');
  S.running=true;
}
function pickPatrol(){
  if(Math.random()<0.55){E.tx=P.x+(Math.random()*2-1)*30;E.tz=P.z+(Math.random()*2-1)*30;}
  else{E.tx=(Math.random()*2-1)*85;E.tz=(Math.random()*2-1)*85;}
  E.tx=clamp(E.tx,-92,92);E.tz=clamp(E.tz,-92,92);E.ttimer=16;
}

/* ---------- Üzenetek, hang ---------- */
function showMsg(t){const m=$('msg');m.textContent=t;m.style.opacity=1;S.msgT=4.2;}
let ac=null;
function thump(vol){if(!ac)return;try{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(72,t);o.frequency.exponentialRampToValueAtTime(42,t+0.16);
g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+0.25);}catch(e){}}

/* ---------- Irányítás ---------- */
const joy={id:null,ox:0,oy:0,x:0,y:0},look={id:null,lx:0,ly:0},keys={};
const touch=$('touch'),joyEl=$('joy'),knob=$('knob');
touch.addEventListener('pointerdown',e=>{
  if(!S.running)return;
  const left=e.clientX<window.innerWidth*0.45&&e.pointerType!=='mouse';
  if(left&&joy.id===null){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.hidden=false;knob.style.transform='translate(0,0)';$('joyHint').hidden=true;}
  else if(look.id===null){look.id=e.pointerId;look.lx=e.clientX;look.ly=e.clientY;}
  try{touch.setPointerCapture(e.pointerId);}catch(_){}
});
touch.addEventListener('pointermove',e=>{
  if(e.pointerId===joy.id){let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),m=50;if(d>m){dx=dx/d*m;dy=dy/d*m;}joy.x=dx/m;joy.y=dy/m;knob.style.transform='translate('+dx+'px,'+dy+'px)';}
  else if(e.pointerId===look.id){const dx=e.clientX-look.lx,dy=e.clientY-look.ly;look.lx=e.clientX;look.ly=e.clientY;P.yaw-=dx*0.0058;P.pitch=clamp(P.pitch-dy*0.0045,-1.15,1.15);P.lookDX+=dx*0.01;}
});
function endPtr(e){if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;joyEl.hidden=true;}if(e.pointerId===look.id)look.id=null;}
touch.addEventListener('pointerup',endPtr);touch.addEventListener('pointercancel',endPtr);
window.addEventListener('keydown',e=>{keys[e.code]=true;if(!S.running)return;if(e.code==='KeyC')toggleCrouch();if(e.code==='KeyF')useSmoke();});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
function tap(el,fn){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(S.running)fn();});el.addEventListener('click',e=>{if(e.detail===0&&S.running)fn();});}
function toggleCrouch(){P.crouch=!P.crouch;if(P.crouch)P.run=false;updateButtons();}
function toggleRun(){P.run=!P.run;if(P.run)P.crouch=false;updateButtons();}
function useSmoke(){
  if(S.smoke<=0)return;S.smoke--;S.smokeT=6;S.sx=P.x;S.sz=P.z;A.puffSmoke(P.x,H(P.x,P.z),P.z);
  if(Math.hypot(E.x-P.x,E.z-P.z)<14){E.blind=3.5;E.state='investigate';const a=Math.random()*Math.PI*2;E.tx=clamp(P.x+Math.cos(a)*25,-92,92);E.tz=clamp(P.z+Math.sin(a)*25,-92,92);}
  showMsg('Füst!');updateButtons();
}
tap($('bCrouch'),toggleCrouch);tap($('bRun'),toggleRun);tap($('bSmoke'),useSmoke);
function updateButtons(){$('bCrouch').classList.toggle('on',P.crouch);$('bRun').classList.toggle('on',P.run);$('smokeN').textContent='×'+S.smoke;$('bSmoke').disabled=S.smoke<=0;$('bSmoke').style.opacity=S.smoke>0?1:0.4;}

function startGame(mode){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();}catch(e){ac=null;}
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{});}catch(e){}
  $('start').hidden=true;$('end').hidden=true;$('joyHint').hidden=false;A.hands.visible=true;newRound(mode);Q.frames=0;Q.acc=0;
}
$('modeGoal').addEventListener('click',()=>startGame('goal'));
$('modeSurv').addEventListener('click',()=>startGame('surv'));
$('again').addEventListener('click',()=>{$('end').hidden=true;$('start').hidden=false;});

function endGame(win,title,text){
  S.running=false;joy.id=null;look.id=null;joyEl.hidden=true;A.hands.visible=false;
  $('endEyebrow').textContent=win?'Sikerült':'Vége';$('endTitle').textContent=title;$('endText').textContent=text;
  $('endFoe').textContent='Az ellenfél: '+E.cfg.name;$('endTip').textContent=E.cfg.tip+(E.seenCount?' Ebben a körben '+E.seenCount+' alkalommal vett észre.':' Egyszer sem vett észre.');
  $('end').hidden=false;
}

/* ---------- Képernyő-effektek ---------- */
const fxDanger=$('fxDanger'),fxLeaf=$('fxLeaf'),fxGrain=$('fxGrain');
(function grain(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),d=g.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);fxGrain.style.backgroundImage='url('+c.toDataURL()+')';})();
const Q={frames:0,acc:0,level:2};
function lowerQuality(){Q.level--;if(Q.level===1){A.setPR(1);A.grass.geometry.setDrawRange(0,A.grass.geometry.attributes.position.count*0.6|0);}
  else if(Q.level===0){moonLight.castShadow=false;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});A.grass.geometry.setDrawRange(0,A.grass.geometry.attributes.position.count*0.4|0);A.setPR(0.85);}}

/* ---------- Ciklus ---------- */
let last=performance.now(),hudT=0,T=0;
const shadowSnap=60/1024;
function frame(now){
  const raw=(now-last)/1000,dt=Math.min(0.05,raw);last=now;T+=dt;
  if(S.running){update(dt);Q.frames++;Q.acc+=raw;if(Q.frames===150){if(Q.acc/150>0.04&&Q.level>0){lowerQuality();Q.frames=0;Q.acc=0;}}}
  else{P.yaw+=dt*0.04;}
  const gy=H(P.x,P.z);
  camera.position.set(P.x,gy+P.camY+Math.sin(P.bob)*0.04,P.z);camera.rotation.set(P.pitch,P.yaw,Math.sin(P.bob*0.5)*0.006*(P.moving?1:0));
  /* árnyék a játékos körül */
  const sx=Math.round(P.x/shadowSnap)*shadowSnap,sz=Math.round(P.z/shadowSnap)*shadowSnap;
  moonLight.target.position.set(sx,gy,sz);moonLight.position.set(sx+MOON_DIR.x*70,gy+MOON_DIR.y*70,sz+MOON_DIR.z*70);
  /* égbolt a kamerához */
  A.sky.position.copy(camera.position);A.stars.position.copy(camera.position);A.stars.material.uniforms.uT.value=T;
  A.moonSpr.position.copy(camera.position).addScaledVector(MOON_DIR,500);A.moonHalo.position.copy(A.moonSpr.position);
  [A.ring1,A.ring2,A.ring3].forEach(r=>{r.position.x=P.x*0.25;r.position.z=P.z*0.25;});
  /* fű, köd, csóvák */
  const U=A.grass.userData.U;U.uCam.value.set(P.x,P.z);U.uT.value=T;U.uPush.value.set(P.x,P.z,1);
  A.fogSheets.forEach((f,i)=>{f.position.x=Math.round(P.x);f.position.z=Math.round(P.z);const tx=f.material.map;tx.offset.set((f.position.x/150)*2.5+T*0.004*f.userData.sp,(-f.position.z/150)*2.5+T*0.003*f.userData.sp);f.position.y=f.userData.y;});
  A.shafts.mat.uniforms.uT.value=T;
  /* szentjánosbogarak */
  A.flies.forEach(s=>{const u=s.userData;let x=u.ox+Math.sin(T*u.sp+u.ph)*1.5,z=u.oz+Math.cos(T*u.sp*0.8+u.ph)*1.5;x=P.x+((x-P.x+20)%40+40)%40-20;z=P.z+((z-P.z+20)%40+40)%40-20;
    s.position.set(x,H(x,z)+u.y+Math.sin(T*1.3+u.ph)*0.3,z);s.material.opacity=Math.max(0,Math.sin(T*2+u.ph*3))*0.85;});
  /* hulló levelek */
  {const m=A.falling,Lv=m.userData.L,d=new THREE.Object3D();Lv.forEach((l,i)=>{l.y-=l.sp*dt;if(l.y<0){l.y=8+Math.random()*2;l.x=(Math.random()*2-1)*12;l.z=(Math.random()*2-1)*12;}
    const wx=P.x+l.x+Math.sin(T*0.8+l.ph)*0.8,wz=P.z+l.z+Math.cos(T*0.6+l.ph)*0.8;d.position.set(wx,H(wx,wz)+l.y,wz);d.rotation.set(T*1.5+l.ph,T+l.ph,T*0.7);d.updateMatrix();m.setMatrixAt(i,d.matrix);});m.instanceMatrix.needsUpdate=true;}
  A.stepSmoke(dt);A.stepPrints(dt);A.stepBeacon(T,dt);
  /* ellenfél */
  if(E.mesh){const ey=H(E.x,E.z);E.mesh.position.set(E.x,ey+(E.type==='ghost'?0.35+Math.sin(T*2)*0.15:0),E.z);E.mesh.rotation.y=E.ry;
    E.mesh.userData.anim(T,E.spd,dt,E.state);}
  /* kezek */
  P.lookDX*=Math.exp(-dt*6);A.stepHands(T,dt,P.bob,P.moving&&S.running,P.running,P.crouch,P.lookDX);
  /* képernyő-effektek */
  fxGrain.style.backgroundPosition=(Math.random()*128|0)+'px '+(Math.random()*128|0)+'px';
  fxDanger.style.opacity=S.threat.toFixed(3);fxLeaf.style.opacity=(S.running&&P.hidden&&P.crouch?1:0);
  renderer.render(scene,camera);requestAnimationFrame(frame);
}

function update(dt){
  /* Játékos mozgás */
  let jx=joy.x,jy=joy.y;
  if(joy.id===null){jx=(keys.KeyD?1:0)-(keys.KeyA?1:0);jy=(keys.KeyS?1:0)-(keys.KeyW?1:0);const l=Math.hypot(jx,jy);if(l>1){jx/=l;jy/=l;}}
  const mag=Math.min(1,Math.hypot(jx,jy));
  const running=(P.run||keys.ShiftLeft)&&P.stam>1&&mag>0.2;P.running=running;
  const speed=P.crouch?2.2:running?6.6:4.2;
  const f=-jy,s=jx,sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
  P.x+=(-sy*f+cy*s)*speed*dt;P.z+=(-cy*f-sy*s)*speed*dt;pushOut(P,0.45);
  P.moving=mag>0.12;
  P.stam=clamp(P.stam+(running?-20:11)*dt,0,100);
  if(P.stam<=1&&P.run){P.run=false;updateButtons();}
  P.noise=P.moving?(P.crouch?4:running?27:12)*mag:0;
  if(P.moving)P.bob+=dt*speed*2.2;
  P.camY+=((P.crouch?0.95:1.65)-P.camY)*Math.min(1,dt*8);

  if(S.smokeT>0)S.smokeT-=dt;
  const inSmoke=S.smokeT>0&&Math.hypot(P.x-S.sx,P.z-S.sz)<5;
  P.hidden=(P.crouch&&inBush(P.x,P.z))||inSmoke;

  /* Ellenfél érzékelés */
  const c=E.cfg,dx=P.x-E.x,dz=P.z-E.z,dist=Math.hypot(dx,dz);
  E.blind=Math.max(0,E.blind-dt);
  let sees=false;
  if(E.blind<=0&&dist<c.range*(P.crouch?0.65:1)){
    const fx=-Math.sin(E.ry),fz=-Math.cos(E.ry),ang=Math.acos(clamp((fx*dx+fz*dz)/(dist||1),-1,1));
    if(ang<c.fov&&!(P.hidden&&dist>2.5)&&!(c.motion&&!P.moving)&&!blocked(E.x,E.z,P.x,P.z))sees=true;
  }
  if(sees){if(E.state!=='chase'){E.seenCount++;}E.state='chase';E.lost=0;E.tx=P.x;E.tz=P.z;}
  else if(E.state!=='chase'&&c.hear>0&&E.blind<=0&&P.noise>0&&dist<P.noise*c.hear){E.state='investigate';E.tx=P.x+(Math.random()*2-1)*3;E.tz=P.z+(Math.random()*2-1)*3;E.look=0;}
  if(!E.known&&(sees||dist<9)){E.known=true;$('foe').textContent='Ellenfél: '+c.name;showMsg(c.reveal);}

  /* Ellenfél mozgás */
  let sp=c.patrol;
  if(E.state==='chase'){
    sp=c.chase;
    if(!sees){E.lost+=dt;if(E.lost>(c.motion&&!P.moving?0.9:3.2)){E.state='investigate';E.look=0;}}
  }else if(E.state==='investigate'){sp=c.patrol*1.35;}
  else{E.ttimer-=dt;if(E.ttimer<=0||Math.hypot(E.tx-E.x,E.tz-E.z)<2)pickPatrol();}
  if(E.blind>0)sp*=0.4;
  const tdx=E.tx-E.x,tdz=E.tz-E.z,td=Math.hypot(tdx,tdz);const ox=E.x,oz=E.z;
  if(E.state==='investigate'&&td<1.6){E.look+=dt;E.ry+=dt*1.6;if(E.look>3.2){E.state='patrol';pickPatrol();}}
  else if(td>0.3){
    E.x+=tdx/td*sp*dt;E.z+=tdz/td*sp*dt;pushOut(E,0.5);
    let want=Math.atan2(-tdx,-tdz),diff=want-E.ry;diff=Math.atan2(Math.sin(diff),Math.cos(diff));E.ry+=diff*Math.min(1,dt*6);
  }
  const moved=Math.hypot(E.x-ox,E.z-oz);E.spd+=(moved/dt-E.spd)*Math.min(1,dt*8);
  if(c.prints){E.printD+=moved;if(E.printD>(c.prints==='frost'?2.6:1.3)){E.printD=0;E.side=-E.side;A.dropPrint(E.x,E.z,E.ry,c.prints,c.prints==='frost'?0:E.side);}}
  const nd=Math.hypot(P.x-E.x,P.z-E.z);
  S.threat+=((E.state==='chase'?0.55+0.45*clamp(1-nd/20,0,1):E.state==='investigate'?0.18:0)+clamp(1-nd/10,0,1)*0.25-S.threat)*Math.min(1,dt*3);
  if(nd<1.3){endGame(false,'Elkapott',E.cfg.name+' talált rád '+fmt(180-S.time)+' után.');return;}

  /* Nyomok, szívdobogás */
  if(!E.known){S.clueT-=dt;if(S.clueT<=0&&nd<48){showMsg(c.clues[S.clueI%c.clues.length]);S.clueI++;S.clueT=18;}}
  if(nd<24){S.beat-=dt;if(S.beat<=0){thump(0.25+0.5*(1-nd/24));S.beat=0.28+(nd/24)*0.8;}}

  /* Idő */
  S.time-=dt;
  if(S.time<=0){S.time=0;
    if(S.mode==='goal'){const gd=Math.hypot(P.x-S.gx,P.z-S.gz);if(gd<6)endGame(true,'Ott voltál','Pontosan a kék fénynél vártad ki az időt.');else endGame(false,'Lejárt az idő','Túlélted, de '+Math.round(gd)+' méterre voltál a céltól.');}
    else endGame(true,'Túlélted','Három percig rejtőztél az erdőben.');
    return;}

  if(S.msgT>0){S.msgT-=dt;if(S.msgT<=0)$('msg').style.opacity=0;}
  hudT-=dt;if(hudT<=0){hudT=0.1;hud(nd);}
}
function fmt(t){t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function hud(nd){
  const st=E.state==='chase'?['Riadó','var(--blood)']:E.state==='investigate'?['Gyanakszik','var(--lantern)']:['Nyugodt','var(--calm)'];
  $('kiState').textContent=st[0];$('kiState').style.color=st[1];$('kiChar').style.color=st[1];$('kiRing').style.borderColor=st[1];
  $('kiDist').textContent=nd<35?Math.round(nd)+' m':'—';
  const tm=$('timer');tm.textContent=fmt(S.time);tm.classList.toggle('late',S.time<30);
  $('stamBar').firstElementChild.style.width=P.stam+'%';
  $('noiseBar').firstElementChild.style.width=Math.min(100,P.noise/27*100)+'%';
  $('hidden').hidden=!P.hidden;
  if(S.mode==='goal'){
    const gx=S.gx-P.x,gz=S.gz-P.z,h=Math.atan2(-gx,-gz);let rel=h-P.yaw;rel=Math.atan2(Math.sin(rel),Math.cos(rel));
    $('arrow').style.transform='rotate('+(-rel*180/Math.PI)+'deg)';$('goalDist').textContent=Math.round(Math.hypot(gx,gz))+' m';
  }
}
A.hands.visible=false;A.beacon.visible=false;
window.AE_TEST={P,E,S,startGame,frame:()=>frame(performance.now())};
requestAnimationFrame(frame);
})();
