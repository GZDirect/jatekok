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
/* homlokzat: egy csempe 8 ablak széles és 8 emelet magas (kb. 16 × 28,8 m).
   Az ablakokban az ég tükröződik (fent világosabb), köztük osztóbordák és födémsávok; a csempe bal felső sarka a tetőszín (a tetőlapok UV-ja oda mutat). */
function facadeTex(seed,o){return canvasTex(512,512,(g,w,h)=>{const r=mulberry32(seed),cw=w/8,ch=h/8;g.fillStyle=o.wall;g.fillRect(0,0,w,h);
  for(let y=0;y<8;y++){if(o.band){g.fillStyle=o.band;g.fillRect(0,y*ch+ch-o.bandH,w,o.bandH);}
    for(let x=0;x<8;x++){const X=x*cw+o.px,Y=y*ch+o.py,W=cw-o.px*2,Hh=ch-o.py-o.bandH-2;const gr=g.createLinearGradient(0,Y,0,Y+Hh);
      const k=r();gr.addColorStop(0,o.top);gr.addColorStop(0.55,o.mid);gr.addColorStop(1,o.bot);g.fillStyle=gr;g.fillRect(X,Y,W,Hh);
      if(k<0.18){g.fillStyle='rgba(255,246,220,'+(0.18+r()*0.25)+')';g.fillRect(X,Y+Hh*0.25,W,Hh*0.75);}
      if(k>0.82){g.fillStyle='rgba(40,46,52,0.35)';g.fillRect(X,Y,W*(0.3+r()*0.6),Hh);}/* behúzott függöny */
      g.fillStyle='rgba(255,255,255,0.12)';g.beginPath();g.moveTo(X,Y+Hh);g.lineTo(X+W*0.35,Y);g.lineTo(X+W*0.5,Y);g.lineTo(X+W*0.15,Y+Hh);g.fill();/* csillanás */
      if(o.mull){g.fillStyle=o.mull;g.fillRect(X+W/2-1,Y,2,Hh);}}}
  g.fillStyle=o.roof;g.fillRect(0,0,10,10);},true);}
const FAC=[
  facadeTex(3,{wall:'#7d858d',band:'#5c646c',bandH:10,px:4,py:6,top:'#c9dcea',mid:'#6f8aa0',bot:'#2f3e4c',mull:'#59626a',roof:'#6a6e72'}),     /* üvegfalas iroda */
  facadeTex(5,{wall:'#b9b2a4',band:'#9c958a',bandH:14,px:12,py:12,top:'#a8bccb',mid:'#4a5a68',bot:'#26323c',mull:null,roof:'#8a857c'}),       /* kőburkolat, lyukablakok */
  facadeTex(7,{wall:'#3e464e',band:'#2e343a',bandH:8,px:2,py:4,top:'#9fc0d8',mid:'#3c5a74',bot:'#18242e',mull:'#2a3036',roof:'#4a4f54'}),     /* sötét üvegtorony */
  facadeTex(9,{wall:'#d4d0c6',band:'#b8b2a6',bandH:16,px:8,py:10,top:'#bcd0de',mid:'#5e7486',bot:'#2c3a46',mull:'#a8a296',roof:'#9a958a'})];  /* világos lakóház */
FAC.forEach(t=>{t.anisotropy=8;});
/* tetőburkolat: szigetelőlemez sávokkal, kavics, foltok, összefolyók */
const concreteTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(13);g.fillStyle='#8f9294';g.fillRect(0,0,w,h);
  for(let i=0;i<5000;i++){g.fillStyle=['rgba(70,72,74,0.22)','rgba(190,190,184,0.2)','rgba(110,106,98,0.18)'][i%3];const sz=1+r()*2.5;g.fillRect(r()*w,r()*h,sz,sz);}
  for(let i=0;i<14;i++){const x=r()*w,y=r()*h,rr=20+r()*70,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(50,52,50,0.18)');gr.addColorStop(1,'rgba(50,52,50,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
  g.fillStyle='rgba(230,230,224,0.22)';for(let x=0;x<w;x+=128){g.fillRect(x,0,3,h);}g.fillStyle='rgba(40,40,40,0.25)';for(let x=0;x<w;x+=128)g.fillRect(x+3,0,1,h);},true);
