(function(){
/* Shinobi – 3. pálya: Üvegtorony. Két felhőkarcoló teteje nappal, a város a mélyben.
   © 2026 Fejes Géza. Minden jog fenntartva.
   A tetők síkja y=0 (H=0). Járható területek: téglalapok (VAROS.rects); ami nincs bennük, az a mélység.
   Csak a ?palya=varos címmel fut. */
const A=window.AE;if(A.LV!=='varos')return;
const {scene,H,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const DEEP=-150;/* az utca szintje */

/* ---------- járható téglalapok ---------- */
const rects=[
  {id:'A',x0:-11,x1:11,z0:42,z1:62,on:true},
  {id:'B',x0:-21.5,x1:21.5,z0:-61.5,z1:7.5,on:true},
  {id:'gond',x0:22.2,x1:25,z0:3.5,z1:6.7,on:true},      /* az ablakmosó kosár (mozog) */
  {id:'board',x0:21,x1:22.6,z0:3.8,z1:6.4,on:true},     /* beszállás a kosárba a déli végén */
  {id:'hatch',x0:20.8,x1:22.6,z0:-39,z1:-36,on:false}]; /* bejutás az ablakon át, ha a kosár ott áll */
function inRect(r,x,z,m){return r.on&&x>=r.x0-m&&x<=r.x1+m&&z>=r.z0-m&&z<=r.z1+m;}
function walkable(x,z){return rects.some(r=>inRect(r,x,z,0));}
function clampRoof(p){if(walkable(p.x,p.z))return;let best=null,bd=1e9;
  rects.forEach(r=>{if(!r.on)return;const x=clamp(p.x,r.x0,r.x1),z=clamp(p.z,r.z0,r.z1),d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best=[x,z];}});if(best){p.x=best[0];p.z=best[1];}}

/* ---------- ütközők ---------- */
function col(x,z,r,low,kind){const o={x,z,r,low:!!low,kind:kind||'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low,list){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/0.55));for(let i=0;i<=n;i++){const o=col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low);if(list)list.push(o);}}

/* ---------- textúrák ---------- */
function facadeTex(seed,base,win,lit){return canvasTex(256,256,(g,w,h)=>{const r=mulberry32(seed);g.fillStyle=base;g.fillRect(0,0,w,h);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const on=r();g.fillStyle=on<0.12?lit:win;g.fillRect(x*32+4,y*32+5,24,20);g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x*32+4,y*32+5,24,4);}
  g.fillStyle='rgba(0,0,0,0.18)';for(let y=0;y<8;y++)g.fillRect(0,y*32+28,w,3);},true);}
const FAC=[facadeTex(3,'#8a9096','#2e3a46','#9ab4c8'),facadeTex(5,'#b8b0a2','#34404a','#c8d4dc'),facadeTex(7,'#5a636c','#1e2a34','#7f9db4'),facadeTex(9,'#c9c6bd','#3d4c58','#d6e2ea')];
const concreteTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(13);g.fillStyle='#9fa3a6';g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){g.fillStyle=['rgba(80,80,76,0.18)','rgba(220,220,212,0.16)','rgba(60,60,58,0.12)'][i%3];g.fillRect(r()*w,r()*h,1+r()*3,1+r()*3);}
  g.strokeStyle='rgba(60,60,56,0.35)';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke();}},true);
concreteTex.repeat.set(1,1);

/* ---------- épület tömbök (UV a mérethez igazítva, hogy az ablakok ne nyúljanak) ---------- */
function boxUV(w,h,d,su,sv){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;
  /* oldalak: +x,-x (d szélesség), +y,-y, +z,-z (w szélesség) */
  const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++){const [a,b]=dims[f];for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*a/su,uv.getY(i)*b/sv);}}return g;}
