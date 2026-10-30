(function(){
/* Árnyékerdő – 2. pálya: a mester rejtett hegyi faluja (díszlet és a próbák elrendezése).
   © 2026 Fejes Géza. Minden jog fenntartva.
   A falu délről északra tíz udvarra oszlik; mindegyik udvar egy próba. Az udvarokat bambuszkerítés választja el, kapukkal.
   Csak a ?palya=falu címmel fut, az erdei pályán semmit sem csinál. */
const A=window.AE;if(A.LV!=='falu')return;
const {scene,H,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const XF=16.5,LIGHTS=[],lampGlow=[];
/* ---------- textúrák: cserép, nád, papírfal (shōji), deszka ---------- */
function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
const tileTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#2b2e32';g.fillRect(0,0,w,h);for(let row=0;row<4;row++){const y=row*32;for(let k=0;k<5;k++){const x=k*32-(row%2)*16;
  const gr=g.createLinearGradient(x,0,x+32,0);gr.addColorStop(0,'#24272b');gr.addColorStop(0.5,'#4a4f55');gr.addColorStop(1,'#202326');g.fillStyle=gr;g.fillRect(x+1,y,30,30);}
  g.fillStyle='rgba(0,0,0,0.55)';g.fillRect(0,y+28,w,4);}},true);
const thatchTex=canvasTex(128,128,(g,w,h)=>{const r=mulberry32(5);g.fillStyle='#6b5a3e';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){const x=r()*w,y=r()*h,l=6+r()*14;g.strokeStyle=['rgba(140,118,78,0.6)','rgba(70,56,36,0.6)','rgba(160,140,96,0.45)'][i%3];g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-0.5)*2,y+l);g.stroke();}
  g.fillStyle='rgba(30,22,14,0.35)';for(let y=0;y<h;y+=32)g.fillRect(0,y,w,3);},true);
const shojiTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#f4e8cc';g.fillRect(0,0,w,h);g.fillStyle='#4a3626';for(let x=0;x<=w;x+=32)g.fillRect(x-2,0,4,h);for(let y=0;y<=h;y+=21)g.fillRect(0,y-2,w,3);g.fillRect(0,0,w,6);g.fillRect(0,h-8,w,8);});
const plankTex=canvasTex(128,128,(g,w,h)=>{const r=mulberry32(8);for(let i=0;i<8;i++){g.fillStyle=['#5a4430','#4e3a28','#614a34'][i%3];g.fillRect(0,i*16,w,16);g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(0,i*16+15,w,1);
  for(let k=0;k<6;k++){g.fillStyle='rgba(30,20,12,0.25)';g.fillRect(r()*w,i*16+r()*14,10+r()*30,1);}}},true);/* a falu oldalkerítése */
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
const wood=lam(0x5a4430),woodD=lam(0x3a2c20),red=lam(0xa8341f),roofM=lam(0x2c2a28),tileM=lam(0xffffff,{map:rep(tileTex.clone(),3.6,1.1)});tileM.map.needsUpdate=true;
function gate(id,x,z,kind){const g=new THREE.Group();g.position.set(x,H(x,z),z);scene.add(g);const hy=H(x,z);
  const cols=[];[-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,kind==='torii'?3.6:2.6,8),kind==='torii'?red:woodD);p.position.set(s*1.35,kind==='torii'?1.8:1.3,0);p.castShadow=true;g.add(p);
    const o={x:x+s*1.35,z,r:0.22,kind:'prop'};trees.push(o);addTo(grid,o);});
  if(kind==='torii'){/* kasagi felhajló végekkel, fekete tetővel; nuki átmenő gerendával; középen tábla; fekete lábazat */
    const kas=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.24,0.34),red);kas.position.y=3.62;g.add(kas);
    [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.24,0.34),red);e.position.set(s*2.08,3.68,0);e.rotation.z=s*0.16;g.add(e);
      const ec=new THREE.Mesh(new THREE.BoxGeometry(0.96,0.1,0.42),roofM);ec.position.set(s*2.1,3.84,0);ec.rotation.z=s*0.16;g.add(ec);
      const kam=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.19,0.32,10),roofM);kam.position.set(s*1.35,0.16,0);g.add(kam);});
    const cap=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.1,0.42),roofM);cap.position.y=3.79;g.add(cap);
    const nuki=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.16,0.18),red);nuki.position.y=3.0;g.add(nuki);
    const gk=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.5,0.1),roofM);gk.position.y=3.3;g.add(gk);}
  else{const beam=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.16,0.22),woodD);beam.position.y=2.5;g.add(beam);
    const rf=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.12,1.1),tileM);rf.position.y=2.68;rf.rotation.x=0;g.add(rf);
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
  const tt=tileTex.clone();tt.needsUpdate=true;rep(tt,XF*2,1.1);const t=new THREE.Mesh(new THREE.BoxGeometry(XF*2+0.3,0.18,1.1),lam(0xffffff,{map:tt}));t.position.set(0,H(0,wz)+3.42,wz);t.castShadow=true;scene.add(t);
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,XF*2+0.3,6),tile);ridge.rotation.z=Math.PI/2;ridge.position.set(0,H(0,wz)+3.56,wz);scene.add(ridge);
  wallCol(-XF,wz,XF,wz,0.45,0.55,false);}

