(function(){
/* Shinobi – 7. pálya: Fehér csend. Hegyi termálfogadó friss hóban, derült délelőtt.
   © 2026 Fejes Géza. Minden jog fenntartva.
   Dél: havas hegyi ösvény (rajt). Nyugaton a gőzölgő szabadtéri medencék. Középen és északon a fogadó faépülete
   fedett verandával (engawa), keleten a könyvelő irodája (külön szárny). Észak: hátsó hegyi kijárat.
   A hóban lábnyom marad (a fapallón, a kövön és a verandán nem). Sík terep (H=0). Csak a ?palya=fogado címmel fut. */
const A=window.AE;if(A.LV!=='fogado')return;
const {scene,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const R=mulberry32(707);
const XMIN=-29.5,XMAX=29.5,ZMIN=-59.5,ZMAX=59.5;

const solids=[],hard=[];/* hard: fa, kő, veranda – itt nincs lábnyom */
function col(x,z,r,low,tall){const o={x,z,r,low:!!low,tall:!!tall,kind:'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low,tall,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(step||0.8)));for(let i=0;i<=n;i++)col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low,tall);}
function solid(x0,x1,z0,z1,id,cols){const s={id:id||'b',x0,x1,z0,z1,on:true};solids.push(s);if(cols!==false){const r=0.5;
  wallCol(x0+0.3,z0+0.3,x1-0.3,z0+0.3,r);wallCol(x0+0.3,z1-0.3,x1-0.3,z1-0.3,r);wallCol(x0+0.3,z0+0.3,x0+0.3,z1-0.3,r);wallCol(x1-0.3,z0+0.3,x1-0.3,z1-0.3,r);}return s;}
const inRect=(r,x,z,m)=>x>r.x0-(m||0)&&x<r.x1+(m||0)&&z>r.z0-(m||0)&&z<r.z1+(m||0);
function walkable(x,z){if(x<XMIN||x>XMAX||z<ZMIN||z>ZMAX)return false;for(const s of solids)if(s.on&&inRect(s,x,z))return false;return true;}
function clampRoof(p){p.x=clamp(p.x,XMIN,XMAX);p.z=clamp(p.z,ZMIN,ZMAX);
  for(const s of solids){if(!s.on||!inRect(s,p.x,p.z,0.25))continue;const dl=p.x-(s.x0-0.25),dr=(s.x1+0.25)-p.x,dn=p.z-(s.z0-0.25),ds=(s.z1+0.25)-p.z,m=Math.min(dl,dr,dn,ds);
    if(m===dl)p.x=s.x0-0.26;else if(m===dr)p.x=s.x1+0.26;else if(m===dn)p.z=s.z0-0.26;else p.z=s.z1+0.26;}}
const onHard=(x,z)=>hard.some(r=>inRect(r,x,z));

function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
const snowT=rep(canvasTex(256,256,(g,w,h)=>{g.fillStyle='#eef2f6';g.fillRect(0,0,w,h);for(let i=0;i<2400;i++){const v=220+Math.floor(R()*35);g.fillStyle='rgba('+v+','+(v+2)+','+(v+6)+',0.5)';g.fillRect(R()*w,R()*h,1+R()*3,1+R()*2);}
  g.fillStyle='rgba(180,196,214,0.18)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(R()*w,R()*h,20+R()*40,8+R()*14,R()*3,0,7);g.fill();}},true),16,32);
const plank=rep(canvasTex(128,128,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=['#6a4a32','#5a3e2a','#74523a'][i%3];g.fillRect(0,i*16,w,16);g.fillStyle='rgba(0,0,0,0.45)';g.fillRect(0,i*16,w,1);}},true),1,1);
const woodD=lam(0x3a2a1e),wood=lam(0x5a3e2a),roofM=lam(0x2c3034),snowM=lam(0xf4f6f8),stone=lam(0x6a6c70),stoneL=lam(0x8a8c90);
const shoji=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#f4ecd8';c.fillRect(0,0,w,h);c.strokeStyle='#3a2a1e';c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(i*w/4,0);c.lineTo(i*w/4,h);c.stroke();}for(let i=1;i<5;i++){c.beginPath();c.moveTo(0,i*h/5);c.lineTo(w,i*h/5);c.stroke();}});
const shojiM=new THREE.MeshLambertMaterial({map:shoji,side:THREE.DoubleSide});flashPatch(shojiM);

/* ---------- talaj: hó; körben havas lejtők és hegyek ---------- */
{const gr=new THREE.Mesh(new THREE.PlaneGeometry(62,122),lam(0xffffff,{map:snowT}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;scene.add(gr);
  const far=new THREE.Mesh(new THREE.PlaneGeometry(700,700),lam(0xe6eaf0));far.rotation.x=-Math.PI/2;far.position.y=-0.03;scene.add(far);
  const mt=lam(0xdfe6ee,{flatShading:true}),rk=lam(0x6a7078,{flatShading:true});
  [[-90,-120,70],[20,-150,90],[110,-90,60],[-140,20,60],[140,40,55],[-60,150,50],[70,140,55]].forEach(q=>{const m=new THREE.Mesh(new THREE.ConeGeometry(q[2]*1.3,q[2]*1.2,7),mt);m.position.set(q[0],q[2]*0.6-2,q[1]);scene.add(m);
    const r=new THREE.Mesh(new THREE.ConeGeometry(q[2]*1.32,q[2]*0.5,7),rk);r.position.set(q[0],q[2]*0.24-2,q[1]);scene.add(r);});
  /* a pálya szélén sziklafal és fenyves takarja a határt */
  const cliff=lam(0x7a7e84,{flatShading:true});[[-33,0,6,122],[33,0,6,122],[0,63,66,6],[0,-63,66,6]].forEach(q=>{const b=new THREE.Mesh(new THREE.BoxGeometry(q[2],5,q[3]),cliff);b.position.set(q[0],2.5,q[1]);scene.add(b);const s=new THREE.Mesh(new THREE.BoxGeometry(q[2]+0.4,0.5,q[3]+0.4),snowM);s.position.set(q[0],5.1,q[1]);scene.add(s);});}

/* ---------- havas fenyők (kampópont, mászható) és sziklák ---------- */
function addGiant(x,z,top,climb){const s=(top-0.85)/8.6,t={kind:'giant',x,z,s,c:R(),r:0.45,col:1.6*s,cr:3.4*s,h:21*s,py:8.6*s,climb:!!climb,i:giants.length};giants.push(t);return t;}
const FIRS=[[-14,46],[14,50],[-24,30],[22,26],[-26,-14],[26,-20],[-18,-46],[18,-40],[4,38],[-6,-54]];
{const tr=lam(0x4a3a2e),nd=lam(0x24402e,{flatShading:true});
  FIRS.forEach(q=>{const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.38,9,7),tr);t.position.y=4.5;t.castShadow=true;g.add(t);
    [[2.6,3.4,2.8],[4.4,2.8,2.6],[6.1,2.1,2.4],[7.6,1.4,2.0]].forEach(l=>{const c=new THREE.Mesh(new THREE.ConeGeometry(l[1],l[2],8),nd);c.position.y=l[0];c.castShadow=true;g.add(c);const s=new THREE.Mesh(new THREE.ConeGeometry(l[1]*0.8,l[2]*0.45,8),snowM);s.position.y=l[0]+l[2]*0.3;g.add(s);});
    g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.45);addGiant(q[0],q[1],6.6,true);});
  [[-8,34,1.3],[10,30,1.1],[-20,52,1.4],[24,46,1.2],[-2,-38,1.0],[20,-56,1.3]].forEach(q=>{const r=new THREE.Mesh(new THREE.DodecahedronGeometry(q[2],0),stone);r.position.set(q[0],q[2]*0.5,q[1]);r.castShadow=true;scene.add(r);
    const s=new THREE.Mesh(new THREE.SphereGeometry(q[2]*0.9,8,5,0,Math.PI*2,0,Math.PI*0.4),snowM);s.position.set(q[0],q[2]*0.62,q[1]);scene.add(s);col(q[0],q[1],q[2]*0.9,true);});}

/* ---------- fapallók: a rajtól a medencékhez és a fogadóhoz (itt nincs lábnyom) ---------- */
{const pm=lam(0xffffff,{map:plank});const walk=(x0,z0,x1,z1,w)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0),m=new THREE.Mesh(new THREE.BoxGeometry(w,0.12,L),pm);m.position.set((x0+x1)/2,0.06,(z0+z1)/2);m.rotation.y=a;m.receiveShadow=true;scene.add(m);
    hard.push({x0:Math.min(x0,x1)-w/2,x1:Math.max(x0,x1)+w/2,z0:Math.min(z0,z1)-w/2,z1:Math.max(z0,z1)+w/2});};
  walk(-2,56,-2,40,1.4);walk(-2,40,-16,40,1.4);walk(-16,40,-16,14,1.4);walk(-2,40,-2,10,1.4);}

/* ---------- szabadtéri termálmedencék gőzzel (nyugat) ---------- */
const POOLS=[{x:-19,z:4,rx:5.5,rz:4},{x:-21,z:-8,rx:4.5,rz:3.4},{x:-10,z:-4,rx:3.4,rz:2.6}];
const STEAM=[];
{const wm=new THREE.MeshPhongMaterial({color:0x6a9ab0,shininess:100,specular:0xffffff,transparent:true,opacity:0.9});
  const stm=new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:0.5,depthWrite:false});
  POOLS.forEach(p=>{const w=new THREE.Mesh(new THREE.CircleGeometry(1,24),wm);w.rotation.x=-Math.PI/2;w.scale.set(p.rx,p.rz,1);w.position.set(p.x,0.05,p.z);scene.add(w);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,rr=1.08;const st=new THREE.Mesh(new THREE.DodecahedronGeometry(0.45+R()*0.3,0),stoneL);st.position.set(p.x+Math.cos(a)*p.rx*rr,0.22,p.z+Math.sin(a)*p.rz*rr);st.scale.y=0.6;st.castShadow=true;scene.add(st);}
    /* a víz és a peremkövek: nem lehet belelépni; a kövön nincs lábnyom */
    const n=Math.ceil((p.rx+p.rz)*1.4);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;col(p.x+Math.cos(a)*p.rx*0.9,p.z+Math.sin(a)*p.rz*0.9,0.5,true,true);}
    solids.push({id:'pool',x0:p.x-p.rx*0.7,x1:p.x+p.rx*0.7,z0:p.z-p.rz*0.7,z1:p.z+p.rz*0.7,on:true,ell:p});
    hard.push({x0:p.x-p.rx*1.35,x1:p.x+p.rx*1.35,z0:p.z-p.rz*1.35,z1:p.z+p.rz*1.35});
    for(let i=0;i<9;i++){const s=new THREE.Sprite(stm.clone());s.userData={x:p.x+(R()*2-1)*p.rx*0.8,z:p.z+(R()*2-1)*p.rz*0.8,ph:R()*5,sp:0.4+R()*0.4};s.scale.setScalar(4);scene.add(s);STEAM.push(s);}});}
