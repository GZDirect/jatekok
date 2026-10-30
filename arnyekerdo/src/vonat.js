(function(){
/* Shinobi – 4. pálya: Hegyi expressz. Mori magánvonata délben robog a hegyek között.
   © 2026 Fejes Géza. Minden jog fenntartva.
   A vonat áll a világ közepén, a táj mozog alatta (V m/s, a menetirány a −z).
   Kocsik hátulról előre: kilátókocsi (rajt) · tehervagon (a tetején kell átmenni) · fülkés személykocsi · konténeres pőrekocsi ·
   étkezőkocsi · szalonkocsi (Mori) · mozdony (vészfék). A padló magassága kocsinként más (AE.H). Csak a ?palya=vonat címmel fut. */
const A=window.AE;if(A.LV!=='vonat')return;
const {scene,H,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const CARS={};[['loco',-62,-44,0],['salon',-42,-22,0],['dining',-20,0,0],['flat',2,22,1.1],['pass',24,44,0],['box',46,66,3.0],['obs',68,82,0]].forEach(q=>CARS[q[0]]={id:q[0],z0:q[1],z1:q[2],h:q[3]});
const CW=1.6;/* a kocsi fél szélessége (belül járható) */

/* ---------- járható téglalapok és visszahúzás ---------- */
const rects=[];Object.values(CARS).forEach(c=>rects.push({id:c.id,x0:-CW,x1:CW,z0:c.z0,z1:c.z1,on:true}));
[[-44,-42],[-22,-20],[0,2],[22,24],[44,46],[66,68]].forEach(q=>rects.push({id:'gw',x0:-0.62,x1:0.62,z0:q[0],z1:q[1],on:true}));
function walkable(x,z){return rects.some(r=>r.on&&x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);}
function clampRoof(p){if(walkable(p.x,p.z))return;let best=null,bd=1e9;rects.forEach(r=>{const x=clamp(p.x,r.x0,r.x1),z=clamp(p.z,r.z0,r.z1),d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best=[x,z];}});if(best){p.x=best[0];p.z=best[1];}}
function col(x,z,r,low){const o={x,z,r,low:!!low,kind:'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/0.45));for(let i=0;i<=n;i++)col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low);}

/* ---------- textúrák ---------- */
function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
/* oldalfal: 4 m-enként egy ablak (átlátszó), kívül bordó lakk aranycsíkkal, belül diófa burkolat */
function sideTex(outer,body,trim){return canvasTex(512,256,(g,w,h)=>{g.fillStyle=body;g.fillRect(0,0,w,h);
  if(outer){g.fillStyle=trim;g.fillRect(0,h*0.68,w,6);g.fillRect(0,h*0.74,w,2);g.fillStyle='rgba(255,255,255,0.07)';g.fillRect(0,0,w,h*0.08);}
  else{for(let i=0;i<14;i++){g.fillStyle='rgba(30,16,8,0.14)';g.fillRect(0,i*18+(i%3),w,1);}g.fillStyle='#2a180e';g.fillRect(0,h*0.62,w,5);}
  g.clearRect(w*0.12,h*0.2,w*0.76,h*0.4);g.strokeStyle=outer?trim:'#c8a060';g.lineWidth=5;g.strokeRect(w*0.12,h*0.2,w*0.76,h*0.4);});}
const outerTex=sideTex(true,'#5e1a22','#c8a048'),innerTex=sideTex(false,'#5a3a24');
const boxTex=canvasTex(256,128,(g,w,h)=>{g.fillStyle='#24324a';g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,0.25)';for(let x=0;x<w;x+=16)g.fillRect(x,0,2,h);g.fillStyle='#d8d0b8';g.fillRect(10,h*0.62,w-20,3);g.fillStyle='rgba(120,70,40,0.35)';for(let i=0;i<30;i++)g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1+Math.random()*10);},true);
const carpetTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#5a1e26';g.fillRect(0,0,w,h);g.strokeStyle='#8a5a2a';g.lineWidth=2;for(let i=0;i<w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i+16,h/2);g.lineTo(i,h);g.stroke();}g.fillStyle='rgba(0,0,0,0.15)';for(let i=0;i<300;i++)g.fillRect(Math.random()*w,Math.random()*h,1,1);},true);
const woodFloor=canvasTex(128,128,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=['#7a5236','#6a4630','#80583a'][i%3];g.fillRect(i*16,0,16,h);g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(i*16,0,1,h);}},true);
const plateTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#6a6e72';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,0.12)';for(let y=0;y<h;y+=8)for(let x=(y/8%2)*8;x<w;x+=16){g.fillRect(x,y,6,2);}},true);
const ctTex=(c1,c2)=>canvasTex(128,64,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,0.22)';for(let x=0;x<w;x+=6)g.fillRect(x,0,2,h);g.fillStyle=c2;g.fillRect(8,8,30,8);g.fillStyle='rgba(255,255,255,0.2)';g.fillRect(0,0,w,3);},true);

/* ---------- a vonat (egy csoportban, enyhén ring) ---------- */
const trainG=new THREE.Group();scene.add(trainG);
const add=(m,shadow)=>{if(shadow!==false){m.castShadow=true;m.receiveShadow=true;}trainG.add(m);return m;};
const box=(x,y,z,w,h,d,mat,sh)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+h/2,z);return add(m,sh);};
const black=lam(0x18191b),metalD=lam(0x4a4e52),metal=lam(0x8a9096),gold=lam(0xc8a048),wood=lam(0x5a3622),leather=lam(0x3a1e18),cream=lam(0xeae2cc),glassM=new THREE.MeshPhongMaterial({color:0xbcd4e0,transparent:true,opacity:0.18,shininess:90,depthWrite:false,side:THREE.DoubleSide});
const CURT=lam(0x6a1a22),BRASS=new THREE.MeshPhongMaterial({color:0xc8a048,shininess:80,specular:0xffe0a0}),SCON=new THREE.MeshLambertMaterial({color:0xf8ecd0,emissive:0xe0b070,emissiveIntensity:0.8}),
  SCONG=new THREE.SpriteMaterial({map:glowTex,color:0xffc880,transparent:true,opacity:0.45,depthWrite:false,blending:THREE.AdditiveBlending}),
  SUNM=new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending});
const outerM=new THREE.MeshLambertMaterial({map:outerTex,alphaTest:0.5,side:THREE.DoubleSide}),innerM=new THREE.MeshLambertMaterial({map:innerTex,alphaTest:0.5,side:THREE.DoubleSide});
/* alváz és forgóvázak minden kocsi alatt */
function chassis(c,col){const L=c.z1-c.z0,cz=(c.z0+c.z1)/2;box(0,-0.55,cz,3.3,0.5,L,col||black);
  [c.z0+2.6,c.z1-2.6].forEach(z=>{box(0,-1.0,z,2.4,0.4,2.6,metalD);[-1,1].forEach(s=>[-0.7,0.7].forEach(o=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.14,14),metalD);w.rotation.z=Math.PI/2;w.position.set(s*0.75,-1.02,z+o);add(w,false);}));});}
