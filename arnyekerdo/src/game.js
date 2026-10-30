(function(){
/* Árnyékerdő – játékmenet. © 2026 Fejes Géza. Minden jog fenntartva.
   Küldetés: a völgy déli végéről (rajt) eljutni az északi útig (kijárat). Hat rendőr keres lámpával és pisztollyal.
   A játékos dönti el, hogy lopakodik vagy harcol. Eszközök: tantó, tekko, kötélkampó, mászókarmok, füstgránát. */
const A=window.AE,{$,clamp,H,scene,camera,renderer,grid,bgrid,near,moonLight,MOON_DIR,giants,XW,ZS,ZN,EXIT,FLU,NFL}=A;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a)),rnd=(a,b)=>a+Math.random()*(b-a);
const LV=A.LV||'erdo';
const START=LV==='falu'?{x:0,z:45}:{x:0,z:93},GOAL=LV==='falu'?{x:0,z:39}:{x:0,z:-112};
const G={LV,day:false,hooks:{},goalName:LV==='falu'?'Mester':'Kijárat'};A.G=G;

/* ---------- Térbeli segédek ---------- */
function clampField(p){p.x=clamp(p.x,-XW-1,XW+1);p.z=clamp(p.z,-ZN-16,ZS+2);if(p.z<-ZN+1&&Math.abs(p.x)>5)p.z=-ZN+1;if(p.z<-ZN-0.5)p.x=clamp(p.x,-3.4,3.4);}
function pushOut(p,rad){
  near(grid,p.x,p.z,t=>{if(t.off)return;const dx=p.x-t.x,dz=p.z-t.z,d=Math.hypot(dx,dz),m=(t.col||t.r)+rad;if(d<m&&d>1e-4){p.x=t.x+dx/d*m;p.z=t.z+dz/d*m;}});
  clampField(p);
}
function blocked(ax,az,bx,bz,skip){
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),steps=Math.ceil(len/1.5);
  for(let i=1;i<steps;i++){const x=ax+dx*i/steps,z=az+dz*i/steps;let hit=false;
    near(grid,x,z,t=>{if(!hit&&t!==skip&&!t.low&&!t.off&&Math.hypot(x-t.x,z-t.z)<t.r+0.55)hit=true;});if(hit)return true;}
  return false;
}
function smokeBlocks(ax,az,bx,bz){if(S.smokeT<=0)return false;const R=4.2;const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;let t=((S.sx-ax)*dx+(S.sz-az)*dz)/L2;t=clamp(t,0,1);
  return Math.hypot(ax+dx*t-S.sx,az+dz*t-S.sz)<R;}
function inBush(x,z){let h=false;near(bgrid,x,z,b=>{if(!h&&Math.hypot(x-b.x,z-b.z)<b.r)h=true;});return h;}
function bushAt(x,z){let h=null;near(bgrid,x,z,b=>{if(!h&&Math.hypot(x-b.x,z-b.z)<b.r*0.9)h=b;});return h;}
const aimMark=new THREE.Sprite(new THREE.SpriteMaterial({map:A.glowTex,color:0xbfeaf2,transparent:true,opacity:0.3,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,fog:false}));aimMark.scale.setScalar(2.2);aimMark.visible=false;scene.add(aimMark);
const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);

/* ---------- Állapot ---------- */
const ITEMS=[{id:'tanto',name:'Tantó'},{id:'tekko',name:'Tekko'},{id:'kampo',name:'Kampó'},{id:'karom',name:'Karmok'},{id:'kavics',name:'Kavics'},{id:'tuske',name:'Tüskék'},{id:'fukiya',name:'Köpőcső'}];
const P={x:START.x,z:START.z,yaw:0,pitch:0,crouch:false,run:false,stam:100,camY:1.65,bob:0,noise:0,moving:false,hidden:false,running:false,lookDX:0,
  hp:100,mode:'ground',item:0,drag:null,stepPh:0,atk:0,atkCd:0,tree:null,py:0,anim:null,lit:false,hurt:0,noiseBoost:0,dirX:0,dirZ:0};
const S={running:false,time:0,smoke:2,smokeT:0,sx:0,sz:0,msgT:0,subT:0,threat:0,alarm:0,alarms:0,kills:0,kos:0,lastKnown:{x:0,z:0},beat:0,aim:null,aimGlow:-1,shots:0,stones:6,spikes:2,darts:3};

/* ---------- Rendőrök ---------- */
const DIFF={konnyu:{name:'Könnyű',n:4,see:0.8,hear:0.8,aw:0.75,dmg:0.7,smoke:3,stones:8,spikes:3,darts:4},normal:{name:'Normál',n:6,see:1,hear:1,aw:1,dmg:1,smoke:2,stones:6,spikes:2,darts:3},nehez:{name:'Nehéz',n:8,see:1.2,hear:1.25,aw:1.3,dmg:1.25,smoke:2,stones:5,spikes:2,darts:2}};
let D=DIFF.normal;try{const k=localStorage.getItem('ae-diff');if(DIFF[k])D=DIFF[k];}catch(e){}
/* riasztásjelző a rendőr feje fölött: kérdőjel, ami a gyanúval telik, riadóban vörös felkiáltójel */
function makeMark(){const cv=document.createElement('canvas');cv.width=64;cv.height=96;const tx=new THREE.CanvasTexture(cv);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false,fog:false}));sp.scale.set(0.42,0.63,1);sp.renderOrder=12;sp.visible=false;scene.add(sp);sp.userData={cv,tx,key:''};return sp;}
function drawMark(sp,kind,k){const u=sp.userData,key=kind+(kind==='?'?Math.round(k*12):'');if(u.key===key)return;u.key=key;const g=u.cv.getContext('2d');g.clearRect(0,0,64,96);
  g.font='700 86px "EB Garamond",Georgia,serif';g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=7;g.strokeStyle='rgba(5,8,10,0.85)';g.strokeText(kind,32,86);
  if(kind==='!'){g.fillStyle='#e0503f';g.fillText('!',32,86);}
  else{g.fillStyle='rgba(236,229,211,0.38)';g.fillText('?',32,86);g.save();const top=86-74*clamp(k,0,1);g.beginPath();g.rect(0,top,64,96-top);g.clip();g.fillStyle='#e0a43a';g.fillText('?',32,86);g.restore();}
  u.tx.needsUpdate=true;}
const MAXCOPS=LV==='falu'?A.FALU.students.length:8,ALLCOPS=[],COPS=[];
/* minden körben új útvonalak: a völgy sávokra oszlik délről északra, mindegyikben egy rendőr jár körbe */
function genRoute(i,n){const z0=64,z1=-96,band=(z0-z1)/n,zc=z0-(i+0.5)*band,xc=rnd(-30,30),pts=[],a0=Math.random()*6.28;
  for(let k=0;k<4;k++){const a=a0+k/4*Math.PI*2+rnd(-0.35,0.35),o={x:clamp(xc+Math.cos(a)*rnd(9,17),-46,46),z:clamp(zc+Math.sin(a)*Math.min(band*0.55,rnd(7,13)),-98,70)};pushOut(o,1.2);pts.push(o);}return pts;}
for(let i=0;i<MAXCOPS;i++){const mesh=A.buildPolice(i+3,LV==='falu'?{student:true}:null);scene.add(mesh);
  ALLCOPS.push({id:i,mesh,beam:A.makeBeam(),pool:A.makePool(),mark:makeMark(),route:[],ri:0,x:0,z:0,ry:0,st:'patrol',tx:0,tz:0,wait:0,aw:0,bp:-0.2,sweep:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,
    shootCd:0,aimT:0,shoot:0,lostT:0,searchT:0,spd:0,sees:false,saidT:0,found:false,lookUpT:0,blind:0,lens:new THREE.Vector3(),dir:new THREE.Vector3(0,0,-1),seenBody:new Set(),stuck:0,hiddenBody:false,stepT:0,radioT:null});}
function setupCops(){COPS.length=0;if(LV==='falu'){ALLCOPS.forEach(c=>COPS.push(c));if(G.hooks.setup)G.hooks.setup();return;}ALLCOPS.forEach((c,i)=>{const on=i<D.n;c.mesh.visible=on;c.beam.visible=on;c.pool.visible=on;c.mark.visible=false;if(on)COPS.push(c);});
  COPS.forEach((c,i)=>{c.route=genRoute(i,COPS.length);resetCop(c);});}
function resetCop(c){const k=Math.floor(Math.random()*c.route.length);c.ri=k;c.x=c.route[k].x+rnd(-2,2);c.z=c.route[k].z+rnd(-2,2);pushOut(c,0.5);
  c.ry=Math.random()*6.28;c.st='patrol';c.aw=0;c.hp=3;c.down=c.dead=false;c.koT=0;c.fall=0;c.stagger=0;c.shootCd=0;c.aimT=0;c.shoot=0;c.lostT=0;c.searchT=0;c.found=false;
  c.wait=rnd(0,3);c.blind=0;c.sleepT=0;c.spikeT=0;c.saidT=-99;c.hiddenBody=false;c.radioT=null;c.lookUpT=-rnd(0,12);c.seenBody.clear();nextWaypoint(c,false);c.mesh.visible=true;c.beam.visible=true;}
function nextWaypoint(c,adv){if(adv)c.ri=(c.ri+1)%c.route.length;c.tx=c.route[c.ri].x;c.tz=c.route[c.ri].z;}
const copEyeY=c=>H(c.x,c.z)+1.6;
setupCops();

/* ---------- Üzenetek, feliratok, hang ---------- */
function showMsg(t){const m=$('msg');m.textContent=t;m.style.opacity=1;S.msgT=3.6;}
const LINES={
  spot:[['いたぞ！止まれ！','Ita zo! Tomare!','Ott van! Állj!'],['動くな！警察だ！','Ugoku na! Keisatsu da!','Ne mozdulj! Rendőrség!'],['そこだ！','Soko da!','Ott van!']],
  sus:[['何だ？','Nanda?','Mi volt ez?'],['誰かいるのか？','Dareka iru no ka?','Van ott valaki?'],['ん？','N?','Hm?']],
  lost:[['どこだ！？','Doko da!?','Hová tűnt?'],['探せ！','Sagase!','Keressétek!']],
  body:[['おい！大丈夫か！？','Oi! Daijōbu ka!?','Hé! Jól vagy?!'],['やられた！応援を！','Yarareta! Ōen o!','Leütötték! Erősítést!']],
  wake:[['くそ…どこだ！','Kuso… doko da!','A fenébe… hol van?!']],
  smoke:[['煙だ！見えない！','Kemuri da! Mienai!','Füst! Nem látok!']],
  ouch:[['痛っ！','Itta!','Áú!'],['足が…！','Ashi ga…!','A lábam…!'],['まきびしだ！','Makibishi da!','Tüskék!']],
  sleep:[['う…眠い…','U… nemui…','Olyan… álmos vagyok…'],['何か刺さった…','Nanika sasatta…','Valami megszúrt…']]
};
let ac=null,noiseBuf=null;
function say(c,kind){const now=S.time;if(now-c.saidT<2.5)return;c.saidT=now;const L=LINES[kind],l=L[Math.floor(Math.random()*L.length)];
  const d=Math.hypot(c.x-P.x,c.z-P.z);if(d>45)return;
  const sub=$('sub');sub.innerHTML='<b>„'+l[1]+'”</b> '+l[2];sub.style.opacity=1;S.subT=2.6;
  try{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(l[0]);u.lang='ja-JP';u.rate=1.15;u.pitch=0.8+c.id*0.06;u.volume=clamp(1.1-d/40,0.15,1);
    const v=speechSynthesis.getVoices().find(v=>/^ja/i.test(v.lang));if(v){u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u);}}}catch(e){}}