/* a gőz takar: ha benne guggolsz, nehezen látnak */
const inSteam=(x,z)=>POOLS.some(p=>{const dx=(x-p.x)/(p.rx*1.5),dz=(z-p.z)/(p.rz*1.5);return dx*dx+dz*dz<1;});
function stepSteam(dt,t){STEAM.forEach(s=>{const u=s.userData,k=((t*u.sp+u.ph)%4)/4;s.position.set(u.x+Math.sin(t*0.5+u.ph)*0.6,0.4+k*4.5,u.z+Math.cos(t*0.4+u.ph)*0.5);s.material.opacity=0.42*Math.sin(k*Math.PI);s.scale.setScalar(3+k*3.5);});}

/* ---------- a fogadó: főépület verandával, keleti szárny (a könyvelő irodája) ---------- */
const MAIN={x0:-8,x1:12,z0:-34,z1:-18},WING={x0:12,x1:22,z0:-36,z1:-24},OFFICE={x:17,z:-30,door:{x:17,z:-23.6}};
{const g=new THREE.Group();
  const build=(b,h,doorX)=>{const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,W=b.x1-b.x0,D=b.z1-b.z0;
    const base=new THREE.Mesh(new THREE.BoxGeometry(W+0.4,0.5,D+0.4),stone);base.position.set(cx,0.25,cz);g.add(base);
    const walls=new THREE.Mesh(new THREE.BoxGeometry(W,h,D),[shojiM,shojiM,woodD,woodD,shojiM,shojiM]);walls.position.set(cx,0.5+h/2,cz);walls.castShadow=true;walls.receiveShadow=true;g.add(walls);
    for(let x=b.x0;x<=b.x1+0.01;x+=2){[b.z0-0.02,b.z1+0.02].forEach(z=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.18,h,0.18),woodD);p.position.set(x,0.5+h/2,z);g.add(p);});}
    const roof=new THREE.Mesh(new THREE.BoxGeometry(W+3.2,0.4,D+3.2),roofM);roof.position.set(cx,0.5+h+0.2,cz);roof.castShadow=true;g.add(roof);
    const ridge=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(W,D)*0.62,2.4,4),roofM);ridge.rotation.y=Math.PI/4;ridge.scale.set(1,1,D/W);ridge.position.set(cx,0.5+h+1.6,cz);ridge.castShadow=true;g.add(ridge);
    const sn=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(W,D)*0.6,2.3,4),snowM);sn.rotation.y=Math.PI/4;sn.scale.set(1,1,D/W);sn.position.set(cx,0.5+h+1.72,cz);g.add(sn);
    const sl=new THREE.Mesh(new THREE.BoxGeometry(W+3.3,0.15,D+3.3),snowM);sl.position.set(cx,0.5+h+0.45,cz);g.add(sl);};
  build(MAIN,3.0);build(WING,2.8);
  /* fedett veranda a főépület déli oldalán és a szárny előtt: deszka, tető alatt, itt nincs hó */
  const pm=lam(0xffffff,{map:plank});[[MAIN.x0-1.6,MAIN.x1,MAIN.z1,MAIN.z1+2.2],[WING.x0,WING.x1+1.6,WING.z1,WING.z1+2.2]].forEach(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(q[1]-q[0],0.45,q[3]-q[2]),pm);m.position.set((q[0]+q[1])/2,0.22,(q[2]+q[3])/2);m.receiveShadow=true;g.add(m);hard.push({x0:q[0],x1:q[1],z0:q[2],z1:q[3]});});
  /* a könyvelő irodája: a szárny keleti fele nyitott belső tér (ajtó délen); asztal, szekrény, kályha */
  const off=new THREE.Mesh(new THREE.PlaneGeometry(7,10),lam(0xc8c08a));off.rotation.x=-Math.PI/2;off.position.set(OFFICE.x,0.52,OFFICE.z);g.add(off);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,8),new THREE.MeshBasicMaterial({color:0xfff0c8}));lamp.position.set(OFFICE.x,3.0,OFFICE.z);g.add(lamp);
  scene.add(g);
  solid(MAIN.x0,MAIN.x1,MAIN.z0,MAIN.z1,'main');
  /* a szárnynak csak a nyugati fele tömör, a keleti fele az iroda (falakkal, ajtóval) */
  solid(WING.x0,13.6,WING.z0,WING.z1,'wingW');
  wallCol(13.6,WING.z0,WING.x1,WING.z0,0.3);wallCol(WING.x1,WING.z0,WING.x1,WING.z1,0.3);wallCol(13.6,WING.z0,13.6,WING.z1,0.3);
  wallCol(13.6,WING.z1,OFFICE.door.x-0.8,WING.z1,0.3);wallCol(OFFICE.door.x+0.8,WING.z1,WING.x1,WING.z1,0.3);
  hard.push({x0:13.6,x1:WING.x1,z0:WING.z0,z1:WING.z1});
  const desk=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.7,0.8),wood);desk.position.set(18.6,0.85,-31.5);scene.add(desk);col(18.6,-31.5,0.7,true);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,0.6),woodD);chest.position.set(21.2,1.1,-34.6);scene.add(chest);col(21.2,-34.6,0.6,true);
  const stove=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.4,0.9,10),lam(0x2a2a2a));stove.position.set(14.6,0.95,-34.4);scene.add(stove);col(14.6,-34.4,0.45,true);}
