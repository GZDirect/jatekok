(function(){
/* Shinobi – 5. pálya: Acélárnyak. Konténerkikötő kora reggel, napkeltekor.
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   Sík terep (H=0). Dél: rakparti bejárat (rajt). Közép: konténerlabirintus, keleten a víz. A z=-34 vonalon kerítés kapuval,
   mögötte az adminisztrációs udvar az irodakonténerrel. A nagy rakodódaru (x=8) ide-oda viszi a konténert a kerítés fölött.
   Járható: a kikötő területe a tömör konténerek nélkül (walkable/clampRoof). Csak a ?palya=kikoto címmel fut. */
const A=window.AE;if(A.LV!=='kikoto')return;
const {scene,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const R=mulberry32(905);
const XMIN=-27,XMAX=26.6,ZMIN=-59.5,ZMAX=59.5,FENCE_Z=-34,GATE={x0:-2,x1:2};

/* ---------- ütközés, járhatóság ---------- */
const solids=[];/* tömör téglalapok (konténerhalmok, pavilonok): ide nem lehet belépni, és a radar is ezeket rajzolja */
function col(x,z,r,low,tall){const o={x,z,r,low:!!low,tall:!!tall,kind:'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low,tall,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(step||0.8)));for(let i=0;i<=n;i++)col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low,tall);}
function solid(x0,x1,z0,z1,id,h){const s={id:id||'ct',x0,x1,z0,z1,h:h||2.6,on:true};solids.push(s);
  wallCol(x0+0.3,z0+0.3,x1-0.3,z0+0.3,0.55);wallCol(x0+0.3,z1-0.3,x1-0.3,z1-0.3,0.55);wallCol(x0+0.3,z0+0.3,x0+0.3,z1-0.3,0.55);wallCol(x1-0.3,z0+0.3,x1-0.3,z1-0.3,0.55);return s;}
const inRect=(r,x,z,m)=>x>r.x0-(m||0)&&x<r.x1+(m||0)&&z>r.z0-(m||0)&&z<r.z1+(m||0);
function walkable(x,z){if(x<XMIN||x>XMAX||z<ZMIN||z>ZMAX)return false;for(const s of solids)if(s.on&&inRect(s,x,z))return false;return true;}
function clampRoof(p){p.x=clamp(p.x,XMIN,XMAX);p.z=clamp(p.z,ZMIN,ZMAX);
  for(const s of solids){if(!s.on||!inRect(s,p.x,p.z,0.25))continue;const dl=p.x-(s.x0-0.25),dr=(s.x1+0.25)-p.x,dn=p.z-(s.z0-0.25),ds=(s.z1+0.25)-p.z,m=Math.min(dl,dr,dn,ds);
    if(m===dl)p.x=s.x0-0.26;else if(m===dr)p.x=s.x1+0.26;else if(m===dn)p.z=s.z0-0.26;else p.z=s.z1+0.26;}}

/* ---------- textúrák és anyagok ---------- */
function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
const asphalt=rep(canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a5c5e';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=70+Math.floor(R()*40);g.fillStyle='rgba('+v+','+v+','+(v+2)+',0.35)';g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}
  g.fillStyle='rgba(30,30,30,0.18)';for(let i=0;i<6;i++){g.beginPath();g.ellipse(R()*w,R()*h,10+R()*30,6+R()*16,R()*3,0,7);g.fill();}},true),14,32);
const ribTex=canvasTex(128,64,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(x,0,3,h);g.fillStyle='rgba(255,255,255,0.35)';g.fillRect(x+4,0,1,h);}
  g.fillStyle='rgba(90,50,30,0.25)';for(let i=0;i<40;i++)g.fillRect(R()*w,h*0.7+R()*h*0.3,1+R()*3,2+R()*8);g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);},true);
const ctM=new THREE.MeshLambertMaterial({map:rep(ribTex,3,1)});flashPatch(ctM);
const COLS=[0x8a3a2a,0x2a5a8a,0x3a6a4a,0x8a8e90,0xc06a2a,0xb89a3a,0xd0d0c8,0x6a2a3a,0x2a4a6a];
const concrete=lam(0xa8a49a),yellow=lam(0xd8b030),red=lam(0xb83a2a),dark=lam(0x2a2c30),metal=lam(0x7a8088),white=lam(0xe8e6e0);

