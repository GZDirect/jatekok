(function(){
/* Shinobi – 6. pálya: A rókák éjszakája. Késő őszi lampionos ünnep egy kastély parkjában, alkonyattól sötétedésig.
   © 2026 Fejes Géza. Minden jog fenntartva.
   Dél: bambuszliget (rajt). Közép: lampionos fesztiváludvar bódésorokkal és színpaddal, nyugaton a koi-tó hidacskával.
   Északkelet: a privát teaház. Észak: szentélykert toriikkal, a hátsó kapu a kijárat (északnyugat).
   Három rókamaszkos díszvendég (az egyik Mori). Sík terep (H=0). Csak a ?palya=fesztival címmel fut. */
const A=window.AE;if(A.LV!=='fesztival')return;
const {scene,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const R=mulberry32(606);
const XMIN=-29.5,XMAX=29.5,ZMIN=-59.5,ZMAX=59.5;

/* ---------- ütközés és járhatóság (ugyanaz a minta, mint a kikötőben) ---------- */
const solids=[];
function col(x,z,r,low,tall){const o={x,z,r,low:!!low,tall:!!tall,kind:'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low,tall,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(step||0.8)));for(let i=0;i<=n;i++)col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low,tall);}
function solid(x0,x1,z0,z1,id,low){const s={id:id||'b',x0,x1,z0,z1,on:true};solids.push(s);const r=low?0.35:0.5;
  wallCol(x0+0.3,z0+0.3,x1-0.3,z0+0.3,r,low);wallCol(x0+0.3,z1-0.3,x1-0.3,z1-0.3,r,low);wallCol(x0+0.3,z0+0.3,x0+0.3,z1-0.3,r,low);wallCol(x1-0.3,z0+0.3,x1-0.3,z1-0.3,r,low);return s;}
const inRect=(r,x,z,m)=>x>r.x0-(m||0)&&x<r.x1+(m||0)&&z>r.z0-(m||0)&&z<r.z1+(m||0);
function walkable(x,z){if(x<XMIN||x>XMAX||z<ZMIN||z>ZMAX)return false;for(const s of solids)if(s.on&&inRect(s,x,z))return false;return true;}
function clampRoof(p){p.x=clamp(p.x,XMIN,XMAX);p.z=clamp(p.z,ZMIN,ZMAX);
  for(const s of solids){if(!s.on||!inRect(s,p.x,p.z,0.25))continue;const dl=p.x-(s.x0-0.25),dr=(s.x1+0.25)-p.x,dn=p.z-(s.z0-0.25),ds=(s.z1+0.25)-p.z,m=Math.min(dl,dr,dn,ds);
    if(m===dl)p.x=s.x0-0.26;else if(m===dr)p.x=s.x1+0.26;else if(m===dn)p.z=s.z0-0.26;else p.z=s.z1+0.26;}}

/* ---------- anyagok ---------- */
function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
const gravel=rep(canvasTex(256,256,(g,w,h)=>{g.fillStyle='#b8ae9c';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=150+Math.floor(R()*60);g.fillStyle='rgba('+v+','+(v-6)+','+(v-16)+',0.6)';g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}},true),18,36);
const moss=rep(canvasTex(128,128,(g,w,h)=>{g.fillStyle='#4a5a32';g.fillRect(0,0,w,h);for(let i=0;i<1500;i++){g.fillStyle=R()<0.5?'rgba(90,110,60,0.5)':'rgba(40,52,28,0.5)';g.fillRect(R()*w,R()*h,2,2);}},true),10,10);
const wood=lam(0x5a3a26),woodD=lam(0x3a261a),red=lam(0xb03222),white=lam(0xece6da),roofM=lam(0x2e3236),stone=lam(0x8a867c),paper=lam(0xf2e8d0,{emissive:0x5a4020,emissiveIntensity:0.25});
const paperGlow=new THREE.MeshLambertMaterial({color:0xfff0d0,emissive:0xffb060,emissiveIntensity:0.0});flashPatch(paperGlow);

/* ---------- talaj: kavics az udvarokon, moha a liget és a kert alatt ---------- */
{const gr=new THREE.Mesh(new THREE.PlaneGeometry(60,120),lam(0xffffff,{map:gravel}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;scene.add(gr);
  [[0,46,60,28],[0,-50,60,20]].forEach(q=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(q[2],q[3]),lam(0xffffff,{map:moss}));m.rotation.x=-Math.PI/2;m.position.set(q[0],0.01,q[1]);m.receiveShadow=true;scene.add(m);});
  const pathT=rep(canvasTex(96,96,(g,w,h)=>{g.fillStyle='#a89e8a';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){const v=130+Math.floor(R()*60);g.fillStyle='rgba('+v+','+(v-6)+','+(v-18)+',0.7)';g.fillRect(R()*w,R()*h,2,2);}
    [[4,4,42,40],[50,6,42,36],[6,50,38,42],[48,48,44,44]].forEach(q=>{g.fillStyle='rgba(40,34,26,0.35)';g.beginPath();g.roundRect?g.roundRect(q[0]+2,q[1]+3,q[2],q[3],8):g.rect(q[0]+2,q[1]+3,q[2],q[3]);g.fill();const v=196+Math.floor(R()*24);g.fillStyle='rgb('+v+','+(v-6)+','+(v-16)+')';g.beginPath();g.roundRect?g.roundRect(q[0],q[1],q[2],q[3],8):g.rect(q[0],q[1],q[2],q[3]);g.fill();});}),1,40);
  const path=new THREE.Mesh(new THREE.PlaneGeometry(3,120),lam(0xffffff,{map:pathT}));path.rotation.x=-Math.PI/2;path.position.set(0,0.015,0);scene.add(path);
  const far=new THREE.Mesh(new THREE.PlaneGeometry(600,600),lam(0x3e4a30));far.rotation.x=-Math.PI/2;far.position.y=-0.03;scene.add(far);}

/* ---------- a park fala (kőalap, fehér vakolat, cseréptető) körben, a hátsó kapuval ---------- */
const EXIT={x0:-27,x1:-21,z0:-59.5,z1:-57};
{const wallM=white,baseM=stone;
  const seg=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0),cx=(x0+x1)/2,cz=(z0+z1)/2;
    const b=new THREE.Mesh(new THREE.BoxGeometry(L,1.2,1.0),baseM);b.position.set(cx,0.6,cz);b.rotation.y=-a;b.castShadow=true;scene.add(b);
    const w=new THREE.Mesh(new THREE.BoxGeometry(L,1.6,0.6),wallM);w.position.set(cx,2.0,cz);w.rotation.y=-a;w.castShadow=true;scene.add(w);
    const r=new THREE.Mesh(new THREE.BoxGeometry(L,0.25,1.2),roofM);r.position.set(cx,2.9,cz);r.rotation.y=-a;scene.add(r);};
  seg(-30.2,60.2,30.2,60.2);seg(-30.2,-60.2,EXIT.x0,-60.2);seg(EXIT.x1,-60.2,30.2,-60.2);seg(-30.2,-60.2,-30.2,60.2);seg(30.2,-60.2,30.2,60.2);
  /* hátsó kapu: két oszlop, tető, nyitott szárny */
  [EXIT.x0,EXIT.x1].forEach(x=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.5,3.4,0.5),woodD);p.position.set(x,1.7,-60.2);scene.add(p);});
  const gr=new THREE.Mesh(new THREE.BoxGeometry(EXIT.x1-EXIT.x0+1,0.3,1.6),roofM);gr.position.set((EXIT.x0+EXIT.x1)/2,3.5,-60.2);scene.add(gr);
  /* a kastély tornya a nyugati fal mögött */
  const keep=new THREE.Group();[[16,6,16,0],[13,5,13,6],[10,4.5,10,11.2],[7,4,7,16]].forEach(q=>{const b=new THREE.Mesh(new THREE.BoxGeometry(q[0],q[1],q[2]),white);b.position.y=q[3]+q[1]/2+8;keep.add(b);
    const r=new THREE.Mesh(new THREE.ConeGeometry(q[0]*0.82,2.2,4),roofM);r.rotation.y=Math.PI/4;r.position.y=q[3]+q[1]+8.6;keep.add(r);});
  const base=new THREE.Mesh(new THREE.BoxGeometry(22,8,22),stone);base.position.y=4;keep.add(base);keep.position.set(-62,0,-10);scene.add(keep);
  const hills=lam(0x4a5a3a,{flatShading:true});[[-120,-140,60],[60,-160,70],[160,-60,50],[-160,60,55]].forEach(q=>{const h=new THREE.Mesh(new THREE.ConeGeometry(q[2]*1.6,q[2],7),hills);h.position.set(q[0],q[2]/2-2,q[1]);scene.add(h);});}