/* tetőpontok: az ereszeken kampóval fent lehet járni (nyom nélkül) */
[[-6,-26],[4,-26],[10,-32],[17,-30]].forEach((q,i)=>{const g=addGiant(q[0],q[1],i===3?4.4:4.8,false);g.dropR=i===3?7.2:9.6;});
/* lámpások a verandán és a kertben */
{const pg=new THREE.MeshLambertMaterial({color:0xfff0d0,emissive:0xffb060,emissiveIntensity:0.6});flashPatch(pg);
  [[-6,-15],[2,-15],[10,-15],[15,-21.4],[-14,10],[-4,-14]].forEach(q=>{const g=new THREE.Group();const p=new THREE.Mesh(new THREE.BoxGeometry(0.14,1.1,0.14),woodD);p.position.y=0.55;g.add(p);const l=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.5,0.4),pg);l.position.y=1.35;g.add(l);
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.08,0.5),snowM);s.position.y=1.64;g.add(s);g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.3,true);});}
/* hátsó kijárat: kapu a sziklafalban északon */
const EXIT={x0:-3,x1:3,z0:-59.5,z1:-57};
{const gm=woodD;[-3.2,3.2].forEach(x=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.4,3.6,0.4),gm);p.position.set(x,1.8,-59.8);scene.add(p);});const t=new THREE.Mesh(new THREE.BoxGeometry(7.4,0.4,0.6),gm);t.position.set(0,3.7,-59.8);scene.add(t);
  const s=new THREE.Mesh(new THREE.BoxGeometry(7.6,0.2,0.8),snowM);s.position.set(0,4.0,-59.8);scene.add(s);const hole=new THREE.Mesh(new THREE.PlaneGeometry(6,3.4),new THREE.MeshBasicMaterial({color:0xe8eef4}));hole.position.set(0,1.7,-60.1);scene.add(hole);}