/* ---------- talaj, rakpart, víz ---------- */
{const gr=new THREE.Mesh(new THREE.PlaneGeometry(56,124),lam(0xffffff,{map:asphalt}));gr.rotation.x=-Math.PI/2;gr.position.set(0,0,0);gr.receiveShadow=true;scene.add(gr);
  /* sárga sávjelölések a főúton és a darusínek */
  const lineM=new THREE.MeshBasicMaterial({color:0xd8b030});for(let z=-56;z<58;z+=6){const l=new THREE.Mesh(new THREE.PlaneGeometry(0.18,3),lineM);l.rotation.x=-Math.PI/2;l.position.set(-2.3,0.015,z);scene.add(l);}
  const railM=lam(0x6a6e72);[2,14].forEach(x=>{const r=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.12,108),railM);r.position.set(x,0.06,-4);scene.add(r);});
  const quay=new THREE.Mesh(new THREE.BoxGeometry(2,0.25,124),concrete);quay.position.set(26.4,0.1,0);quay.receiveShadow=true;scene.add(quay);
  const edge=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,124),yellow);edge.position.set(27.2,0.12,0);scene.add(edge);
  for(let z=-54;z<58;z+=12){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.34,0.7,10),dark);b.position.set(26.6,0.35,z);b.castShadow=true;scene.add(b);col(26.6,z,0.35,true);}
  const quayWall=new THREE.Mesh(new THREE.BoxGeometry(1,4,124),lam(0x6a6860));quayWall.position.set(27.9,-2,0);scene.add(quayWall);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshPhongMaterial({color:0x2e5466,shininess:70,specular:0x8ab0c0,transparent:true,opacity:0.94}));
  water.rotation.x=-Math.PI/2;water.position.set(478,-1.2,0);scene.add(water);A.KK_WATER=water;
  /* a két szélén és északon a kikötő folytatódik: aszfalt a távolba */
  const far=new THREE.Mesh(new THREE.PlaneGeometry(400,400),lam(0x6a6a68));far.rotation.x=-Math.PI/2;far.position.set(-173,-0.02,0);scene.add(far);
  const far2=new THREE.Mesh(new THREE.PlaneGeometry(56,300),lam(0x666664));far2.rotation.x=-Math.PI/2;far2.position.set(0,-0.02,-212);scene.add(far2);
  const far3=far2.clone();far3.position.set(0,-0.02,212);scene.add(far3);}

/* ---------- konténerek (instancolva) ---------- */
const CT=[];/* {x,z,len,lv,c} egy halom */
const COLX=[-21.8,-14.8,-7.8,17.2,19.6,23.6],SEG=[[34,46],[18,30],[2,14],[-14,-2],[-30,-18]];
const LVT=[[2,1,2,1,2],[1,2,0,2,1],[2,0,1,2,1],[1,2,1,2,0],[2,1,2,1,1],[1,2,0,1,2]];
COLX.forEach((x,ci)=>SEG.forEach((s,si)=>{const lv=LVT[ci][si];if(!lv)return;CT.push({x,z:(s[0]+s[1])/2,len:s[1]-s[0],lv});}));
/* a daru két végállomásán egy-egy konténer, erre teszi le a terhet */
CT.push({x:8,z:-12,len:6.1,lv:1,id:'pick'},{x:8,z:-46,len:6.1,lv:1,id:'drop'});
/* az irodaudvar szélein is van néhány */
CT.push({x:22.6,z:-48,len:12,lv:2},{x:-24.6,z:-54,len:6.1,lv:1});
CT.forEach(c=>{c.c=COLS[Math.floor(R()*COLS.length)];solid(c.x-1.22,c.x+1.22,c.z-c.len/2,c.z+c.len/2,c.id||'ct',c.lv*2.6);});
{const units=[];CT.forEach(c=>{for(let k=0;k<c.lv;k++){const n=Math.round(c.len/6.1);for(let j=0;j<n;j++)units.push({x:c.x,z:c.z-c.len/2+(j+0.5)*c.len/n,y:k*2.6+1.3,l:c.len/n-0.04,c:(k%2)&&R()<0.6?COLS[Math.floor(R()*COLS.length)]:c.c});}});
  const geo=new THREE.BoxGeometry(2.44,2.59,1);const im=new THREE.InstancedMesh(geo,ctM,units.length);const D=new THREE.Object3D(),TC=new THREE.Color();
  units.forEach((u,i)=>{D.position.set(u.x,u.y,u.z);D.scale.set(1,1,u.l);D.rotation.set(0,0,0);D.updateMatrix();im.setMatrixAt(i,D.matrix);im.setColorAt(i,TC.setHex(u.c));});
  im.castShadow=true;im.receiveShadow=true;scene.add(im);
  /* sarokvasak: sötét csíkok a konténerek tetején és alján */
  const rim=new THREE.InstancedMesh(new THREE.BoxGeometry(2.5,0.12,1),dark,units.length*2);let k=0;units.forEach(u=>{[u.y-1.24,u.y+1.24].forEach(y=>{D.position.set(u.x,y,u.z);D.scale.set(1,1,u.l+0.02);D.updateMatrix();rim.setMatrixAt(k++,D.matrix);});});scene.add(rim);}