/* utaskocsi teste: padló, mennyezet, két oldalfal ablakokkal (kívül-belül), tető, végfalak ajtóval */
function coach(c,floorMat){const L=c.z1-c.z0,cz=(c.z0+c.z1)/2,Hh=2.6;chassis(c);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(2*CW+0.1,L),floorMat);fl.rotation.x=-Math.PI/2;fl.position.set(0,0.01,cz);add(fl,false).receiveShadow=true;
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(2*CW+0.2,L),cream);ce.rotation.x=Math.PI/2;ce.position.set(0,Hh,cz);add(ce,false);
  [-1,1].forEach(s=>{const ot=outerTex.clone();ot.needsUpdate=true;rep(ot,L/4,1);const om=outerM.clone();om.map=ot;const o=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh+0.3),om);o.rotation.y=s*Math.PI/2;o.position.set(s*(CW+0.14),Hh/2-0.15,cz);add(o);
    const it=innerTex.clone();it.needsUpdate=true;rep(it,L/4,1);const im=innerM.clone();im.map=it;const i=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh),im);i.rotation.y=-s*Math.PI/2;i.position.set(s*(CW+0.06),Hh/2,cz);add(i,false);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh*0.4),glassM);gl.rotation.y=s*Math.PI/2;gl.position.set(s*(CW+0.1),Hh*0.6,cz);add(gl,false);});
  {const rg=new THREE.CylinderGeometry(2.4,2.4,L,16,1,true,Math.PI-0.78,1.56);rg.rotateX(Math.PI/2);rg.scale(1,0.4,1);const roof=new THREE.Mesh(rg,lam(0x3a3c40,{side:THREE.DoubleSide}));roof.position.set(0,Hh-0.68,cz);add(roof);for(let z=c.z0+3;z<c.z1-2;z+=5){const v=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.22,1.0),lam(0x55585c));v.position.set(0,Hh+0.3,z);add(v);}}
  [c.z0,c.z1].forEach(z=>{box(-1.25,0,z,0.8,Hh,0.12,wood);box(1.25,0,z,0.8,Hh,0.12,wood);box(0,2.15,z,1.7,Hh-2.15,0.12,wood);wallCol(-CW,z,-0.88,z,0.2);wallCol(0.88,z,CW,z,0.2);});
  /* ablakonként: függöny két oldalt, fali lámpa, a napfény foltja a padlón; fent csomagtartó */
  [-1,1].forEach(s=>{for(let z=c.z0+2;z<c.z1-1;z+=4){[-1.55,1.55].forEach(o=>{const cu=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.15,0.32),CURT);cu.position.set(s*(CW+0.02),1.6,z+o);trainG.add(cu);});
      const val=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.16,3.4),CURT);val.position.set(s*(CW+0.01),2.18,z);trainG.add(val);
      const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,0.16,8),SCON);sc.position.set(s*(CW-0.03),1.95,z+2);trainG.add(sc);const sg=new THREE.Sprite(SCONG);sg.scale.setScalar(0.7);sg.position.set(s*(CW-0.1),1.95,z+2);trainG.add(sg);
      if(s<0){const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.0,2.4),SUNM);sp.rotation.x=-Math.PI/2;sp.position.set(-0.75,0.025,z+0.4);trainG.add(sp);}}
    const rack=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.04,L-0.6),BRASS);rack.position.set(s*(CW-0.25),2.25,cz);trainG.add(rack);
    for(let z=c.z0+1;z<c.z1;z+=2){const br=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.12,0.03),BRASS);br.position.set(s*(CW-0.22),2.18,z);trainG.add(br);}});
  /* mennyezeti lámpák */for(let z=c.z0+2;z<c.z1-1;z+=4){const l=new THREE.Mesh(new THREE.PlaneGeometry(0.5,1.2),new THREE.MeshBasicMaterial({color:0xfff2d8}));l.rotation.x=Math.PI/2;l.position.set(0,Hh-0.02,z);add(l,false);}}
/* átjárók: harmonikás fal, padlólemez */
[[-44,-42],[-22,-20],[0,2],[22,24],[44,46],[66,68]].forEach(q=>{const z=(q[0]+q[1])/2,h0=H(0,q[0]+0.01),h1=H(0,q[1]-0.01);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.3,Math.hypot(2,h1-h0)),lam(0x6a6e72,{map:plateTex}));pl.rotation.x=-Math.PI/2+Math.atan2(h1-h0,2);pl.position.set(0,(h0+h1)/2+0.02,z);add(pl,false);
  if(Math.abs(h1-h0)<0.5){[-1,1].forEach(s=>{const b=box(s*0.72,h0,z,0.12,2.3,2,lam(0x2a2c2e));});const t=box(0,h0+2.3,z,1.56,0.12,2,lam(0x2a2c2e));}
  wallCol(-0.75,q[0],-0.75,q[1],0.12);wallCol(0.75,q[0],0.75,q[1],0.12);});
/* létra a tehervagon két végén */
function ladder(z,dir){const g=new THREE.Group();g.position.set(0,0,z);trainG.add(g);[-0.32,0.32].forEach(x=>{const r=new THREE.Mesh(new THREE.BoxGeometry(0.05,3.2,0.05),metal);r.position.set(x,1.6,0);g.add(r);});
  for(let y=0.3;y<3.1;y+=0.32){const s=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.64,5),metal);s.rotation.z=Math.PI/2;s.position.set(0,y,0);g.add(s);}g.rotation.x=dir*0.75;}
ladder(67,-1);ladder(45,1);

/* ===== 7. kilátókocsi (rajt): hátsó nyitott peron, szalon kanapékkal ===== */
{const c=CARS.obs;coach({z0:68,z1:80},lam(0xffffff,{map:rep(carpetTex.clone(),2,8)}));chassis({z0:80,z1:82});
  const pf=new THREE.Mesh(new THREE.PlaneGeometry(3.3,2),lam(0x6a4a30,{map:rep(woodFloor.clone(),2,1)}));pf.rotation.x=-Math.PI/2;pf.position.set(0,0.015,81);add(pf,false);
  [-1,1].forEach(s=>{box(s*1.62,0,81,0.06,1.05,2,gold);});box(0,0.95,81.95,3.3,0.06,0.06,gold);for(let x=-1.5;x<=1.5;x+=0.3)box(x,0,81.95,0.03,0.95,0.03,gold);
  wallCol(-CW,82,CW,82,0.15,true);
  box(-1.15,0,73,0.8,0.45,3.5,lam(0x2a4a3a));box(-1.45,0.45,73,0.25,0.5,3.5,lam(0x2a4a3a));col(-1.15,72,0.5,true);col(-1.15,74,0.5,true);
  box(1.15,0,76,0.8,0.45,2.6,lam(0x2a4a3a));box(1.45,0.45,76,0.25,0.5,2.6,lam(0x2a4a3a));col(1.15,75.4,0.5,true);col(1.15,76.6,0.5,true);
  box(0.9,0,78.8,0.5,0.6,0.5,wood);const lamp=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.25,10,1,true),new THREE.MeshLambertMaterial({color:0xf0e2c0,emissive:0xd8b070,emissiveIntensity:0.6,side:THREE.DoubleSide}));lamp.position.set(0.9,0.9,78.8);add(lamp,false);}