function mergeGeos(list){let pos=[],nor=[],uv=[];list.forEach(g=>{const n=g.index?g.toNonIndexed():g;pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);uv.push(...n.attributes.uv.array);});
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return o;}
/* a két saját torony: tetejük y=0-nál, lefelé a mélybe */
const towerParts=[];
[[-12,12,41,63],[-22.5,22.5,-62.5,8.5]].forEach(q=>{const w=q[1]-q[0],d=q[3]-q[2],h=-DEEP+0.4;const g=boxUV(w,h,d,4,3.6);g.translate((q[0]+q[1])/2,DEEP/2-0.2,(q[2]+q[3])/2);towerParts.push(g);});
{const m=new THREE.Mesh(mergeGeos(towerParts),new THREE.MeshLambertMaterial({map:FAC[0]}));m.receiveShadow=true;scene.add(m);}
/* tetőburkolat */
[[-12,12,41,63],[-22.5,22.5,-62.5,8.5]].forEach(q=>{const t=concreteTex.clone();t.needsUpdate=true;t.repeat.set((q[1]-q[0])/4,(q[3]-q[2])/4);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(q[1]-q[0],q[3]-q[2]),flashPatch(new THREE.MeshLambertMaterial({map:t,color:0xb4b6b8})));m.rotation.x=-Math.PI/2;m.position.set((q[0]+q[1])/2,0.01,(q[2]+q[3])/2);m.receiveShadow=true;scene.add(m);});
/* mellvéd a tetők szélén (1 m) */
const parapetM=lam(0x8c8a84);
function parapet(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),m=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.05,L),parapetM);m.position.set((x0+x1)/2,0.52,(z0+z1)/2);m.rotation.y=Math.atan2(x1-x0,z1-z0);m.castShadow=true;m.receiveShadow=true;scene.add(m);}
parapet(-12,41.2,12,41.2);parapet(-12,62.8,12,62.8);parapet(-11.8,41,-11.8,63);parapet(11.8,41,11.8,63);
parapet(-22.5,8.3,22.5,8.3);parapet(-22.5,-62.3,22.5,-62.3);parapet(-22.3,-62.5,-22.3,8.5);
parapet(22.3,8.5,22.3,6.9);parapet(22.3,3.3,22.3,-26.5);/* a keleti oldalon a penthouse homlokzata a mellvéd */

/* ---------- a város a mélyben ---------- */
{const r=mulberry32(77),parts=[[],[],[],[]];let n=0,tries=0;
  while(n<170&&tries<3000){tries++;const a=r()*Math.PI*2,d=48+Math.pow(r(),0.8)*380,x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(Math.abs(x)<34&&z>-80&&z<75)continue;const w=14+r()*26,dd=14+r()*26,top=-135+Math.pow(r(),0.7)*(d<120?165:230);const h=top-DEEP;
    const g=boxUV(w,h,dd,4,3.6);g.translate(x,DEEP+h/2,z);parts[n%4].push(g);n++;}
  parts.forEach((p,i)=>{if(!p.length)return;const m=new THREE.Mesh(mergeGeos(p),new THREE.MeshLambertMaterial({map:FAC[i]}));scene.add(m);});
  /* utca és járda */
  const street=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshLambertMaterial({color:0x4a4c4e}));street.rotation.x=-Math.PI/2;street.position.y=DEEP;scene.add(street);
  const lineM=new THREE.MeshBasicMaterial({color:0xd8d4c4});[[0,25,1400,0.4],[34,0,0.4,1400],[-38,0,0.4,1400]].forEach(q=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(q[2],q[3]),lineM);l.rotation.x=-Math.PI/2;l.position.set(q[0],DEEP+0.05,q[1]);scene.add(l);});
  /* autók az utcán (apró dobozok) */
  const carM=[0xc8302a,0xe8e8e2,0x2a2c30,0x3a6ab0,0xe0b030].map(c=>new THREE.MeshLambertMaterial({color:c}));
  for(let i=0;i<40;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.4,4.4),carM[i%5]);const onX=i%2;c.position.set(onX?(r()*2-1)*300:(i%4<2?32:-36),DEEP+0.7,onX?23+(r()<0.5?-2:2):(r()*2-1)*300);if(onX)c.rotation.y=Math.PI/2;scene.add(c);}
  /* az alacsonyabb háztető, ahová a kábel vezet */
  const low=new THREE.Mesh(boxUV(40,110,40,4,3.6),new THREE.MeshLambertMaterial({map:FAC[1]}));low.position.set(70,DEEP+55,-130);scene.add(low);}

/* ---------- tetőépítmények ---------- */
const metal=lam(0x9aa0a6),metalD=lam(0x5a6066),acM=lam(0xc4c6c4),yellow=lam(0xe0b020),whiteM=lam(0xeae8e2);
function box(x,z,w,h,d,mat,y,ry){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,(y||0)+h/2,z);if(ry)m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
/* klímaberendezések: fedezék (eltakarnak) */
function acUnit(x,z,ry){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry||0;scene.add(g);const b=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.35,1.3),acM);b.position.y=0.68;b.castShadow=true;g.add(b);
  [-0.5,0.5].forEach(o=>{const f=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.06,16),metalD);f.position.set(o,1.37,0);g.add(f);});
  const c=Math.cos(ry||0),s=Math.sin(ry||0);[-0.65,0,0.65].forEach(k=>col(x+c*k,z-s*k,0.62,false));}