function audioInit(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();if(!noiseBuf){noiseBuf=ac.createBuffer(1,ac.sampleRate*0.6,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}}catch(e){ac=null;}}
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function noiseHit(vol,freq,type,dec,q){if(!ac)return;try{const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;f.type=type||'lowpass';f.frequency.value=freq;f.Q.value=q||0.7;
  env(g,t,0.004,vol,dec);s.connect(f);f.connect(g);g.connect(ac.destination);s.start(t);s.stop(t+dec+0.05);}catch(e){}}
function tone(vol,f0,f1,dur,type){if(!ac)return;try{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  env(g,t,0.01,vol,dur);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur+0.05);}catch(e){}}
function thump(vol){tone(vol,72,42,0.22);}
function gunshot(d){const v=clamp(1-d/90,0.05,1);noiseHit(0.9*v,2400,'lowpass',0.28);tone(0.5*v,160,50,0.18,'triangle');}
function whistle(d){if(!ac)return;const v=clamp(1-d/80,0.05,0.5);try{const t=ac.currentTime,o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain();o.type='square';o.frequency.value=2900;
  lfo.frequency.value=28;lg.gain.value=180;lfo.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v*0.12,t+0.03);g.gain.setValueAtTime(v*0.12,t+0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+0.85);
  o.connect(g);g.connect(ac.destination);o.start(t);lfo.start(t);o.stop(t+0.9);lfo.stop(t+0.9);}catch(e){}}

/* ---------- Irányítás ---------- */
const joy={id:null,ox:0,oy:0,x:0,y:0},look={id:null,lx:0,ly:0,sx:0,sy:0,t0:0,mouse:false},keys={};
const touch=$('touch'),joyEl=$('joy'),knob=$('knob');
touch.addEventListener('pointerdown',e=>{
  if(!S.running)return;
  const left=e.clientX<window.innerWidth*0.45&&e.pointerType!=='mouse';
  if(left&&joy.id===null){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.hidden=false;knob.style.transform='translate(0,0)';$('joyHint').hidden=true;}
  else if(look.id===null){look.id=e.pointerId;look.lx=look.sx=e.clientX;look.ly=look.sy=e.clientY;look.t0=performance.now();look.mouse=e.pointerType==='mouse';}
  try{touch.setPointerCapture(e.pointerId);}catch(_){}
});
touch.addEventListener('pointermove',e=>{
  if(e.pointerId===joy.id){let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),m=50;if(d>m){dx=dx/d*m;dy=dy/d*m;}joy.x=dx/m;joy.y=dy/m;knob.style.transform='translate('+dx+'px,'+dy+'px)';}
  else if(e.pointerId===look.id){const dx=e.clientX-look.lx,dy=e.clientY-look.ly;look.lx=e.clientX;look.ly=e.clientY;P.yaw-=dx*0.0058;P.pitch=clamp(P.pitch-dy*0.0045,-1.25,1.3);P.lookDX+=dx*0.01;}
});
function endPtr(e){if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;joyEl.hidden=true;}
  if(e.pointerId===look.id){/* egérrel egy rövid kattintás húzás nélkül = használat */
    if(look.mouse&&e.type==='pointerup'&&Math.hypot(e.clientX-look.sx,e.clientY-look.sy)<6&&performance.now()-look.t0<350&&S.running)useItem();look.id=null;}}
touch.addEventListener('pointerup',endPtr);touch.addEventListener('pointercancel',endPtr);
touch.addEventListener('wheel',e=>{if(S.running)selectItem((P.item+(e.deltaY>0?1:ITEMS.length-1))%ITEMS.length);},{passive:true});
window.addEventListener('keydown',e=>{keys[e.code]=true;if(!S.running||e.repeat)return;
  if(e.code==='KeyC')crouchOrDrop();if(e.code==='KeyF')useSmoke();if(e.code==='KeyE')useItem();if(e.code==='Space'){e.preventDefault();if(P.mode==='perch')dropDown();else useItem();}
  if(e.code==='KeyG')toggleDrag();if(e.code==='KeyQ')selectItem((P.item+1)%ITEMS.length);const n=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7'].indexOf(e.code);if(n>=0)selectItem(n);});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
function tap(el,fn){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(S.running)fn();});el.addEventListener('click',e=>{if(e.detail===0&&S.running)fn();});}
function crouchOrDrop(){if(P.mode==='perch'){dropDown();return;}if(P.mode!=='ground')return;P.crouch=!P.crouch;if(P.crouch)P.run=false;updateButtons();}
function toggleRun(){if(P.mode!=='ground'||P.drag)return;P.run=!P.run;if(P.run)P.crouch=false;updateButtons();}
function selectItem(i){P.item=i;A.setHandItem(ITEMS[i].id);updateButtons();}
tap($('bCrouch'),crouchOrDrop);tap($('bRun'),toggleRun);tap($('bSmoke'),useSmoke);tap($('bUse'),useItem);tap($('bDrag'),toggleDrag);
document.querySelectorAll('#tools .tool').forEach(b=>tap(b,()=>selectItem(+b.dataset.i)));
function updateButtons(){
  $('bCrouch').classList.toggle('on',P.crouch&&P.mode==='ground');$('bCrouch').firstChild.textContent=P.mode==='perch'?'Le':'Guggol';
  $('bRun').classList.toggle('on',P.run);$('smokeN').textContent='×'+S.smoke;$('stoneN').textContent='×'+S.stones;$('spikeN').textContent='×'+S.spikes;$('dartN').textContent='×'+S.darts;$('bSmoke').disabled=S.smoke<=0;$('bSmoke').style.opacity=S.smoke>0?1:0.4;
  document.querySelectorAll('#tools .tool').forEach(b=>b.classList.toggle('on',+b.dataset.i===P.item));
}
const fwd=()=>({x:-Math.sin(P.yaw),z:-Math.cos(P.yaw)});
function eyePos(out){return out.set(P.x,P.mode==='ground'?H(P.x,P.z)+P.camY:P.py,P.z);}

/* ---------- Fegyverek ---------- */
function meleeTarget(){const f=fwd();let best=null,bd=9;
  COPS.forEach(c=>{if(c.dead)return;const dx=c.x-P.x,dz=c.z-P.z,d=Math.hypot(dx,dz);if(d>2.2)return;const ang=Math.acos(clamp((dx*f.x+dz*f.z)/(d||1),-1,1));if(ang<0.85&&d<bd){bd=d;best=c;}});return best;}
function takeDown(c,lethal,how){c.down=true;c.dead=lethal;c.koT=lethal?0:75;c.st='down';c.aw=0;c.shoot=0;c.found=false;c.seenBody.clear();
  if(lethal)S.kills++;else S.kos++;showMsg(how);noiseHit(0.35,700,'bandpass',0.25,1.2);thump(0.5);}
function strike(c,weapon,fromAbove){
  const lethal=weapon==='tanto'&&LV!=='falu';
  if(c.down){if(lethal&&!c.dead){c.dead=true;c.koT=0;S.kos--;S.kills++;showMsg('Végeztél vele.');}else if(!lethal){c.koT=75;showMsg('Újra leütötted.');}return;}
  if(c.st!=='alert'||fromAbove&&c.st!=='alert'){takeDown(c,lethal,fromAbove?(lethal?'Halál felülről.':'Leütötted felülről.'):(lethal?'Csendes ölés.':'Leütötted. Egy idő múlva magához tér.'));P.noiseBoost=lethal?3:5;return;}
  c.hp-=(lethal?1.5:1)*(fromAbove?2:1);c.stagger=0.75;c.shootCd=Math.max(c.shootCd,0.9);c.aimT=0;noiseHit(0.4,900,'bandpass',0.18,1);P.noiseBoost=14;
  if(c.hp<=0)takeDown(c,lethal,lethal?'Leszúrtad.':'Kiütötted.');
}
function useItem(){
  if(!S.running)return;if(P.drag){toggleDrag();return;}const it=ITEMS[P.item].id;
  if(it==='tanto'||it==='tekko'){
    if(P.mode==='perch'){dropDown();return;}
    if(P.mode!=='ground'||P.atkCd>0)return;P.atk=0.001;P.atkCd=0.5;noiseHit(0.12,3000,'highpass',0.12);
    const c=meleeTarget();if(c)P.pend={c,it,t:0.12};else if(G.hooks.melee)G.hooks.melee(it);
  }else if(it==='kampo'){
    if(P.mode!=='ground'&&P.mode!=='perch')return;
    if(!S.aim){showMsg('Nincs hová akasztani. Célozz egy sűrű lombú óriásfára.');return;}
    if(!S.aim.ok){showMsg('Túl messze van.');return;}
    startHook(S.aim.g);
  }else if(it==='kavics'){
    if(P.mode==='ground'||P.mode==='perch')throwStone();
  }else if(it==='tuske'){
    if(P.mode==='ground')useSpikes();
  }else if(it==='fukiya'){
    if(P.mode==='ground'||P.mode==='perch')blowDart();
  }else if(it==='karom'){
    if(P.mode==='perch'){dropDown();return;}if(P.mode!=='ground')return;
    const g=climbTarget();if(g)startClimb(g);
    else{let other=false;const f=fwd();near(grid,P.x,P.z,t=>{if(!t.low&&t.kind&&!['giant','rock','prop'].includes(t.kind)&&Math.hypot(t.x-P.x,t.z-P.z)<t.r+1.4)other=true;});
      showMsg(other?'Ez a fa túl ritkás, nem rejtene el. Keress sűrű lombú óriásfát.':'Állj egy óriásfa törzséhez, és fordulj felé.');}
  }
}
/* ---------- Test elhúzása, kavics ---------- */
function bodyNear(){let best=null,bd=1.9;COPS.forEach(c=>{if(!c.down)return;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c;}});return best;}
function toggleDrag(){if(!S.running||P.mode!=='ground')return;
  if(P.drag){const c=P.drag;P.drag=null;c.hiddenBody=inBush(c.x,c.z);showMsg(c.hiddenBody?'Elrejtetted a bokorban. Itt nem találják meg.':'Elengedted. Ha egy társa meglátja, riaszt.');noiseHit(0.08,500,'lowpass',0.25);updateButtons();return;}
  const c=bodyNear();if(!c){showMsg((LV==='falu'?'Nincs a közelben földön fekvő tanítvány.':'Nincs a közelben leütött rendőr.'));return;}
  P.drag=c;c.hiddenBody=false;P.run=false;P.pitch=Math.min(P.pitch,-0.25);showMsg('Húzod. Vidd be egy bokorba, és engedd el.');noiseHit(0.08,600,'lowpass',0.3);updateButtons();}
const STONE={on:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,t:0,m:new THREE.Mesh(A.jitterStone(),new THREE.MeshLambertMaterial({color:0x8a8c88,flatShading:true}))};
STONE.m.scale.setScalar(0.06);STONE.m.visible=false;scene.add(STONE.m);
function throwStone(){if(STONE.on)return;if(S.stones<=0){showMsg('Elfogyott a kavics.');return;}S.stones--;
  const e=eyePos(V1),d=V2.set(0,0,-1).applyEuler(camera.rotation);
  TS.thrown=true;Object.assign(STONE,{on:true,x:e.x+d.x*0.5,y:e.y-0.15+d.y*0.5,z:e.z+d.z*0.5,vx:d.x*15,vy:d.y*15+3.2,vz:d.z*15,t:0});STONE.m.visible=true;P.atk=0.001;noiseHit(0.05,2000,'bandpass',0.08);updateButtons();}