/* ---------- Naruse konténere: nyitott ajtó, bent ládák és a boríték ---------- */
const NRS={x:-14.8,z:8,len:6.1};
{const g=new THREE.Group(),m=lam(0x3a3e44,{map:rep(ribTex.clone(),3,1)});m.map.needsUpdate=true;const L=NRS.len;
  const wall=(x,z,w,d)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,2.6,d),m);b.position.set(x,1.3,z);b.castShadow=true;b.receiveShadow=true;g.add(b);};
  wall(-1.17,0,0.1,L);wall(1.17,0,0.1,L);wall(0,-L/2,2.44,0.1);const roof=new THREE.Mesh(new THREE.BoxGeometry(2.44,0.1,L),m);roof.position.set(0,2.6,0);g.add(roof);
  const fl=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.06,L),lam(0x4a3a2a));fl.position.set(0,0.03,0);g.add(fl);
  /* kinyitott ajtószárnyak a déli végén */
  [-1,1].forEach(s=>{const d=new THREE.Mesh(new THREE.BoxGeometry(1.2,2.5,0.08),m);d.position.set(s*1.75,1.3,L/2+0.55);d.rotation.y=s*1.35;g.add(d);});
  const label=canvasTex(256,64,(c,w,h)=>{c.fillStyle='#3a3e44';c.fillRect(0,0,w,h);c.fillStyle='#e8e4d8';c.font='bold 34px sans-serif';c.fillText('NRSU 409217',12,44);});
  const lb=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.45),new THREE.MeshLambertMaterial({map:label}));lb.position.set(1.23,2.1,0);lb.rotation.y=Math.PI/2;g.add(lb);
  [[0.4,-1.6],[-0.5,-2.2],[0.3,-0.6]].forEach(q=>{const b=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.6,0.8),lam(0x8a6a44));b.position.set(q[0],0.3,q[1]);b.castShadow=true;g.add(b);});
  g.position.set(NRS.x,0,NRS.z);scene.add(g);
  /* bent csak a ládák állják az utat; a falak ütköznek és takarnak */
  wallCol(NRS.x-1.17,NRS.z-L/2,NRS.x-1.17,NRS.z+L/2,0.3);wallCol(NRS.x+1.17,NRS.z-L/2,NRS.x+1.17,NRS.z+L/2,0.3);wallCol(NRS.x-1.1,NRS.z-L/2,NRS.x+1.1,NRS.z-L/2,0.3);}
const PASS={x:NRS.x+0.3,z:NRS.z-0.6,m:null};/* a borítékok a középső ládán */
{const g=new THREE.Group();const e=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.22),lam(0xe8dcc0));e.position.y=0.62;g.add(e);const s=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.031,0.06),lam(0xa02a20));s.position.set(0.05,0.63,0);g.add(s);
  g.position.set(PASS.x,0,PASS.z);scene.add(g);PASS.m=g;}