/* ---------- bambuszliget délen (takar, nem lehet átmenni) ---------- */
{const stems=[],pos=[];for(let i=0;i<34;i++){let x,z,ok=false,t=0;while(!ok&&t<50){t++;x=(R()*2-1)*27;z=34+R()*24;ok=Math.abs(x)>3.2&&!(z>51&&Math.abs(x)<6);}if(ok)pos.push([x,z,1.1+R()*1.1]);}
  const sm=lam(0x6a8a3a),lm=lam(0x4a6e2c,{side:THREE.DoubleSide});
  pos.forEach(q=>{for(let k=0;k<7;k++){const a=R()*6.28,r=R()*q[2]*0.8;stems.push({x:q[0]+Math.cos(a)*r,z:q[1]+Math.sin(a)*r,h:7+R()*5,l:R()*0.3});}col(q[0],q[1],q[2]*0.85);});
  const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05,0.06,1,5),sm,stems.length),D=new THREE.Object3D();
  stems.forEach((s,i)=>{D.position.set(s.x,s.h/2,s.z);D.rotation.set(s.l*0.2,0,s.l*0.15);D.scale.set(1,s.h,1);D.updateMatrix();im.setMatrixAt(i,D.matrix);});im.castShadow=true;scene.add(im);
  const lf=new THREE.InstancedMesh(new THREE.ConeGeometry(0.9,2.6,5),lm,stems.length);stems.forEach((s,i)=>{D.position.set(s.x,s.h-0.6,s.z);D.rotation.set(Math.PI,R()*6,0);D.scale.set(1,1,1);D.updateMatrix();lf.setMatrixAt(i,D.matrix);});lf.castShadow=true;scene.add(lf);}