function stepStone(dt){if(!STONE.on)return;STONE.t+=dt;STONE.vy-=9.8*dt;STONE.x+=STONE.vx*dt;STONE.y+=STONE.vy*dt;STONE.z+=STONE.vz*dt;
  STONE.m.position.set(STONE.x,STONE.y,STONE.z);STONE.m.rotation.x+=dt*9;STONE.m.rotation.y+=dt*7;
  const gy=H(STONE.x,STONE.z);let hit=STONE.y<=gy+0.05;
  if(!hit&&STONE.y<gy+4)near(grid,STONE.x,STONE.z,t=>{if(!hit&&Math.hypot(STONE.x-t.x,STONE.z-t.z)<t.r+0.05)hit=true;});
  if(hit||STONE.t>4){STONE.on=false;STONE.m.visible=false;clearSpikes();DART.on=false;DART.m.visible=false;stoneLand(STONE.x,STONE.z);}}
function stoneLand(x,z){const d=Math.hypot(x-P.x,z-P.z),v=clamp(1-d/45,0.12,1);noiseHit(0.3*v,3200,'bandpass',0.09,3);tone(0.05*v,1800,900,0.05,'square');
  COPS.forEach(c=>{if(c.down||c.st==='alert')return;if(Math.hypot(c.x-x,c.z-z)>16*D.hear)return;
    if(c.st==='patrol'||c.st==='suspect'){c.st='suspect';c.searchT=7;}c.aw=Math.max(c.aw,0.45);c.tx=x+rnd(-1.5,1.5);c.tz=z+rnd(-1.5,1.5);say(c,'sus');});}

/* ---------- Köpőcső: altatónyíl ---------- */
const DART={on:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,t:0,m:new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.16,5),new THREE.MeshBasicMaterial({color:0xe8dcc0}))};
DART.m.visible=false;scene.add(DART.m);
function dartTarget(){const e=eyePos(V1),d=V2.set(0,0,-1).applyEuler(camera.rotation);let best=null,bd=1e9;
  COPS.forEach(c=>{if(c.down||c.sleepT>0)return;const cx=c.x-e.x,cz=c.z-e.z,cy=H(c.x,c.z)+1.2-e.y,t=cx*d.x+cy*d.y+cz*d.z;if(t<1||t>30)return;
    const px=e.x+d.x*t-c.x,py=e.y+d.y*t-(H(c.x,c.z)+1.2),pz=e.z+d.z*t-c.z;if(Math.hypot(px,pz)<0.5&&Math.abs(py)<0.95&&t<bd&&!blocked(e.x,e.z,c.x,c.z)){bd=t;best=c;}});return best;}
function blowDart(){if(DART.on)return;if(S.darts<=0){showMsg('Elfogyott az altatónyíl.');return;}S.darts--;
  const e=eyePos(V1),d=V2.set(0,0,-1).applyEuler(camera.rotation);Object.assign(DART,{on:true,x:e.x+d.x*0.4,y:e.y-0.05+d.y*0.4,z:e.z+d.z*0.4,vx:d.x*42,vy:d.y*42,vz:d.z*42,t:0});
  DART.m.visible=true;P.atk=0.001;P.noiseBoost=Math.max(P.noiseBoost,2);noiseHit(0.09,1600,'bandpass',0.07,2);updateButtons();}
function stepDart(dt){if(!DART.on)return;const n=3;for(let k=0;k<n&&DART.on;k++){const h=dt/n;DART.t+=h;DART.vy-=2.5*h;DART.x+=DART.vx*h;DART.y+=DART.vy*h;DART.z+=DART.vz*h;
    let hitC=null;COPS.forEach(c=>{if(hitC||c.down||c.sleepT>0)return;const gy=H(c.x,c.z);if(DART.y<gy+0.1||DART.y>gy+1.85)return;if(Math.hypot(DART.x-c.x,DART.z-c.z)<0.42)hitC=c;});
    if(hitC){DART.on=false;hitC.sleepT=1.3;hitC.aw=Math.max(hitC.aw,0.4);say(hitC,'sleep');showMsg('Talált! Mindjárt elalszik.');noiseHit(0.05,2500,'highpass',0.05);break;}
    let wall=DART.y<=H(DART.x,DART.z)+0.02||DART.t>1.2;if(!wall&&DART.y<H(DART.x,DART.z)+4)near(grid,DART.x,DART.z,t=>{if(!wall&&!t.off&&Math.hypot(DART.x-t.x,DART.z-t.z)<(t.col||t.r)*0.9)wall=true;});
    if(wall){DART.on=false;noiseHit(0.03,3000,'highpass',0.04);}}
  DART.m.visible=DART.on;if(DART.on){DART.m.position.set(DART.x,DART.y,DART.z);DART.m.quaternion.setFromUnitVectors(UPV,V3.set(DART.vx,DART.vy,DART.vz).normalize());}}

/* ---------- Tüskék (makibishi): előre dobva, vagy futás közben magad mögé szórva ---------- */
const SPK=[],spikeMat=new THREE.MeshLambertMaterial({color:0x8a9096});
function makeSpikePatch(x,z){const g=new THREE.Group(),geo=A.spikeGeo();for(let i=0;i<9;i++){const m=new THREE.Mesh(geo,spikeMat);const a=Math.random()*6.28,r=Math.random()*1.2;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    m.position.set(px,H(px,pz)+0.03,pz);m.rotation.set(Math.random()*0.3,Math.random()*6.28,Math.random()*0.3);m.scale.setScalar(0.06);g.add(m);}
  scene.add(g);SPK.push({x,z,g,t:90,hit:new Set()});}
function useSpikes(){if(S.spikes<=0){showMsg('Elfogyott a tüske.');return;}if(SPK.some(k=>k.fly))return;S.spikes--;
  if(P.running){const f=fwd(),o={x:P.x-f.x*1.4,z:P.z-f.z*1.4};makeSpikePatch(o.x,o.z);showMsg('Tüskéket szórtál magad mögé.');noiseHit(0.08,2600,'bandpass',0.1,2);}
  else{const e=eyePos(V1),d=V2.set(0,0,-1).applyEuler(camera.rotation),m=new THREE.Mesh(A.spikeGeo(),spikeMat);m.scale.setScalar(0.06);scene.add(m);
    SPK.push({fly:true,x:e.x+d.x*0.5,y:e.y-0.15,z:e.z+d.z*0.5,vx:d.x*11,vy:d.y*11+3,vz:d.z*11,t:0,m,hit:new Set()});P.atk=0.001;}
  updateButtons();}
function stepSpikes(dt){for(let i=SPK.length-1;i>=0;i--){const k=SPK[i];
    if(k.fly){k.t+=dt;k.vy-=9.8*dt;k.x+=k.vx*dt;k.y+=k.vy*dt;k.z+=k.vz*dt;k.m.position.set(k.x,k.y,k.z);k.m.rotation.x+=dt*10;k.m.rotation.z+=dt*7;
      let hit=k.y<=H(k.x,k.z)+0.05||k.t>3;if(!hit&&k.y<H(k.x,k.z)+3)near(grid,k.x,k.z,t=>{if(!hit&&!t.off&&!t.low&&Math.hypot(k.x-t.x,k.z-t.z)<t.r)hit=true;});
      if(hit){scene.remove(k.m);SPK.splice(i,1);const o={x:k.x,z:k.z};pushOut(o,0.3);makeSpikePatch(o.x,o.z);noiseHit(0.1,3400,'bandpass',0.08,3);}continue;}
    k.t-=dt;if(k.t<=0){scene.remove(k.g);SPK.splice(i,1);continue;}
    COPS.forEach(c=>{if(c.down||k.hit.has(c.id))return;if(Math.hypot(c.x-k.x,c.z-k.z)<1.5){k.hit.add(c.id);c.spikeT=4.5;c.stagger=1.2;c.spiked=true;say(c,'ouch');noiseHit(0.12,700,'bandpass',0.15,1);}});}}
function clearSpikes(){SPK.forEach(k=>{if(k.g)scene.remove(k.g);if(k.m)scene.remove(k.m);});SPK.length=0;}

/* ---------- Léptek, éjszakai hangok ---------- */
function dest(pan){try{if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);p.connect(ac.destination);return p;}}catch(e){}return ac.destination;}
function panOf(x,z){const ang=Math.atan2(x-P.x,z-P.z);return clamp(-Math.sin(wrapA(ang-(P.yaw+Math.PI))),-1,1);}
function noisePan(vol,freq,type,dec,q,pan){if(!ac)return;try{const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;f.type=type;f.frequency.value=freq;f.Q.value=q||0.7;
  env(g,t,0.004,vol,dec);s.connect(f);f.connect(g);g.connect(dest(pan));s.start(t,Math.random()*0.3);s.stop(t+dec+0.05);}catch(e){}}
function surfAt(x,z){if(z<-ZN+1&&Math.abs(x)<4)return 'road';if(bushAt(x,z))return 'bush';const n=0.5+0.5*Math.sin(x*0.08+Math.cos(z*0.06)*2)*Math.cos(z*0.07);return n>0.55?'leaves':'grass';}
function footstep(){const v=P.drag?0.5:P.crouch?0.3:P.running?1:0.6,s=surfAt(P.x,P.z),r=0.85+Math.random()*0.3;
  if(s==='road'){noisePan(0.06*v*r,900,'lowpass',0.05,0.7,0);noisePan(0.03*v,4200,'bandpass',0.03,2,0);}
  else if(s==='bush')noisePan(0.1*v*r,1700,'bandpass',0.3,0.8,0);
  else if(s==='leaves'){noisePan(0.07*v*r,2600*r,'bandpass',0.09,1.4,0);noisePan(0.035*v,3800,'highpass',0.05,0.7,(Math.random()-0.5)*0.4);}
  else noisePan(0.045*v*r,1100*r,'bandpass',0.12,0.9,0);}
const AMB={on:false,cr:0,owl:10};
function ambStart(){if(!ac||AMB.on)return;AMB.on=true;try{const b=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=l*0.985+(Math.random()*2-1)*0.015;d[i]=l*6;}
  const s=ac.createBufferSource();s.buffer=b;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=420;const g=ac.createGain();g.gain.value=0.05;
  const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=0.06;lg.gain.value=0.03;lfo.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(ac.destination);s.start();lfo.start();}catch(e){}}
function chirp(f,v,pan,dl){try{const t=ac.currentTime+dl,o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+0.035);o.connect(g);g.connect(dest(pan));o.start(t);o.stop(t+0.05);}catch(e){}}
function owl(pan){[0,0.55,0.8].forEach((dl,i)=>{try{const t=ac.currentTime+dl,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;
  o.frequency.setValueAtTime(i?370:400,t);o.frequency.exponentialRampToValueAtTime(i?340:360,t+(i?0.18:0.4));g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.035,t+0.06);g.gain.exponentialRampToValueAtTime(0.0001,t+(i?0.22:0.45));
  o.connect(f);f.connect(g);g.connect(dest(pan));o.start(t);o.stop(t+0.5);}catch(e){}});}