[[15.5,-4,0],[15.5,-9.5,0],[-6,-17,Math.PI/2],[3.5,-19.5,0],[-16,-33,Math.PI/2],[-16,-41,Math.PI/2],[-7,46,0],[7.5,47,0]].forEach(q=>acUnit(...q));
/* lépcsőházak (az erősítés innen jön) */
box(-18.5,-20.5,4.2,3.2,5,lam(0xb0aca2));wallCol(-20.6,-18,-16.4,-18,0.5,false);wallCol(-20.6,-23,-16.4,-23,0.5,false);wallCol(-20.6,-18,-20.6,-23,0.5,false);wallCol(-16.4,-18,-16.4,-23,0.5,false);
box(-18.5,-17.95,1.2,2.2,0.1,lam(0x4a4e54));
box(7,57,4,3,4.5,lam(0xb0aca2));[[5,55],[9,55],[5,59],[9,59],[7,57]].forEach(q=>col(q[0],q[1],1.3,false));
/* helikopter-leszálló */
{const pad=new THREE.Mesh(new THREE.CircleGeometry(6.5,40),lam(0x3c4046));pad.rotation.x=-Math.PI/2;pad.position.set(-11,0.03,-3);scene.add(pad);
  const ring=new THREE.Mesh(new THREE.RingGeometry(5.6,6.0,40),new THREE.MeshBasicMaterial({color:0xe8e4d4}));ring.rotation.x=-Math.PI/2;ring.position.set(-11,0.04,-3);scene.add(ring);
  const hTex=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#e8e4d4';g.fillRect(28,20,16,88);g.fillRect(84,20,16,88);g.fillRect(28,56,72,16);});
  const hm=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:hTex,transparent:true}));hm.rotation.x=-Math.PI/2;hm.position.set(-11,0.05,-3);scene.add(hm);}
/* virágládák a sövények alatt */
A.bushes.forEach(b=>{const m=box(b.x,b.z,2.6*b.s,0.45,2.6*b.s,lam(0x6a5a48));m.position.y=0.22;});

/* ---------- kampópontok: daru, víztorony, antenna (a giants listában, a világ fái helyett) ---------- */
const HOOKS=[];
{const g=giants[0],x=g.x,z=g.z;/* toronydaru a szakadék fölött */
  const mastH=12-DEEP;const mast=new THREE.Mesh(new THREE.BoxGeometry(1.4,mastH,1.4),yellow);mast.position.set(x,DEEP+mastH/2,z);scene.add(mast);
  for(let y=DEEP+4;y<12;y+=3){const d=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,1.5),metalD);d.position.set(x,y,z);scene.add(d);}
  const jib=new THREE.Mesh(new THREE.BoxGeometry(30,0.9,0.9),yellow);jib.position.set(x+9,12.6,z);jib.castShadow=true;scene.add(jib);
  const cj=new THREE.Mesh(new THREE.BoxGeometry(2,1.8,2.2),lam(0x8a8e92));cj.position.set(x-5,12,z);scene.add(cj);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,1.8),whiteM);cab.position.set(x,11.2,z+1.3);scene.add(cab);
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,0.12,16),metalD);plat.position.set(x,g.py-0.05,z);scene.add(plat);
  const hook=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.08,6,12),metalD);hook.position.set(x+18,7,z);scene.add(hook);const cb=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,5.4,4),metalD);cb.position.set(x+18,9.9,z);scene.add(cb);
  HOOKS.push({g,y:11.2*g.s});}
{const g=giants[1],x=g.x,z=g.z;/* víztorony a céltorony tetején */
  [[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].forEach(q=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,7.6,6),metalD);l.position.set(x+q[0],3.8,z+q[1]);l.castShadow=true;scene.add(l);});
  const tank=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,4,20),lam(0x7a6a58));tank.position.set(x,9.6,z);tank.castShadow=true;scene.add(tank);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.3,20),lam(0x5a4c40));roof.position.set(x,12.25,z);scene.add(roof);
  const walk=new THREE.Mesh(new THREE.CylinderGeometry(3.0,3.0,0.1,20,1,false),metal);walk.position.set(x,g.py-0.05,z);scene.add(walk);
  const rail=new THREE.Mesh(new THREE.TorusGeometry(3.0,0.04,4,30),metal);rail.rotation.x=Math.PI/2;rail.position.set(x,g.py+0.95,z);scene.add(rail);
  const lad=new THREE.Mesh(new THREE.BoxGeometry(0.5,7.6,0.06),metalD);lad.position.set(x,3.8,z+1.55);scene.add(lad);
  HOOKS.push({g,y:11.2*g.s});}
{const g=giants[2],x=g.x,z=g.z;/* antenna a penthouse tetején, alatta tartóoszlop az irodában */
  const pil=new THREE.Mesh(new THREE.BoxGeometry(0.7,3.6,0.7),lam(0xd8d4ca));pil.position.set(x,1.8,z);pil.castShadow=true;scene.add(pil);
  const ms=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,9,6),metal);ms.position.set(x,3.6+4.5,z);scene.add(ms);
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,0.1,14),metal);plat.position.set(x,g.py-0.05,z);scene.add(plat);
  const dish=new THREE.Mesh(new THREE.SphereGeometry(0.7,12,8,0,Math.PI*2,0,Math.PI/2.6),whiteM);dish.rotation.x=Math.PI/2.2;dish.position.set(x+0.5,10.6,z);scene.add(dish);
  HOOKS.push({g,y:11.2*g.s});}