/* ---------- fenyők: kampópontok és mászható törzsek ---------- */
const PINES=[[-23,26],[22,30],[-25,-22],[25,-10],[-13,-40],[13,-47],[-4,36],[24,10]];
function addGiant(x,z,top,climb){const s=(top-0.85)/8.6,t={kind:'giant',x,z,s,c:R(),r:0.45,col:1.6*s,cr:3.4*s,h:21*s,py:8.6*s,climb:!!climb,i:giants.length};giants.push(t);return t;}
{const trunk=lam(0x5a4434),needle=lam(0x2e4a2a,{flatShading:true});
  PINES.forEach(q=>{const g=new THREE.Group(),h=9;const t=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.42,h,7),trunk);t.position.y=h/2;t.rotation.z=(R()-0.5)*0.12;t.castShadow=true;g.add(t);
    [[7.0,3.2],[8.4,2.6],[9.6,1.9]].forEach((l,k)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(l[1]*0.75,l[1],1.1,8),needle);c.position.set((R()-0.5)*0.8,l[0],(R()-0.5)*0.8);c.castShadow=true;g.add(c);});
    g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.45);addGiant(q[0],q[1],6.6,true);});}

/* ---------- fesztiváludvar: bódék, színpad, lampionfüzérek ---------- */
const LANTERNS=[];
{const stall=(x,z,ry,c)=>{const g=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.0,1.6),wood);base.position.y=0.5;base.castShadow=true;g.add(base);
    const top=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.08,1.7),lam(0xd8cdb4));top.position.y=1.04;g.add(top);
    [[-1.5,-0.7],[1.5,-0.7],[-1.5,0.7],[1.5,0.7]].forEach(p=>{const pst=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.4,0.1),woodD);pst.position.set(p[0],1.2,p[1]);g.add(pst);});
    const awn=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.08,2.2),lam(c));awn.position.set(0,2.45,0.1);awn.rotation.x=0.18;awn.castShadow=true;g.add(awn);
    const nor=new THREE.Mesh(new THREE.PlaneGeometry(3.2,0.55),lam(0xf0e6d0,{side:THREE.DoubleSide}));nor.position.set(0,2.1,0.82);g.add(nor);
    for(let k=0;k<3;k++){const it=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.18,0.4),lam([0xc84a2a,0xe8c060,0x7a9a4a][k]));it.position.set(-1+k,1.17,0.2);g.add(it);}
    const lp=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),paperGlow);lp.scale.y=1.3;lp.position.set(1.3,2.0,0.9);g.add(lp);
    g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);};
  const cols=[0xb03222,0x2a4a7a,0xd8a030,0x3a6a4a,0x8a2a5a,0xb03222];
  [22,15,8,1,-6].forEach((z,i)=>{stall(-16,z,Math.PI/2,cols[i%6]);solid(-16.8,-15.2,z-1.6,z+1.6,'stall');stall(16,z,-Math.PI/2,cols[(i+3)%6]);solid(15.2,16.8,z-1.6,z+1.6,'stall');});
  /* színpad taikodobokkal */
  const st=new THREE.Mesh(new THREE.BoxGeometry(8,1,4),wood);st.position.set(0,0.5,-9);st.castShadow=true;st.receiveShadow=true;scene.add(st);solid(-4,4,-11,-7,'stage');
  const back=new THREE.Mesh(new THREE.BoxGeometry(8,3.4,0.3),red);back.position.set(0,2.7,-10.9);scene.add(back);
  [[-2,-9],[0.5,-9.4],[2.6,-8.8]].forEach(q=>{const d=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.9,14),lam(0x6a3a22));d.rotation.x=Math.PI/2;d.position.set(q[0],1.6,q[1]);scene.add(d);});
  /* lampionfüzérek a bódésorok között */
  const string=(x0,z0,x1,z1,n)=>{for(let i=0;i<=n;i++){const k=i/n,x=x0+(x1-x0)*k,z=z0+(z1-z0)*k,y=4.2-Math.sin(k*Math.PI)*0.9;const m=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),paperGlow);m.scale.y=1.25;m.position.set(x,y,z);scene.add(m);
      const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffa050,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(1.5);s.position.copy(m.position);scene.add(s);LANTERNS.push(s);}
    const w=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,Math.hypot(x1-x0,z1-z0),3),woodD);w.position.set((x0+x1)/2,3.8,(z0+z1)/2);w.rotation.z=Math.PI/2;w.rotation.y=-Math.atan2(z1-z0,x1-x0);scene.add(w);};
  [24,16,8,0,-8].forEach(z=>string(-14.6,z,14.6,z,9));
  [[-14.8,26],[14.8,26],[-14.8,-12],[14.8,-12]].forEach(q=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,4.6,6),woodD);p.position.set(q[0],2.3,q[1]);scene.add(p);col(q[0],q[1],0.2);});
  /* kőlámpások */
  [[-3,-16],[3,-16],[-3,-30],[3,-30],[-8,-52],[8,-52]].forEach(q=>{const g=new THREE.Group();[[0.5,0.3,0.15],[0.2,0.9,0.75],[0.55,0.45,1.35],[0.7,0.18,1.67]].forEach(l=>{const b=new THREE.Mesh(new THREE.BoxGeometry(l[0],l[1],l[0]),stone);b.position.y=l[2];b.castShadow=true;g.add(b);});
    const w=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.26,0.36),paperGlow);w.position.y=1.35;g.add(w);g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.4,true);});}