function radio(v,pan){try{const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=1900;f.Q.value=2.5;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.09*v,t+0.02);g.gain.setValueAtTime(0.09*v,t+0.45);g.gain.exponentialRampToValueAtTime(0.0001,t+0.55);s.connect(f);f.connect(g);g.connect(dest(pan));s.start(t);s.stop(t+0.6);
  [0.6,0.72].forEach(dl=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='square';o.frequency.value=1250;gg.gain.setValueAtTime(0.0001,t+dl);gg.gain.exponentialRampToValueAtTime(0.03*v,t+dl+0.005);gg.gain.exponentialRampToValueAtTime(0.0001,t+dl+0.05);o.connect(gg);gg.connect(dest(pan));o.start(t+dl);o.stop(t+dl+0.06);});}catch(e){}}
function ambStep(dt){if(!ac||!AMB.on)return;
  AMB.cr-=dt;if(AMB.cr<=0){AMB.cr=0.35+Math.random()*0.7;const pan=Math.random()*2-1,n=2+(Math.random()*3|0),f=4300+Math.random()*700,v=0.004+Math.random()*0.006;for(let i=0;i<n;i++)chirp(f,v,pan,i*0.055);}
  AMB.owl-=dt;if(AMB.owl<=0){AMB.owl=18+Math.random()*28;owl(Math.random()*2-1);}
  COPS.forEach(c=>{if(c.down)return;const d=Math.hypot(c.x-P.x,c.z-P.z);
    if(c.spd>0.3&&d<22){c.stepT-=dt*(c.spd/1.3);if(c.stepT<=0){c.stepT=0.55;noisePan(0.075*(1-d/22)*(c.spd>2?1.3:1),1300,'bandpass',0.08,1,panOf(c.x,c.z));}}
    c.radioT=(c.radioT==null?rnd(4,20):c.radioT)-dt;if(c.radioT<=0){c.radioT=rnd(14,28);if(d<32)radio(clamp(1-d/32,0,1),panOf(c.x,c.z));}});}

/* ---------- Bemutató az első percben ---------- */
const isTouch=matchMedia('(pointer:coarse)').matches;
const TUT=[
  {t:isTouch?'Mozogj: húzd a bal hüvelykujjadat a képernyő bal oldalán.':'Mozogj a W A S D billentyűkkel.',done:()=>Math.hypot(P.x-START.x,P.z-START.z)>4},
  {t:isTouch?'Nézz körül: húzd a jobb hüvelykujjadat.':'Nézz körül: húzd az egeret lenyomott gombbal.',done:()=>TS.yaw>1.2},
  {t:isTouch?'Guggolj le a Guggol gombbal. Guggolva halkabb vagy, bokorban nem látnak.':'Guggolj le a C billentyűvel. Guggolva halkabb vagy, bokorban nem látnak.',done:()=>P.crouch},
  {t:isTouch?'Válaszd a Kampót, és célozz a közeli óriásfa lombjára. Ha a lomb felderül, nyomd meg a Kampó gombot.':'Válaszd a kampót (3), célozz a közeli óriásfa lombjára, és ha felderül, kattints.',done:()=>P.mode==='perch'},
  {t:'Fent vagy a lombban: innen csak akkor látnak meg, ha rád világítanak. Ugorj le ('+(isTouch?'Le gomb':'szóköz')+'). Ha alattad rendőr áll, felülről támadsz.',done:()=>P.mode==='ground'},
  {t:'Válaszd a kavicsot ('+(isTouch?'Kavics':'5')+'), és dobj el egyet ('+(isTouch?'Dob gomb':'kattintás')+'). A koppanása odacsalja a közeli rendőröket.',done:()=>TS.thrown},
  {t:'A tantóval (1) hátulról egy szúrással végzel egy rendőrrel, a tekkóval (2) csak leütöd. Válaszd ki a tantót.',done:()=>P.item===0},
  {t:'A leütött rendőrt bokorba húzhatod ('+(isTouch?'Húz gomb':'G')+'), így a társai nem találják meg. A bal felső térkép mutatja a bokrokat és az óriásfákat. Ha készen állsz, nyomd meg a Tovább gombot, és indulj észak felé!',manual:true}];
const TS={on:false,i:0,t:0,yaw:0,lastYaw:0,thrown:false};
function tutShow(){const el=$('tut');if(!TS.on||TS.i>=TUT.length){el.hidden=true;return;}el.hidden=false;$('tutStep').textContent=(TS.i+1)+' / '+TUT.length;$('tutText').textContent=TUT[TS.i].t;$('tutNext').textContent=TS.i===TUT.length-1?'Kész':'Tovább';}
function tutStart(){TS.on=true;TS.i=0;TS.t=0;TS.yaw=0;TS.lastYaw=P.yaw;TS.thrown=false;tutShow();}
function tutNext(ok){if(!TS.on)return;if(ok)tone(0.07,880,1320,0.12);TS.i++;TS.t=0;if(TS.i>=TUT.length)tutEnd(true);else tutShow();}
function tutEnd(done){TS.on=false;tutShow();if(done){try{localStorage.setItem('ae-tut-done','1');}catch(e){}}}
function tutStep(dt){if(!TS.on)return;TS.yaw+=Math.abs(wrapA(P.yaw-TS.lastYaw));TS.lastYaw=P.yaw;TS.t+=dt;const st=TUT[TS.i];
  if(!st.manual&&TS.t>0.6&&st.done())tutNext(true);}
$('tutSkip').addEventListener('click',()=>tutEnd(true));
$('tutNext').addEventListener('click',()=>tutNext(false));

function useSmoke(){
  if(S.smoke<=0||!S.running)return;S.smoke--;S.smokeT=7;S.sx=P.x;S.sz=P.z;A.puffSmoke(P.x,H(P.x,P.z),P.z);noiseHit(0.3,500,'lowpass',0.5);
  COPS.forEach(c=>{if(c.down)return;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<8){c.blind=4.5;c.aimT=0;c.shootCd=Math.max(c.shootCd,2);if(c.st==='alert'){c.lostT=5;}say(c,'smoke');}});
  showMsg('Füst!');updateButtons();
}

/* ---------- Kampó, mászás, fán ülés, leugrás ---------- */
function giantBase(g){return H(g.x,g.z);}
function perchFor(g,fromX,fromZ){let dx=fromX-g.x,dz=fromZ-g.z,d=Math.hypot(dx,dz);if(d<0.01){dx=0;dz=1;d=1;}dx/=d;dz/=d;
  return{x:g.x+dx*1.75*g.s,z:g.z+dz*1.75*g.s,y:giantBase(g)+g.py+0.85,dx,dz};}
function aimGiant(){/* sugár a kamerából: melyik óriásfa lombjára mutatsz? */
  const o=eyePos(V1),d=V2.set(0,0,-1).applyEuler(camera.rotation);let best=null,bt=1e9;
  giants.forEach(g=>{if(g===P.tree)return;const c=V3.set(g.x,giantBase(g)+11.2*g.s,g.z),R=5.8*g.s;const ox=o.x-c.x,oy=o.y-c.y,oz=o.z-c.z;
    const b=ox*d.x+oy*d.y+oz*d.z,cc=ox*ox+oy*oy+oz*oz-R*R,disc=b*b-cc;if(disc<0)return;const t=-b-Math.sqrt(disc);if(t<0||t>60||t>=bt)return;
    bt=t;best=g;});
  if(!best)return null;const dist=Math.hypot(o.x-best.x,o.y-(giantBase(best)+best.py),o.z-best.z);return{g:best,dist,ok:dist<=32};}
function climbTarget(){const f=fwd();let best=null;giants.forEach(g=>{const dx=g.x-P.x,dz=g.z-P.z,d=Math.hypot(dx,dz);if(d>g.r+1.6)return;
  if(Math.acos(clamp((dx*f.x+dz*f.z)/(d||1),-1,1))<1.1)best=g;});return best;}
function startHook(g){const from=eyePos(new THREE.Vector3()),pr=perchFor(g,P.x,P.z),hp=new THREE.Vector3(g.x+pr.dx*1.0*g.s,giantBase(g)+g.py+1.6*g.s,g.z+pr.dz*1.0*g.s);
  P.mode='hook';P.run=false;P.crouch=false;P.anim={t:0,g,from,to:new THREE.Vector3(pr.x,pr.y,pr.z),hp,throwT:0.35,pullT:0.25+from.distanceTo(hp)*0.035};
  P.py=from.y;noiseHit(0.25,1400,'bandpass',0.35,2);P.noiseBoost=5;updateButtons();}
function startClimb(g){const from=eyePos(new THREE.Vector3()),pr=perchFor(g,P.x,P.z);
  P.mode='climb';P.run=false;P.crouch=false;P.anim={t:0,g,from,to:new THREE.Vector3(pr.x,pr.y,pr.z),dur:2.4,tx:g.x+pr.dx*(g.r+0.45),tz:g.z+pr.dz*(g.r+0.45)};P.py=from.y;P.noiseBoost=4;updateButtons();}
function arrivePerch(g){P.mode='perch';P.tree=g;A.setRope(0,0,0,0,0,0,false);showMsg('A lombban vagy. Innen nem látnak, csak ha rád világítanak.');thump(0.2);updateButtons();}
function dropDown(){if(P.mode!=='perch')return;const g=P.tree,pr=perchFor(g,P.x,P.z);let lx=g.x+pr.dx*(1.75*g.s+1.6),lz=g.z+pr.dz*(1.75*g.s+1.6);
  /* felülről támadás: van-e rendőr a földet érés közelében? */
  let tgt=null,bd=4.8;COPS.forEach(c=>{if(c.dead)return;const d=Math.hypot(c.x-lx,c.z-lz);if(d<bd){bd=d;tgt=c;}});
  if(tgt&&ITEMS[P.item].id!=='tekko'&&ITEMS[P.item].id!=='tanto'){/* ha nincs fegyver a kézben, a tantót veszi elő */selectItem(0);}
  if(tgt){const dx=P.x-tgt.x,dz=P.z-tgt.z,d=Math.hypot(dx,dz)||1;lx=tgt.x+dx/d*0.9;lz=tgt.z+dz/d*0.9;}
  const o={x:lx,z:lz};pushOut(o,0.45);
  P.mode='drop';P.anim={t:0,dur:0.6,from:new THREE.Vector3(P.x,P.py,P.z),to:new THREE.Vector3(o.x,H(o.x,o.z)+0.95,o.z),tgt};P.tree=null;updateButtons();}
function stepPlayerAnim(dt){const a=P.anim;a.t+=dt;
  if(P.mode==='hook'){const hand=V1.copy(a.from).add(V3.set(0,-0.3,0));
    if(a.t<a.throwT){const k=a.t/a.throwT,hx=a.from.x+(a.hp.x-a.from.x)*k,hy=a.from.y+(a.hp.y-a.from.y)*k+Math.sin(k*Math.PI)*1.2,hz=a.from.z+(a.hp.z-a.from.z)*k;A.setRope(hand.x,hand.y,hand.z,hx,hy,hz,true);}
    else{const k=clamp((a.t-a.throwT)/a.pullT,0,1),e=k*k*(3-2*k);P.x=a.from.x+(a.to.x-a.from.x)*e;P.z=a.from.z+(a.to.z-a.from.z)*e;P.py=a.from.y+(a.to.y-a.from.y)*e+Math.sin(k*Math.PI)*0.6;
      A.setRope(P.x,P.py-0.3,P.z,a.hp.x,a.hp.y,a.hp.z,true);if(a.t-a.throwT<dt*1.5)tone(0.12,900,300,0.08,'square');if(k>=1)arrivePerch(a.g);}}
  else if(P.mode==='climb'){const k=clamp(a.t/a.dur,0,1);const k1=clamp(k/0.12,0,1),k2=clamp((k-0.12)/0.76,0,1),k3=clamp((k-0.88)/0.12,0,1);
    const bx=a.from.x+(a.tx-a.from.x)*k1,bz=a.from.z+(a.tz-a.from.z)*k1;P.x=bx+(a.to.x-bx)*k3;P.z=bz+(a.to.z-bz)*k3;P.py=a.from.y+(a.to.y-a.from.y)*k2;
    if(Math.floor(a.t*3)!==Math.floor((a.t-dt)*3))noiseHit(0.08,2500,'bandpass',0.12,3);if(k>=1)arrivePerch(a.g);}
  else if(P.mode==='drop'){const k=clamp(a.t/a.dur,0,1);P.x=a.from.x+(a.to.x-a.from.x)*k;P.z=a.from.z+(a.to.z-a.from.z)*k;P.py=a.from.y+(a.to.y-a.from.y)*k*k;
    if(k>=1){P.mode='ground';P.camY=0.95;P.crouch=true;thump(0.45);if(a.tgt&&!a.tgt.dead){strike(a.tgt,ITEMS[P.item].id==='tekko'?'tekko':'tanto',true);}else P.noiseBoost=16;updateButtons();}}
}