const latticeTex=canvasTex(64,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=7;g.strokeRect(3,0,w-6,h);g.lineWidth=5;g.beginPath();g.moveTo(3,0);g.lineTo(w-3,h/2);g.lineTo(3,h);g.stroke();g.lineWidth=4;g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();},true);

/* ---------- épület tömbök (UV a mérethez igazítva) ---------- */
const SU=16,SV=28.8;
function boxUV(w,h,d,su,sv){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;
  /* oldalak: +x,-x (d szélesség), +z,-z (w szélesség); a tető és az alj egyszínű (a csempe sarka) */
  const dims=[[d,h],[d,h],null,null,[w,h],[w,h]];for(let f=0;f<6;f++){const dm=dims[f];for(let k=0;k<4;k++){const i=f*4+k;if(!dm){uv.setXY(i,0.008,0.992);continue;}uv.setXY(i,uv.getX(i)*dm[0]/su,uv.getY(i)*dm[1]/sv);}}return g;}
function mergeGeos(list){let pos=[],nor=[],uv=[];list.forEach(g=>{const n=g.index?g.toNonIndexed():g;pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);uv.push(...n.attributes.uv.array);});
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return o;}
/* a két saját torony: tetejük y=0-nál, lefelé a mélybe */
const towerParts=[];
[[-12,12,41,63],[-22.5,22.5,-62.5,8.5]].forEach(q=>{const w=q[1]-q[0],d=q[3]-q[2],h=-DEEP+0.4;const g=boxUV(w,h,d,SU,SV);g.translate((q[0]+q[1])/2,DEEP/2-0.2,(q[2]+q[3])/2);towerParts.push(g);});
{const m=new THREE.Mesh(mergeGeos(towerParts),new THREE.MeshLambertMaterial({map:FAC[0]}));m.receiveShadow=true;scene.add(m);}
/* tetőburkolat */
[[-12,12,41,63],[-22.5,22.5,-62.5,8.5]].forEach(q=>{const t=concreteTex.clone();t.needsUpdate=true;t.repeat.set((q[1]-q[0])/8,(q[3]-q[2])/8);t.anisotropy=8;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(q[1]-q[0],q[3]-q[2]),flashPatch(new THREE.MeshLambertMaterial({map:t,color:0x9da1a5})));m.rotation.x=-Math.PI/2;m.position.set((q[0]+q[1])/2,0.01,(q[2]+q[3])/2);m.receiveShadow=true;scene.add(m);});
/* összefolyók és szellőzők a tetőn */
{const dm=new THREE.MeshLambertMaterial({color:0x3a3c3e});[[-6,50],[6,44],[-15,0],[12,-12],[-12,-46],[14,-56]].forEach(q=>{const d=new THREE.Mesh(new THREE.CircleGeometry(0.22,10),dm);d.rotation.x=-Math.PI/2;d.position.set(q[0],0.02,q[1]);scene.add(d);});
  const vm=lam(0xb8bcc0);[[-9,58],[9,43],[-20,4],[19.5,-60],[-20,-35]].forEach(q=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.9,10),vm);p.position.set(q[0],0.45,q[1]);scene.add(p);const c=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.22,0.18,10),vm);c.position.set(q[0],0.98,q[1]);scene.add(c);});
  /* napelemek a rajttorony tetején */
  const pv=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#1c2a44';g.fillRect(0,0,w,h);g.strokeStyle='#8a96a8';g.lineWidth=1;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,h);g.stroke();g.beginPath();g.moveTo(0,i*16);g.lineTo(w,i*16);g.stroke();}});
  const pm=new THREE.MeshPhongMaterial({map:pv,shininess:80,specular:0x8899aa});for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.06,1.6),pm);p.position.set(-6.5,0.7,52.5+i*2.2);p.rotation.x=-0.35;p.castShadow=true;scene.add(p);
    const leg=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.6,0.06),lam(0x8a8e92));leg.position.set(-6.5,0.35,53.1+i*2.2);scene.add(leg);}
  [52.5,54.7,56.9].forEach(z=>{col(-7.6,z,0.9,true);col(-5.4,z,0.9,true);});}
/* mellvéd a tetők szélén (1 m) */
const parapetM=lam(0x8c8a84),copingM=lam(0xb4b8bc);
function parapet(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),m=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.05,L),parapetM);m.position.set((x0+x1)/2,0.52,(z0+z1)/2);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;scene.add(m);
  const c=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.06,L+0.1),copingM);c.position.set((x0+x1)/2,1.07,(z0+z1)/2);c.rotation.y=ry;scene.add(c);}
