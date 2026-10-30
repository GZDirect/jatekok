(function(){
/* Árnyékerdő – 2. pálya: a mester rejtett hegyi faluja (díszlet és a próbák elrendezése).
   © 2026 Fejes Géza. Minden jog fenntartva.
   A falu délről északra tíz udvarra oszlik; mindegyik udvar egy próba. Az udvarokat bambuszkerítés választja el, kapukkal.
   Csak a ?palya=falu címmel fut, az erdei pályán semmit sem csinál. */
const A=window.AE;if(A.LV!=='falu')return;
const {scene,H,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const XF=16.5,LIGHTS=[];/* a falu oldalkerítése */
/* udvarok: déli (top) és északi (bot) határ; a kapu az északi határon áll */
const ROOMS=[
  {id:'erkezes',top:48,bot:36,gx:0,gate:'torii'},
  {id:'csend',top:36,bot:24,gx:10},
  {id:'bokor',top:24,bot:6,gx:-10},
  {id:'babuk',top:6,bot:-6,gx:10},
  {id:'kampo',top:-6,bot:-26,gx:0},
  {id:'karom',top:-26,bot:-40,gx:-10},
  {id:'kavics',top:-40,bot:-52,gx:0,gate:'open'},
  {id:'test',top:-52,bot:-66,gx:0},
  {id:'fust',top:-66,bot:-78,gx:0},
  {id:'kopocso',top:-78,bot:-90,gx:-10},
  {id:'tuske',top:-90,bot:-102,gx:0},
  {id:'vizsga',top:-102,bot:-127,gx:null}];

/* ---------- ütköző pontok ---------- */
function wallCol(x0,z0,x1,z1,r,step,low,list){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let i=0;i<=n;i++){const o={x:x0+(x1-x0)*i/n,z:z0+(z1-z0)*i/n,r,low,kind:'prop'};trees.push(o);addTo(grid,o);if(list)list.push(o);}}

/* ---------- bambuszkerítés (egyetlen példányos háló) ---------- */
const fenceParts=[];
function fence(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0);if(L<0.3)return;const dx=(x1-x0)/L,dz=(z1-z0)/L,a=Math.atan2(dx,dz);
  const n=Math.max(1,Math.round(L/1.8));for(let i=0;i<=n;i++){const t=i/n;fenceParts.push({x:x0+(x1-x0)*t,z:z0+(z1-z0)*t,y:0.75,sx:0.11,sy:1.5,sz:0.11,a,c:0x4a3a28});}
  [0.45,1.0,1.38].forEach(y=>fenceParts.push({x:(x0+x1)/2,z:(z0+z1)/2,y,sx:0.05,sy:0.05,sz:L,a,c:0x6b6a3a}));
  const m=Math.round(L/0.16);for(let i=0;i<m;i++){const t=(i+0.5)/m;fenceParts.push({x:x0+(x1-x0)*t,z:z0+(z1-z0)*t,y:0.62,sx:0.06,sy:1.18+((i*7)%5)*0.03,sz:0.06,a,c:i%3?0x7a7440:0x6a6638});}
  wallCol(x0,z0,x1,z1,0.28,0.6,true);}
/* határkerítések */
fence(-XF,48,-XF,-127);fence(XF,48,XF,-127);fence(-XF,48,XF,48);fence(-XF,-127,XF,-127);
ROOMS.forEach(r=>{if(r.gx===null)return;const z=r.bot;fence(-XF,z,r.gx-1.4,z);fence(r.gx+1.4,z,XF,z);});
{const D=new THREE.Object3D(),C=new THREE.Color(),m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),lam(0xffffff),fenceParts.length);
  fenceParts.forEach((f,i)=>{D.position.set(f.x,H(f.x,f.z)+f.y,f.z);D.rotation.set(0,f.a,0);D.scale.set(f.sx,f.sy,f.sz);D.updateMatrix();m.setMatrixAt(i,D.matrix);m.setColorAt(i,C.setHex(f.c));});
  m.castShadow=true;m.receiveShadow=true;scene.add(m);}