/* ---------- Játék indítása, vége ---------- */
function newRound(){
  S.time=0;S.smoke=D.smoke;S.stones=D.stones;S.spikes=D.spikes;S.darts=D.darts;S.smokeT=0;S.beat=0;S.threat=0;S.alarm=0;S.alarms=0;S.kills=0;S.kos=0;S.shots=0;S.aim=null;
  Object.assign(P,{x:START.x,z:START.z,yaw:0,pitch:0.05,crouch:false,run:false,stam:100,hp:100,mode:'ground',tree:null,anim:null,atk:0,atkCd:0,pend:null,hurt:0,noiseBoost:0,camY:1.65,drag:null});
  selectItem(0);A.setRope(0,0,0,0,0,0,false);setupCops();A.clearPrints();STONE.on=false;STONE.m.visible=false;if(BR.b){A.shakeBush(BR.b,0,0);BR.b=null;}
  $('foe').textContent=(LV==='falu'?'Tanítványok: ':'Rendőrök: ')+COPS.length;updateButtons();
  if(LV==='falu'){tutEnd(false);if(G.hooks.newRound)G.hooks.newRound();}
  else{showMsg('A rendőrség körbezárta a völgyet. Juss el az északi útig.');if($('tutOn').checked)tutStart();else tutEnd(false);}
  S.running=true;
}
function startGame(){
  goFull();audioInit();ambStart();try{speechSynthesis&&speechSynthesis.getVoices();}catch(e){}
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{});}catch(e){}
  document.body.classList.remove('menu');$('start').hidden=true;$('end').hidden=true;$('joyHint').hidden=false;A.hands.visible=true;newRound();Q.frames=0;Q.acc=0;
}
$('go').addEventListener('click',startGame);
/* telefonon és tableten fekvő helyzet, teljes képernyő */
const PORT=matchMedia('(orientation:portrait) and (pointer:coarse)');
function lockL(){try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}
function goFull(){try{if(!isTouch)return;const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).then(lockL,lockL);else lockL();}catch(e){}}
document.addEventListener('pointerdown',()=>{if(!S.running&&!document.fullscreenElement)goFull();},{capture:true});
/* nehézség és bemutató a kezdőképernyőn */
function showDiff(){document.querySelectorAll('#diff [data-d]').forEach(b=>b.setAttribute('aria-checked',DIFF[b.dataset.d]===D?'true':'false'));$('copsN').textContent=D.n;}
document.querySelectorAll('#diff [data-d]').forEach(b=>b.addEventListener('click',()=>{D=DIFF[b.dataset.d];try{localStorage.setItem('ae-diff',b.dataset.d);}catch(e){}showDiff();}));
showDiff();try{$('tutOn').checked=!localStorage.getItem('ae-tut-done');}catch(e){$('tutOn').checked=true;}
$('again').addEventListener('click',()=>{$('end').hidden=true;$('start').hidden=false;});
function rank(){const a=S.alarms,downs=S.kills+S.kos;
  if(a===0&&downs===0)return['Árnyék','Senki sem tudta, hogy itt jártál.'];
  if(a===0&&downs>=COPS.length)return['Csendes halál','Egyenként tűntek el, egyikük sem látott meg.'];
  if(a===0)return['Nagymester','Egyszer sem vettek észre.'];
  if(a===1)return['Mester','Egyszer láttak meg.'];
  if(a<=3)return['Nindzsa',a+' alkalommal láttak meg.'];
  if(a<=5)return['Tanonc',a+' alkalommal láttak meg.'];
  return['Útonálló','Az egész völgy rólad kiabált.'];}
function endGame(win,title,text){
  S.running=false;tutEnd(false);if(P.drag)P.drag=null;joy.id=null;look.id=null;joyEl.hidden=true;A.hands.visible=false;A.setRope(0,0,0,0,0,0,false);aimMark.visible=false;if(S.aimGlow>=0){A.glowGiant(S.aimGlow,0);S.aimGlow=-1;}
  $('endEyebrow').textContent=win?'Kijutottál':'Vége';$('endTitle').textContent=title;$('endText').textContent=text;
  const rk=G.hooks.rank?G.hooks.rank():rank();$('endFoe').textContent=win?'Rang: '+rk[0]:'';
  $('endTip').textContent=LV==='falu'?(rk[2]||''):(win?rk[1]+' ':'')+'Nehézség: '+D.name+' · Idő: '+fmt(S.time)+' · Ölések: '+S.kills+' · Leütések: '+S.kos+' · Riasztások: '+S.alarms+'.';
  document.body.classList.add('menu');$('end').hidden=false;try{speechSynthesis&&speechSynthesis.cancel();}catch(e){}
}

/* ---------- Képernyő-effektek, minőség ---------- */
const fxDanger=$('fxDanger'),fxLeaf=$('fxLeaf'),fxGrain=$('fxGrain'),fxHurt=$('fxHurt');
(function grain(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),d=g.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);fxGrain.style.backgroundImage='url('+c.toDataURL()+')';})();
const Q={frames:0,acc:0,level:2};
function lowerQuality(){Q.level--;if(Q.level===1){A.setPR(1);A.grass.geometry.setDrawRange(0,A.grass.geometry.attributes.position.count*0.6|0);}
  else if(Q.level===0){moonLight.castShadow=false;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});A.grass.geometry.setDrawRange(0,A.grass.geometry.attributes.position.count*0.4|0);A.setPR(0.85);}}

/* ---------- Rendőrök: érzékelés és viselkedés ---------- */
function alertAll(src,x,z,why){S.lastKnown.x=x;S.lastKnown.z=z;
  COPS.forEach(c=>{if(c.down||c===src)return;const d=Math.hypot(c.x-x,c.z-z);if(d>90)return;if(c.st!=='alert'){c.st='search';c.searchT=26;c.tx=x+rnd(-6,6);c.tz=z+rnd(-6,6);c.aw=Math.max(c.aw,0.6);}});}