parapet(-12,41.2,12,41.2);parapet(-12,62.8,12,62.8);parapet(-11.8,41,-11.8,63);parapet(11.8,41,11.8,63);
parapet(-22.5,8.3,22.5,8.3);parapet(-22.5,-62.3,22.5,-62.3);parapet(-22.3,-62.5,-22.3,8.5);
parapet(22.3,8.5,22.3,6.9);parapet(22.3,3.3,22.3,-26.5);/* a keleti oldalon a penthouse homlokzata a mellvéd */

/* ---------- a város a mélyben ---------- */
const NEAR=[],CARS=[];{const r=mulberry32(77),parts=[[],[],[],[]],crowns=[];let n=0,tries=0;
  while(n<170&&tries<3000){tries++;const a=r()*Math.PI*2,d=48+Math.pow(r(),0.8)*380,x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(Math.abs(x)<34&&z>-80&&z<75)continue;const w=14+r()*26,dd=14+r()*26,top=-135+Math.pow(r(),0.7)*(d<120?165:230);const h=top-DEEP,ty=n%4;
    const g=boxUV(w,h,dd,SU,SV);g.translate(x,DEEP+h/2,z);parts[ty].push(g);if(d<140)NEAR.push({x,z,w,d:dd,top,dist:d});
    /* lépcsőzetes felső szint és gépház a tetőn */
    if(r()<0.55&&h>60){const w2=w*(0.55+r()*0.25),d2=dd*(0.55+r()*0.25),h2=8+r()*22;const g2=boxUV(w2,h2,d2,SU,SV);g2.translate(x+(r()-0.5)*(w-w2)*0.6,top+h2/2,z+(r()-0.5)*(dd-d2)*0.6);parts[ty].push(g2);
      if(r()<0.6)crowns.push({x,z,y:top+h2,s:2+r()*3});}
    else crowns.push({x:x+(r()-0.5)*w*0.4,z:z+(r()-0.5)*dd*0.4,y:top,s:2+r()*4});
    n++;}
  parts.forEach((p,i)=>{if(!p.length)return;const m=new THREE.Mesh(mergeGeos(p),new THREE.MeshLambertMaterial({map:FAC[i]}));scene.add(m);});
  /* gépházak és antennák a háztetőkön */
  {const gb=new THREE.BoxGeometry(1,1,1),gm=new THREE.InstancedMesh(gb,lam(0x8c9094),crowns.length),am=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15,0.2,1,5),lam(0x6a6e72),crowns.length),D=new THREE.Object3D();
    crowns.forEach((c,i)=>{D.position.set(c.x,c.y+c.s*0.6,c.z);D.rotation.set(0,0,0);D.scale.set(c.s*2.2,c.s*1.2,c.s*1.8);D.updateMatrix();gm.setMatrixAt(i,D.matrix);
      D.position.set(c.x+c.s*0.6,c.y+c.s*1.2+c.s*2.5,c.z);D.scale.set(1,c.s*5,1);D.updateMatrix();am.setMatrixAt(i,D.matrix);});scene.add(gm);scene.add(am);}
  /* utca és járda */
  const street=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshLambertMaterial({color:0x4a4c4e}));street.rotation.x=-Math.PI/2;street.position.y=DEEP;scene.add(street);
  const lineM=new THREE.MeshBasicMaterial({color:0xd8d4c4});[[0,25,1400,0.4],[34,0,0.4,1400],[-38,0,0.4,1400]].forEach(q=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(q[2],q[3]),lineM);l.rotation.x=-Math.PI/2;l.position.set(q[0],DEEP+0.05,q[1]);scene.add(l);});
  /* autók az utcán: mozognak a sávokban */
  const carM=[0xc8302a,0xe8e8e2,0x2a2c30,0x3a6ab0,0xe0b030,0x8a8e92].map(c=>lam(c)),glassC=lam(0x1a2430);
  for(let i=0;i<46;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.8,4.4),carM[i%6]);b.position.y=0.55;g.add(b);const c=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.6,2.2),glassC);c.position.set(0,1.2,-0.2);g.add(c);
    const lane=i%4,axisX=lane<2;const pos=(r()*2-1)*320,sp=(9+r()*7)*(lane%2?1:-1);CARS.push({g,axisX,lane,pos,sp});
    if(axisX)g.rotation.y=Math.PI/2;g.position.y=DEEP;scene.add(g);}
  /* az alacsonyabb háztető, ahová a kábel vezet */
  const low=new THREE.Mesh(boxUV(40,110,40,SU,SV),new THREE.MeshLambertMaterial({map:FAC[1]}));low.position.set(70,DEEP+55,-130);scene.add(low);}