/* ---------- koi-tó a nyugati oldalon, ívelt hídda ---------- */
const POND={x0:-28.5,x1:-19,z0:-6,z1:10};
{const w=new THREE.Mesh(new THREE.PlaneGeometry(POND.x1-POND.x0,POND.z1-POND.z0),new THREE.MeshPhongMaterial({color:0x2a4a50,shininess:90,specular:0x8ab0b0}));w.rotation.x=-Math.PI/2;w.position.set((POND.x0+POND.x1)/2,0.04,(POND.z0+POND.z1)/2);scene.add(w);
  for(let i=0;i<5;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.04,0.12),lam([0xe86a2a,0xf0f0e0,0xd84a2a][i%3]));f.position.set(-26+R()*5,0.06,-3+R()*10);f.rotation.y=R()*6;scene.add(f);}
  const rim=stone;[[POND.x0,POND.z0,POND.x1,POND.z0],[POND.x0,POND.z1,POND.x1,POND.z1],[POND.x1,POND.z0,POND.x1,POND.z1]].forEach(q=>{const L=Math.hypot(q[2]-q[0],q[3]-q[1]);const b=new THREE.Mesh(new THREE.BoxGeometry(q[0]===q[2]?0.5:L,0.3,q[0]===q[2]?L:0.5),rim);b.position.set((q[0]+q[2])/2,0.15,(q[1]+q[3])/2);scene.add(b);});
  /* a tó két része: a híd (z 1..3) járható, a víz nem */
  solids.push({id:'pond',x0:POND.x0,x1:POND.x1,z0:POND.z0,z1:0.9,on:true},{id:'pond',x0:POND.x0,x1:POND.x1,z0:3.1,z1:POND.z1,on:true});
  wallCol(POND.x1,POND.z0,POND.x1,0.9,0.3,true,true);wallCol(POND.x1,3.1,POND.x1,POND.z1,0.3,true,true);wallCol(POND.x0,POND.z0,POND.x1,POND.z0,0.3,true,true);wallCol(POND.x0,POND.z1,POND.x1,POND.z1,0.3,true,true);
  const br=new THREE.Group();for(let i=0;i<10;i++){const k=i/9,x=POND.x0+(POND.x1-POND.x0)*k;const p=new THREE.Mesh(new THREE.BoxGeometry((POND.x1-POND.x0)/9.5,0.12,2.2),red);p.position.set(x,0.25+Math.sin(k*Math.PI)*0.45,2);br.add(p);}
  [-1,1].forEach(s=>{const rl=new THREE.Mesh(new THREE.BoxGeometry(POND.x1-POND.x0,0.08,0.08),red);rl.position.set((POND.x0+POND.x1)/2,1.2,2+s*1.05);br.add(rl);});scene.add(br);
  wallCol(POND.x0,0.95,POND.x1,0.95,0.2,true,true,0.5);wallCol(POND.x0,3.05,POND.x1,3.05,0.2,true,true,0.5);}