function spotted(c){if(c.st!=='alert'){if(S.alarm<=0)S.alarms++;S.alarm=40;c.st='alert';c.aimT=0;c.lostT=0;c.shootCd=Math.max(c.shootCd,0.5);say(c,'spot');whistle(Math.hypot(c.x-P.x,c.z-P.z));alertAll(c,P.x,P.z,'spot');}}
function stepCop(c,dt,eye){
  const ox=c.x,oz=c.z,gy=H(c.x,c.z);c.stagger=Math.max(0,c.stagger-dt);c.blind=Math.max(0,c.blind-dt);c.shoot=Math.max(0,c.shoot-dt*14);c.spikeT=Math.max(0,(c.spikeT||0)-dt);
  if(c.sleepT>0&&!c.down){c.sleepT-=dt;c.spd=0;c.stagger=0.3;if(c.sleepT<=0){takeDown(c,false,'Elaludt.');c.koT=G.LV==='falu'?1e9:55;c.slept=true;}return;}
  if(c.down){c.fall=Math.min(1,c.fall+dt*2.2);c.spd=0;
    if(!c.dead){c.koT-=dt;if(c.koT<=0){c.down=false;c.hp=2;c.st='search';c.searchT=30;c.tx=c.x;c.tz=c.z;c.aw=0.7;say(c,'wake');S.alarm=Math.max(S.alarm,30);alertAll(c,c.x,c.z,'wake');}}
    return;}
  if(LV==='falu'&&!c.active){c.spd=0;c.fall=Math.max(0,c.fall-dt*1.5);return;}
  c.fall=Math.max(0,c.fall-dt*1.5);
  /* --- látás --- */
  const dx=P.x-c.x,dz=P.z-c.z,dh=Math.hypot(dx,dz),ce=copEyeY(c),ey=eye.y-0.35;
  const lx=eye.x-c.lens.x,ly=ey-c.lens.y,lz=eye.z-c.lens.z,ld=Math.hypot(lx,ly,lz)||1;
  const inBeam=!G.day&&(lx*c.dir.x+ly*c.dir.y+lz*c.dir.z)/ld>0.955&&ld<28*D.see;
  const fx=-Math.sin(c.ry),fz=-Math.cos(c.ry),ang=Math.acos(clamp((fx*dx+fz*dz)/(dh||1),-1,1)),elev=Math.atan2(ey-ce,dh);
  const air=P.mode!=='ground';let rate=0;
  if(c.blind<=0&&dh<40){
    const los=!blocked(c.x,c.z,P.x,P.z,P.tree)&&!smokeBlocks(c.x,c.z,P.x,P.z);
    if(los){
      if(inBeam){const hid=P.hidden&&!air;rate=(2.4*(1-ld/30)+0.6)*(hid?(ld<7?0.5:0):1)*(air?0.75:1);}
      if(!air&&!P.hidden){const range=(P.crouch?8:15)*(G.day?1.45:1)*D.see*(P.running?1.35:1)*(c.st==='search'||c.st==='alert'?1.3:1);
        if(ang<1.05&&dh<range&&elev<0.7)rate=Math.max(rate,(0.9*(1-dh/range)+0.25)*(P.moving?1.3:0.6));
        if(dh<1.8&&(ang<1.6||(P.moving&&!P.crouch)))rate=Math.max(rate,3);}
      if(c.st==='alert'&&!air&&dh<30&&ang<1.4&&!(P.hidden&&dh>5))rate=Math.max(rate,2);
    }
  }
  c.sees=rate>0;P.lit=P.lit||(inBeam&&c.blind<=0);
  if(rate>0){c.aw=Math.min(1.2,c.aw+rate*dt*D.aw);if(c.aw>=0.35&&c.st==='patrol'){c.st='suspect';c.searchT=6;say(c,'sus');}if(c.st==='suspect'||c.st==='search'){c.tx=P.x;c.tz=P.z;}}
  else if(c.st!=='alert')c.aw=Math.max(0,c.aw-0.16*dt);
  if(c.aw>=1)spotted(c);
  /* --- hallás --- */
  if(c.st!=='alert'&&c.blind<=0&&P.noise>0&&dh<P.noise*0.85*D.hear){if(c.st==='patrol'){c.st='suspect';c.searchT=6;say(c,'sus');}c.aw=Math.max(c.aw,0.4);c.tx=P.x+rnd(-3,3);c.tz=P.z+rnd(-3,3);}
  /* --- testek: ha meglát egy leütött társat --- */
  if(c.st!=='alert')COPS.forEach(b=>{if(b===c||!b.down||b.hiddenBody||b===P.drag||c.seenBody.has(b.id))return;const bx=b.x-c.x,bz=b.z-c.z,bd=Math.hypot(bx,bz);if(bd>22)return;
    const ba=Math.acos(clamp((fx*bx+fz*bz)/(bd||1),-1,1));const by=H(b.x,b.z)+0.2,bl=Math.hypot(b.x-c.lens.x,by-c.lens.y,b.z-c.lens.z)||1;
    const lit=((b.x-c.lens.x)*c.dir.x+(by-c.lens.y)*c.dir.y+(b.z-c.lens.z)*c.dir.z)/bl>0.94;
    if((lit||(bd<10&&ba<1.1))&&!blocked(c.x,c.z,b.x,b.z)){c.seenBody.add(b.id);c.st='search';c.searchT=28;c.tx=b.x+rnd(-3,3);c.tz=b.z+rnd(-3,3);say(c,'body');whistle(Math.hypot(c.x-P.x,c.z-P.z));S.alarm=Math.max(S.alarm,30);alertAll(c,b.x,b.z,'body');}});
  /* --- viselkedés --- */
  let sp=1.3,wantYaw=null,bpT=-0.2+0.05*Math.sin(S.time*0.7+c.id),swT=0;
  c.lookUpT-=dt;if(c.lookUpT<-rnd(10,22))c.lookUpT=2.2;const lookUp=c.lookUpT>0;
  if(c.st==='patrol'){
    const d=Math.hypot(c.tx-c.x,c.tz-c.z);
    if(d<1.2){c.wait-=dt;sp=0;swT=0.95*Math.sin(S.time*0.8+c.id*2);if(c.wait<=0){nextWaypoint(c,true);c.wait=rnd(2,4.5);}}
    else swT=0.35*Math.sin(S.time*0.9+c.id);
    if(lookUp)bpT=0.45;
  }else if(c.st==='suspect'){
    sp=1.8;const d=Math.hypot(c.tx-c.x,c.tz-c.z);if(d<1.5){sp=0;c.searchT-=dt;swT=0.8*Math.sin(S.time*1.2+c.id);if(c.searchT<=0&&c.aw<0.35){c.st='patrol';nextWaypoint(c,false);}}
    bpT=Math.atan2(ey-ce,Math.max(dh,1))*(c.sees?1:0.4);
  }else if(c.st==='search'){
    sp=2.5;c.searchT-=dt;const d=Math.hypot(c.tx-c.x,c.tz-c.z);
    if(d<1.5){c.tx=S.lastKnown.x+rnd(-12,12);c.tz=S.lastKnown.z+rnd(-12,12);const o={x:c.tx,z:c.tz};clampField(o);c.tx=o.x;c.tz=o.z;c.wait=rnd(1,2.5);}
    if(c.wait>0){c.wait-=dt;sp=0;}
    swT=0.9*Math.sin(S.time*1.1+c.id);bpT=0.3+0.5*Math.sin(S.time*0.6+c.id*1.7);
    if(c.searchT<=0){c.st='patrol';c.aw=0.25;nextWaypoint(c,false);}
  }else if(c.st==='alert'){
    if(c.sees){c.lostT=0;S.lastKnown.x=P.x;S.lastKnown.z=P.z;c.tx=P.x;c.tz=P.z;wantYaw=Math.atan2(-dx,-dz);bpT=Math.atan2(ey-ce,Math.max(dh,0.5));
      sp=dh>8?3.4:dh>4?1.2:0;c.aimT+=dt;c.shootCd-=dt;
      if(LV==='falu'){sp=c.blind>0?0:4.2;if(dh<1.3&&c.blind<=0&&!(c.spikeT>0)&&G.hooks.caught)G.hooks.caught(c);}
      else if(c.aimT>0.65&&c.shootCd<=0&&c.stagger<=0&&c.blind<=0)fire(c,dh);
    }else{c.lostT+=dt;c.aimT=Math.max(0,c.aimT-dt);c.shootCd-=dt;sp=3.2;c.tx=S.lastKnown.x;c.tz=S.lastKnown.z;bpT=0.1+0.35*Math.sin(S.time*1.3+c.id);swT=0.6*Math.sin(S.time*1.4);
      if(c.lostT>3.5){c.st='search';c.searchT=24;c.aw=0.6;say(c,'lost');}}
  }
  if(c.stagger>0||c.blind>0)sp*=0.25;
  if(c.spikeT>0){sp=0;wantYaw=null;}
  /* mozgás */
  const tdx=c.tx-c.x,tdz=c.tz-c.z,td=Math.hypot(tdx,tdz);
  if(sp>0&&td>0.4){c.x+=tdx/td*sp*dt;c.z+=tdz/td*sp*dt;pushOut(c,0.45);if(wantYaw===null)wantYaw=Math.atan2(-tdx,-tdz);}
  const moved=Math.hypot(c.x-ox,c.z-oz);c.spd+=(moved/Math.max(dt,1e-3)-c.spd)*Math.min(1,dt*8);
  if(sp>0&&moved<sp*dt*0.25&&td>0.4){c.stuck+=dt;if(c.stuck>1.5){c.stuck=0;if(c.st==='patrol')nextWaypoint(c,true);else{c.tx=c.x+rnd(-8,8);c.tz=c.z+rnd(-8,8);}}}else c.stuck=0;
  if(wantYaw!==null){c.ry+=wrapA(wantYaw-c.ry)*Math.min(1,dt*(c.st==='alert'?7:3.5));}
  c.bp+=(clamp(bpT,-0.5,1.0)-c.bp)*Math.min(1,dt*3);c.sweep+=(swT-c.sweep)*Math.min(1,dt*2.5);
}
function fire(c,dh){c.shootCd=rnd(1.0,1.5);c.shoot=1;S.shots++;gunshot(dh);P.noiseBoost=Math.max(P.noiseBoost,0);
  const air=P.mode!=='ground';let p=0.78-dh*0.022-(P.moving?0.14:0)-(P.running?0.16:0)-(P.crouch?0.06:0)-(air?0.1:0);if(dh<4)p=0.9;p=clamp(p,0.08,0.9);
  if(Math.random()<p){const dmg=rnd(18,26)*D.dmg;P.hp-=dmg;P.hurt=1;thump(0.7);noiseHit(0.4,400,'lowpass',0.2);if(P.hp<=0){P.hp=0;endGame(false,'Lelőttek','A rendőrök '+fmt(S.time)+' után elkaptak.');}}
  else{noiseHit(0.15,5000,'highpass',0.08);}
  COPS.forEach(o=>{if(o===c||o.down)return;if(Math.hypot(o.x-c.x,o.z-c.z)<60&&o.st!=='alert'){o.st='search';o.searchT=26;o.tx=S.lastKnown.x+rnd(-5,5);o.tz=S.lastKnown.z+rnd(-5,5);}});}
function syncCop(c,dt){const m=c.mesh,y=H(c.x,c.z);m.position.set(c.x,y,c.z);m.rotation.y=c.ry;
  m.userData.anim(S.time,c.spd,dt,{st:c.st,bp:c.bp,sweep:c.sweep,shoot:c.shoot,fall:c.fall,stagger:c.stagger>0?Math.sin(c.stagger*12)*0.6:0});
  m.updateMatrixWorld(true);const R=m.userData.R;R.lensP.getWorldPosition(c.lens);c.dir.set(0,-1,0).transformDirection(R.lensP.matrixWorld);
  /* fénycsóva */
  const on=c.dead?0.55:c.down?0.7:1;c.beam.position.copy(c.lens);c.beam.quaternion.setFromUnitVectors(UPV,c.dir);c.beam.material.uniforms.uA.value=on;c.beam.visible=on>0&&!G.day;}

/* ---------- Ciklus ---------- */
let last=performance.now(),hudT=0,T=0;const BR={b:null,k:0,in:false};
const shadowSnap=60/1024;
function frame(now){
  const raw=(now-last)/1000,dt=Math.min(0.05,raw);last=now;T+=dt;
  if(S.running&&!PORT.matches){update(dt);Q.frames++;Q.acc+=raw;if(Q.frames===150){if(Q.acc/150>0.04&&Q.level>0){lowerQuality();}Q.frames=0;Q.acc=0;}}
  else{P.yaw+=dt*0.04;}
  const gy=H(P.x,P.z);
  if(P.mode==='ground')camera.position.set(P.x,gy+P.camY+Math.sin(P.bob)*0.04,P.z);else camera.position.set(P.x,P.py,P.z);
  camera.rotation.set(P.pitch,P.yaw,Math.sin(P.bob*0.5)*0.006*(P.moving?1:0));
  const sx=Math.round(P.x/shadowSnap)*shadowSnap,sz=Math.round(P.z/shadowSnap)*shadowSnap;
  moonLight.target.position.set(sx,gy,sz);moonLight.position.set(sx+MOON_DIR.x*70,gy+MOON_DIR.y*70,sz+MOON_DIR.z*70);
  A.sky.position.copy(camera.position);A.stars.position.copy(camera.position);A.stars.material.uniforms.uT.value=T;
  A.moonSpr.position.copy(camera.position).addScaledVector(MOON_DIR,500);A.moonHalo.position.copy(A.moonSpr.position);
  [A.ring1,A.ring2,A.ring3].forEach(r=>{r.position.x=P.x*0.25;r.position.z=P.z*0.25;});
  const U=A.grass.userData.U;U.uCam.value.set(P.x,P.z);U.uT.value=T;U.uPush.value.set(P.x,P.z,P.mode==='ground'?1:0);
  A.fogSheets.forEach((f,i)=>{f.position.x=Math.round(P.x);f.position.z=Math.round(P.z);const tx=f.material.map;tx.offset.set((f.position.x/150)*2.5+T*0.004*f.userData.sp,(-f.position.z/150)*2.5+T*0.003*f.userData.sp);f.position.y=f.userData.y;});
  A.shafts.mat.uniforms.uT.value=T;A.stepScenery(T);
  A.flies.forEach(s=>{const u=s.userData;let x=u.ox+Math.sin(T*u.sp+u.ph)*1.5,z=u.oz+Math.cos(T*u.sp*0.8+u.ph)*1.5;x=P.x+((x-P.x+20)%40+40)%40-20;z=P.z+((z-P.z+20)%40+40)%40-20;
    s.position.set(x,H(x,z)+u.y+Math.sin(T*1.3+u.ph)*0.3,z);s.material.opacity=Math.max(0,Math.sin(T*2+u.ph*3))*0.85;});
  {const m=A.falling,Lv=m.userData.L,d=new THREE.Object3D();Lv.forEach((l,i)=>{l.y-=l.sp*dt;if(l.y<0){l.y=8+Math.random()*2;l.x=(Math.random()*2-1)*12;l.z=(Math.random()*2-1)*12;}
    const wx=P.x+l.x+Math.sin(T*0.8+l.ph)*0.8,wz=P.z+l.z+Math.cos(T*0.6+l.ph)*0.8;d.position.set(wx,H(wx,wz)+l.y,wz);d.rotation.set(T*1.5+l.ph,T+l.ph,T*0.7);d.updateMatrix();m.setMatrixAt(i,d.matrix);});m.instanceMatrix.needsUpdate=true;}
  A.stepSmoke(dt);A.stepPrints(dt);
  /* rendőrök megjelenítése, zseblámpák fénye a shaderekben */
  COPS.forEach(c=>syncCop(c,S.running?dt:0));
  {const near6=COPS.slice().sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    for(let i=0;i<NFL;i++){const c=near6[i];if(c){FLU.uFLp.value[i].copy(c.lens);FLU.uFLd.value[i].copy(c.dir);FLU.uFLo.value[i]=G.day?0:c.dead?0.5:c.down?0.6:1;}else FLU.uFLo.value[i]=0;}
    const pc=U.uPC.value;for(let i=0;i<4;i++){const c=near6[i];if(c)pc[i].set(c.x,c.z,(c.spd>0.2||c.down)?1:0);else pc[i].set(0,0,0);}}
  A.beamU.uT.value=T;
  COPS.forEach(c=>{const on=c.dead?0.55:c.down?0.7:1,h=c.beam.visible?A.beamHit(c.lens,c.dir,V3):null;
    if(h){const d=c.lens.distanceTo(h),sz=2*(0.06+0.161*d)*1.05;c.pool.position.set(h.x,h.y+0.06,h.z);c.pool.scale.set(sz,1,sz);c.pool.material.opacity=on*0.3*clamp(1-d/30,0,1);}else c.pool.material.opacity=0;
    const m=c.mark,dP=Math.hypot(c.x-P.x,c.z-P.z);let kind=null;if(!c.down&&S.running&&dP<55){if(c.st==='alert')kind='!';else if(c.st==='search'||c.st==='suspect'||c.aw>0.03)kind='?';}
    m.visible=!!kind;if(kind){drawMark(m,kind,c.st==='search'?Math.max(c.aw,0.7):c.aw);m.position.set(c.x,H(c.x,c.z)+2.35+Math.sin(T*3+c.id)*0.03,c.z);const k=clamp(dP/10,0.8,3.2);m.scale.set(0.5*k,0.75*k,1);}});
  if(BR.b){A.shakeBush(BR.b,BR.k,T);BR.k=Math.max(0,BR.k-dt*(BR.in?0.5:2.5));if(BR.k<=0&&!BR.in){A.shakeBush(BR.b,0,0);BR.b=null;}}
  P.lookDX*=Math.exp(-dt*6);if(P.atk>0){P.atk+=dt/0.35;if(P.atk>=1)P.atk=0;}
  A.stepHands(T,dt,P.bob,P.moving&&S.running&&P.mode==='ground',P.running,P.crouch,P.lookDX,P.atk,P.mode==='climb');
  fxGrain.style.backgroundPosition=(Math.random()*128|0)+'px '+(Math.random()*128|0)+'px';
  P.hurt=Math.max(0,P.hurt-dt*1.6);fxHurt.style.opacity=(P.hurt*0.85).toFixed(3);
  fxDanger.style.opacity=S.threat.toFixed(3);fxLeaf.style.opacity=(S.running&&P.hidden&&(P.crouch||P.mode==='perch')?1:0);
  renderer.render(scene,camera);requestAnimationFrame(frame);
}

