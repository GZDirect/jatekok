(function(){
/* Shinobi – 8. pálya: Az utolsó pecsét. Ősi hegyi templom, világos reggel.
   © 2026 Fejes Géza. Minden jog fenntartva.
   Dél: erdei ösvény és a külső szentélykert (rajt). Középen a templom: papírfolyosó (z -14..-10), mögötte négy szoba (z -24..-14),
   belső udvar (z -28..-24), a főcsarnok (z -40..-28), és a titkos archívum (z -48..-40) egy elhúzható falpanel mögött.
   A papírfolyosó egyes szakaszain a lámpás a hátad mögött van: ott a sziluetted kirajzolódik a szoba felőli papírfalon.
   Kijárat: a hátsó erdei ösvény északnyugaton. Sík terep (H=0). Csak a ?palya=templom címmel fut. */
const A=window.AE;if(A.LV!=='templom')return;
const {scene,grid,addTo,trees,canvasTex,glowTex,flashPatch,mulberry32,clamp,giants}=A;
const lam=(c,o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const R=mulberry32(808);
const XMIN=-29.5,XMAX=29.5,ZMIN=-59.5,ZMAX=59.5;

const solids=[];
function col(x,z,r,low,tall){const o={x,z,r,low:!!low,tall:!!tall,kind:'prop'};trees.push(o);addTo(grid,o);return o;}
function wallCol(x0,z0,x1,z1,r,low,tall,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(step||0.6)));const out=[];for(let i=0;i<=n;i++)out.push(col(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r,low,tall));return out;}
const inRect=(r,x,z,m)=>x>r.x0-(m||0)&&x<r.x1+(m||0)&&z>r.z0-(m||0)&&z<r.z1+(m||0);
function walkable(x,z){if(x<XMIN||x>XMAX||z<ZMIN||z>ZMAX)return false;for(const s of solids)if(s.on&&inRect(s,x,z))return false;return true;}
function clampRoof(p){p.x=clamp(p.x,XMIN,XMAX);p.z=clamp(p.z,ZMIN,ZMAX);
  for(const s of solids){if(!s.on||!inRect(s,p.x,p.z,0.25))continue;const dl=p.x-(s.x0-0.25),dr=(s.x1+0.25)-p.x,dn=p.z-(s.z0-0.25),ds=(s.z1+0.25)-p.z,m=Math.min(dl,dr,dn,ds);
    if(m===dl)p.x=s.x0-0.26;else if(m===dr)p.x=s.x1+0.26;else if(m===dn)p.z=s.z0-0.26;else p.z=s.z1+0.26;}}

function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
const gravel=rep(canvasTex(256,256,(g,w,h)=>{g.fillStyle='#bdb5a4';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=150+Math.floor(R()*70);g.fillStyle='rgba('+v+','+(v-4)+','+(v-14)+',0.55)';g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}},true),18,36);
const moss=rep(canvasTex(128,128,(g,w,h)=>{g.fillStyle='#3e5a2e';g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){g.fillStyle=R()<0.5?'rgba(80,110,50,0.5)':'rgba(30,50,24,0.5)';g.fillRect(R()*w,R()*h,2,2);}},true),12,12);
const plank=rep(canvasTex(128,128,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=['#7a5636','#6a4a2e','#84603e'][i%3];g.fillRect(0,i*16,w,16);g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(0,i*16,w,1);}},true),6,6);
const woodD=lam(0x3a2618),wood=lam(0x6a4628),red=lam(0xa83020),roofM=lam(0x2a2e30),stone=lam(0x8a867c);
const shoji=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#f6eedc';c.fillRect(0,0,w,h);c.strokeStyle='#3a2618';c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(i*w/4,0);c.lineTo(i*w/4,h);c.stroke();}for(let i=1;i<5;i++){c.beginPath();c.moveTo(0,i*h/5);c.lineTo(w,i*h/5);c.stroke();}});
const shojiM=new THREE.MeshLambertMaterial({map:shoji,side:THREE.DoubleSide,emissive:0x6a4a20,emissiveIntensity:0.12});flashPatch(shojiM);