/* ===== 6. tehervagon: zárt doboz, a tetején deszkajárda ===== */
{const c=CARS.box,L=c.z1-c.z0,cz=(c.z0+c.z1)/2;chassis(c);const bt=boxTex.clone();bt.needsUpdate=true;rep(bt,L/4,1);
  box(0,0,cz,3.3,2.98,L,lam(0xffffff,{map:bt}));const rw=new THREE.Mesh(new THREE.PlaneGeometry(0.9,L),lam(0x7a5a3a,{map:rep(woodFloor.clone(),1,L/2)}));rw.rotation.x=-Math.PI/2;rw.position.set(0,3.0,cz);add(rw,false);
  for(let z=c.z0+1;z<c.z1;z+=2.5)box(0,2.98,z,3.3,0.06,0.12,metalD);
  [-1,1].forEach(s=>{box(s*1.66,0.3,cz-3,0.06,2.3,2.4,lam(0x1a2840));box(s*1.7,1.4,cz-3,0.05,0.08,2.6,metal);});}

/* ===== 5. fülkés személykocsi: folyosó jobb oldalt, négy fülke tolóajtóval, a két végén előtér ===== */
{const c=CARS.pass;coach(c,lam(0xffffff,{map:rep(carpetTex.clone(),2,10)}));
  box(-0.5,0,42,2.2,2.6,0.08,wood);wallCol(-CW,42,0.55,42,0.15);
  for(let k=0;k<4;k++){const zA=c.z0+2+4*k;
    box(-0.5,0,zA,2.2,2.6,0.08,wood);wallCol(-CW,zA,0.55,zA,0.15);
    box(0.62,0,zA+0.6,0.08,2.6,1.2,wood);box(0.62,0,zA+3.4,0.08,2.6,1.2,wood);box(0.62,2.1,zA+2,0.08,0.5,1.6,wood);
    wallCol(0.62,zA,0.62,zA+1.15,0.15);wallCol(0.62,zA+2.85,0.62,zA+4,0.15);
    const door=new THREE.Mesh(new THREE.BoxGeometry(0.05,2.0,1.2),glassM);door.position.set(0.68,1.0,zA+0.6);add(door,false);
    [zA+0.45,zA+3.55].forEach((z,j)=>{box(-0.55,0,z,2.1,0.45,0.6,lam(0x6a2a2a));box(-0.55,0.45,z+(j?0.24:-0.24),2.1,0.75,0.12,lam(0x6a2a2a));col(-1.1,z,0.35,true);col(-0.1,z,0.35,true);});
    box(-1.45,0.6,zA+2,0.3,0.06,0.8,wood);}
  /* utasok a fülkékben (nem figyelnek) */}

/* ===== 4. pőrekocsi két konténerrel, középen ponyvás ládák ===== */
const CTN=[];
{const c=CARS.flat,cz=(c.z0+c.z1)/2,L=c.z1-c.z0;chassis(c,lam(0x3a3e42));box(0,0,cz,3.3,1.1,L,lam(0x6a6e72,{map:rep(plateTex.clone(),3,L)}));
  [[-0.6,3,9.4,'#c85a1e','#ffffff'],[0.6,14.6,21,'#1e5a8a','#e8e0c0']].forEach(q=>{const [x,z0,z1,c1,c2]=q,cz2=(z0+z1)/2,l=z1-z0;const t=ctTex(c1,c2);rep(t,l/2.5,1);
    const m=new THREE.Mesh(new THREE.BoxGeometry(2.0,2.6,l),[lam(0xffffff,{map:t}),lam(0xffffff,{map:t}),lam(0xffffff,{color:new THREE.Color(c1)}),lam(0xffffff,{color:new THREE.Color(c1)}),lam(0xffffff,{color:new THREE.Color(c1).multiplyScalar(0.8)}),lam(0xffffff,{color:new THREE.Color(c1).multiplyScalar(0.8)})]);
    m.position.set(x,1.1+1.3,cz2);add(m);CTN.push({x,z0,z1});for(let zz=z0+0.4;zz<=z1-0.4;zz+=0.6){col(x-0.65,zz,0.42);col(x+0.65,zz,0.42);}col(x,z0+0.4,0.6);col(x,z1-0.4,0.6);});
  const tarp=lam(0x4a5a3a,{flatShading:true});[[-1.05,10.4],[1.05,13.6]].forEach(q=>{box(q[0],1.1,q[1],0.8,0.35,1.1,tarp);});
  [-1,1].forEach(s=>{for(let z=c.z0+1;z<c.z1;z+=2)box(s*1.62,1.1,z,0.05,0.5,0.05,metal);box(s*1.62,1.55,cz,0.04,0.04,L,metal);});}

/* ===== 3. étkezőkocsi: boxok magas háttámlával, elöl konyha ===== */
{const c=CARS.dining;coach(c,lam(0xffffff,{map:rep(woodFloor.clone(),2,10)}));
  const tc=lam(0xf2ece0);[-12,-8,-4].forEach(z=>[-1,1].forEach(s=>{box(s*1.12,0,z,0.8,0.74,0.9,tc);col(s*1.12,z,0.5,true);
    [z-1.0,z+1.0].forEach(bz=>{box(s*1.12,0,bz,0.9,0.45,0.5,lam(0x6a2a2a));box(s*1.12,0.45,bz+(bz<z?-0.2:0.2),0.9,0.9,0.1,lam(0x6a2a2a));col(s*1.12,bz,0.34,false);});
    const lp=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.18,8),new THREE.MeshLambertMaterial({color:0xf0e0c0,emissive:0xe0b070,emissiveIntensity:0.6}));lp.position.set(s*1.2,0.85,z);add(lp,false);}));
  /* konyha a kocsi elején: pult és fal, keskeny átjáró */
  box(0,0,-15.2,1.1,2.6,0.1,wood);box(-1.25,0,-15.2,0.7,2.6,0.1,wood);wallCol(-CW,-15.2,-0.9,-15.2,0.15);wallCol(0.55,-15.2,CW,-15.2,0.15);
  box(-1.2,0,-17.5,0.7,0.9,3.6,metal);wallCol(-1.25,-19.4,-1.25,-15.6,0.42);box(-1.2,0.9,-17.5,0.7,0.04,3.6,lam(0xd0d4d8));
  for(let k=0;k<3;k++){const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.2,10),metalD);pot.position.set(-1.2,1.04,-18.5+k*0.9);add(pot,false);}
  /* bárpult hátul */box(1.2,0,-1.4,0.7,1.05,1.8,wood);col(1.2,-1.4,0.6,false);for(let k=0;k<5;k++){const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.28,6),lam([0x2a5a2a,0x6a2a1a,0xc8a048][k%3]));bt.position.set(1.4,1.2,-2.0+k*0.3);add(bt,false);}}