/* ---------- házak a kerítésen kívül, és a dojo ---------- */
const plasterM=lam(0xcfc6b0),timberM=lam(0x3a2e24),thatchM=lam(0xffffff,{map:rep(thatchTex,1,1)}),tileRoofM=lam(0xffffff,{map:rep(tileTex.clone(),1,1)}),plankM=lam(0xffffff,{map:rep(plankTex,1,1)}),
  shojiM=new THREE.MeshLambertMaterial({color:0xffffff,map:shojiTex,emissive:0xb07a3a,emissiveMap:shojiTex,emissiveIntensity:0.6});tileRoofM.map.needsUpdate=true;
function prismRoof(w,d,h,mat){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(0,h);s.lineTo(w/2,0);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return new THREE.Mesh(g,mat);}
function house(x,z,ry,w,d,lit){const g=new THREE.Group();g.position.set(x,H(x,z),z);g.rotation.y=ry;scene.add(g);
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,2.8,d),plasterM);body.position.y=1.4;body.castShadow=true;body.receiveShadow=true;g.add(body);
  [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(q=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.2,2.9,0.2),timberM);p.position.set(q[0],1.45,q[1]);g.add(p);});
  const beam=new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.18,d+0.1),timberM);beam.position.y=2.75;g.add(beam);
  const tiled=(Math.round(x*7+z)%2)===0;const roof=prismRoof(w+1.4,d+1.2,tiled?1.9:2.4,tiled?tileRoofM:thatchM);roof.position.y=2.8;roof.rotation.y=Math.PI/2;roof.castShadow=true;g.add(roof);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.3,d+1.3),timberM);ridge.position.y=2.8+(tiled?1.9:2.4);ridge.rotation.y=Math.PI/2;g.add(ridge);
  /* engawa: deszkás tornác elöl, tolóajtók papírral */
  const eng=new THREE.Mesh(new THREE.BoxGeometry(w,0.12,1.1),plankM);eng.position.set(0,0.45,d/2+0.55);eng.receiveShadow=true;g.add(eng);
  [-w/2+0.2,0,w/2-0.2].forEach(px=>{const lg=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.45,0.1),timberM);lg.position.set(px,0.22,d/2+1.0);g.add(lg);});
  const n=Math.max(2,Math.round(w/1.6));for(let i=0;i<n;i++){const sh=new THREE.Mesh(new THREE.PlaneGeometry(w/n-0.08,1.9),lit||i%2?shojiM:plasterM);sh.position.set(-w/2+(i+0.5)*w/n,1.5,d/2+0.02);g.add(sh);}
  if(lit){[-1,1].forEach(s=>{const lp=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.42,10),new THREE.MeshLambertMaterial({color:0xd84030,emissive:0xff7030,emissiveIntensity:0.7}));lp.scale.set(1,1,1);lp.position.set(s*(w/2-0.4),2.35,d/2+0.95);g.add(lp);
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff9050,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));gl.scale.setScalar(1.6);gl.position.copy(lp.position);g.add(gl);lampGlow.push(gl);});}}
[[-21.5,38,Math.PI/2,6,5,1],[21.5,30,-Math.PI/2,6,5,1],[-21.5,10,Math.PI/2,7,5,0],[21.5,-2,-Math.PI/2,6,5,1],[-21.5,-30,Math.PI/2,6,5,1],[21.5,-42,-Math.PI/2,7,5,0],[-21.5,-62,Math.PI/2,6,5,1],[21.5,-74,-Math.PI/2,6,5,1],[-21.5,-86,Math.PI/2,6,5,0],[21.5,-98,-Math.PI/2,7,5,1],[-21.5,-110,Math.PI/2,6,5,1],[21.5,-120,-Math.PI/2,6,5,0]].forEach(q=>house(...q));
/* dojo az északi végén */
{const dz=-123.5,g=new THREE.Group();g.position.set(0,H(0,dz),dz);scene.add(g);const W=15,D=6.4;
  const floor=new THREE.Mesh(new THREE.BoxGeometry(W+2,0.7,D+2),timberM);floor.position.y=0.35;floor.receiveShadow=true;g.add(floor);
  const body=new THREE.Mesh(new THREE.BoxGeometry(W,3.2,D),plasterM);body.position.y=2.3;body.castShadow=true;g.add(body);
  for(let i=0;i<6;i++){const sh=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.4),shojiM);sh.position.set(-6.2+i*2.48,2.0,D/2+0.02);g.add(sh);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.5,0.06),timberM);fr.position.set(-7.4+i*2.48,2.0,D/2+0.04);g.add(fr);}
  for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,3.4,8),timberM);p.position.set(-7.6+i*2.53,2.4,D/2+0.9);g.add(p);}
  const dt=tileTex.clone();dt.needsUpdate=true;rep(dt,1,1);const roof=prismRoof(W+3.5,D+4,3.4,lam(0xffffff,{map:dt}));roof.position.y=3.9;
  const rdg=new THREE.Mesh(new THREE.BoxGeometry(W+3.7,0.42,0.5),lam(0x1e2124));rdg.position.y=7.35;g.add(rdg);[-1,1].forEach(s=>{const oni=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.8,0.6),lam(0x1e2124));oni.position.set(s*(W/2+1.9),7.45,0);g.add(oni);});
  for(let k=0;k<3;k++){const st=new THREE.Mesh(new THREE.BoxGeometry(4,0.23,0.5),lam(0x8a8478));st.position.set(0,0.12+k*0.23,D/2+1.0+1.2-k*0.45);st.receiveShadow=true;g.add(st);}
  [-1,1].forEach(s=>{const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,4.6,6),timberM);pole.position.set(s*3.4,2.3,D/2+2.6);g.add(pole);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.7,3.0),new THREE.MeshLambertMaterial({color:s<0?0x2a3a6a:0x7a2a24,side:THREE.DoubleSide}));fl.position.set(s*3.4+0.37*s,2.9,D/2+2.6);g.add(fl);});roof.rotation.y=Math.PI/2;roof.castShadow=true;g.add(roof);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.7),new THREE.MeshBasicMaterial({map:canvasTex(256,80,(c,w,h)=>{c.fillStyle='#2a1d14';c.fillRect(0,0,w,h);c.fillStyle='#e8dcc0';c.font='700 56px "Noto Serif JP",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('影道場',w/2,h/2+3);})}));
  sign.position.set(0,4.15,D/2+1.05);g.add(sign);
  const light=new THREE.PointLight(0xffb070,1.4,22,1.6);light.position.set(0,2.6,D/2+2.2);g.add(light);LIGHTS.push(light);
  wallCol(-W/2-1,dz+D/2+1.05,W/2+1,dz+D/2+1.05,0.45,0.6,false);}

/* ---------- kőlámpások (tōrō) ---------- */
const stoneM=lam(0x8a8880);
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
  {room:'csend',route:[P2(-6,30.5)],ry:Math.PI/2,listen:true},
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


/* ---------- lépőkövek (tobi-ishi) a kapuktól a kapukig ---------- */
{const pts=[[0,47],[0,36],[10,24],[-10,6],[10,-6],[2,-12.5],[2,-17.5],[0,-26],[-10,-40],[0,-52],[0,-66],[0,-78],[-10,-90],[0,-102],[0,-116]],list=[],r=mulberry32(19);
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(i===4)continue;const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(L/1.15);
    for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t+(r()-0.5)*0.35,z=a[1]+(b[1]-a[1])*t+(r()-0.5)*0.35;if(Math.abs(z+15)<1.4)continue;list.push({x,z,s:0.32+r()*0.12,a:r()*6.28,c:r()});}}
  const geo=new THREE.DodecahedronGeometry(1,0);const m=new THREE.InstancedMesh(geo,lam(0xffffff),list.length),D=new THREE.Object3D(),C=new THREE.Color();
  list.forEach((o,i)=>{D.position.set(o.x,H(o.x,o.z)+0.02,o.z);D.rotation.set(0,o.a,0);D.scale.set(o.s*1.25,0.07,o.s);D.updateMatrix();m.setMatrixAt(i,D.matrix);m.setColorAt(i,C.setHSL(0.08,0.05,0.24+o.c*0.1));});
  m.receiveShadow=true;scene.add(m);}
/* ---------- bambuszligetek a kerítéseken kívül ---------- */
{const r=mulberry32(23),stalks=[],tops=[],houseZ=[38,30,10,-2,-30,-42,-62,-74,-86,-98,-110,-120];
  for(let c=0;c<22;c++){const side=c%2?1:-1,cz=44-c*7.6+(r()-0.5)*3;if(houseZ.some(hz=>Math.abs(hz-cz)<4.2&&Math.sign(hz===38||hz===10||hz===-30||hz===-62||hz===-86||hz===-110?-1:1)===side))continue;
    const cx=side*(19+r()*5);for(let k=0;k<9;k++){const x=cx+(r()-0.5)*2.6,z=cz+(r()-0.5)*2.6,h=6+r()*4;stalks.push({x,z,h,c:r(),l:(r()-0.5)*0.08});}
    for(let k=0;k<4;k++)tops.push({x:cx+(r()-0.5)*2.4,z:cz+(r()-0.5)*2.4,y:6.5+r()*3,s:1.4+r()*0.8,c:r()});}
  const sg=new THREE.CylinderGeometry(0.045,0.055,1,6);sg.translate(0,0.5,0);const m=new THREE.InstancedMesh(sg,lam(0xffffff),stalks.length),D=new THREE.Object3D(),C=new THREE.Color();
  stalks.forEach((o,i)=>{D.position.set(o.x,H(o.x,o.z),o.z);D.rotation.set(o.l,0,o.l*0.7);D.scale.set(1,o.h,1);D.updateMatrix();m.setMatrixAt(i,D.matrix);m.setColorAt(i,C.setHSL(0.24+o.c*0.05,0.45,0.32+o.c*0.12));});scene.add(m);
  const lg=new THREE.IcosahedronGeometry(1,0);const lm=new THREE.InstancedMesh(lg,lam(0xffffff,{flatShading:true}),tops.length);
  tops.forEach((o,i)=>{D.position.set(o.x,H(o.x,o.z)+o.y,o.z);D.rotation.set(o.c*3,o.c*5,0);D.scale.set(o.s,o.s*0.7,o.s);D.updateMatrix();lm.setMatrixAt(i,D.matrix);lm.setColorAt(i,C.setHSL(0.26+o.c*0.05,0.4,0.24+o.c*0.1));});lm.castShadow=true;scene.add(lm);}
/* ---------- papírlámpások a kapuk gerendáján ---------- */
Object.values(GATES).forEach(G=>{if(G.kind!=='gate')return;[-1,1].forEach(s=>{const x=G.x+s*1.0,y=H(G.x,G.z)+2.05;const lp=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.36,10),new THREE.MeshLambertMaterial({color:0xf2e2c0,emissive:0xe08a40,emissiveIntensity:0.75}));lp.position.set(x,y,G.z+0.3);scene.add(lp);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb060,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));gl.scale.setScalar(1.5);gl.position.copy(lp.position);scene.add(gl);lampGlow.push(gl);});});