/* ---------- felhők ---------- */
{const ct=canvasTex(256,128,(g,w,h)=>{const r=mulberry32(29);g.clearRect(0,0,w,h);for(let i=0;i<26;i++){const x=40+r()*176,y=50+r()*40-Math.abs(x-128)*0.15,rr=18+r()*30,gr=g.createRadialGradient(x,y,0,x,y,rr);
    gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.6,'rgba(244,246,250,0.5)');gr.addColorStop(1,'rgba(240,244,248,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}});
  const r=mulberry32(31);for(let i=0;i<16;i++){const a=r()*Math.PI*2,d=320+r()*230;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,opacity:0.75+r()*0.2,depthWrite:false,fog:false}));
    const sc=160+r()*160;s.scale.set(sc,sc*0.45,1);s.position.set(Math.cos(a)*d,110+r()*120,Math.sin(a)*d);s.renderOrder=-7;scene.add(s);}}

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
  const mastH=12-DEEP;const lt=latticeTex.clone();lt.needsUpdate=true;lt.repeat.set(1,mastH/1.4);const latM=new THREE.MeshLambertMaterial({color:0xe0b020,map:lt,alphaTest:0.5,side:THREE.DoubleSide});const mast=new THREE.Mesh(new THREE.BoxGeometry(1.4,mastH,1.4),latM);mast.position.set(x,DEEP+mastH/2,z);scene.add(mast);
  for(let y=DEEP+4;y<12;y+=3){const d=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,1.5),metalD);d.position.set(x,y,z);scene.add(d);}
  const jt=latticeTex.clone();jt.needsUpdate=true;jt.center.set(0.5,0.5);jt.rotation=Math.PI/2;jt.repeat.set(1,30/0.9);const jib=new THREE.Mesh(new THREE.BoxGeometry(30,0.9,0.9),new THREE.MeshLambertMaterial({color:0xe0b020,map:jt,alphaTest:0.5,side:THREE.DoubleSide}));jib.position.set(x+9,12.6,z);jib.castShadow=true;scene.add(jib);
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
const glassRefl=canvasTex(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#cfe0ec');gr.addColorStop(0.45,'#88a2b6');gr.addColorStop(0.5,'#5c7284');gr.addColorStop(1,'#6e8496');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,0.35)';g.beginPath();g.moveTo(10,h);g.lineTo(60,0);g.lineTo(80,0);g.lineTo(30,h);g.fill();g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.moveTo(70,h);g.lineTo(110,0);g.lineTo(118,0);g.lineTo(78,h);g.fill();});
const glassM=new THREE.MeshPhongMaterial({color:0xffffff,map:glassRefl,transparent:true,opacity:0.24,shininess:90,specular:0xffffff,depthWrite:false,side:THREE.DoubleSide});
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
  const pq=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(41);g.fillStyle='#5a3e2a';g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=-1;x<4;x++){const o=(y%2)*32;g.fillStyle='hsl(28,'+(30+r()*10)+'%,'+(30+r()*10)+'%)';g.fillRect(x*64+o,y*16,64,16);g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x*64+o,y*16,1,16);g.fillRect(0,y*16+15,w,1);}
    for(let i=0;i<400;i++){g.fillStyle='rgba(20,10,4,0.12)';g.fillRect(r()*w,r()*h,6+r()*20,1);}},true);pq.repeat.set((PH.x1-PH.x0)/4,(PH.z1-PH.z0)/4);pq.anisotropy=8;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(PH.x1-PH.x0,PH.z1-PH.z0),lam(0xffffff,{map:pq}));floor.rotation.x=-Math.PI/2;floor.position.set((PH.x0+PH.x1)/2,0.02,(PH.z0+PH.z1)/2);floor.receiveShadow=true;scene.add(floor);}