/* ===== 2. szalonkocsi: Mori íróasztala, kanapék, függönyök ===== */
const CASE={x:0.8,z:-37.2,taken:false};
{const c=CARS.salon;coach(c,lam(0xffffff,{map:rep(carpetTex.clone(),2,10)}));
  box(0.8,0,-37.2,1.0,0.76,1.8,wood);col(0.8,-36.6,0.55,true);col(0.8,-37.8,0.55,true);box(1.1,0,-39.2,0.6,1.1,0.6,leather);
  const brief=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.12,0.34),lam(0x2a1a10));brief.position.set(0.75,0.83,-37.0);add(brief);CASE.m=brief;
  const lmp=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.22,10,1,true),new THREE.MeshLambertMaterial({color:0x2a5a3a,emissive:0x1a3a20,side:THREE.DoubleSide}));lmp.position.set(1.1,1.05,-36.5);add(lmp,false);
  box(-1.2,0,-30,0.75,0.45,3.4,leather);box(-1.48,0.45,-30,0.2,0.55,3.4,leather);col(-1.3,-29,0.4,true);col(-1.3,-31,0.4,true);
  box(1.2,0,-28,0.75,0.45,2.4,leather);box(1.48,0.45,-28,0.2,0.55,2.4,leather);col(1.2,-27.5,0.45,true);col(1.2,-28.5,0.45,true);
  box(-0.55,0,-29.5,0.5,0.42,0.9,wood);
  box(-1.3,0,-40.8,0.5,2.0,1.6,wood);col(-1.3,-40.8,0.7,false);/* szekrény */
  const curt=lam(0x7a1a22);[[1.45,-25.2],[-1.45,-33]].forEach(q=>{box(q[0],0,q[1],0.12,2.5,1.4,curt);});}

/* ===== 1. mozdony: gépterem középen, két oldalt keskeny folyosó, elöl vezetőállás a vészfékkel ===== */
const BRAKE={x:-0.8,z:-60.4};
{const c=CARS.loco;chassis(c,lam(0x1a1a1c));const red=lam(0x8a1a1a),cz=(c.z0+c.z1)/2;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(3.3,18),lam(0x6a6e72,{map:rep(plateTex.clone(),3,18)}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0.01,cz);add(fl,false);
  [-1,1].forEach(s=>{box(s*1.66,0,cz,0.08,2.7,18,red);box(s*1.68,1.25,cz,0.04,0.1,18,gold);});box(0,2.7,cz,3.4,0.25,18,lam(0x2a2a2c));
  box(0,0,-49.6,1.6,2.2,8,lam(0x4a4e52));wallCol(-0.75,-53.6,-0.75,-45.6,0.12);wallCol(0.75,-53.6,0.75,-45.6,0.12);wallCol(-0.75,-45.6,0.75,-45.6,0.12);wallCol(-0.75,-53.6,0.75,-53.6,0.12);for(let z=-53;z<-46;z+=1.2){box(0,2.2,z,1.2,0.2,0.3,metal);}
  box(0,2.15,-44,1.7,0.55,0.1,red);wallCol(-1.6,-44,-0.88,-44,0.15);wallCol(0.88,-44,1.6,-44,0.15);box(-1.25,0,-44,0.8,2.7,0.1,red);box(1.25,0,-44,0.8,2.7,0.1,red);
  box(-0.5,0,-54,2.2,2.7,0.1,red);wallCol(-CW,-54,0.6,-54,0.15);
  /* vezetőállás */box(0.4,0,-61.3,2.2,1.0,0.8,lam(0x2a2c30));col(0.2,-61.3,0.6,true);col(1.0,-61.3,0.6,true);const scr=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.3),new THREE.MeshBasicMaterial({color:0x6ad0a0}));scr.position.set(0.4,1.05,-60.9);scr.rotation.x=-0.6;add(scr,false);
  box(0.6,0,-59.6,0.55,0.5,0.55,leather);
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.1),glassM);ws.position.set(0,1.8,-62.02);add(ws,false);box(0,0,-62.05,3.4,1.25,0.1,red);box(0,2.35,-62.05,3.4,0.4,0.1,red);
  const nose=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,1.4,12,1,false,0,Math.PI),red);nose.rotation.set(Math.PI/2,0,Math.PI/2);nose.scale.set(1,1,0.6);nose.position.set(0,0.6,-62.6);add(nose);
  const hl=new THREE.Mesh(new THREE.CircleGeometry(0.18,12),new THREE.MeshBasicMaterial({color:0xfff6d8}));hl.position.set(0,1.0,-63.45);hl.rotation.y=Math.PI;add(hl,false);
  /* vészfék: piros kar fekete dobozon */
  box(BRAKE.x,0,BRAKE.z,0.4,0.9,0.3,black);const lev=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.5,6),lam(0xd02020,{emissive:0x500000}));lev.position.set(BRAKE.x,1.15,BRAKE.z);lev.rotation.x=0.4;add(lev,false);BRAKE.m=lev;
  const knob=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),lam(0xff3030,{emissive:0x801010}));knob.position.set(0,0.25,0);lev.add(knob);col(BRAKE.x,BRAKE.z,0.3,true);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff4040,transparent:true,opacity:0.0,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(1.2);sp.position.set(BRAKE.x,1.4,BRAKE.z);add(sp,false);BRAKE.spr=sp;
  /* pantográf a tetőn */const pg=new THREE.Group();pg.position.set(0,2.95,-50);trainG.add(pg);[[-0.4,0.6],[0.4,-0.6]].forEach(q=>{const a=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,1.6),metal);a.position.set(0,0.6,q[1]*0.3);a.rotation.x=q[1];pg.add(a);});const bar=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.06,0.1),metal);bar.position.y=1.25;pg.add(bar);}