/* ---------- kerítés a z=-34 vonalon, kapuval és portásfülkével ---------- */
{const mesh=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(190,196,200,0.9)';g.lineWidth=1.6;for(let i=-w;i<w*2;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i+h,0);g.lineTo(i,h);g.stroke();}});
  const fm=new THREE.MeshLambertMaterial({map:rep(mesh,1,1),transparent:true,alphaTest:0.3,side:THREE.DoubleSide});flashPatch(fm);
  const seg=(x0,x1)=>{const L=x1-x0,p=new THREE.Mesh(new THREE.PlaneGeometry(L,2.4),fm.clone());p.material.map=rep(mesh.clone(),L/1.4,2.4/1.4);p.material.map.needsUpdate=true;p.position.set((x0+x1)/2,1.2,FENCE_Z);scene.add(p);
    for(let x=x0;x<=x1+0.01;x+=3){const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.7,6),metal);post.position.set(x,1.35,FENCE_Z);scene.add(post);}
    const wire=new THREE.Mesh(new THREE.BoxGeometry(L,0.04,0.04),metal);wire.position.set((x0+x1)/2,2.62,FENCE_Z);scene.add(wire);
    wallCol(x0,FENCE_Z,x1,FENCE_Z,0.22,true,true,0.4);};
  seg(XMIN,GATE.x0);seg(GATE.x1,XMAX);
  /* sorompó és portásfülke a kapu mellett */
  const arm=new THREE.Mesh(new THREE.BoxGeometry(4,0.1,0.1),new THREE.MeshLambertMaterial({color:0xd83020}));arm.position.set(0,1.05,FENCE_Z+0.4);scene.add(arm);
  const booth=new THREE.Group();const bw=new THREE.Mesh(new THREE.BoxGeometry(2,2.5,2),white);bw.position.y=1.25;bw.castShadow=true;booth.add(bw);
  const bwin=new THREE.Mesh(new THREE.BoxGeometry(2.02,0.8,1.6),new THREE.MeshPhongMaterial({color:0x8ab0c8,shininess:80}));bwin.position.y=1.6;booth.add(bwin);
  const broof=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.15,2.3),dark);broof.position.y=2.55;booth.add(broof);booth.position.set(-3.2,0,FENCE_Z+1.4);scene.add(booth);
  solid(-4.2,-2.2,FENCE_Z+0.4,FENCE_Z+2.4,'booth',2.6);}

/* ---------- irodakonténer az udvaron (benne a rakományjegyzék) ---------- */
const OFF={x0:-20,x1:-12,z0:-48,z1:-44,door:-16};
{const g=new THREE.Group(),wm=lam(0xd8d4c8),winM=new THREE.MeshPhongMaterial({color:0x6a8aa0,shininess:90,specular:0xffffff});
  const W=(x,z,w,d,h,y,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h||2.7,d),m||wm);b.position.set(x,(y||0)+(h||2.7)/2,z);b.castShadow=true;b.receiveShadow=true;g.add(b);return b;};
  const cx=(OFF.x0+OFF.x1)/2,cz=(OFF.z0+OFF.z1)/2,LW=OFF.x1-OFF.x0,LD=OFF.z1-OFF.z0;
  W(cx,OFF.z0,LW,0.12);W(OFF.x0,cz,0.12,LD);W(OFF.x1,cz,0.12,LD);
  W((OFF.x0+OFF.door-0.6)/2,OFF.z1,OFF.door-0.6-OFF.x0,0.12);W((OFF.door+0.6+OFF.x1)/2,OFF.z1,OFF.x1-OFF.door-0.6,0.12);W(OFF.door,OFF.z1,1.2,0.12,0.5,2.2);
  [-18.4,-13.6].forEach(x=>W(x,OFF.z1+0.01,1.6,0.04,0.9,1.2,winM));W(OFF.x1+0.01,cz,0.04,1.8,0.9,1.2,winM);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(LW+0.4,0.18,LD+0.4),dark);roof.position.set(cx,2.79,cz);roof.castShadow=true;g.add(roof);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(LW,LD),lam(0x6a6458));fl.rotation.x=-Math.PI/2;fl.position.set(cx,0.02,cz);g.add(fl);
  W(-18.3,-46.6,1.6,0.8,0.76,0,lam(0x6a4a30));W(-14,-47.4,1.4,0.6,0.76,0,lam(0x6a4a30));W(-12.35,-46,0.4,1.4,1.8,0,lam(0x4a4e52));
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.05,0.3),new THREE.MeshBasicMaterial({color:0xfff4dc}));lamp.position.set(cx,2.68,cz);g.add(lamp);
  scene.add(g);
  wallCol(OFF.x0,OFF.z0,OFF.x1,OFF.z0,0.25);wallCol(OFF.x0,OFF.z0,OFF.x0,OFF.z1,0.25);wallCol(OFF.x1,OFF.z0,OFF.x1,OFF.z1,0.25);
  wallCol(OFF.x0,OFF.z1,OFF.door-0.7,OFF.z1,0.25);wallCol(OFF.door+0.7,OFF.z1,OFF.x1,OFF.z1,0.25);
  col(-18.3,-46.6,0.7,true);col(-14,-47.4,0.6,true);}