/* ---------- kapuk ---------- */
const GATES={},gateAnim=[];
const wood=lam(0x5a4430),woodD=lam(0x3a2c20),red=lam(0xa8341f),roofM=lam(0x2c2a28);
function gate(id,x,z,kind){const g=new THREE.Group();g.position.set(x,H(x,z),z);scene.add(g);const hy=H(x,z);
  const cols=[];[-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,kind==='torii'?3.6:2.6,8),kind==='torii'?red:woodD);p.position.set(s*1.35,kind==='torii'?1.8:1.3,0);p.castShadow=true;g.add(p);
    const o={x:x+s*1.35,z,r:0.22,kind:'prop'};trees.push(o);addTo(grid,o);});
  if(kind==='torii'){const k=new THREE.Mesh(new THREE.BoxGeometry(4.0,0.22,0.3),red);k.position.y=3.6;g.add(k);const k2=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.14,0.2),red);k2.position.y=3.1;g.add(k2);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.12,0.42),roofM);cap.position.y=3.76;g.add(cap);}
  else{const beam=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.16,0.22),woodD);beam.position.y=2.5;g.add(beam);
    const rf=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.1,0.9),roofM);rf.position.y=2.68;rf.rotation.x=0;g.add(rf);
    const rr=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3.6,6),roofM);rr.rotation.z=Math.PI/2;rr.position.y=2.76;g.add(rr);}
  const doors=[];if(kind!=='torii'&&kind!=='open'){[-1,1].forEach(s=>{const piv=new THREE.Group();piv.position.set(s*1.3,0,0);g.add(piv);
    const d=new THREE.Mesh(new THREE.BoxGeometry(1.26,2.1,0.08),wood);d.position.set(-s*0.64,1.12,0);d.castShadow=true;piv.add(d);
    for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.08,0.1),woodD);b.position.set(-s*0.64,0.4+k*0.7,0.02);piv.add(b);}doors.push({piv,s});});}
  const lock=[];if(kind!=='open'){[-0.7,0,0.7].forEach(dx=>{const o={x:x+dx,z,r:0.55,kind:'prop'};trees.push(o);addTo(grid,o);lock.push(o);});}
  const G={id,x,z,kind,open:false,doors,lock,t:0,
    setOpen(v,instant){G.open=v;lock.forEach(o=>o.off=v);if(instant)G.t=v?1:0;}};
  GATES[id]=G;gateAnim.push(G);return G;}
ROOMS.forEach(r=>{if(r.gx===null)return;gate(r.id,r.gx,r.bot,r.gate||'gate');});
function stepGates(dt){gateAnim.forEach(G=>{const tg=G.open?1:0;G.t+=clamp(tg-G.t,-dt*1.2,dt*1.2);G.doors.forEach(d=>{d.piv.rotation.y=d.s*G.t*1.7;});});}

/* ---------- a kampós udvar magas fala ---------- */
{const wz=-15,plaster=lam(0xd8d0bc),tile=lam(0x34383c),base=lam(0x6a6258);
  const w=new THREE.Mesh(new THREE.BoxGeometry(XF*2,3.3,0.55),plaster);w.position.set(0,H(0,wz)+1.65,wz);w.castShadow=true;w.receiveShadow=true;scene.add(w);
  const b=new THREE.Mesh(new THREE.BoxGeometry(XF*2+0.1,0.6,0.62),base);b.position.set(0,H(0,wz)+0.3,wz);scene.add(b);
  const t=new THREE.Mesh(new THREE.BoxGeometry(XF*2+0.3,0.18,1.1),tile);t.position.set(0,H(0,wz)+3.42,wz);t.castShadow=true;scene.add(t);
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,XF*2+0.3,6),tile);ridge.rotation.z=Math.PI/2;ridge.position.set(0,H(0,wz)+3.56,wz);scene.add(ridge);
  wallCol(-XF,wz,XF,wz,0.45,0.55,false);}

/* ---------- házak a kerítésen kívül, és a dojo ---------- */
const plasterM=lam(0xcfc6b0),timberM=lam(0x3a2e24),thatchM=lam(0x6b5a3e),shojiM=new THREE.MeshLambertMaterial({color:0xf2e6c8,emissive:0xb07a3a,emissiveIntensity:0.55});
function prismRoof(w,d,h,mat){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(0,h);s.lineTo(w/2,0);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return new THREE.Mesh(g,mat);}
function house(x,z,ry,w,d,lit){const g=new THREE.Group();g.position.set(x,H(x,z),z);g.rotation.y=ry;scene.add(g);
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,2.8,d),plasterM);body.position.y=1.4;body.castShadow=true;body.receiveShadow=true;g.add(body);
  [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(q=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.2,2.9,0.2),timberM);p.position.set(q[0],1.45,q[1]);g.add(p);});
  const beam=new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.18,d+0.1),timberM);beam.position.y=2.75;g.add(beam);
  const roof=prismRoof(w+1.4,d+1.2,2.4,thatchM);roof.position.y=2.8;roof.rotation.y=Math.PI/2;roof.castShadow=true;g.add(roof);
  if(lit){const sh=new THREE.Mesh(new THREE.PlaneGeometry(w*0.5,1.4),shojiM);sh.position.set(0,1.2,d/2+0.02);g.add(sh);}}