/* halvány jel a kampóponton (a játék a lombot világítaná) */
HOOKS.forEach(h=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xbfeaf2,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.scale.setScalar(3.2);s.position.set(h.g.x,h.y,h.g.z);scene.add(s);h.spr=s;});
A.glowGiant=(i,k)=>{if(i<0||!HOOKS[i])return;HOOKS[i].spr.material.opacity=k*0.8;};

/* ---------- a penthouse: üvegfalú iroda a céltorony tetején ---------- */
const glassM=new THREE.MeshPhongMaterial({color:0x9fc4d8,transparent:true,opacity:0.22,shininess:90,specular:0xffffff,depthWrite:false,side:THREE.DoubleSide});
const blindTex=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#d8d2c4';g.fillRect(0,0,w,h);g.fillStyle='rgba(90,80,64,0.35)';for(let y=0;y<h;y+=6)g.fillRect(0,y,w,2);},true);
const blindM=new THREE.MeshLambertMaterial({map:blindTex,side:THREE.DoubleSide});
const wallM=lam(0xd8d4ca),frameM=lam(0x2a2e33);
const PH={x0:-8,x1:21.5,z0:-48,z1:-27,h:3.6};
function panel(x0,z0,x1,z1,kind){/* kind: glass | blind | wall */const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;
  const mat=kind==='glass'?glassM:kind==='blind'?blindM:wallM;const m=new THREE.Mesh(new THREE.BoxGeometry(kind==='wall'?0.3:0.06,PH.h,L),mat);m.position.set(cx,PH.h/2,cz);m.rotation.y=ry;if(kind!=='glass'){m.castShadow=true;}m.receiveShadow=true;scene.add(m);
  if(kind!=='wall'){const n=Math.max(1,Math.round(L/2.4));for(let i=0;i<=n;i++){const t=i/n,f=new THREE.Mesh(new THREE.BoxGeometry(0.1,PH.h,0.1),frameM);f.position.set(x0+(x1-x0)*t,PH.h/2,z0+(z1-z0)*t);scene.add(f);}
    const top=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,L),frameM);top.position.set(cx,PH.h-0.06,cz);top.rotation.y=ry;scene.add(top);}
  const list=[];wallCol(x0,z0,x1,z1,0.32,kind==='glass',list);return{m,list};}