/* ---------- kampópontok: a konténerek teteje ---------- */
const HOOKS=[];giants.forEach(g=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xbfeaf2,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.scale.setScalar(2.2);s.position.set(g.x,H(g.x,g.z)+g.py+0.6,g.z);scene.add(s);HOOKS.push({g,spr:s});});
A.glowGiant=(i,k)=>{if(i<0||!HOOKS[i])return;HOOKS[i].spr.material.opacity=k*0.8;};

/* ---------- pálya és táj: csempék, amelyek a vonat alatt hátrafelé vándorolnak ---------- */
const V0=22,TL=60,NT=14,ZFRONT=-420;const LIFE={V:V0};
{/* sínek és ágyazat: a talpfák textúrája csúszik */const sl=canvasTex(64,128,(g,w,h)=>{g.fillStyle='#7a766c';g.fillRect(0,0,w,h);for(let i=0;i<600;i++){g.fillStyle=['rgba(60,58,54,0.5)','rgba(150,146,138,0.5)'][i%2];g.fillRect(Math.random()*w,Math.random()*h,2,2);}g.fillStyle='#4a3a2c';g.fillRect(4,10,w-8,22);g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(4,30,w-8,2);},true);
  rep(sl,1,1100/0.65);const bal=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1100,1,60),lam(0xffffff,{map:sl}));bal.rotation.x=-Math.PI/2;bal.position.set(0,-1.38,-120);scene.add(bal);LIFE.ballast=sl;
  /* sínek és felsővezeték rövid darabokból (a nagyon hosszú háromszögek rosszul rajzolódnak) */
  const n=36,rm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.08,0.14,20),metal,n*2),wm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.03,0.03,20),black,n),D=new THREE.Object3D();
  for(let i=0;i<n;i++){const z=-480+i*20+10;[-0.72,0.72].forEach((x,k)=>{D.position.set(x,-1.3,z);D.updateMatrix();rm.setMatrixAt(i*2+k,D.matrix);});D.position.set(0,6.0,z);D.updateMatrix();wm.setMatrixAt(i,D.matrix);}
  rm.frustumCulled=false;wm.frustumCulled=false;scene.add(rm);scene.add(wm);}
const TILES=[];const poleM=lam(0x8a8478);
/* ---------- táj: rizsföldek, kertek, falvak, erdők, folyó, vasúti átjáró ---------- */
/* rizsföld: vízzel elárasztott parcellák, bennük sorokban a fiatal palánták, köztük földgátak */
const paddyTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(5),n=4,c=w/n;g.fillStyle='#6a5a3e';g.fillRect(0,0,w,h);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const X=x*c+5,Y=y*c+5,S=c-10,k=r();const gr=g.createLinearGradient(X,Y,X+S,Y+S);
    if(k<0.65){gr.addColorStop(0,'#6e949a');gr.addColorStop(1,'#4e7a76');g.fillStyle=gr;g.fillRect(X,Y,S,S);g.fillStyle='rgba(90,150,60,0.9)';for(let ry=Y+4;ry<Y+S;ry+=7)for(let rx=X+3+(ry%14?0:3);rx<X+S;rx+=6)g.fillRect(rx,ry,2,3);}
    else{g.fillStyle='hsl('+(80+r()*25)+',45%,'+(32+r()*10)+'%)';g.fillRect(X,Y,S,S);g.fillStyle='rgba(30,50,20,0.35)';for(let ry=Y+3;ry<Y+S;ry+=5)g.fillRect(X,ry,S,2);}
    g.fillStyle='rgba(255,255,255,0.15)';g.fillRect(X,Y,S,2);}},true);
const meadowTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(6);g.fillStyle='#4e7a32';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=['rgba(110,150,60,0.5)','rgba(40,70,25,0.5)','rgba(160,170,80,0.35)'][i%3];g.fillRect(r()*w,r()*h,2,2+r()*3);}
  for(let i=0;i<60;i++){g.fillStyle=['#e8e0a0','#f0f0f0','#d080a0'][i%3];g.fillRect(r()*w,r()*h,2,2);}},true);
const waterTex=canvasTex(256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#4a8aa0');gr.addColorStop(1,'#2e6a7e');g.fillStyle=gr;g.fillRect(0,0,w,h);const r=mulberry32(7);
  for(let i=0;i<220;i++){g.strokeStyle='rgba(220,240,250,'+(0.1+r()*0.25)+')';g.lineWidth=1;const x=r()*w,y=r()*h,l=8+r()*24;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+l/2,y-2,x+l,y);g.stroke();}},true);
const fieldMats={paddy:new THREE.MeshPhongMaterial({map:paddyTex,shininess:30,specular:0x1e2428}),meadow:lam(0xffffff,{map:meadowTex}),river:lam(0x5a7a3a)};
paddyTex.repeat.set(8,0.6);meadowTex.repeat.set(30,2.4);
const waterM=new THREE.MeshPhongMaterial({map:waterTex,shininess:110,specular:0xa8d8e8});waterTex.repeat.set(16,1.2);
/* közös geometriák és anyagok */
const G2={
  ground:new THREE.PlaneGeometry(800,TL),bank:(()=>{const g=new THREE.PlaneGeometry(2.6,TL,1,1);return g;})(),
  ced:(()=>{const parts=[];[[0,2.2,1.7],[0,3.6,1.35],[0,4.8,0.95],[0,5.8,0.55]].forEach(q=>{const c=new THREE.ConeGeometry(q[2],2.0,7);c.translate(0,q[1],0);parts.push(c);});return mergeG(parts);})(),
  leaf:(()=>{const parts=[];const r=mulberry32(11);for(let i=0;i<5;i++){const c=new THREE.IcosahedronGeometry(1.1+r()*0.6,0);c.translate((r()-0.5)*1.6,3.2+r()*1.4,(r()-0.5)*1.6);parts.push(c);}return mergeG(parts);})(),
  trunk:(()=>{const g=new THREE.CylinderGeometry(0.14,0.22,3,5);g.translate(0,1.5,0);return g;})(),
  bamboo:(()=>{const parts=[];const r=mulberry32(13);for(let i=0;i<12;i++){const c=new THREE.CylinderGeometry(0.05,0.06,7+r()*3,5);c.translate((r()-0.5)*2.2,3.6,(r()-0.5)*2.2);c.rotateZ((r()-0.5)*0.12);parts.push(c);}return mergeG(parts);})(),
  bambooTop:(()=>{const parts=[];const r=mulberry32(17);for(let i=0;i<7;i++){const c=new THREE.IcosahedronGeometry(1.0+r()*0.5,0);c.scale(1,0.6,1);c.translate((r()-0.5)*2.4,6.5+r()*2.5,(r()-0.5)*2.4);parts.push(c);}return mergeG(parts);})(),
  hill:(()=>{const g=new THREE.ConeGeometry(1,1,9,2);const p=g.attributes.position,r=mulberry32(19);for(let i=0;i<p.count;i++){if(p.getY(i)>-0.49&&p.getY(i)<0.49){p.setX(i,p.getX(i)*(0.85+r()*0.3));p.setZ(i,p.getZ(i)*(0.85+r()*0.3));}}g.computeVertexNormals();return g;})(),
  pole:new THREE.CylinderGeometry(0.1,0.13,8,6),wire:new THREE.BoxGeometry(0.02,0.02,TL),
  house:new THREE.BoxGeometry(1,1,1),gable:(()=>{const s=new THREE.Shape();s.moveTo(-0.5,0);s.lineTo(0,0.42);s.lineTo(0.5,0);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-0.5);return g;})()};