/* bútorok: íróasztal, kanapé, tárgyalóasztal, cserepes növények */
const wood=lam(0x3a2a20),leather=lam(0x1e1c1c);
box(-2,-44,3.4,0.78,1.4,wood);col(-3.1,-44,0.75,true);col(-0.9,-44,0.75,true);
box(-2,-46.2,0.8,1.15,0.8,leather);
box(-6.4,-31,1.2,0.8,4,leather);col(-6.4,-30,0.7,true);col(-6.4,-32,0.7,true);
box(14.5,-37.5,7,0.76,2.2,wood);[-2.8,-0.9,0.9,2.8].forEach(k=>col(14.5+k,-37.5,1.0,true));
for(let i=0;i<4;i++){box(12+i*1.7,-35.6,0.6,1.0,0.6,leather);box(12+i*1.7,-39.4,0.6,1.0,0.6,leather);}
[[-7.2,-28,0.5],[6.2,-28,0.5],[20.6,-28,0.5]].forEach(q=>{box(q[0],q[1],0.6,0.6,0.6,lam(0x6a5a48));const p=new THREE.Mesh(new THREE.IcosahedronGeometry(0.55,0),lam(0x2f5a2a));p.position.set(q[0],1.0,q[1]);scene.add(p);col(q[0],q[1],0.45,true);});
/* belső részletek: mennyezeti lámpák, szőnyegek, könyvespolc, kép, monitor, tévé */
{const panelM=new THREE.MeshBasicMaterial({color:0xfff6e4});[[-5,-31],[-5,-38],[3,-31],[3,-46],[11,-31],[18,-31],[11,-44],[18,-44]].forEach(q=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.5),panelM);l.rotation.x=Math.PI/2;l.position.set(q[0],PH.h-0.02,q[1]);scene.add(l);});
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(PH.x1-PH.x0,PH.z1-PH.z0),lam(0xe8e6e0,{side:THREE.DoubleSide}));ceil.rotation.x=Math.PI/2;ceil.position.set((PH.x0+PH.x1)/2,PH.h-0.03,(PH.z0+PH.z1)/2);scene.add(ceil);
  const rug=(x,z,w,d,c)=>{const t=canvasTex(128,128,(g,W,Hh)=>{g.fillStyle=c[0];g.fillRect(0,0,W,Hh);g.strokeStyle=c[1];g.lineWidth=8;g.strokeRect(10,10,W-20,Hh-20);g.lineWidth=2;g.strokeRect(24,24,W-48,Hh-48);});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lam(0xffffff,{map:t}));m.rotation.x=-Math.PI/2;m.position.set(x,0.03,z);m.receiveShadow=true;scene.add(m);};
  rug(-2,-43.5,6,4.4,['#5a2a24','#c8a060']);rug(-5,-31,4,5,['#2e3a48','#9aa8b4']);rug(14.5,-37.5,9,4.4,['#3a3430','#8a7a68']);
  const books=canvasTex(128,128,(g,w,h)=>{const r=mulberry32(43);g.fillStyle='#3a2a20';g.fillRect(0,0,w,h);for(let row=0;row<4;row++){let x=2;while(x<w-4){const bw=4+r()*7;g.fillStyle='hsl('+(r()*360)+',35%,'+(25+r()*30)+'%)';g.fillRect(x,row*32+4,bw,24+r()*3);x+=bw+1;}g.fillStyle='#24180f';g.fillRect(0,row*32+29,w,3);}});
  const sh=new THREE.Mesh(new THREE.BoxGeometry(0.4,2.4,4.4),[lam(0x3a2a20,{map:books}),lam(0x3a2a20),lam(0x3a2a20),lam(0x3a2a20),lam(0x3a2a20),lam(0x3a2a20)]);sh.position.set(-7.6,1.2,-37.5);scene.add(sh);wallCol(-7.6,-35.5,-7.6,-39.5,0.35,false);
  const art=canvasTex(128,96,(g,w,h)=>{g.fillStyle='#e8e2d2';g.fillRect(0,0,w,h);g.fillStyle='#b8402e';g.beginPath();g.arc(84,40,22,0,Math.PI*2);g.fill();g.strokeStyle='#1a1a1a';g.lineWidth=5;g.beginPath();g.moveTo(10,80);g.quadraticCurveTo(50,30,118,70);g.stroke();});
  const pic=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.4),new THREE.MeshLambertMaterial({map:art}));pic.position.set(6.84,1.9,-42.5);pic.rotation.y=-Math.PI/2;scene.add(pic);
  const tv=new THREE.Mesh(new THREE.BoxGeometry(0.08,1.2,2.1),lam(0x111214));tv.position.set(7.2,1.8,-41.5);scene.add(tv);const scr=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.1),new THREE.MeshBasicMaterial({color:0x2a5a8a}));scr.position.set(7.25,1.8,-41.5);scr.rotation.y=Math.PI/2;scene.add(scr);
  const mon=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.55,0.05),lam(0x111214));mon.position.set(-2.4,1.15,-44.3);scene.add(mon);const ms=new THREE.Mesh(new THREE.PlaneGeometry(0.84,0.48),new THREE.MeshBasicMaterial({color:0x8ab4d8}));ms.position.set(-2.4,1.15,-44.27);scene.add(ms);
  const lampS=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.2,10,1,true),new THREE.MeshLambertMaterial({color:0xf0e4c8,emissive:0xd8b070,emissiveIntensity:0.5,side:THREE.DoubleSide}));lampS.position.set(-0.8,1.25,-44.2);scene.add(lampS);}