/* ---------- juhar- és cseresznyefák az udvarok sarkában ---------- */
const TREES2=[];
{const spots=[[-14,45.5,1],[14.5,34,0],[-14.5,26,1],[14.5,7,0],[-14.5,-4,1],[14.5,-36,0],[-14.5,-56,1],[14.5,-70,0],[-14.5,-81,1],[14.5,-94,0],[-14.5,-104,1],[14.5,-125,0]];
  const trunkM=lam(0x4a3628),r=mulberry32(37),blobs=[];
  spots.forEach(q=>{const [x,z,kind]=q,h=3.2+r()*0.8;const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.2,h,7),trunkM);tr.position.set(x,H(x,z)+h/2,z);tr.rotation.z=(r()-0.5)*0.15;tr.castShadow=true;scene.add(tr);
    for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.07,1.6,5),trunkM);const a=r()*6.28;b.position.set(x+Math.cos(a)*0.5,H(x,z)+h-0.2,z+Math.sin(a)*0.5);b.rotation.set(Math.sin(a)*0.8,0,-Math.cos(a)*0.8);scene.add(b);}
    for(let k=0;k<7;k++){const a=r()*6.28,rr=r()*1.4;blobs.push({x:x+Math.cos(a)*rr,y:H(x,z)+h+0.2+r()*1.1,z:z+Math.sin(a)*rr,s:0.8+r()*0.6,kind,c:r()});}
    const o={x,z,r:0.28,kind:'prop'};trees.push(o);addTo(grid,o);TREES2.push({x,z,kind});});
  const m=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),lam(0xffffff,{flatShading:true}),blobs.length),D=new THREE.Object3D(),C=new THREE.Color();
  blobs.forEach((b,i)=>{D.position.set(b.x,b.y,b.z);D.rotation.set(b.c*4,b.c*7,0);D.scale.set(b.s,b.s*0.75,b.s);D.updateMatrix();m.setMatrixAt(i,D.matrix);
    m.setColorAt(i,b.kind?C.setHSL(0.94+b.c*0.03,0.55,0.78+b.c*0.08):C.setHSL(0.02+b.c*0.04,0.75,0.42+b.c*0.1));});m.castShadow=true;scene.add(m);
  if(A.falling)A.falling.material.color.setHex(0xf0b0c4);}