/* ---------- talaj és környezet ---------- */
{const gr=new THREE.Mesh(new THREE.PlaneGeometry(62,122),lam(0xffffff,{map:gravel}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;scene.add(gr);
  [[0,44,62,32],[-24,-30,14,60],[24,-30,14,60],[0,-55,62,10]].forEach(q=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(q[2],q[3]),lam(0xffffff,{map:moss}));m.rotation.x=-Math.PI/2;m.position.set(q[0],0.01,q[1]);m.receiveShadow=true;scene.add(m);});
  const far=new THREE.Mesh(new THREE.PlaneGeometry(700,700),lam(0x34482a));far.rotation.x=-Math.PI/2;far.position.y=-0.03;scene.add(far);
  const mt=lam(0x5a6e52,{flatShading:true});[[-100,-120,70],[30,-160,90],[120,-80,60],[-150,30,60],[140,50,55],[-60,150,50],[80,150,50]].forEach(q=>{const m=new THREE.Mesh(new THREE.ConeGeometry(q[2]*1.3,q[2]*1.2,7),mt);m.position.set(q[0],q[2]*0.6-2,q[1]);scene.add(m);});
  /* sűrű erdő körben (határ) */
  const tr=lam(0x4a3a2a),nd=lam(0x26402a,{flatShading:true});const ring=[];for(let i=0;i<120;i++){const a=R()*Math.PI*2;let x,z;if(R()<0.5){x=(R()<0.5?-1:1)*(31+R()*10);z=(R()*2-1)*64;}else{x=(R()*2-1)*42;z=(R()<0.5?-1:1)*(61+R()*8);}ring.push([x,z,7+R()*6]);}
  const tg=new THREE.CylinderGeometry(0.25,0.35,1,6),cg=new THREE.ConeGeometry(2.4,1,7);const ti=new THREE.InstancedMesh(tg,tr,ring.length),ci=new THREE.InstancedMesh(cg,nd,ring.length),D=new THREE.Object3D();
  ring.forEach((q,i)=>{D.position.set(q[0],q[2]*0.3,q[1]);D.scale.set(1,q[2]*0.6,1);D.updateMatrix();ti.setMatrixAt(i,D.matrix);D.position.set(q[0],q[2]*0.75,q[1]);D.scale.set(1,q[2]*0.8,1);D.updateMatrix();ci.setMatrixAt(i,D.matrix);});scene.add(ti);scene.add(ci);}

/* ---------- fenyők és kőlámpások a kertben ---------- */
function addGiant(x,z,top,climb){const s=(top-0.85)/8.6,t={kind:'giant',x,z,s,c:R(),r:0.45,col:1.6*s,cr:3.4*s,h:21*s,py:8.6*s,climb:!!climb,i:giants.length};giants.push(t);return t;}
{const tr=lam(0x5a4434),nd=lam(0x2e4a2a,{flatShading:true});
  [[-16,40],[16,36],[-26,14],[26,10],[-27,-46],[27,-50],[-8,-54]].forEach(q=>{const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.42,9,7),tr);t.position.y=4.5;t.castShadow=true;g.add(t);
    [[7.0,3.2],[8.4,2.6],[9.6,1.9]].forEach(l=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(l[1]*0.75,l[1],1.1,8),nd);c.position.set((R()-0.5)*0.8,l[0],(R()-0.5)*0.8);c.castShadow=true;g.add(c);});
    g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.45);addGiant(q[0],q[1],6.6,true);});
  [[-4,30],[4,30],[-4,14],[4,14],[-18,-6],[18,-6]].forEach(q=>{const g=new THREE.Group();[[0.5,0.3,0.15],[0.2,0.9,0.75],[0.55,0.45,1.35],[0.7,0.18,1.67]].forEach(l=>{const b=new THREE.Mesh(new THREE.BoxGeometry(l[0],l[1],l[0]),stone);b.position.y=l[2];b.castShadow=true;g.add(b);});g.position.set(q[0],0,q[1]);scene.add(g);col(q[0],q[1],0.4,true);});
  /* lépcső és torii a bejáratnál */
  const tg=new THREE.Group();[-2,2].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,5,10),red);p.position.set(x,2.5,0);tg.add(p);col(x,40,0.3);});
  const k1=new THREE.Mesh(new THREE.BoxGeometry(6.2,0.38,0.55),lam(0x1e1e1e));k1.position.y=5.15;tg.add(k1);const k2=new THREE.Mesh(new THREE.BoxGeometry(5,0.26,0.36),red);k2.position.y=4.45;tg.add(k2);tg.position.set(0,0,40);scene.add(tg);}