function update(dt){
  S.time+=dt;
  /* Játékos mozgás */
  let jx=joy.x,jy=joy.y;
  if(joy.id===null){jx=(keys.KeyD?1:0)-(keys.KeyA?1:0);jy=(keys.KeyS?1:0)-(keys.KeyW?1:0);const l=Math.hypot(jx,jy);if(l>1){jx/=l;jy/=l;}}
  const mag=Math.min(1,Math.hypot(jx,jy));
  if(P.mode==='ground'){
    const running=!P.drag&&(P.run||keys.ShiftLeft||keys.ShiftRight)&&P.stam>1&&mag>0.2;P.running=running;
    const speed=P.drag?1.5:P.crouch?2.2:running?6.6:4.2;
    const f=-jy,s=jx,sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
    P.x+=(-sy*f+cy*s)*speed*dt;P.z+=(-cy*f-sy*s)*speed*dt;pushOut(P,0.45);
    P.moving=mag>0.12;P.stam=clamp(P.stam+(running?-20:11)*dt,0,100);if(P.stam<=1&&P.run){P.run=false;updateButtons();}
    P.noise=P.moving?(P.drag?6:P.crouch?4:running?27:12)*mag:0;if(P.moving)P.bob+=dt*speed*2.2;
    {const ph=Math.floor(P.bob/Math.PI);if(ph!==P.stepPh){P.stepPh=ph;if(P.moving)footstep();}}
    {const b=P.moving?bushAt(P.x,P.z):null;BR.in=!!b;if(b){if(BR.b&&BR.b!==b)A.shakeBush(BR.b,0,0);BR.b=b;BR.k=1;}}
    if(P.drag){const c=P.drag;if(!c.down){P.drag=null;updateButtons();}else{const f=fwd(),tx=P.x+f.x*1.0,tz=P.z+f.z*1.0,k=Math.min(1,dt*8);c.x+=(tx-c.x)*k;c.z+=(tz-c.z)*k;pushOut(c,0.35);c.ry=P.yaw+Math.PI;/* a rendőr hanyatt fekszik, a lábánál fogva húzod: a teste előtted látszik */}}
    P.camY+=((P.crouch?0.95:P.drag?1.15:1.65)-P.camY)*Math.min(1,dt*8);
  }else{P.moving=false;P.running=false;P.noise=0;P.stam=clamp(P.stam+11*dt,0,100);if(P.mode!=='perch')stepPlayerAnim(dt);}
  if(P.noiseBoost>0){P.noise=Math.max(P.noise,P.noiseBoost);P.noiseBoost=Math.max(0,P.noiseBoost-dt*30);}
  P.atkCd=Math.max(0,P.atkCd-dt);
  stepStone(dt);stepDart(dt);stepSpikes(dt);ambStep(dt);tutStep(dt);
  if(P.pend){P.pend.t-=dt;if(P.pend.t<=0){const q=P.pend;P.pend=null;if(!q.c.dead)strike(q.c,q.it,false);}}
  if(S.smokeT>0)S.smokeT-=dt;
  const inSmoke=S.smokeT>0&&Math.hypot(P.x-S.sx,P.z-S.sz)<5;
  P.hidden=(P.crouch&&P.mode==='ground'&&inBush(P.x,P.z))||inSmoke||P.mode==='perch';
  if(!S.running)return;

  /* Rendőrök */
  const eye=eyePos(new THREE.Vector3());P.lit=false;let nd=1e9,maxSt=0;
  COPS.forEach(c=>{if(!S.freeze)stepCop(c,dt,eye);if(!S.running)return;if(c.down)return;const d=Math.hypot(P.x-c.x,P.z-c.z);if(d<nd)nd=d;
    const lv=c.st==='alert'?3:c.st==='search'?2:c.st==='suspect'?1:0;if(lv>maxSt)maxSt=lv;});
  if(!S.running)return;
  for(let i=0;i<COPS.length;i++){const a=COPS[i];if(a.down)continue;const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);
    if(P.mode==='ground'&&d<0.85&&d>1e-4){P.x=a.x+dx/d*0.85;P.z=a.z+dz/d*0.85;}
    for(let j=i+1;j<COPS.length;j++){const b=COPS[j];if(b.down)continue;const ex=a.x-b.x,ez=a.z-b.z,e=Math.hypot(ex,ez);if(e<0.9&&e>1e-4){const m=(0.9-e)/2;a.x+=ex/e*m;a.z+=ez/e*m;b.x-=ex/e*m;b.z-=ez/e*m;}}}
  S.alarm=Math.max(0,S.alarm-dt);S.maxSt=maxSt;S.nd=nd;
  S.threat+=((maxSt===3?0.6:maxSt===2?0.25:maxSt===1?0.12:0)+clamp(1-nd/10,0,1)*0.2+(P.lit?0.15:0)-S.threat)*Math.min(1,dt*3);
  if(maxSt>=2&&nd<26){S.beat-=dt;if(S.beat<=0){thump(0.2+0.45*(1-nd/26));S.beat=0.3+(nd/26)*0.7;}}

  /* Kampó célzás: halvány jelzés a lombon */
  S.aim=(ITEMS[P.item].id==='kampo'&&(P.mode==='ground'||P.mode==='perch'))?aimGiant():null;
  const gi=S.aim&&S.aim.ok?S.aim.g.i:-1;
  if(gi!==S.aimGlow){if(S.aimGlow>=0)A.glowGiant(S.aimGlow,0);S.aimGlow=gi;}
  if(gi>=0){const g=S.aim.g,k=0.5+0.5*Math.sin(S.time*4);A.glowGiant(gi,0.55+0.25*k);const pr=perchFor(g,P.x,P.z);
    aimMark.position.set(g.x+pr.dx*1.0*g.s,giantBase(g)+g.py+1.6*g.s,g.z+pr.dz*1.0*g.s);aimMark.material.opacity=0.22+0.16*k;aimMark.visible=true;}else aimMark.visible=false;

  /* Cél */
  if(LV==='erdo'&&P.mode==='ground'&&P.z<-ZN-4&&Math.abs(P.x)<6){const rk=rank();endGame(true,'Kijutottál',rk[0]==='Árnyék'?'Átjutottál a völgyön, és senki sem tudta, hogy ott voltál.':'Elérted az északi utat '+fmt(S.time)+' alatt.');return;}

  if(G.hooks.update){G.hooks.update(dt);if(!S.running)return;}
  if(S.msgT>0){S.msgT-=dt;if(S.msgT<=0)$('msg').style.opacity=0;}
  if(S.subT>0){S.subT-=dt;if(S.subT<=0)$('sub').style.opacity=0;}
  hudT-=dt;if(hudT<=0){hudT=0.1;hud();}
}
function fmt(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}

/* ---------- HUD: iránytű, ki-gyűrű, sávok, célkereszt ---------- */
const cmp=$('compass'),cg=cmp.getContext('2d');
function drawCompass(){const dpr=Math.min(2,window.devicePixelRatio||1),W=cmp.clientWidth||210,Hh=cmp.clientHeight||40;if(cmp.width!==W*dpr){cmp.width=W*dpr;cmp.height=Hh*dpr;}
  cg.setTransform(dpr,0,0,dpr,0,0);cg.clearRect(0,0,W,Hh);const head=-P.yaw*180/Math.PI,span=100,cx=W/2,px=W/2/span;
  const css=getComputedStyle(document.documentElement),moon=css.getPropertyValue('--moon').trim()||'#ece5d3',mist=css.getPropertyValue('--mist').trim()||'#a9b2ab',goal=css.getPropertyValue('--goal').trim()||'#7fd3e6';
  const lab={0:'É',45:'ÉK',90:'K',135:'DK',180:'D',225:'DNy',270:'Ny',315:'ÉNy'};
  cg.textAlign='center';cg.textBaseline='alphabetic';
  for(let a=0;a<360;a+=15){let rel=((a-head)%360+540)%360-180;if(Math.abs(rel)>span)continue;const x=cx+rel*px,fade=1-Math.abs(rel)/span;cg.globalAlpha=0.25+0.75*fade;
    const card=a%90===0,mid=a%45===0;cg.strokeStyle=card?moon:mist;cg.lineWidth=card?1.6:1;cg.beginPath();cg.moveTo(x,Hh-6);cg.lineTo(x,Hh-(card?16:mid?13:10));cg.stroke();
    if(lab[a]!==undefined){cg.fillStyle=card?moon:mist;cg.font=(card?'600 13px ':'500 10px ')+'"IBM Plex Sans",system-ui,sans-serif';cg.fillText(lab[a],x,Hh-19);}}
  cg.globalAlpha=1;cg.strokeStyle=moon;cg.lineWidth=1;cg.beginPath();cg.moveTo(8,Hh-6);cg.lineTo(W-8,Hh-6);cg.globalAlpha=0.3;cg.stroke();cg.globalAlpha=1;
  /* kijárat jelölő */
  const gx=GOAL.x-P.x,gz=GOAL.z-P.z,b=Math.atan2(gx,-gz)*180/Math.PI;let rel=((b-head)%360+540)%360-180;const off=Math.abs(rel)>span-6;const x=cx+clamp(rel,-span+6,span-6)*px;
  cg.fillStyle=goal;cg.beginPath();if(off){const s=rel>0?1:-1;cg.moveTo(x+s*7,Hh-11);cg.lineTo(x-s*3,Hh-17);cg.lineTo(x-s*3,Hh-5);}else{cg.moveTo(x,Hh-21);cg.lineTo(x+5,Hh-12);cg.lineTo(x,Hh-3);cg.lineTo(x-5,Hh-12);}cg.closePath();cg.fill();
  $('goalDist').textContent=G.goalName+' · '+Math.round(Math.hypot(gx,gz))+' m';}