const MAN={x:-18.0,z:-46.4,m:null};
{const g=new THREE.Group();const f=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.04,0.24),lam(0x2a5a8a));f.position.y=0.8;f.rotation.y=0.3;g.add(f);
  const p=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.02,0.2),lam(0xf2ede0));p.position.y=0.83;p.rotation.y=0.36;g.add(p);g.position.set(MAN.x,0,MAN.z);scene.add(g);MAN.m=g;}

/* ---------- lámpaoszlopok: kampópont és karmokkal mászható ---------- */
const POLES=[[-24.8,-31],[24.4,-31],[-3.6,22],[-3.6,-22],[11.5,46]];
{const pm=lam(0x8a9096),head=new THREE.MeshBasicMaterial({color:0xfff0c8});
  POLES.forEach(q=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.18,7.2,8),pm);p.position.set(q[0],3.6,q[1]);p.castShadow=true;scene.add(p);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.12,0.12),pm);arm.position.set(q[0]+0.6,7.1,q[1]);scene.add(arm);
    const h=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.14,0.32),head);h.position.set(q[0]+1.2,7.0,q[1]);scene.add(h);
    const plat=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,0.08,10),pm);plat.position.set(q[0],6.9,q[1]);scene.add(plat);});}

/* ---------- kampópontok: konténerhalmok tetején, oszlopokon, az iroda tetején ---------- */
function addGiant(x,z,top,climb){const s=(top-0.85)/8.6,t={kind:'giant',x,z,s,c:R(),r:Math.max(0.3,1.05*s),col:1.6*s,cr:3.4*s,h:21*s,py:8.6*s,climb:!!climb,i:giants.length,kk:true};giants.push(t);return t;}
[[-21.8,40],[-21.8,8],[-21.8,-24],[-14.8,24],[-14.8,-8],[-7.8,40],[-7.8,-8],[17.2,24],[17.2,-8],[19.6,40],[19.6,8],[23.6,24],[23.6,-24],[22.6,-48]].forEach(q=>addGiant(q[0],q[1],5.2,false));
POLES.forEach(q=>{const g=addGiant(q[0],q[1],7.0,true);g.r=0.3;const o={x:q[0],z:q[1],r:0.25,kind:'prop'};trees.push(o);addTo(grid,o);});
addGiant(-16,-46,2.95,false).dropR=3.4;/* az iroda tetejéről a falakon kívülre ugrasz */