/* ---------- a privát teaház északkeleten ---------- */
const TEA={x0:14,x1:24,z0:-34,z1:-24,door:{x:19,z:-23.4}};
{const g=new THREE.Group(),cx=(TEA.x0+TEA.x1)/2,cz=(TEA.z0+TEA.z1)/2,W=TEA.x1-TEA.x0,Dd=TEA.z1-TEA.z0;
  const fl=new THREE.Mesh(new THREE.BoxGeometry(W+1,0.4,Dd+1),wood);fl.position.set(cx,0.2,cz);fl.receiveShadow=true;g.add(fl);
  const tat=new THREE.Mesh(new THREE.PlaneGeometry(W-0.4,Dd-0.4),lam(0xc8c08a));tat.rotation.x=-Math.PI/2;tat.position.set(cx,0.41,cz);g.add(tat);
  const shoji=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#f4ecd8';c.fillRect(0,0,w,h);c.strokeStyle='#5a3a26';c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(i*w/4,0);c.lineTo(i*w/4,h);c.stroke();}for(let i=1;i<5;i++){c.beginPath();c.moveTo(0,i*h/5);c.lineTo(w,i*h/5);c.stroke();}});
  const sm=new THREE.MeshLambertMaterial({map:rep(shoji,1,1),emissive:0x8a5a20,emissiveIntensity:0.15,side:THREE.DoubleSide});flashPatch(sm);TEA.paper=sm;
  const wall=(x,z,w,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,2.4,d),sm);m.position.set(x,1.6,z);g.add(m);};
  wall(cx,TEA.z0,W,0.08);wall(TEA.x0,cz,0.08,Dd);wall(TEA.x1,cz,0.08,Dd);wall((TEA.x0+TEA.door.x-0.8)/2,TEA.z1,TEA.door.x-0.8-TEA.x0,0.08);wall((TEA.door.x+0.8+TEA.x1)/2,TEA.z1,TEA.x1-TEA.door.x-0.8,0.08);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(W,Dd)*0.62,2.6,4),roofM);roof.rotation.y=Math.PI/4;roof.scale.set(1,1,Dd/W);roof.position.set(cx,4.1,cz);roof.castShadow=true;g.add(roof);
  const tbl=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.35,0.9),woodD);tbl.position.set(cx,0.58,cz-1);g.add(tbl);
  scene.add(g);
  wallCol(TEA.x0,TEA.z0,TEA.x1,TEA.z0,0.3);wallCol(TEA.x0,TEA.z0,TEA.x0,TEA.z1,0.3);wallCol(TEA.x1,TEA.z0,TEA.x1,TEA.z1,0.3);wallCol(TEA.x0,TEA.z1,TEA.door.x-0.9,TEA.z1,0.3);wallCol(TEA.door.x+0.9,TEA.z1,TEA.x1,TEA.z1,0.3);}