[[-21.5,38,Math.PI/2,6,5,1],[21.5,30,-Math.PI/2,6,5,1],[-21.5,10,Math.PI/2,7,5,0],[21.5,-2,-Math.PI/2,6,5,1],[-21.5,-30,Math.PI/2,6,5,1],[21.5,-42,-Math.PI/2,7,5,0],[-21.5,-62,Math.PI/2,6,5,1],[21.5,-74,-Math.PI/2,6,5,1],[-21.5,-86,Math.PI/2,6,5,0],[21.5,-98,-Math.PI/2,7,5,1],[-21.5,-110,Math.PI/2,6,5,1],[21.5,-120,-Math.PI/2,6,5,0]].forEach(q=>house(...q));
/* dojo az északi végén */
{const dz=-123.5,g=new THREE.Group();g.position.set(0,H(0,dz),dz);scene.add(g);const W=15,D=6.4;
  const floor=new THREE.Mesh(new THREE.BoxGeometry(W+2,0.7,D+2),timberM);floor.position.y=0.35;floor.receiveShadow=true;g.add(floor);
  const body=new THREE.Mesh(new THREE.BoxGeometry(W,3.2,D),plasterM);body.position.y=2.3;body.castShadow=true;g.add(body);
  for(let i=0;i<6;i++){const sh=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.4),shojiM);sh.position.set(-6.2+i*2.48,2.0,D/2+0.02);g.add(sh);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.5,0.06),timberM);fr.position.set(-7.4+i*2.48,2.0,D/2+0.04);g.add(fr);}
  for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,3.4,8),timberM);p.position.set(-7.6+i*2.53,2.4,D/2+0.9);g.add(p);}
  const roof=prismRoof(W+3.5,D+4,3.4,lam(0x2e3034));roof.position.y=3.9;roof.rotation.y=Math.PI/2;roof.castShadow=true;g.add(roof);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.7),new THREE.MeshBasicMaterial({map:canvasTex(256,80,(c,w,h)=>{c.fillStyle='#2a1d14';c.fillRect(0,0,w,h);c.fillStyle='#e8dcc0';c.font='700 56px "Noto Serif JP",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('影道場',w/2,h/2+3);})}));
  sign.position.set(0,4.15,D/2+1.05);g.add(sign);
  const light=new THREE.PointLight(0xffb070,1.4,22,1.6);light.position.set(0,2.6,D/2+2.2);g.add(light);LIGHTS.push(light);
  wallCol(-W/2-1,dz+D/2+1.05,W/2+1,dz+D/2+1.05,0.45,0.6,false);}

/* ---------- kőlámpások (tōrō) ---------- */
const stoneM=lam(0x8a8880),lampGlow=[];
function toro(x,z){const g=new THREE.Group();g.position.set(x,H(x,z),z);scene.add(g);
  const b=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.34,0.25,8),stoneM);b.position.y=0.12;g.add(b);
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.8,8),stoneM);p.position.y=0.65;g.add(p);
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.36,0.42),new THREE.MeshLambertMaterial({color:0x8a8880,emissive:0xffa040,emissiveIntensity:0.45}));box.position.y=1.23;g.add(box);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(0.42,0.32,4),stoneM);cap.rotation.y=Math.PI/4;cap.position.y=1.57;g.add(cap);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffa850,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(2.2);s.position.y=1.23;g.add(s);lampGlow.push(s);
  const o={x,z,r:0.38,kind:'prop'};trees.push(o);addTo(grid,o);}
[[-3,44],[3,44],[13,26],[-13,22],[-13,7],[13,-4],[3,-24],[-13,-28],[-3,-50],[3,-50],[13,-54],[-13,-64],[-3,-76],[3,-76],[13,-88],[-13,-92],[13,-100],[-4,-118],[4,-118]].forEach(q=>toro(q[0],q[1]));
{const l=new THREE.PointLight(0xffb070,1.0,18,1.6);l.position.set(0,H(0,40)+2.5,40);scene.add(l);
 const l2=new THREE.PointLight(0xffb070,0.9,16,1.6);l2.position.set(2,H(2,0)+2.6,0);scene.add(l2);LIGHTS.push(l,l2);}