/* ---------- rakodódaru: a portál a síneken (x=2 és 14) jár, a terhet a kerítés fölött viszi ---------- */
const CRANE={zS:-12,zN:-46,z:-12,lift:0,st:'wait',t:9,dir:1,g:new THREE.Group(),load:null,spreader:null,perch:null,ride:false};
{const g=CRANE.g,leg=new THREE.BoxGeometry(0.7,15,0.7);
  [[2,-4.5],[2,4.5],[14,-4.5],[14,4.5]].forEach(q=>{const l=new THREE.Mesh(leg,yellow);l.position.set(q[0],7.5,q[1]);l.castShadow=true;g.add(l);});
  [2,14].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,10.5),yellow);s.position.set(x,0.6,0);g.add(s);const s2=s.clone();s2.position.y=14.6;g.add(s2);
    [-4.5,4.5].forEach(z=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.5,10),dark);w.rotation.z=Math.PI/2;w.position.set(x,0.35,z);g.add(w);});});
  [-4.5,4.5].forEach(z=>{const b=new THREE.Mesh(new THREE.BoxGeometry(13.4,1.1,0.9),yellow);b.position.set(8,15.2,z);b.castShadow=true;g.add(b);});
  const cab=new THREE.Mesh(new THREE.BoxGeometry(2,1.8,2),red);cab.position.set(3.4,13.6,0);g.add(cab);
  const cw=new THREE.Mesh(new THREE.BoxGeometry(2.02,0.8,1.6),new THREE.MeshPhongMaterial({color:0x8ab0c8,shininess:80}));cw.position.set(3.4,13.8,0);g.add(cw);
  const trol=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.9,2.4),dark);trol.position.set(8,15.9,0);g.add(trol);
  const sp=new THREE.Group();const fr=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.3,6.2),yellow);sp.add(fr);
  [[-0.9,-2.6],[0.9,-2.6],[-0.9,2.6],[0.9,2.6]].forEach(q=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1,4),dark);c.position.set(q[0],0.5,q[1]);c.name='cable';sp.add(c);});
  const load=new THREE.Mesh(new THREE.BoxGeometry(2.44,2.59,6.06),new THREE.MeshLambertMaterial({map:rep(ribTex.clone(),3,1),color:0xc06a2a}));load.material.map.needsUpdate=true;flashPatch(load.material);load.position.y=-1.45;load.castShadow=true;load.receiveShadow=true;sp.add(load);
  sp.position.set(8,6.6,0);g.add(sp);CRANE.spreader=sp;CRANE.load=load;
  g.position.z=CRANE.z;scene.add(g);
  /* lábak ütközése: a portál lábai mozognak, ezért kis kör, amit a frissítés tol */
  CRANE.legs=[[2,-4.5],[2,4.5],[14,-4.5],[14,4.5]].map(q=>{const o={x:q[0],z:CRANE.z+q[1],r:0.6,kind:'prop',dz:q[1]};return o;});
  CRANE.perch=addGiant(8,CRANE.z,5.2,false);CRANE.perch.crane=true;}
/* a teher teteje: 5,2 m a végállomásokon (a lerakott konténer tetején), 7,2 m menet közben */
function craneTop(){return 5.2+CRANE.lift*2;}
function stepCrane(dt){const C=CRANE;C.t-=dt;
  if(C.st==='wait'&&C.t<=0){C.st='up';C.t=2.2;}
  else if(C.st==='up'){C.lift=Math.min(1,C.lift+dt/2.2);if(C.t<=0){C.st='move';C.t=0;}}
  else if(C.st==='move'){const to=C.dir>0?C.zN:C.zS,sp=2.5;const d=to-C.z;const st=Math.sign(d)*Math.min(Math.abs(d),sp*dt);C.z+=st;if(Math.abs(to-C.z)<0.01){C.z=to;C.st='down';C.t=2.2;}}
  else if(C.st==='down'){C.lift=Math.max(0,C.lift-dt/2.2);if(C.t<=0){C.st='wait';C.t=11;C.dir*=-1;}}
  C.g.position.z=C.z;C.spreader.position.y=6.6+C.lift*2;C.spreader.children.forEach(o=>{if(o.name==='cable'){const L=15.4-(6.6+C.lift*2);o.scale.y=L;o.position.y=L/2+0.15;}});
  const p=C.perch,top=craneTop();p.z=C.z;p.s=(top-0.85)/8.6;p.py=8.6*p.s;
  /* a végállomáson a lerakott teher a kerítés két oldalán egy-egy halmot „magasít” */
  solids.forEach(s=>{if(s.id==='pick'||s.id==='drop'){const atS=Math.abs(C.z-C.zS)<0.1&&C.lift<0.05,atN=Math.abs(C.z-C.zN)<0.1&&C.lift<0.05;s.h=(s.id==='pick'?atS:atN)?5.2:2.6;}});}