/* ---------- hóesés: könnyű pelyhek a kamera körül ---------- */
const FLAKES=(()=>{const N=500,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(R()*2-1)*30;pos[i*3+1]=R()*14;pos[i*3+2]=(R()*2-1)*30;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color:0xffffff,size:0.07,transparent:true,opacity:0.8,depthWrite:false});const p=new THREE.Points(g,m);p.frustumCulled=false;scene.add(p);return p;})();
function stepFlakes(dt,cx,cz){const a=FLAKES.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=dt*0.9;a[i]+=Math.sin(a[i+1]*0.7+i)*dt*0.15;if(a[i+1]<0)a[i+1]+=14;}FLAKES.geometry.attributes.position.needsUpdate=true;FLAKES.position.set(cx,0,cz);}

/* ---------- lábnyomok: korlátozott számú lapos jelölő ---------- */
const PRINTS=[],NP=70;
{const t=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(120,140,170,0.55)';g.beginPath();g.ellipse(w*0.5,h*0.36,w*0.16,h*0.24,0,0,7);g.fill();g.beginPath();g.ellipse(w*0.5,h*0.78,w*0.13,h*0.12,0,0,7);g.fill();});
  const geo=new THREE.PlaneGeometry(0.28,0.42);geo.rotateX(-Math.PI/2);
  for(let i=0;i<NP;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:0}));m.position.y=0.02;m.visible=false;scene.add(m);PRINTS.push({m,x:0,z:0,t:-99,ry:0,seen:false});}}