/* bejárati előtető */
{const c=new THREE.Mesh(new THREE.BoxGeometry(4,0.16,2.2),frameM);c.position.set(0.25,3.0,-26);c.castShadow=true;scene.add(c);}
/* terasz: fapadló, napozóágyak, napernyő */
{const dk=canvasTex(128,128,(g,w,h)=>{const r=mulberry32(47);for(let i=0;i<8;i++){g.fillStyle='hsl(26,'+(28+r()*8)+'%,'+(38+r()*8)+'%)';g.fillRect(0,i*16,w,15);g.fillStyle='rgba(0,0,0,0.45)';g.fillRect(0,i*16+15,w,1);}},true);dk.repeat.set(29.5/4,13.5/2);
  const deck=new THREE.Mesh(new THREE.PlaneGeometry(29.5,13.6),lam(0xffffff,{map:dk}));deck.rotation.x=-Math.PI/2;deck.position.set(6.75,0.025,-55.1);deck.receiveShadow=true;scene.add(deck);
  const white=lam(0xeeeae2);[11.5,14].forEach(x=>{const b=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.3,2.0),white);b.position.set(x,0.3,-55.5);b.castShadow=true;scene.add(b);const bk=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.6,0.1),white);bk.position.set(x,0.6,-54.5);bk.rotation.x=-0.6;scene.add(bk);col(x,-55.5,0.6,true);});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.5,6),metalD);pole.position.set(16.5,1.25,-57.5);scene.add(pole);
  const um=new THREE.Mesh(new THREE.ConeGeometry(1.6,0.5,10,1,true),new THREE.MeshLambertMaterial({color:0xe8e0cc,side:THREE.DoubleSide}));um.position.set(16.5,2.55,-57.5);um.castShadow=true;scene.add(um);col(16.5,-57.5,0.2,false);}
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