function mergeG(list){let pos=[],nor=[];list.forEach(g=>{const n=g.index?g.toNonIndexed():g;pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);});const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return o;}
const M2={ced:lam(0x234a26,{flatShading:true}),ced2:lam(0x2c5a2c,{flatShading:true}),leaf:lam(0x4a7a30,{flatShading:true}),leaf2:lam(0x6a8a34,{flatShading:true}),maple:lam(0xb84a26,{flatShading:true}),trunk:lam(0x4a3a2a),
  bamboo:lam(0x7a9a3a),bambooTop:lam(0x5a8a32,{flatShading:true}),hill:lam(0x4a6e34,{flatShading:true}),hill2:lam(0x3e5e30,{flatShading:true}),pole:lam(0x5a4a3a),wire:lam(0x222222),
  wall:[lam(0xe8e2d2),lam(0xd8cdb8),lam(0xc8bca4)],timber:lam(0x3a2c22),roof:[lam(0x2e3440),lam(0x4a5866),lam(0x6a3a2a),lam(0x8a7a52)],bank:lam(0x5a7a36),gravel:lam(0x8a8478)};
function mesh(geo,mat,x,y,z,sx,sy,sz,ry,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(ry)m.rotation.y=ry;parent.add(m);return m;}
function tree(t,x,z,kind,s,r){if(kind==='ced'){mesh(G2.ced,r()<0.5?M2.ced:M2.ced2,x,-1.5,z,s,s,s,r()*6,t);mesh(G2.trunk,M2.trunk,x,-1.5,z,s,s*0.6,s,0,t);}
  else if(kind==='bamboo'){mesh(G2.bamboo,M2.bamboo,x,-1.5,z,s,s,s,r()*6,t);mesh(G2.bambooTop,M2.bambooTop,x,-1.5,z,s,s,s,r()*6,t);}
  else{mesh(G2.trunk,M2.trunk,x,-1.5,z,s,s,s,0,t);mesh(G2.leaf,r()<0.12?M2.maple:r()<0.5?M2.leaf:M2.leaf2,x,-1.5,z,s,s,s,r()*6,t);}}
function house(t,x,z,r,big){const w=(big?9:6)+r()*3,d=(big?6:4.5)+r()*2,h=big?3.4:2.8,k=Math.floor(r()*3),rk=Math.floor(r()*4),ry=(r()<0.5?0:Math.PI/2)+(r()-0.5)*0.2,g=new THREE.Group();g.position.set(x,-1.5,z);g.rotation.y=ry;t.add(g);
  mesh(G2.house,M2.wall[k],0,h/2,0,w,h,d,0,g);mesh(G2.house,M2.timber,0,0.25,0,w+0.1,0.5,d+0.1,0,g);
  [-w/2,w/2].forEach(px=>mesh(G2.house,M2.timber,px,h/2,d/2,0.18,h,0.18,0,g));
  const roof=mesh(G2.gable,M2.roof[rk],0,h,0,w+1.2,d+1.0,d+1.2,0,g);roof.rotation.y=Math.PI/2;roof.scale.set(d+1.4,(d+1.4)*(rk===3?0.9:0.7),w+1.2);
  if(r()<0.6){const wall=mesh(G2.house,M2.wall[0],0,0.6,d/2+3,w+2,1.2,0.25,0,g);}}