/* déli fal: az iroda előtt redőny, középen bejárat, a tárgyaló előtt üveg */
panel(-8,-27,-1,-27,'blind');panel(1.5,-27,21.5,-27,'glass');
/* északi fal: az iroda felől üveg (kilátás a teraszra), a tárgyaló felől redőny */
panel(-8,-48,-1,-48,'glass');panel(1.5,-48,7,-48,'glass');panel(7,-48,21.5,-48,'blind');
/* nyugati fal: beton; keleti homlokzat: üveg, benne a nyitható ablakkal */
panel(-8,-27,-8,-48,'wall');panel(21.5,-27,21.5,-36,'glass');panel(21.5,-39,21.5,-48,'glass');
const hatch=panel(21.5,-36,21.5,-39,'glass');
/* belső fal az iroda és a tárgyaló között, ajtóval */
panel(7,-27,7,-35.5,'wall');panel(7,-38.5,7,-48,'wall');
/* tető, középen tetőablak az antenna mellett */
{const roofM=lam(0x9a9890);[[-8.3,-4,-48.3,-26.7],[0,21.8,-48.3,-26.7],[-4,0,-48.3,-44],[-4,0,-39,-26.7]].forEach(q=>{const w=q[1]-q[0],d=q[3]-q[2];const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.3,d),roofM);m.position.set((q[0]+q[1])/2,PH.h+0.15,(q[2]+q[3])/2);m.castShadow=true;m.receiveShadow=true;scene.add(m);});
  const sky=new THREE.Mesh(new THREE.BoxGeometry(4,0.08,5),glassM);sky.position.set(-2,PH.h+0.2,-41.5);scene.add(sky);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(PH.x1-PH.x0,PH.z1-PH.z0),lam(0x6a5444));floor.rotation.x=-Math.PI/2;floor.position.set((PH.x0+PH.x1)/2,0.02,(PH.z0+PH.z1)/2);floor.receiveShadow=true;scene.add(floor);}
/* bútorok: íróasztal, kanapé, tárgyalóasztal, cserepes növények */
const wood=lam(0x3a2a20),leather=lam(0x1e1c1c);
box(-2,-44,3.4,0.78,1.4,wood);col(-3.1,-44,0.75,true);col(-0.9,-44,0.75,true);
box(-2,-46.2,0.8,1.15,0.8,leather);
box(-6.4,-31,1.2,0.8,4,leather);col(-6.4,-30,0.7,true);col(-6.4,-32,0.7,true);
box(14.5,-37.5,7,0.76,2.2,wood);[-2.8,-0.9,0.9,2.8].forEach(k=>col(14.5+k,-37.5,1.0,true));
for(let i=0;i<4;i++){box(12+i*1.7,-35.6,0.6,1.0,0.6,leather);box(12+i*1.7,-39.4,0.6,1.0,0.6,leather);}
[[-7.2,-28,0.5],[6.2,-28,0.5],[20.6,-28,0.5]].forEach(q=>{box(q[0],q[1],0.6,0.6,0.6,lam(0x6a5a48));const p=new THREE.Mesh(new THREE.IcosahedronGeometry(0.55,0),lam(0x2f5a2a));p.position.set(q[0],1.0,q[1]);scene.add(p);col(q[0],q[1],0.45,true);});
/* terasz: korlát üvegből, a sarokban a menekülő kábel */
{const rail=new THREE.Mesh(new THREE.BoxGeometry(44.6,1.1,0.05),glassM);rail.position.set(0,0.55,-62.1);scene.add(rail);}
const ANCHOR={x:18.6,z:-60.2};
{const post=box(ANCHOR.x,ANCHOR.z,0.35,2.4,0.35,metalD);const top=new THREE.Vector3(ANCHOR.x,2.3,ANCHOR.z),end=new THREE.Vector3(70,DEEP+110.2,-130);
  const L=top.distanceTo(end),cab=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,L,5),lam(0x2a2c30));cab.position.copy(top).add(end).multiplyScalar(0.5);cab.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(top).normalize());scene.add(cab);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x7fd3e6,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.scale.setScalar(2.4);s.position.set(ANCHOR.x,2.4,ANCHOR.z);scene.add(s);ANCHOR.spr=s;
  col(ANCHOR.x,ANCHOR.z,0.3,false);}

/* ---------- ablakmosó kosár a keleti homlokzaton ---------- */
const GOND={z:5.1,z0:5.1,z1:-37.5,dir:0,mesh:new THREE.Group()};
{const g=GOND.mesh;scene.add(g);const fl=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.12,3.2),metal);fl.position.y=0.02;g.add(fl);
  [[1.25,0],[-1.25,0]].forEach(q=>{const r=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.05,3.2),metalD);r.position.set(q[0],0.55,0);g.add(r);});
  const r2=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.05,0.06),metalD);r2.position.set(0,0.55,1.6);g.add(r2);const r3=r2.clone();r3.position.z=-1.6;g.add(r3);
  [-1.2,1.2].forEach(o=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,8,4),metalD);c.position.set(0,4.5,o);g.add(c);});
  const sq=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,2.6),lam(0xd8a020));sq.position.set(-0.6,0.3,0);g.add(sq);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});}