/* ---------- a templom ---------- */
const B={x0:-22,x1:22,z0:-40,z1:-10};
const PANEL={x0:-2,x1:2,z:-40,open:false,m:null,solid:null,cols:[]};
const ARCH={x0:-6,x1:6,z0:-48,z1:-40,chest:{x:0,z:-46.2}};
const SWITCH={moon:{x:-20.6,z:-22.4},sun:{x:20.6,z:-22.4}};
const LIT=[];/* sziluett-szakaszok: {x0,x1} a folyosón, ahol a lámpás a hátad mögött van; a néző a szobában: {x0,x1,z0,z1} */
{const g=new THREE.Group(),pm=lam(0xffffff,{map:plank});
  const floor=new THREE.Mesh(new THREE.BoxGeometry(B.x1-B.x0+2,0.3,B.z1-B.z0+2),pm);floor.position.set(0,0.15,(B.z0+B.z1)/2);floor.receiveShadow=true;g.add(floor);
  const af=new THREE.Mesh(new THREE.BoxGeometry(ARCH.x1-ARCH.x0,0.3,ARCH.z1-ARCH.z0),lam(0x3a3028));af.position.set(0,0.15,(ARCH.z0+ARCH.z1)/2);g.add(af);
  /* fal: h magas, m anyag; a papírfal nem állítja meg a pillantást? de igen: a falak takarnak, csak a sziluett árulkodik */
  const W=(x0,z0,x1,z1,m,h,gaps)=>{gaps=gaps||[];const horiz=Math.abs(z1-z0)<0.01,a0=horiz?Math.min(x0,x1):Math.min(z0,z1),a1=horiz?Math.max(x0,x1):Math.max(z0,z1);let segs=[[a0,a1]];
    gaps.forEach(gp=>{segs=segs.flatMap(s=>gp[1]<=s[0]||gp[0]>=s[1]?[s]:[[s[0],gp[0]],[gp[1],s[1]]].filter(q=>q[1]-q[0]>0.05));});
    segs.forEach(s=>{const L=s[1]-s[0],c=(s[0]+s[1])/2;const mesh=new THREE.Mesh(new THREE.BoxGeometry(horiz?L:0.12,h||2.6,horiz?0.12:L),m);mesh.position.set(horiz?c:x0,0.3+(h||2.6)/2,horiz?z0:c);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
      if(horiz)wallCol(s[0],z0,s[1],z0,0.3);else wallCol(x0,s[0],x0,s[1],0.3);});};
  /* külső falak: déli bejárat (x 0) és a két végén (x ±20); kelet és nyugat zárt; észak a főcsarnok és az archívum */
  W(B.x0,B.z1,B.x1,B.z1,wood,2.6,[[-1.2,1.2],[-21.2,-18.8],[18.8,21.2]]);W(B.x0,B.z1,B.x0,-24,wood);W(B.x1,B.z1,B.x1,-24,wood);
  /* papírfal a folyosó és a szobák között (z=-14), ajtó az 1. és a 4. szobába */
  W(B.x0,-14,B.x1,-14,shojiM,2.6,[[-16,-14],[14,16]]);
  /* a szobák válaszfalai (x -11, 0, 11) ajtókkal középen; a szobák északi fala (z=-24) a belső udvar felé, ajtó a középen */
  [-11,0,11].forEach(x=>W(x,-14,x,-24,shojiM,2.6,[[-20,-18]]));W(B.x0,-24,B.x1,-24,wood,2.6,[[-6.6,-4.4],[4.4,6.6]]);
  /* főcsarnok: z -40..-28, x -12..12; déli ajtó középen, keleti ajtó (x=12, z -34) */
  W(-12,-28,12,-28,wood,3.2,[[-1.4,1.4]]);W(-12,-28,-12,-40,wood,3.2);W(12,-28,12,-40,wood,3.2,[[-35,-33]]);W(-12,-40,12,-40,wood,3.2,[[PANEL.x0,PANEL.x1]]);
  /* archívum */
  W(ARCH.x0,-40,ARCH.x0,ARCH.z0,stone,3.0);W(ARCH.x1,-40,ARCH.x1,ARCH.z0,stone,3.0);W(ARCH.x0,ARCH.z0,ARCH.x1,ARCH.z0,stone,3.0);
  /* tetők */
  const roof=(x0,x1,z0,z1,y,hh)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,Wd=x1-x0,Dd=z1-z0;const r=new THREE.Mesh(new THREE.BoxGeometry(Wd+2.4,0.3,Dd+2.4),roofM);r.position.set(cx,y,cz);r.castShadow=true;g.add(r);
    const rg=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(Wd,Dd)*0.62,hh,4),roofM);rg.rotation.y=Math.PI/4;rg.scale.set(1,1,Dd/Wd);rg.position.set(cx,y+hh/2,cz);rg.castShadow=true;g.add(rg);};
  roof(B.x0,B.x1,-24,B.z1,3.05,2.2);roof(-12,12,-40,-28,3.65,3.4);roof(ARCH.x0,ARCH.x1,ARCH.z0,-40,3.4,1.4);
  /* belső udvar kavicsa a tető nélküli sávban */
  const ct=new THREE.Mesh(new THREE.PlaneGeometry(44,4),lam(0xffffff,{map:gravel}));ct.rotation.x=-Math.PI/2;ct.position.set(0,0.31,-26);g.add(ct);
  /* a főcsarnokban: oltár, gongok, tekercsek */
  const alt=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.4),red);alt.position.set(-7,0.9,-38.6);g.add(alt);col(-7,-38.6,1.2,true);col(-5,-38.6,1.0,true);col(-9,-38.6,1.0,true);
  const gong=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.12,18),lam(0xa8883a));gong.rotation.x=Math.PI/2;gong.position.set(7,2.0,-39.6);g.add(gong);
  /* az elhúzható falpanel az archívum előtt */
  const pn=new THREE.Mesh(new THREE.BoxGeometry(PANEL.x1-PANEL.x0,3.2,0.16),lam(0x5a3a22));pn.position.set(0,1.9,PANEL.z);g.add(pn);PANEL.m=pn;
  PANEL.cols=wallCol(PANEL.x0,PANEL.z,PANEL.x1,PANEL.z,0.3);
  /* az archívum ládája és polcai */
  const ch=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.8,0.8),lam(0x2a1a10));ch.position.set(ARCH.chest.x,0.7,ARCH.chest.z);g.add(ch);col(ARCH.chest.x,ARCH.chest.z,0.6,true);
  [-4.6,4.6].forEach(x=>{const sh=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.4,6),woodD);sh.position.set(x,1.5,-44);g.add(sh);col(x,-44,0.5,true);col(x,-42,0.5,true);col(x,-46,0.5,true);});
  /* kapcsolók: holdas tekercs (1. szoba) és napos lámpás (4. szoba) */
  const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.9,1.8),new THREE.MeshLambertMaterial({map:canvasTex(64,128,(c,w,h)=>{c.fillStyle='#e8dcc0';c.fillRect(0,0,w,h);c.fillStyle='#d8d8e8';c.beginPath();c.arc(w/2,h*0.35,w*0.28,0,7);c.fill();c.fillStyle='#e8dcc0';c.beginPath();c.arc(w*0.62,h*0.31,w*0.24,0,7);c.fill();c.strokeStyle='#3a2a1a';c.lineWidth=3;c.strokeRect(2,2,w-4,h-4);}),side:THREE.DoubleSide}));
  sc.position.set(SWITCH.moon.x-0.9,1.9,SWITCH.moon.z);sc.rotation.y=Math.PI/2;g.add(sc);SWITCH.moon.m=sc;
  const sl=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.6,0.5),new THREE.MeshLambertMaterial({color:0xfff0c8,emissive:0xffa040,emissiveIntensity:0.6}));sl.position.set(SWITCH.sun.x+0.6,1.4,SWITCH.sun.z);g.add(sl);SWITCH.sun.m=sl;
  const sp=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.1,0.12),woodD);sp.position.set(SWITCH.sun.x+0.6,0.85,SWITCH.sun.z);g.add(sp);
  /* lámpások a folyosón: két szakaszon a folyosó déli falán égnek (a játékos mögött), ott vetül a sziluett a szobák papírfalára */
  const lm=new THREE.MeshLambertMaterial({color:0xfff0d0,emissive:0xffb060,emissiveIntensity:0.9});flashPatch(lm);
  [[-8,-2.5],[3,8.5]].forEach(q=>{LIT.push({x0:q[0],x1:q[1],viewer:{x0:q[0]-3,x1:q[1]+3,z0:-24,z1:-14}});
    for(let x=q[0]+0.6;x<q[1];x+=2.4){const l=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.45,0.25),lm);l.position.set(x,2.2,-10.2);g.add(l);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb060,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(1.6);s.position.set(x,2.2,-10.4);g.add(s);}});
  scene.add(g);}