const ROADM=lam(0x4a4c4e),STRIPE=new THREE.MeshBasicMaterial({color:0xf0e8d0});
function buildTile(t){const g=t.g;while(g.children.length)g.remove(g.children[0]);const r=t.r,type=t.type;
  const gm=new THREE.Mesh(G2.ground,type==='river'?fieldMats.river:type==='village'||type==='forest'?fieldMats.meadow:fieldMats.paddy);gm.rotation.x=-Math.PI/2;gm.position.y=-1.5;g.add(gm);gm.receiveShadow=true;
  /* töltés a sín két oldalán: kavicsos váll, füves rézsű, kábelcsatorna */
  if(type!=='river'){[-1,1].forEach(s=>{const b=new THREE.Mesh(G2.bank,M2.bank);b.rotation.x=-Math.PI/2;b.rotation.y=-s*0.32;b.position.set(s*3.4,-1.42,0);g.add(b);mesh(G2.house,M2.gravel,s*2.45,-1.38,0,0.35,0.12,TL,0,g);});}
  /* felsővezeték-oszlop */const p=mesh(G2.house,poleM,-3.4,2.3,0,0.25,7.6,0.25,0,g);mesh(G2.house,poleM,-1.7,6.1,0,3.6,0.12,0.12,0,g);mesh(G2.house,poleM,-1.7,5.6,0,0.08,1.0,0.08,0,g);
  /* távíróoszlopok vezetékekkel */if(type!=='river'){mesh(G2.pole,M2.pole,7,2.5,0,1,1,1,0,g);mesh(G2.house,M2.pole,7,6.2,0,1.4,0.08,0.08,0,g);[-0.6,0,0.6].forEach(o=>mesh(G2.wire,M2.wire,7+o,6.15-Math.abs(o)*0.1,0,1,1,1,0,g));}
  if(type==='river'){const w=new THREE.Mesh(new THREE.PlaneGeometry(800,TL*0.7),waterM);w.rotation.x=-Math.PI/2;w.position.y=-8;g.add(w);gm.visible=false;
    [-1,1].forEach(s=>{const bank=new THREE.Mesh(new THREE.BoxGeometry(800,8,TL*0.15),lam(0x5a7a3a));bank.position.set(0,-5.5,s*TL*0.42);g.add(bank);for(let i=0;i<6;i++){const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(1+r()*1.5,0),lam(0x8a8678,{flatShading:true}));rk.position.set((r()-0.5)*120,-7.8,s*TL*0.3);g.add(rk);}});
    [-1,1].forEach(s=>{const tm=lam(0x7a2a24);const top=mesh(G2.house,tm,s*2.6,4.2,0,0.3,0.3,TL,0,g);mesh(G2.house,tm,s*2.6,-1.3,0,0.3,0.3,TL,0,g);
      for(let k=0;k<10;k++){const d=mesh(G2.house,tm,s*2.6,1.45,-TL/2+k*TL/10+3,0.2,6.3,0.2,0,g);d.rotation.x=(k%2?1:-1)*0.6;}for(let k=0;k<=10;k++)mesh(G2.house,tm,s*2.6,1.45,-TL/2+k*TL/10,0.2,5.5,0.2,0,g);});
    for(let k=0;k<=5;k++)mesh(G2.house,lam(0x7a2a24),0,4.3,-TL/2+k*TL/5,5.4,0.2,0.2,0,g);
    mesh(G2.house,lam(0x4a5560),0,-1.7,0,5.2,0.4,TL,0,g);for(let k=0;k<3;k++)mesh(G2.house,lam(0x8a8478),0,-7,-TL/2+k*TL/2,4,9,3,0,g);return;}
  if(type==='crossing'){/* vasúti átjáró: út keresztben, sorompók, villogó piros lámpák, várakozó autók */
    const road=new THREE.Mesh(new THREE.PlaneGeometry(800,7),ROADM);road.rotation.x=-Math.PI/2;road.position.y=-1.47;g.add(road);for(let x=-390;x<390;x+=8)mesh(G2.house,STRIPE,x,-1.46,0,4,0.01,0.15,0,g);
    t.lights=[];[-1,1].forEach(s=>{const x=s*4.4,z=s*4.2;mesh(G2.pole,lam(0xe8e8e0),x,2,z,0.7,0.6,0.7,0,g);mesh(G2.house,lam(0x111111),x,3.6,z,0.9,0.4,0.3,0,g);
      [-0.28,0.28].forEach(o=>{const l=new THREE.Mesh(new THREE.CircleGeometry(0.14,10),new THREE.MeshBasicMaterial({color:0x401010}));l.position.set(x+o,3.6,z+s*0.16);l.rotation.y=s>0?0:Math.PI;g.add(l);t.lights.push(l);});
      const bar=mesh(G2.house,lam(0xf0d020),x-s*2,1.0-1.5+1.5,z,4,0.12,0.12,0,g);for(let k=0;k<4;k++)mesh(G2.house,lam(0x111111),x-s*(0.5+k),1.0,z,0.4,0.13,0.13,0,g);
      const car=new THREE.Group();car.position.set(s*12,-1.5,-s*1.8);g.add(car);mesh(G2.house,lam([0xc8302a,0xe8e8e2][s>0?0:1]),0,0.55,0,4.2,0.8,1.8,0,car);mesh(G2.house,lam(0x1a2430),-0.2,1.2,0,2.2,0.6,1.6,0,car);});}
  if(type==='village'){for(let i=0;i<5;i++){const s=r()<0.5?-1:1;house(g,s*(12+r()*60),(r()-0.5)*TL*0.8,r,i===0);}for(let i=0;i<5;i++){const s=r()<0.5?-1:1;tree(g,s*(10+r()*60),(r()-0.5)*TL,r()<0.4?'ced':'leaf',0.8+r()*0.5,r);}}
  else if(type==='forest'){for(let i=0;i<26;i++){const s=r()<0.5?-1:1,x=s*(8+r()*45);tree(g,x,(r()-0.5)*TL,r()<0.6?'ced':r()<0.6?'leaf':'bamboo',0.9+r()*0.7,r);}}
  else{for(let i=0;i<4;i++){const s=r()<0.5?-1:1;tree(g,s*(12+r()*80),(r()-0.5)*TL,r()<0.3?'bamboo':r()<0.5?'ced':'leaf',0.8+r()*0.5,r);}if(r()<0.4){const s=r()<0.5?-1:1;house(g,s*(18+r()*50),(r()-0.5)*TL*0.6,r,true);}}
  /* dombok a távolban */if(r()<0.7){const s=r()<0.5?-1:1;const hgt=12+r()*30;mesh(G2.hill,r()<0.5?M2.hill:M2.hill2,s*(90+r()*120),-1.5+hgt/2,(r()-0.5)*TL,40+r()*40,hgt,30+r()*25,r()*6,g);}}
{const r=mulberry32(97);for(let i=0;i<NT;i++){const g=new THREE.Group();scene.add(g);const t={g,z:ZFRONT+i*TL+TL/2,r,type:'fields'};g.position.z=t.z;TILES.push(t);t.type=['paddy','village','forest','crossing','paddy','forest'][i%6];buildTile(t);}}
let tileCount=0;
function pickType(r){tileCount++;if(tileCount%9===5)return 'river';if(tileCount%11===3)return 'crossing';const q=r();return q<0.38?'paddy':q<0.68?'forest':'village';}
/* ---------- távoli hegyek hósapkával (nem mozognak: messze vannak) ---------- */
{const parts=[];const r=mulberry32(23);const geo=new THREE.ConeGeometry(1,1,7,3);const p=geo.attributes.position,cols=[];for(let i=0;i<p.count;i++){const y=p.getY(i)+0.5;if(y>0.05&&y<0.95){p.setX(i,p.getX(i)*(0.8+r()*0.4));p.setZ(i,p.getZ(i)*(0.8+r()*0.4));}
    const c=y>0.78?[0.95,0.96,0.98]:y>0.55?[0.42,0.5,0.46]:[0.3,0.42,0.3];cols.push(...c);}geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.computeVertexNormals();
  const mm=lam(0xffffff,{vertexColors:true,flatShading:true});const list=[];for(let i=0;i<30;i++){const a=r()*Math.PI*2,d=480+r()*160;if(Math.abs(Math.sin(a))>0.92)continue;list.push({x:Math.cos(a)*d,z:Math.sin(a)*d,h:90+r()*130,w:110+r()*90,ry:r()*6});}
  const im=new THREE.InstancedMesh(geo,mm,list.length),D=new THREE.Object3D();list.forEach((q,i)=>{D.position.set(q.x,q.h/2-10,q.z);D.rotation.set(0,q.ry,0);D.scale.set(q.w,q.h,q.w);D.updateMatrix();im.setMatrixAt(i,D.matrix);});im.frustumCulled=false;scene.add(im);LIFE.mtn=im;}
/* ---------- felhők ---------- */
{const ct=canvasTex(256,128,(g,w,h)=>{const r=mulberry32(29);g.clearRect(0,0,w,h);for(let i=0;i<26;i++){const x=40+r()*176,y=50+r()*40-Math.abs(x-128)*0.15,rr=18+r()*30,gr=g.createRadialGradient(x,y,0,x,y,rr);
    gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.6,'rgba(244,246,250,0.5)');gr.addColorStop(1,'rgba(240,244,248,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}});
  const r=mulberry32(31);LIFE.clouds=[];for(let i=0;i<14;i++){const a=r()*Math.PI*2,d=300+r()*250;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,opacity:0.8,depthWrite:false,fog:false}));
    const sc=150+r()*160;s.scale.set(sc,sc*0.45,1);s.position.set(Math.cos(a)*d,130+r()*110,Math.sin(a)*d);s.renderOrder=-7;scene.add(s);LIFE.clouds.push(s);}}