/* sín a homlokzat tetején */
{const rail=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,46),metalD);rail.position.set(23.6,8.2,-15.5);scene.add(rail);
  [-37,-15,6].forEach(z=>{const a=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.2,0.2),metalD);a.position.set(22.6,8.2,z);scene.add(a);const p=new THREE.Mesh(new THREE.BoxGeometry(0.2,8.2,0.2),metalD);p.position.set(21.6,4.1,z);scene.add(p);});}
function stepGondola(dt){if(GOND.dir){const tgt=GOND.dir>0?GOND.z1:GOND.z0,sg=Math.sign(tgt-GOND.z);GOND.z+=sg*Math.min(Math.abs(tgt-GOND.z),2.6*dt);if(Math.abs(tgt-GOND.z)<0.01){GOND.z=tgt;GOND.dir=0;}}
  GOND.mesh.position.set(23.6,0,GOND.z);const r=rects[2];r.z0=GOND.z-1.5;r.z1=GOND.z+1.5;
  rects[3].on=Math.abs(GOND.z-GOND.z0)<0.05;const at=Math.abs(GOND.z-GOND.z1)<0.05;rects[4].on=at;hatch.list.forEach(o=>o.off=at);hatch.m.visible=!at;}
stepGondola(0);

/* ---------- biztonsági kamerák ---------- */
const CAMS=[];
function camera3(x,z,y,yaw,amp,per){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const arm=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,0.5),metalD);arm.position.z=0.2;g.add(arm);
  const head=new THREE.Group();g.add(head);const body=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.22,0.5),whiteM);body.position.z=-0.15;head.add(body);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.06,10),new THREE.MeshBasicMaterial({color:0x111111}));lens.rotation.x=Math.PI/2;lens.position.z=-0.42;head.add(lens);
  const led=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,5),new THREE.MeshBasicMaterial({color:0xff2020}));led.position.set(0.09,0.08,-0.38);head.add(led);
  const coneL=7,cone=new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.4)*coneL,coneL,20,1,true),new THREE.MeshBasicMaterial({color:0xff4030,transparent:true,opacity:0.05,depthWrite:false,side:THREE.FrontSide,fog:false}));
  cone.geometry.translate(0,-coneL/2,0);cone.rotation.x=Math.PI/2+0.32;cone.position.z=-0.42;head.add(cone);
  CAMS.push({x,z,y,yaw,amp,per,head,cone,led,aw:0,range:15,ph:Math.random()*6});}
camera3(-8.4,-26.6,3.3,Math.PI*0.86,0.62,9);   /* penthouse délnyugati sarka: a kertet és a helikopter-leszállót nézi */
camera3(21.2,-26.6,3.3,-Math.PI*0.8,0.5,8);    /* délkeleti sarok: a keleti oldalt nézi */
camera3(-16.3,-23.3,3.0,Math.PI*0.2,0.5,10);   /* lépcsőház: a nyugati sávot nézi */

A.VAROS={rects,walkable,clampRoof,GOND,stepGondola,CAMS,ANCHOR,PH,HOOKS,DEEP,
  /* szereplők: 0 Kuroda, 1-2 személyi testőr, 3-6 járőr (nehézség szerint), 7-8 erősítés */
  actors:['boss','guard','guard','patrol','patrol','patrol','patrol','reinf','reinf'],
  stair:{x:-18.5,z:-23.6},
  spots:{desk:{x:-2,z:-45.6,ry:Math.PI},meet:{x:14.5,z:-40.2,ry:0},terrace:{x:4,z:-56,ry:0},safe:{x:-5.5,z:-29.5}},
  routes:[[{x:-16,z:-1},{x:-16,z:-25},{x:-10.5,z:-25},{x:-10.5,z:-8}],[{x:17.5,z:1},{x:17.5,z:-23},{x:6,z:-23},{x:6,z:-7}],[{x:-14.5,z:-29},{x:-14.5,z:-58.5},{x:-3,z:-58.5}],[{x:2,z:-51.5},{x:17,z:-51.5},{x:17,z:-58.5},{x:9,z:-58.5}]]};
})();