/* ---------- a közeli épületek részletei: erkélyek, tetőkert, reklámtábla, ablakmosó állvány ---------- */
NEAR.sort((a,b)=>a.dist-b.dist);
{const balc=[],r=mulberry32(83),railM=new THREE.MeshPhongMaterial({color:0xb8d0dc,transparent:true,opacity:0.5,shininess:80,depthWrite:false}),slabM=lam(0xd0ccc4);
  NEAR.slice(0,4).forEach((b,k)=>{if(k%2)return;/* erkélysorok a felénk néző oldalon */const fx=-Math.sign(b.x)||1,fz=-Math.sign(b.z)||1,alongX=Math.abs(b.z)>Math.abs(b.x);
    for(let y=b.top-4;y>DEEP+6&&y>-90;y-=3.6)for(let c=-1;c<=1;c+=2){const L=4.2;const x=alongX?b.x+c*b.w*0.25:b.x+fx*(b.w/2+0.6),z=alongX?b.z+fz*(b.d/2+0.6):b.z+c*b.d*0.25;balc.push({x,y,z,alongX,L});}});
  const sg=new THREE.BoxGeometry(1,1,1),sm=new THREE.InstancedMesh(sg,slabM,balc.length),rm=new THREE.InstancedMesh(sg,railM,balc.length),D=new THREE.Object3D();
  balc.forEach((q,i)=>{D.position.set(q.x,q.y,q.z);D.scale.set(q.alongX?q.L:1.2,0.18,q.alongX?1.2:q.L);D.updateMatrix();sm.setMatrixAt(i,D.matrix);D.position.y=q.y+0.55;D.scale.set(q.alongX?q.L:1.25,0.9,q.alongX?1.25:q.L);D.updateMatrix();rm.setMatrixAt(i,D.matrix);});
  scene.add(sm);scene.add(rm);
  /* tetőkert a legközelebbi alacsonyabb házakon */
  NEAR.filter(b=>b.top<-6).slice(0,2).forEach(b=>{const lawn=new THREE.Mesh(new THREE.PlaneGeometry(b.w*0.8,b.d*0.8),lam(0x4e7a3a));lawn.rotation.x=-Math.PI/2;lawn.position.set(b.x,b.top+0.05,b.z);scene.add(lawn);
    for(let k=0;k<5;k++){const tx=b.x+(r()-0.5)*b.w*0.6,tz=b.z+(r()-0.5)*b.d*0.6;const t=new THREE.Mesh(new THREE.IcosahedronGeometry(1+r(),0),lam(0x3e6a2e,{flatShading:true}));t.position.set(tx,b.top+1.6,tz);scene.add(t);
      const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,1.2,5),lam(0x5a4430));tr.position.set(tx,b.top+0.6,tz);scene.add(tr);}
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(b.w*0.25,b.d*0.15),new THREE.MeshPhongMaterial({color:0x3aa0c8,shininess:120}));pool.rotation.x=-Math.PI/2;pool.position.set(b.x+b.w*0.2,b.top+0.07,b.z-b.d*0.2);scene.add(pool);});
  /* reklámtáblák (felirat nélküli, színes grafika) a magasabb házak tetején */
  const adTex=[canvasTex(256,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#e83a5a');gr.addColorStop(1,'#f0a030');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();g.arc(70,64,40,0,Math.PI*2);g.fill();g.fillStyle='#e83a5a';g.beginPath();g.arc(70,64,22,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,0.85)';g.fillRect(130,40,100,14);g.fillRect(130,66,70,10);}),
    canvasTex(256,128,(g,w,h)=>{g.fillStyle='#1e3a6a';g.fillRect(0,0,w,h);g.fillStyle='#3ac0e8';for(let i=0;i<5;i++){g.beginPath();g.moveTo(20+i*44,110);g.lineTo(40+i*44,20+i*8);g.lineTo(60+i*44,110);g.fill();}g.fillStyle='#fff';g.fillRect(16,14,90,10);})];
  NEAR.filter(b=>b.top>-40).slice(0,2).forEach((b,k)=>{const W=Math.min(b.w*0.8,14),Hh=W*0.5,face=new THREE.Mesh(new THREE.PlaneGeometry(W,Hh),new THREE.MeshBasicMaterial({map:adTex[k%2],side:THREE.DoubleSide}));
    const ry=Math.atan2(-b.x,-b.z);face.position.set(b.x,b.top+2+Hh/2,b.z);face.rotation.y=ry;scene.add(face);
    [-1,1].forEach(s2=>{const leg=new THREE.Mesh(new THREE.BoxGeometry(0.25,2+Hh,0.25),metalD);leg.position.set(b.x+Math.cos(ry)*s2*W*0.4,b.top+(2+Hh)/2,b.z-Math.sin(ry)*s2*W*0.4);scene.add(leg);});});
  /* ablakmosó állvány egy szomszéd torony oldalán */
  {const b=NEAR[0];if(b){const fx=b.x+(-Math.sign(b.x)||1)*(b.w/2+0.9),y=b.top-25;const pl=new THREE.Group();pl.position.set(fx,y,b.z);scene.add(pl);
    const fl=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,4),metal);pl.add(fl);const rl=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,0.08),metalD);rl.position.set(0,0.5,2);pl.add(rl);const rl2=rl.clone();rl2.position.z=-2;pl.add(rl2);
    [-1.8,1.8].forEach(o=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,25,4),metalD);c.position.set(0,12.5,o);pl.add(c);});NEAR.rig=pl;NEAR.rigY=y;}}}