/* ---------- érkezés: koi-tó híddal, gereblyézett kavicskert ---------- */
const KOI=[],GRAVEL=[{x0:-14,x1:-6.5,z0:39,z1:46}];
{const px=10,pz=42,R=2.7;
  const water=new THREE.Mesh(new THREE.CircleGeometry(R,28),new THREE.MeshPhongMaterial({color:0x1c3a40,shininess:110,specular:0x8ab0c0,transparent:true,opacity:0.92}));water.rotation.x=-Math.PI/2;water.scale.set(1.25,1,1);water.position.set(px,H(px,pz)+0.04,pz);scene.add(water);
  const r=mulberry32(53),rim=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),lam(0x6a6862,{flatShading:true}),36),D=new THREE.Object3D();
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2,x=px+Math.cos(a)*R*1.25*1.02,z=pz+Math.sin(a)*R*1.02;D.position.set(x,H(x,z)+0.05,z);D.rotation.set(r(),r()*6,r());const s=0.28+r()*0.18;D.scale.set(s,s*0.6,s);D.updateMatrix();rim.setMatrixAt(i,D.matrix);
    if(Math.abs(Math.sin(a))<0.35)continue;/* a híd két végénél nincs ütköző */const o={x,z,r:0.5,low:true,kind:'prop'};trees.push(o);addTo(grid,o);}
  scene.add(rim);
  /* ívelt fahíd kelet-nyugati irányban */
  const red2=lam(0x9a2e20),bw=1.2,L=R*2.5+1;for(let i=0;i<12;i++){const t=i/11,x=px-L/2+t*L,y=Math.sin(t*Math.PI)*0.35;const pl=new THREE.Mesh(new THREE.BoxGeometry(L/12+0.02,0.08,bw),plankM);pl.position.set(x,H(px,pz)+0.12+y,pz);pl.receiveShadow=true;scene.add(pl);}
  [-1,1].forEach(s=>{for(let i=0;i<=6;i++){const t=i/6,x=px-L/2+t*L,y=Math.sin(t*Math.PI)*0.35;const post=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.6,0.07),red2);post.position.set(x,H(px,pz)+0.42+y,pz+s*bw/2);scene.add(post);}
    const rail=new THREE.Mesh(new THREE.TorusGeometry(L/2,0.035,4,20,Math.PI),red2);rail.scale.set(1,0.35/(L/2)*1.2,1);rail.position.set(px,H(px,pz)+0.68,pz+s*bw/2);scene.add(rail);});
  /* tavirózsa-levelek és pontyok */
  for(let i=0;i<6;i++){const a=r()*6.28,rr=r()*R*0.8;const lp=new THREE.Mesh(new THREE.CircleGeometry(0.22+r()*0.1,10),lam(0x3e6a2c));lp.rotation.x=-Math.PI/2;lp.position.set(px+Math.cos(a)*rr*1.2,H(px,pz)+0.06,pz+Math.sin(a)*rr);scene.add(lp);}
  const koiM=[lam(0xe8602a),lam(0xf2efe6),lam(0xe8a030)];for(let i=0;i<5;i++){const k=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),koiM[i%3]);k.scale.set(0.55,0.35,1.6);scene.add(k);KOI.push({m:k,px,pz,r:0.8+r()*1.4,ph:r()*6.28,sp:0.25+r()*0.25,y:H(px,pz)+0.0});}}
{const g=GRAVEL[0],w=g.x1-g.x0,d=g.z1-g.z0,cx=(g.x0+g.x1)/2,cz=(g.z0+g.z1)/2;
  const tex=canvasTex(256,256,(c,W,Hh)=>{c.fillStyle='#8e8a80';c.fillRect(0,0,W,Hh);const r=mulberry32(61);for(let i=0;i<3000;i++){c.fillStyle=['rgba(80,76,68,0.4)','rgba(180,176,166,0.4)'][i%2];c.fillRect(r()*W,r()*Hh,1.5,1.5);}
    c.strokeStyle='rgba(60,56,50,0.6)';c.lineWidth=2;for(let y=6;y<Hh;y+=10){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}},true);tex.repeat.set(w/4,d/4);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lam(0xffffff,{map:tex}));m.rotation.x=-Math.PI/2;m.position.set(cx,H(cx,cz)+0.03,cz);m.receiveShadow=true;scene.add(m);
  /* három kő a kavicsban, körülöttük körkörös gereblyézés */
  [[-11.5,41.5,0.6],[-9,44,0.4],[-8.2,40.5,0.35]].forEach(q=>{const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),lam(0x5a5a56,{flatShading:true}));rk.scale.set(q[2]*1.2,q[2],q[2]);rk.position.set(q[0],H(q[0],q[1])+q[2]*0.5,q[1]);rk.castShadow=true;scene.add(rk);
    for(let k=1;k<=2;k++){const ring=new THREE.Mesh(new THREE.RingGeometry(q[2]*1.3+k*0.25,q[2]*1.3+k*0.25+0.04,24),new THREE.MeshBasicMaterial({color:0x8e887a}));ring.rotation.x=-Math.PI/2;ring.position.set(q[0],H(q[0],q[1])+0.035,q[1]);scene.add(ring);}
    const o={x:q[0],z:q[1],r:q[2]*1.1,low:true,kind:'rock'};trees.push(o);addTo(grid,o);});}