const rad=$('radar'),rgx=rad.getContext('2d');
/* közeli térkép: a nézési irány felfelé, 36 m sugarú környék. Bokrok, óriásfák, kijárat; rendőr csak ha keres vagy riadóban van, leütött rendőr szürke ×. */
function drawRadar(){const dpr=Math.min(2,window.devicePixelRatio||1),W=rad.clientWidth||110;if(rad.width!==Math.round(W*dpr)){rad.width=rad.height=Math.round(W*dpr);}
  const g=rgx;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,W);const c=W/2,R=W/2-1.5,RM=36,k=R/RM,cy=Math.cos(P.yaw),sy=Math.sin(P.yaw);
  const tf=(x,z)=>{const dx=x-P.x,dz=z-P.z;return [c+(dx*cy-dz*sy)*k,c+(dx*sy+dz*cy)*k];};const inR=(x,z,m)=>Math.hypot(x-P.x,z-P.z)<RM+(m||0);
  g.save();g.beginPath();g.arc(c,c,R,0,Math.PI*2);g.fillStyle='rgba(5,8,10,0.66)';g.fill();g.clip();
  /* határ és út */
  g.strokeStyle='rgba(236,229,211,0.28)';g.lineWidth=1.2;g.beginPath();[[-XW,ZS],[XW,ZS],[XW,-ZN],[3.9,-ZN],[3.9,-150],[-3.9,-150],[-3.9,-ZN],[-XW,-ZN]].forEach((q,i)=>{const p=tf(q[0],q[1]);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.stroke();
  g.fillStyle='rgba(120,128,132,0.35)';g.beginPath();[[-3.5,-ZN],[3.5,-ZN],[3.5,-150],[-3.5,-150]].forEach((q,i)=>{const p=tf(q[0],q[1]);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.fill();
  g.fillStyle='rgba(70,110,70,0.55)';A.bushes.forEach(b=>{if(!inR(b.x,b.z,2))return;const p=tf(b.x,b.z);g.beginPath();g.arc(p[0],p[1],Math.max(1.4,b.r*k*0.8),0,Math.PI*2);g.fill();});
  giants.forEach(t=>{if(!inR(t.x,t.z,5))return;const p=tf(t.x,t.z);g.fillStyle='rgba(127,211,230,0.18)';g.beginPath();g.arc(p[0],p[1],t.cr*k,0,Math.PI*2);g.fill();g.fillStyle='#7fd3e6';g.beginPath();g.arc(p[0],p[1],2.2,0,Math.PI*2);g.fill();});
  if(S.smokeT>0&&inR(S.sx,S.sz,5)){const p=tf(S.sx,S.sz);g.fillStyle='rgba(180,190,196,0.35)';g.beginPath();g.arc(p[0],p[1],4.2*k,0,Math.PI*2);g.fill();}
  COPS.forEach(o=>{if(!inR(o.x,o.z))return;const p=tf(o.x,o.z);
    if(o.down){g.strokeStyle=o.hiddenBody?'rgba(169,178,171,0.35)':'rgba(169,178,171,0.85)';g.lineWidth=1.6;g.beginPath();g.moveTo(p[0]-3,p[1]-3);g.lineTo(p[0]+3,p[1]+3);g.moveTo(p[0]+3,p[1]-3);g.lineTo(p[0]-3,p[1]+3);g.stroke();return;}
    if(o.st==='alert'||o.st==='search'){g.fillStyle=o.st==='alert'?'#e0503f':'#e0a43a';g.beginPath();g.arc(p[0],p[1],3.2,0,Math.PI*2);g.fill();}});
  g.restore();
  /* kijárat iránya a peremen */
  {const p=tf(GOAL.x,GOAL.z),dx=p[0]-c,dy=p[1]-c,d=Math.hypot(dx,dy);const q=d>R-5?[c+dx/d*(R-5),c+dy/d*(R-5)]:p;g.fillStyle='#7fd3e6';g.beginPath();g.arc(q[0],q[1],3.4,0,Math.PI*2);g.fill();}
  g.fillStyle='#ece5d3';g.beginPath();g.moveTo(c,c-6);g.lineTo(c+4.2,c+4.5);g.lineTo(c,c+2.2);g.lineTo(c-4.2,c+4.5);g.closePath();g.fill();
  g.strokeStyle='rgba(236,229,211,0.35)';g.lineWidth=1;g.beginPath();g.arc(c,c,R,0,Math.PI*2);g.stroke();}
function hud(){
  const m=S.maxSt||0,nd=S.nd||1e9;
  const st=m===3?['Riadó','var(--blood)']:m===2?['Keresnek','var(--lantern)']:m===1?['Gyanakszanak','var(--lantern)']:['Nyugodt','var(--calm)'];
  $('kiState').textContent=st[0];$('kiState').style.color=st[1];$('kiChar').style.color=st[1];$('kiRing').style.borderColor=st[1];
  $('kiDist').textContent=nd<35?Math.round(nd)+' m':'—';
  const out=COPS.filter(c=>c.down).length;$('foe').textContent=LV==='falu'?(G.station||''):'Rendőrök: '+(COPS.length-out)+(out?' · kiiktatva: '+out:'');
  $('timer').textContent=fmt(S.time);
  $('hpBar').firstElementChild.style.width=P.hp+'%';$('hpBar').classList.toggle('low',P.hp<35);
  $('stamBar').firstElementChild.style.width=P.stam+'%';
  $('noiseBar').firstElementChild.style.width=Math.min(100,P.noise/27*100)+'%';
  $('hidden').hidden=!P.hidden;$('lit').hidden=!P.lit;
  drawCompass();drawRadar();
  {const bd=$('bDrag'),show=P.mode==='ground'&&(P.drag||bodyNear());bd.hidden=!show;bd.firstChild.textContent=P.drag?'Elenged':'Húz';}
  /* célkereszt és felirat */
  const it=ITEMS[P.item].id,cr=$('cross'),pr=$('prompt');let txt='',cls='';
  if(P.drag)txt=inBush(P.drag.x,P.drag.z)?'Engedd el: a bokorban elrejted':'Húzod a testet – vidd egy bokorba';
  else if(P.mode==='perch')txt=it==='kampo'?(S.aim?(S.aim.ok?'Kampó: átlendülsz a másik fára':'Túl messze'):'Célozz egy másik óriásfára, vagy ugorj le'):'Leugrás'+(COPS.some(c=>!c.dead&&Math.hypot(c.x-P.x,c.z-P.z)<7)?' – támadás felülről!':'');
  else if(P.mode==='ground'){
    if(it==='kampo'){if(S.aim){txt=S.aim.ok?'Fel tudsz kapaszkodni':'Túl messze ('+Math.round(S.aim.dist)+' m)';cls=S.aim.ok?'ok':'far';}}
    else if(it==='karom'){if(climbTarget()){txt='Mássz fel';cls='ok';}}
    else if(it==='fukiya'){if(S.darts<=0)txt='Elfogyott az altatónyíl';else{const c=dartTarget();txt=c?'Fújd: elalszik':'Köpőcső: altatónyíl';cls=c?'ok':'';}}
    else if(it==='tuske'){txt=S.spikes<=0?'Elfogyott a tüske':P.running?'Szórd magad mögé':'Dobd előre (futás közben magad mögé szórod)';}
    else if(it==='kavics'){txt=S.stones>0?(LV==='falu'?'Dobd el: a koppanás odacsalja az őrt':'Dobd el: a koppanás odacsalja a rendőröket'):'Elfogyott a kavics';}
    else{const c=meleeTarget();if(c){txt=c.down?(it==='tanto'?'Végezz vele':'Üsd le újra'):c.st!=='alert'?(it==='tanto'?'Csendes ölés':'Leütés'):(it==='tanto'?'Szúrás':'Ütés');cls='ok';}}}
  cr.className='hud '+cls;cr.hidden=!(it==='kampo'||it==='fukiya'||cls);pr.textContent=txt;pr.hidden=!txt;
  const ul=$('bUse');ul.firstChild.textContent=P.drag?'Elenged':P.mode==='perch'&&it!=='kampo'&&it!=='kavics'&&it!=='fukiya'?'Le':it==='kampo'?'Kampó':it==='karom'?'Mászás':it==='kavics'?'Dob':it==='fukiya'?'Fúj':it==='tuske'?(P.running?'Szór':'Dob'):it==='tekko'?'Üt':'Szúr';
  if(P.mode==='perch')updateButtons();
}
A.hands.visible=false;A.beacon.visible=false;
/* a falu (kiképzés) logikája ezen keresztül éri el a játék belsejét */
function sayLine(l,x,z,pitch){const d=Math.hypot(x-P.x,z-P.z);const sub=$('sub');sub.innerHTML='<b>„'+l[1]+'”</b> '+l[2];sub.style.opacity=1;S.subT=Math.max(3.2,l[2].length*0.075);
  try{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(l[0]);u.lang='ja-JP';u.rate=0.95;u.pitch=pitch||0.6;u.volume=clamp(1.1-d/40,0.25,1);
    const v=speechSynthesis.getVoices().find(v=>/^ja/i.test(v.lang));if(v){u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u);}}}catch(e){}}
Object.assign(G,{clearSpikes,SPK,DART,LINES,setDiff:k=>{D=DIFF[k];},P,S,COPS,ALLCOPS,GOAL,START,ITEMS,showMsg,sayLine,say,selectItem,updateButtons,pushOut,inBush,bodyNear,tone,thump,noiseHit,endGame,eyePos,fwd,resetCop,nextWaypoint,fmt,wrapA,rnd,STONE,startGame,
  setStones:n=>{S.stones=n;updateButtons();},setSpikes:n=>{S.spikes=n;updateButtons();},setDarts:n=>{S.darts=n;updateButtons();},setSmoke:n=>{S.smoke=n;updateButtons();}});
/* Tesztelési horog: csak ?aetest címparaméterrel él, az élő játékban nincs. */
if(/[?&]aetest/.test(location.search))window.AE_TEST={blowDart,useSpikes,SPK,DART,P,S,COPS,ALLCOPS,DIFF,setD:k=>{D=DIFF[k];},toggleDrag,throwStone,STONE,TS,drawRadar,startGame,useItem,selectItem,dropDown,startHook,startClimb,giants,stepCop,blocked,perchFor,arrivePerch,tick:(dt,n)=>{for(let i=0;i<(n||1);i++){if(!S.running)break;update(dt);COPS.forEach(c=>syncCop(c,dt));}},frame:()=>frame(performance.now())};
requestAnimationFrame(frame);
})();