/* ---------- élet a városban: autók, madárraj, helikopter ---------- */
const BIRDS=[],HELI={t:-20};
{const bm=new THREE.MeshBasicMaterial({color:0x2a2c30,side:THREE.DoubleSide,fog:true});const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0.18,-0.55,0.05,-0.1,0,0,-0.18, 0,0,0.18,0.55,0.05,-0.1,0,0,-0.18],3));wg.computeVertexNormals();
  const r=mulberry32(91);for(let i=0;i<14;i++){const m=new THREE.Mesh(wg.clone(),bm);m.scale.setScalar(1.4);scene.add(m);BIRDS.push({m,ox:(r()-0.5)*14,oy:(r()-0.5)*4,oz:(r()-0.5)*14,ph:r()*6});}
  const hg=new THREE.Group();const hb=new THREE.Mesh(new THREE.SphereGeometry(1.4,10,8),lam(0x2a3a4a));hb.scale.set(1,0.9,1.9);hg.add(hb);const tail=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.35,5,6),lam(0x2a3a4a));tail.rotation.x=Math.PI/2;tail.position.z=3.6;hg.add(tail);
  const rot=new THREE.Mesh(new THREE.BoxGeometry(9,0.06,0.35),lam(0x18191b));rot.position.y=1.4;hg.add(rot);const sk=new THREE.Mesh(new THREE.BoxGeometry(2,0.08,3),lam(0x18191b));sk.position.y=-1.3;hg.add(sk);hg.visible=false;scene.add(hg);HELI.g=hg;HELI.rot=rot;}
function stepLife(dt,t){CARS.forEach(c=>{c.pos+=c.sp*dt;if(c.pos>330)c.pos=-330;if(c.pos<-330)c.pos=330;
    if(c.axisX){c.g.position.x=c.pos;c.g.position.z=c.lane===0?22.5:27.5;c.g.rotation.y=c.sp>0?Math.PI/2:-Math.PI/2;}else{c.g.position.z=c.pos;c.g.position.x=c.lane===2?31.5:36.5;c.g.rotation.y=c.sp>0?0:Math.PI;}});
  const a=t*0.12,cx=Math.cos(a)*70-10,cz=Math.sin(a)*70-20,cy=24+Math.sin(t*0.3)*4;BIRDS.forEach(b=>{const x=cx+b.ox+Math.sin(t*0.7+b.ph)*1.5,z=cz+b.oz+Math.cos(t*0.6+b.ph)*1.5;b.m.position.set(x,cy+b.oy,z);b.m.rotation.y=-a;b.m.rotation.z=Math.sin(t*9+b.ph)*0.6;});
  HELI.t+=dt;if(HELI.t>45)HELI.t=-15;const k=HELI.t/45;HELI.g.visible=HELI.t>0;if(HELI.t>0){HELI.g.position.set(-260+k*520,70+Math.sin(k*3)*6,-170+k*60);HELI.g.rotation.y=-Math.PI/2+0.1;HELI.rot.rotation.y+=dt*30;}
  if(NEAR.rig){NEAR.rig.position.y=NEAR.rigY+Math.sin(t*0.05)*8;}}

A.VAROS={glassM,stepLife,rects,walkable,clampRoof,GOND,stepGondola,CAMS,ANCHOR,PH,HOOKS,DEEP,
  /* szereplők: 0 Kuroda, 1-2 személyi testőr, 3-6 járőr (nehézség szerint), 7-8 erősítés */
  actors:['boss','guard','guard','patrol','patrol','patrol','patrol','reinf','reinf'],
  stair:{x:-18.5,z:-23.6},
  spots:{desk:{x:-2,z:-45.6,ry:Math.PI},meet:{x:14.5,z:-40.2,ry:0},terrace:{x:4,z:-56,ry:0},safe:{x:-5.5,z:-29.5}},
  routes:[[{x:-16,z:-1},{x:-16,z:-25},{x:-10.5,z:-25},{x:-10.5,z:-8}],[{x:17.5,z:1},{x:17.5,z:-23},{x:6,z:-23},{x:6,z:-7}],[{x:-14.5,z:-29},{x:-14.5,z:-58.5},{x:-3,z:-58.5}],[{x:2,z:-51.5},{x:17,z:-51.5},{x:17,z:-58.5},{x:9,z:-58.5}]]};
})();