addGiant(19,-29,4.4,false).dropR=6.6;/* a teaház teteje: onnan a bejárat elé ugrasz */

/* ---------- szentélykert: toriik, a szentély épülete ---------- */
{const torii=(z)=>{const g=new THREE.Group();[-1.8,1.8].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.24,4.6,10),red);p.position.set(x,2.3,0);p.castShadow=true;g.add(p);col(x,z,0.3);});
    const k1=new THREE.Mesh(new THREE.BoxGeometry(5.6,0.35,0.5),lam(0x1e1e1e));k1.position.y=4.75;g.add(k1);const k2=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.25,0.35),red);k2.position.y=4.1;g.add(k2);g.position.set(0,0,z);scene.add(g);};
  [-20,-34,-42].forEach(torii);
  const sh=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(12,3.2,7),lam(0x8a5a3a));b.position.y=2.2;b.castShadow=true;sh.add(b);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(13,0.6,8),stone);pl.position.y=0.3;sh.add(pl);
  const r=new THREE.Mesh(new THREE.ConeGeometry(9.5,3.4,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,0.62);r.position.y=5.4;r.castShadow=true;sh.add(r);
  const rope=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.12,6,16,Math.PI),lam(0xe8dcb0));rope.rotation.z=Math.PI;rope.position.set(0,3.4,3.55);sh.add(rope);
  sh.position.set(0,0,-52);scene.add(sh);solid(-6.5,6.5,-56,-48,'shrine');}

/* ---------- díszvendégek kellékei: rókamaszk és legyező ---------- */
function foxMask(){const g=new THREE.Group(),wm=new THREE.MeshLambertMaterial({color:0xf4f0e8}),rm=new THREE.MeshBasicMaterial({color:0xc8281e}),bk=new THREE.MeshBasicMaterial({color:0x1a1210});
  const face=new THREE.Mesh(new THREE.SphereGeometry(0.125,10,8,0,Math.PI*2,0,Math.PI*0.6),wm);face.rotation.x=-Math.PI/2;face.scale.set(1,1,0.9);face.position.set(0,0.12,-0.02);g.add(face);
  const snout=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.14,8),wm);snout.rotation.x=-Math.PI/2;snout.position.set(0,0.08,-0.16);g.add(snout);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.11,4),wm);e.position.set(s*0.075,0.25,-0.03);e.rotation.z=-s*0.25;g.add(e);
    const ei=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.07,4),rm);ei.position.set(s*0.075,0.245,-0.06);ei.rotation.z=-s*0.25;g.add(ei);
    const st=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.012,0.01),rm);st.position.set(s*0.05,0.155,-0.125);st.rotation.z=s*0.45;g.add(st);
    const ey=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.01,0.01),bk);ey.position.set(s*0.042,0.135,-0.128);ey.rotation.z=-s*0.3;g.add(ey);});
  const nose=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,5),bk);nose.position.set(0,0.08,-0.23);g.add(nose);return g;}
function fan(){const g=new THREE.Group();const shp=new THREE.Shape();shp.moveTo(0,0);shp.absarc(0,0,0.2,Math.PI*0.2,Math.PI*0.8,false);shp.lineTo(0,0);
  const m=new THREE.Mesh(new THREE.ShapeGeometry(shp,8),new THREE.MeshLambertMaterial({color:0xe8dcc0,side:THREE.DoubleSide}));g.add(m);
  const r=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,0.05),new THREE.Vector2(0.03,0.15),new THREE.Vector2(-0.03,0.15)])),new THREE.MeshBasicMaterial({color:0xc8281e,side:THREE.DoubleSide}));r.position.z=0.001;g.add(r);
  g.rotation.x=Math.PI;g.position.set(0,-0.34,-0.04);return g;}

/* ---------- civil látogatók (díszlet: sétálnak, nem figyelnek) ---------- */
const VISIT=[];
{const loops=[[[-11,24],[-11,-4],[-6,-4],[-6,24]],[[11,24],[11,-4],[6,-4],[6,24]],[[-9,10],[9,10],[9,14],[-9,14]],[[-3,-14],[3,-14],[3,-28],[-3,-28]],[[-11,2],[-18.5,2],[-11,2],[-11,-2]],[[7,20],[-7,20],[-7,18],[7,18]]];
  loops.forEach((L,i)=>{const m=A.buildPolice(60+i,{suit:true,civ:true});scene.add(m);const R2=m.userData.R;if(R2.lensGlow)R2.lensGlow.visible=false;
    VISIT.push({m,L,k:0,x:L[0][0],z:L[0][1],ry:0,sp:0.9+R()*0.3,wait:R()*4});});}