/* alagút: bordás beton cső, kábeltálcák, lámpák fényudvarral; elöl hegy */
const TUN={on:false,z0:0,len:220,ceil:4.6,g:new THREE.Group()};
{const g=TUN.g;scene.add(g);g.visible=false;const L=TUN.len;
  const ct=canvasTex(128,128,(c,w,h)=>{const r=mulberry32(37);c.fillStyle='#5a5852';c.fillRect(0,0,w,h);for(let i=0;i<900;i++){c.fillStyle=['rgba(30,30,28,0.3)','rgba(120,118,110,0.25)'][i%2];c.fillRect(r()*w,r()*h,2,2);}
    for(let i=0;i<6;i++){c.fillStyle='rgba(40,50,40,0.35)';c.fillRect(r()*w,0,3+r()*6,h);}c.fillStyle='rgba(0,0,0,0.4)';c.fillRect(0,0,w,4);},true);ct.repeat.set(L/6,1);
  const rm=lam(0xffffff,{map:ct});const rm2=lam(0x2e2c28);
  [-1,1].forEach(s2=>{const w=new THREE.Mesh(new THREE.BoxGeometry(0.6,6.2,L),rm);w.position.set(s2*2.7,1.7,-L/2);g.add(w);mesh(G2.house,rm2,s2*2.32,2.6,-L/2,0.15,0.3,L,0,g);});
  const cm=lam(0xffffff,{map:ct.clone()});cm.map.needsUpdate=true;cm.map.repeat.set(1,L/6);const ceil=new THREE.Mesh(new THREE.BoxGeometry(6,0.6,L),cm);ceil.position.set(0,4.9,-L/2);g.add(ceil);
  for(let z=-3;z>-L;z-=6){[-1,1].forEach(s2=>mesh(G2.house,rm2,s2*2.36,1.7,z,0.12,6.2,0.4,0,g));mesh(G2.house,rm2,0,4.55,z,4.9,0.12,0.4,0,g);}
  const glow=new THREE.SpriteMaterial({map:glowTex,color:0xffc070,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending});
  for(let z=-10;z>-L;z-=12){const lp=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.12,0.7),new THREE.MeshBasicMaterial({color:0xffd890}));lp.position.set(-2.3,3.6,z);g.add(lp);const sp=new THREE.Sprite(glow);sp.scale.setScalar(1.8);sp.position.set(-2.1,3.6,z);g.add(sp);}
  const mtn=new THREE.Mesh(new THREE.ConeGeometry(70,60,9),lam(0x3e5e30,{flatShading:true}));mtn.position.set(0,24,-L/2);mtn.scale.set(1,1,(L/2+20)/70);g.add(mtn);
  const hole=new THREE.Mesh(new THREE.PlaneGeometry(4.8,6.0),new THREE.MeshBasicMaterial({color:0x050505}));hole.position.set(0,1.6,1.0);g.add(hole);TUN.hole=hole;
  const pm=lam(0x9a968a);[[0.2],[-L-0.2]].forEach(q=>{[-1,1].forEach(s2=>{const b=new THREE.Mesh(new THREE.BoxGeometry(3.6,9,1.5),pm);b.position.set(s2*4.2,3.1,q[0]);g.add(b);});const t=new THREE.Mesh(new THREE.BoxGeometry(12,3.6,1.5),pm);t.position.set(0,6.6,q[0]);g.add(t);
    const arch=new THREE.Mesh(new THREE.BoxGeometry(5.2,0.5,1.6),lam(0x6a665c));arch.position.set(0,4.75,q[0]);g.add(arch);});}
function stepLand(dt){const dz=LIFE.V*dt;LIFE.ballast.offset.y+=dz/0.65;
  const bl=Math.floor(performance.now()/450)%2;TILES.forEach(t=>{if(t.lights)t.lights.forEach((l,k)=>l.material.color.setHex((k%2)===bl?0xff2a1a:0x401010));t.z+=dz;if(t.z>ZFRONT+NT*TL){t.z-=NT*TL;t.type=pickType(t.r);t.lights=null;buildTile(t);}t.g.position.z=t.z;t.g.visible=!(TUN.on&&t.z<TUN.z0+TL/2&&t.z>TUN.z0-TUN.len-TL/2);});
  if(TUN.on){TUN.z0+=dz;TUN.g.position.z=TUN.z0;TUN.hole.visible=TUN.z0<-63;if(TUN.z0-TUN.len>140){TUN.on=false;TUN.g.visible=false;}}}
function startTunnel(){TUN.on=true;TUN.z0=-300;TUN.g.position.z=TUN.z0;TUN.g.visible=true;}
function inTunnel(z){return TUN.on&&z<TUN.z0&&z>TUN.z0-TUN.len;}

/* ---------- utasok: ülő civilek (díszlet, nem figyelnek) ---------- */
{const seats=[[-0.55,30.45,0],[-0.3,38.45,0],[-1.1,-11.0,Math.PI],[1.1,-5.0,0],[-1.15,74.2,Math.PI/2]];
  seats.forEach((q,i)=>{const m=A.buildPolice(40+i,{suit:true,civ:true});m.position.set(q[0],H(q[0],q[1]),q[1]);m.rotation.y=q[2];m.userData.anim(0,0,0,{st:'patrol',bp:0,sweep:0,shoot:0,fall:0,stagger:0});
    const R=m.userData.R;R.hips.position.y=0.55;R.legs.forEach(l=>{l.hp.rotation.x=-1.45;l.kn.rotation.x=1.45;});R.arms.forEach(a=>{a.sh.rotation.x=0.5;a.el.rotation.x=0.9;});R.lensGlow.visible=false;scene.add(m);});}

A.ROOF=A.VONAT={SUNM,SCONG,rects,walkable,clampRoof,CARS,CASE,BRAKE,HOOKS,CTN,LIFE,TUN,stepLand,startTunnel,inTunnel,trainG,glassM,
  actors:['boss','guard','guard','conductor','guard','guard','guard','guard','driver','guard','guard','guard'],
  spots:{desk:{x:1.1,z:-38.9,ry:Math.PI},window:{x:-0.6,z:-26.2,ry:Math.PI/2},cab:{x:-1.0,z:-41.0,ry:Math.PI},safe:{x:-1.2,z:-39.5}}};
})();