const gravelAt=(x,z)=>GRAVEL.some(g=>x>g.x0&&x<g.x1&&z>g.z0&&z<g.z1);

/* ---------- shishi-odoshi a csend udvarán: koppanáskor egy pillanatra elnyomja a lépteket ---------- */
const SHISHI={x:13.2,z:33.2,t:0,period:9,tip:0,maskT:0};
{const g=new THREE.Group();g.position.set(SHISHI.x,H(SHISHI.x,SHISHI.z),SHISHI.z);g.rotation.y=-0.6;scene.add(g);const bam=lam(0x8a9a4a),stone=lam(0x6a6a64,{flatShading:true});
  const basin=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.55,0.4,10),stone);basin.position.set(0,0.2,0.8);g.add(basin);const wtr=new THREE.Mesh(new THREE.CircleGeometry(0.38,12),new THREE.MeshPhongMaterial({color:0x22404a,shininess:90}));wtr.rotation.x=-Math.PI/2;wtr.position.set(0,0.41,0.8);g.add(wtr);
  const spout=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.1,6),bam);spout.rotation.x=Math.PI/2.4;spout.position.set(0,1.05,-0.55);g.add(spout);
  [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.8,6),bam);p.position.set(s*0.14,0.4,0);g.add(p);});
  const piv=new THREE.Group();piv.position.set(0,0.62,0);g.add(piv);const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,1.3,8),bam);tube.rotation.x=Math.PI/2;tube.position.z=0.1;piv.add(tube);
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(0.16,0),stone);rock.position.set(0,0.12,-0.55);g.add(rock);SHISHI.piv=piv;
  const o={x:SHISHI.x,z:SHISHI.z,r:0.7,low:true,kind:'prop'};trees.push(o);addTo(grid,o);}
function stepFalu(dt,t){KOI.forEach(k=>{k.ph+=dt*k.sp;const a=k.ph;k.m.position.set(k.px+Math.cos(a)*k.r*1.2,k.y,k.pz+Math.sin(a)*k.r*0.85);k.m.rotation.y=-a;});
  SHISHI.t+=dt;let knock=false;const ph=SHISHI.t%SHISHI.period;const fill=Math.min(1,ph/(SHISHI.period-0.6));let ang;
  if(ph<SHISHI.period-0.6)ang=-0.25+fill*0.45;else{ang=0.55-(ph-(SHISHI.period-0.6))*0.8;}
  if(SHISHI.last!=null&&SHISHI.last<SHISHI.period-0.25&&ph>=SHISHI.period-0.25)knock=true;SHISHI.last=ph;SHISHI.piv.rotation.x=ang;
  if(SHISHI.maskT>0)SHISHI.maskT-=dt;if(knock)SHISHI.maskT=1.6;return knock;}

A.FALU={TREES2,KOI,GRAVEL,gravelAt,SHISHI,stepFalu,LIGHTS,shojiM,ROOMS,GATES,DUMMIES,master,students,stepGates,stepDummies,lampGlow,XF};
})();