/* ---------- szalmabábuk (makiwara): az arcuk felől nem szabad ütni ---------- */
const straw=lam(0xb89a5a),strawD=lam(0x8a6e3a),rope=lam(0x5a4632),post=lam(0x4a3a2a);
const faceTex=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#efe6d2';c.beginPath();c.arc(64,64,60,0,Math.PI*2);c.fill();c.fillStyle='#1a1410';
  c.beginPath();c.ellipse(42,54,9,5,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(86,54,9,5,0,0,Math.PI*2);c.fill();c.fillStyle='#a8341f';c.fillRect(40,86,48,6);});
const DUMMIES=[];
function dummy(x,z,face){const g=new THREE.Group();g.position.set(x,H(x,z),z);g.rotation.y=face;scene.add(g);
  const pp=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,1.0,8),post);pp.position.y=0.5;g.add(pp);
  const top=new THREE.Group();top.position.y=0.95;g.add(top);
  const bd=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.24,0.95,10),straw);bd.position.y=0.48;bd.castShadow=true;top.add(bd);
  [0.15,0.5,0.82].forEach(y=>{const r=new THREE.Mesh(new THREE.TorusGeometry(0.23,0.025,5,14),rope);r.rotation.x=Math.PI/2;r.position.y=y;top.add(r);});
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.0,6),strawD);arm.rotation.z=Math.PI/2;arm.position.y=0.6;top.add(arm);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.17,10,8),straw);head.position.y=1.08;top.add(head);
  const fc=new THREE.Mesh(new THREE.CircleGeometry(0.15,16),new THREE.MeshLambertMaterial({map:faceTex}));fc.position.set(0,1.08,-0.165);fc.rotation.y=Math.PI;top.add(fc);
  const mark=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.08),new THREE.MeshBasicMaterial({color:0xc8402e}));mark.position.set(0,0.62,0.245);mark.visible=false;top.add(mark);
  /* előre (az arc felé) mutató irány: a csoport −z tengelye forgatva */
  const d={x,z,face,g,top,mark,hit:false,how:null,wob:0,fx:-Math.sin(face),fz:-Math.cos(face)};DUMMIES.push(d);
  const o={x,z,r:0.32,kind:'prop'};trees.push(o);addTo(grid,o);return d;}
dummy(-6,1,Math.PI);dummy(2,-2,-Math.PI/2);dummy(9,2,0);
function stepDummies(dt,t){DUMMIES.forEach(d=>{if(d.wob>0){d.wob=Math.max(0,d.wob-dt);const k=d.wob;d.top.rotation.x=Math.sin(t*22)*0.22*k;d.top.rotation.z=Math.cos(t*19)*0.12*k;}});}

/* ---------- a mester ---------- */
const master=A.buildPolice(99,{master:true});scene.add(master);

/* ---------- tanítványok: hol állnak, merre járnak ---------- */
const P2=(x,z)=>({x,z});
const students=[
  {room:'csend',route:[P2(-4,29)],ry:Math.PI/2,listen:true},
  {room:'bokor',route:[P2(-13,15),P2(13,15)],ry:-Math.PI/2},
  {room:'karom',route:[P2(-13,-30.5),P2(-1,-30.5)],ry:-Math.PI/2},
  {room:'kavics',route:[P2(0,-50.6)],ry:Math.PI},
  {room:'test',route:[P2(-12,-53.5),P2(-12,-64.5),P2(12,-64.5),P2(12,-53.5)],ry:Math.PI/2,delay:14},
  {room:'test',route:[P2(1,-58.5)],ry:0,body:true},
  {room:'fust',route:[P2(-4,-75)],ry:Math.PI,senior:true},
  {room:'fust',route:[P2(4,-75)],ry:Math.PI,senior:true},
  {room:'kopocso',route:[P2(-9,-88.3)],ry:Math.PI*0.85},
  {room:'tuske',route:[P2(3,-99.5)],ry:Math.PI*0.8,senior:true},
  {room:'vizsga',route:[P2(-14,-108.5),P2(14,-108.5)],ry:-Math.PI/2},
  {room:'vizsga',route:[P2(-13,-117),P2(-13,-109),P2(13,-109),P2(13,-117)],ry:0},
  {room:'vizsga',route:[P2(10,-114),P2(-10,-114)],ry:Math.PI/2}];

A.FALU={LIGHTS,shojiM,ROOMS,GATES,DUMMIES,master,students,stepGates,stepDummies,lampGlow,XF};
})();