/* ---------- díszlet: hajó a rakparton, távoli daruk, város a ködben ---------- */
{const hull=new THREE.Mesh(new THREE.BoxGeometry(16,9,110),lam(0x2a2e34));hull.position.set(40,1.5,-6);hull.castShadow=true;scene.add(hull);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(16.2,1.4,110.2),lam(0x8a2a22));stripe.position.set(40,-2.4,-6);scene.add(stripe);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(15,0.4,108),lam(0x5a5e62));deck.position.set(40,6.2,-6);scene.add(deck);
  const sup=new THREE.Mesh(new THREE.BoxGeometry(12,12,9),white);sup.position.set(40,12.4,40);sup.castShadow=true;scene.add(sup);
  for(let i=0;i<4;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(12.1,0.7,9.1),lam(0x3a4a5a));w.position.set(40,9+i*2.6,40);scene.add(w);}
  const funnel=new THREE.Mesh(new THREE.BoxGeometry(4,5,4),red);funnel.position.set(40,20.5,42);scene.add(funnel);
  const units=[];for(let z=-56;z<30;z+=6.3)for(let x=-1;x<=1;x++){const h=1+Math.floor(R()*3);for(let k=0;k<h;k++)units.push({x:40+x*2.5*1.8,z,y:6.4+k*2.6+1.3,c:COLS[Math.floor(R()*COLS.length)]});}
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(4.4,2.59,6.06),ctM,units.length),D=new THREE.Object3D(),TC=new THREE.Color();units.forEach((u,i)=>{D.position.set(u.x,u.y,u.z);D.updateMatrix();im.setMatrixAt(i,D.matrix);im.setColorAt(i,TC.setHex(u.c));});scene.add(im);
  const sil=lam(0x8a98a4);[[-60,-140,30],[-20,-150,36],[30,-160,32],[70,-150,28]].forEach(q=>{const g=new THREE.Group();[[-4,0],[4,0]].forEach(o=>{const l=new THREE.Mesh(new THREE.BoxGeometry(1,q[2],1),sil);l.position.set(o[0],q[2]/2,0);g.add(l);});
    const b=new THREE.Mesh(new THREE.BoxGeometry(30,2,2),sil);b.position.set(6,q[2],0);g.add(b);g.position.set(q[0],0,q[1]);scene.add(g);});
  const city=lam(0x9aa8b4);for(let i=0;i<26;i++){const h=10+R()*45,b=new THREE.Mesh(new THREE.BoxGeometry(8+R()*14,h,8+R()*10),city);b.position.set(-90-R()*80,h/2,-150+i*12);scene.add(b);}}

/* ---------- őrök útvonalai ---------- */
const routes={
  gate:[{x:0,z:-32.6}],
  road:[{x:-3,z:50},{x:-3,z:-30},{x:-1.5,z:-30},{x:-1.5,z:50}],
  crane:[{x:4.5,z:-28},{x:11.5,z:-28},{x:11.5,z:12},{x:4.5,z:12}],
  quay:[{x:25.6,z:44},{x:25.6,z:-30}],
  offW:[{x:-22,z:-38},{x:-6,z:-38},{x:-6,z:-56},{x:-22,z:-56}],
  maze:[{x:-11.2,z:44},{x:-11.2,z:-31},{x:-18.3,z:-31},{x:-18.3,z:44}],
  offE:[{x:6,z:-40},{x:20,z:-40},{x:20,z:-57},{x:6,z:-57}],
  office:[{x:-13.2,z:-46.6}],
  south:[{x:10,z:54},{x:22,z:54},{x:22,z:49},{x:10,z:49}],
  alley:[{x:21.6,z:44},{x:21.6,z:-31}]};

A.realTex(asphalt,'aszfalt');A.realTex(ribTex,'bordaslemez');A.skyImage('eg_hajnal',0.75);
A.ROOF=A.KIKOTO={rects:solids,walkable,clampRoof,CT,NRS,PASS,MAN,OFF,CRANE,stepCrane,craneTop,routes,FENCE_Z,GATE,
  EXIT:{x0:21,x1:26.6,z0:-59.5,z1:-56},
  actors:['guard','guard','guard','guard','guard','guard','guard','guard','guard','guard'],
  spots:{start:{x:0,z:56}}};
})();