function stepVisitors(dt,t){VISIT.forEach(v=>{if(v.wait>0){v.wait-=dt;v.m.userData.anim(t,0,dt,{st:'patrol',bp:0,sweep:Math.sin(t*0.5+v.sp)*0.3,shoot:0,fall:0,stagger:0});return;}
  const p=v.L[(v.k+1)%v.L.length],dx=p[0]-v.x,dz=p[1]-v.z,d=Math.hypot(dx,dz);if(d<0.3){v.k=(v.k+1)%v.L.length;v.wait=1+R()*5;return;}
  const s=Math.min(d,v.sp*dt);v.x+=dx/d*s;v.z+=dz/d*s;const want=Math.atan2(-dx,-dz);v.ry+=Math.atan2(Math.sin(want-v.ry),Math.cos(want-v.ry))*Math.min(1,dt*5);
  v.m.position.set(v.x,0,v.z);v.m.rotation.y=v.ry;v.m.userData.anim(t,v.sp,dt,{st:'patrol',bp:0,sweep:0,shoot:0,fall:0,stagger:0});});}

/* ---------- tűzijáték: rakéták a szentélykert fölött ---------- */
const FW=[];
{const N=70;for(let i=0;i<6;i++){const geo=new THREE.BufferGeometry(),pos=new Float32Array(N*3),dirs=[];for(let k=0;k<N;k++){const u=R()*2-1,a=R()*6.28,s=Math.sqrt(1-u*u);dirs.push(new THREE.Vector3(s*Math.cos(a),u,s*Math.sin(a)));}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const mat=new THREE.PointsMaterial({size:1.6,map:glowTex,color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
  const p=new THREE.Points(geo,mat);p.frustumCulled=false;scene.add(p);FW.push({p,dirs,t:9,c:new THREE.Vector3(),col:0});}}
const FWCOLS=[0xff5a3a,0xffd060,0x7ad0ff,0xff7ad0,0xa0ff8a,0xffffff];
function burst(f){f.t=0;f.c.set((R()*2-1)*35,32+R()*16,-70-R()*40);f.p.material.color.setHex(FWCOLS[Math.floor(R()*FWCOLS.length)]);}
function stepFireworks(dt,on){FW.forEach(f=>{if(on&&f.t>2.2&&R()<dt*0.8)burst(f);f.t+=dt;const k=f.t,r=k<2.2?(1-Math.pow(1-Math.min(1,k/1.6),3))*14:0;
  const pos=f.p.geometry.attributes.position.array;for(let i=0;i<f.dirs.length;i++){const d=f.dirs[i];pos[i*3]=f.c.x+d.x*r;pos[i*3+1]=f.c.y+d.y*r-k*k*1.4;pos[i*3+2]=f.c.z+d.z*r;}
  f.p.geometry.attributes.position.needsUpdate=true;f.p.material.opacity=k<2.2?Math.max(0,1-k/2.2):0;});}

/* ---------- útvonalak és helyek ---------- */
const spots={
  stalls:{x:-6,z:15.5},stage:{x:3,z:-3.5},bridge:{x:-13,z:2},tea:{x:19,z:-29},
  body:{x:0,z:0}};
const routes={
  court1:[{x:-11,z:27},{x:-11,z:13},{x:-4,z:13},{x:-4,z:27}],
  court2:[{x:12,z:-12},{x:12,z:4},{x:7,z:4},{x:7,z:-12}],
  shrine:[{x:-14,z:-36},{x:14,z:-36},{x:14,z:-44},{x:-14,z:-44}],
  tea:[{x:19,z:-21.8}],
  bamboo:[{x:0,z:50},{x:0,z:32},{x:-1.5,z:32},{x:-1.5,z:50}],
  pond:[{x:-24,z:14},{x:-24,z:20},{x:-18,z:28},{x:-18,z:14}]};

A.ROOF=A.FESZT={rects:solids,walkable,clampRoof,LANTERNS,paperGlow,TEA,POND,EXIT,spots,routes,foxMask,fan,stepVisitors,stepFireworks,burst,FW,VISIT,
  actors:['vip','vip','vip','guard','guard','guard','guard','guard','guard','guard']};
})();