/* a sziluett: sötét alak a papírfalon (z=-14), a játékos x-e szerint mozog */
const SIL=(()=>{const t=canvasTex(64,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(20,14,10,0.75)';c.beginPath();c.arc(w/2,h*0.16,w*0.16,0,7);c.fill();c.beginPath();c.moveTo(w*0.26,h*0.28);c.lineTo(w*0.74,h*0.28);c.lineTo(w*0.7,h*0.62);c.lineTo(w*0.62,h);c.lineTo(w*0.38,h);c.lineTo(w*0.3,h*0.62);c.closePath();c.fill();});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(0.9,1.9),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.position.set(0,1.25,-14.08);m.visible=false;scene.add(m);return m;})();
/* tetőpontok: a szobasor és a főcsarnok gerince (kampó), róluk a belső udvarra vagy a kertbe ugrasz */
[[-16,-19],[16,-19],[0,-34]].forEach((q,i)=>{const g=addGiant(q[0],q[1],i===2?5.4:4.6,false);g.dropR=i===2?8.6:7.2;});

const EXIT={x0:-28,x1:-20,z0:-59.5,z1:-56};
const routes={
  garden:[{x:-10,z:46},{x:-10,z:22},{x:10,z:22},{x:10,z:46}],
  front:[{x:-20,z:-6},{x:20,z:-6},{x:20,z:-2},{x:-20,z:-2}],
  room2:[{x:-6,z:-20},{x:-4,z:-17}],
  room3:[{x:6,z:-20},{x:4,z:-17}],
  court:[{x:-20,z:-26},{x:20,z:-26}],
  east:[{x:26,z:0},{x:26,z:-46},{x:16,z:-50},{x:16,z:-44}],
  west:[{x:-26,z:0},{x:-26,z:-40},{x:-16,z:-52},{x:-16,z:-44}],
  hall:[{x:-9,z:-31},{x:9,z:-31}],
  north:[{x:-12,z:-54},{x:12,z:-54}]};

A.ROOF=A.TEMPLOM={rects:solids,walkable,clampRoof,B,PANEL,ARCH,SWITCH,LIT,SIL,EXIT,routes,
  actors:['naruse','guard','guard','guard','guard','guard','guard','guard','guard','guard'],
  spots:{naruse:{x:6,z:-34,ry:Math.PI/2}}};
})();