let pIdx=0;
function addPrint(x,z,ry,t){const p=PRINTS[pIdx];pIdx=(pIdx+1)%NP;Object.assign(p,{x,z,ry,t,seen:false});p.m.position.set(x,0.02,z);p.m.rotation.y=ry;p.m.visible=true;p.m.material.opacity=0.85;return p;}
const PRINT_LIFE=45;
function stepPrints(t){PRINTS.forEach(p=>{if(!p.m.visible)return;const a=t-p.t;if(a>PRINT_LIFE||a<0){p.m.visible=false;return;}p.m.material.opacity=0.85*(1-Math.max(0,a-PRINT_LIFE*0.6)/(PRINT_LIFE*0.4));});}
function clearPrints(){PRINTS.forEach(p=>{p.m.visible=false;p.t=-99;});}

const routes={
  path:[{x:9,z:48},{x:9,z:28},{x:16,z:28},{x:16,z:48}],
  pools:[{x:-26,z:16},{x:-26,z:-16},{x:-12,z:-14},{x:-8,z:10},{x:-12,z:16}],
  front:[{x:-10,z:-12},{x:14,z:-12},{x:14,z:-16},{x:-10,z:-16}],
  east:[{x:26,z:-6},{x:26,z:-40},{x:24,z:-40},{x:24,z:-6}],
  back:[{x:-14,z:-40},{x:24,z:-42},{x:24,z:-48},{x:-14,z:-48}],
  door:[{x:12.4,z:-21.2},{x:23.2,z:-21.2}],
  north:[{x:-20,z:-54},{x:20,z:-54},{x:20,z:-50},{x:-20,z:-50}],
  west:[{x:-27,z:-20},{x:-27,z:-48},{x:-22,z:-48},{x:-22,z:-20}],
  south:[{x:14,z:40},{x:24,z:40},{x:24,z:12},{x:14,z:12}]};

A.ROOF=A.FOGADO={rects:solids,walkable,clampRoof,onHard,inSteam,stepSteam,stepFlakes,addPrint,stepPrints,clearPrints,PRINTS,PRINT_LIFE,POOLS,MAIN,WING,OFFICE,EXIT,routes,
  actors:['guard','guard','guard','guard','guard','guard','guard','guard','guard']};
})();
