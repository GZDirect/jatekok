(function(){
/* Shinobi – közös grafikai réteg a sík pályákhoz (kikötő, fesztivál, fogadó, templom).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   Mit ad: nagy léptékű foltosság a talajon, sötét sáv az épületek és falak tövében (talajárnyék),
   pályánkénti színezett képszél, élő díszletek (sirályok, párafátyol, égő lámpások, falevelek, füstölő),
   és az őrök pályához illő ruhája. Minden olcsó: egy-egy átlátszó sík vagy pár sprite, telefonon is fut. */
const A=window.AE,LV=A.LV;if(!A.ROOF||!A.G)return;
const {scene,canvasTex,softTex,glowTex,mulberry32,camera}=A,G=A.G;
document.body.classList.add('lv-'+LV);
const FLAT=LV==='kikoto'||LV==='fesztival'||LV==='fogado'||LV==='templom';
const R=mulberry32(5150);
A.FX=A.FX||[];
const lam=c=>new THREE.MeshLambertMaterial({color:c});

/* ---------- 1. nagy léptékű foltosság a talajon ---------- */
if(FLAT){
  const tint={kikoto:[16,20,26],fesztival:[18,14,8],fogado:[40,62,100],templom:[20,24,8]}[LV];
  const blot=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);
    for(let i=0;i<260;i++){const x=R()*w,y=R()*h,r=8+R()*(i<60?70:26),a=(i<60?0.16:0.12)*R()*(LV==='templom'||LV==='fesztival'?1.9:1.3);
      const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+tint+','+a.toFixed(3)+')');gr.addColorStop(1,'rgba('+tint+',0)');
      g.fillStyle=gr;for(const dx of[-w,0,w])for(const dy of[-h,0,h]){g.save();g.translate(dx,dy);g.fillRect(x-r,y-r,r*2,r*2);g.restore();}}
    if(LV==='kikoto'){for(let i=0;i<40;i++){const x=R()*w,y=R()*h,r=3+R()*10;g.fillStyle='rgba(8,8,10,'+(0.12+R()*0.18).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*0.6,R()*3,0,7);g.fill();}}
    if(LV==='fogado'){g.strokeStyle='rgba(60,90,140,0.08)';for(let i=0;i<60;i++){g.lineWidth=2+R()*6;g.beginPath();const x=R()*w,y=R()*h;g.moveTo(x,y);g.quadraticCurveTo(x+40,y+(R()-0.5)*30,x+90+R()*60,y+(R()-0.5)*20);g.stroke();}}},true);
  blot.repeat.set(2,4);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(60,122),new THREE.MeshBasicMaterial({map:blot,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.rotation.x=-Math.PI/2;m.position.y=0.02;m.renderOrder=1;scene.add(m);
}

/* ---------- 2. talajárnyék az épületek, konténerek és falak tövében ---------- */
if(FLAT){
  const ao=canvasTex(8,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);const c=LV==='fogado'?'40,60,100':'8,10,14';
    gr.addColorStop(0,'rgba('+c+','+(LV==='fogado'?0.32:0.5)+')');gr.addColorStop(0.35,'rgba('+c+','+(LV==='fogado'?0.15:0.24)+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  const pos=[],uv=[],idx=[];let n=0;
  const quad=(ax,az,bx,bz,ox,oz,W)=>{/* a fal tövétől (a→b) kifelé (ox,oz) W szélesen */
    pos.push(ax,0,az,bx,0,bz,bx+ox*W,0,bz+oz*W,ax+ox*W,0,az+oz*W);uv.push(0,0,1,0,1,1,0,1);idx.push(n,n+2,n+1,n,n+3,n+2);n+=4;};
  A.ROOF.rects.concat(LV==='templom'&&A.TEMPLOM.B?[A.TEMPLOM.B,{x0:-12,x1:12,z0:-40,z1:-28},A.TEMPLOM.ARCH]:[]).forEach(s=>{if(!s)return;if(s.ell||s.id==='pool'||s.id==='pond'||s.id==='water'||s.noAO)return;const w=s.x1-s.x0,d=s.z1-s.z0;if(w<0.3&&d<0.3)return;
    const W=Math.min(1.3,0.5+Math.min(w,d)*0.18);
    quad(s.x0,s.z1,s.x1,s.z1,0,1,W);quad(s.x1,s.z0,s.x0,s.z0,0,-1,W);quad(s.x0,s.z0,s.x0,s.z1,-1,0,W);quad(s.x1,s.z1,s.x1,s.z0,1,0,W);});
  if(n){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);
    const mm=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({map:ao,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    mm.position.y=0.03;mm.renderOrder=2;scene.add(mm);}
}

/* ---------- 3. élő díszletek ---------- */
const sprite=(tex,col,op,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,depthWrite:false}));s.scale.setScalar(sc||1);scene.add(s);return s;};

if(LV==='kikoto'){
  /* sirályok a víz és a rakpart felett */
  const wingG=new THREE.BufferGeometry();wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0.15,-0.55,0.12,-0.05,0,0,-0.15, 0,0,0.15,0.55,0.12,-0.05,0,0,-0.15],3));wingG.computeVertexNormals();
  const gm=new THREE.MeshBasicMaterial({color:0xf2f0ea,side:THREE.DoubleSide});
  const gulls=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(wingG.clone(),gm);m.userData={cx:30+R()*25,cz:-40+R()*80,r:8+R()*14,h:9+R()*9,sp:(0.18+R()*0.15)*(R()<0.5?-1:1),ph:R()*6};scene.add(m);gulls.push(m);}
  /* reggeli párafátyol a rakpart felett */
  const mist=[];for(let i=0;i<14;i++){const s=sprite(softTex,0xe8dcd4,0.0,22+R()*14);s.userData={x:-24+R()*80,z:-60+R()*120,y:1.5+R()*2.5,sp:0.4+R()*0.5,ph:R()*6};mist.push(s);}
  /* a víz lassan hullámzik */
  const wt=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){const y=R()*h,x=R()*w,l=10+R()*40;g.strokeStyle='rgba(150,180,195,'+(0.25+R()*0.35).toFixed(2)+')';g.lineWidth=1+R()*2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+l/2,y-2,x+l,y);g.stroke();}},true);
  wt.repeat.set(70,70);if(A.KK_WATER){A.KK_WATER.material.map=wt;A.KK_WATER.material.needsUpdate=true;}
  /* villogó vörös jelzőfény a daru tetején */
  let beacon=null;{const C=A.KIKOTO&&A.KIKOTO.CRANE;if(C&&C.g){beacon=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff3020,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));beacon.scale.setScalar(1.6);beacon.position.set(3.4,14.75,0);C.g.add(beacon);}}
  A.FX.push((dt,t)=>{gulls.forEach(m=>{const u=m.userData,a=t*u.sp+u.ph;m.position.set(u.cx+Math.cos(a)*u.r,u.h+Math.sin(t*0.7+u.ph)*0.8,u.cz+Math.sin(a)*u.r);m.rotation.y=-a-(u.sp>0?0:Math.PI);
      const f=Math.sin(t*6+u.ph)*0.5;const p=m.geometry.attributes.position.array;p[4]=p[13]=0.12+f*0.4;m.geometry.attributes.position.needsUpdate=true;});
    mist.forEach(s=>{const u=s.userData;s.position.set(u.x+Math.sin(t*0.03*u.sp+u.ph)*8,u.y,u.z);s.material.opacity=0.10+0.06*Math.sin(t*0.2+u.ph);});
    wt.offset.set((t*0.004)%1,(t*0.0025)%1);if(beacon)beacon.material.opacity=Math.max(0,Math.sin(t*3))>0.6?1:0.12;});
}

if(LV==='fesztival'){
  /* égi lámpások emelkednek a fák fölött, a fesztivál távoli része felől */
  const sky=[];for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffa040,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
    s.scale.setScalar(1.4);s.userData={x:(R()<0.5?-1:1)*(34+R()*40),z:-60+R()*120,ph:R(),sp:0.012+R()*0.01};scene.add(s);sky.push(s);}
  /* parázsló sütőfüst a bódék fölött: lágy szürke puffok */
  const puffs=[];const SP=[[-16,15],[16,8],[-16,1],[16,-6]];
  SP.forEach((q,k)=>{for(let j=0;j<3;j++){const s=sprite(softTex,0xc8c0b8,0,1.2);s.userData={x:q[0],z:q[1],ph:j/3+k*0.13};puffs.push(s);}});
  A.FX.push((dt,t)=>{const k=Math.min(1,(G.duskK!==undefined?G.duskK:0.5));
    sky.forEach(s=>{const u=s.userData,f=(t*u.sp+u.ph)%1;s.position.set(u.x+Math.sin(f*9+u.ph*6)*1.5,6+f*55,u.z);s.material.opacity=k*(f<0.08?f/0.08:1-f)*0.95;});
    puffs.forEach(s=>{const u=s.userData,f=(t*0.18+u.ph)%1;s.position.set(u.x+Math.sin(t*0.6+u.ph*9)*0.3,2.8+f*3.2,u.z);s.scale.setScalar(0.8+f*2.2);s.material.opacity=0.28*Math.sin(f*Math.PI)*(1-0.5*k);});});
}

if(LV==='templom'){
  /* lehulló juharlevelek a játékos körül */
  const N=90,pos=new Float32Array(N*3),col=new Float32Array(N*3),C=new THREE.Color();
  for(let i=0;i<N;i++){pos[i*3]=(R()-0.5)*40;pos[i*3+1]=R()*12;pos[i*3+2]=(R()-0.5)*40;C.setHSL(0.02+R()*0.08,0.75,0.42+R()*0.12);col[i*3]=C.r;col[i*3+1]=C.g;col[i*3+2]=C.b;}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('color',new THREE.BufferAttribute(col,3));
  const lt=canvasTex(32,32,(g)=>{g.fillStyle='#fff';g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;g.lineTo(16+Math.cos(a)*14,16+Math.sin(a)*14);g.lineTo(16+Math.cos(a+0.63)*6,16+Math.sin(a+0.63)*6);}g.fill();});
  const leaves=new THREE.Points(gg,new THREE.PointsMaterial({size:0.22,map:lt,vertexColors:true,transparent:true,alphaTest:0.4,depthWrite:false}));scene.add(leaves);
  /* füstölő füstje a főcsarnok előtt */
  const smoke=[];const SM={x:2.8,z:-26,y:1.05};
  {const br=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.24,0.45,10),lam(0x5a4a30));br.position.set(SM.x,0.53,SM.z);scene.add(br);const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.3,6),lam(0x3a3020));lg.position.set(SM.x,0.88,SM.z);scene.add(lg);}
  for(let j=0;j<7;j++){const s=sprite(softTex,0xd8d4cc,0,0.5);s.userData={ph:j/7};smoke.push(s);}
  A.FX.push((dt,t)=>{const p=gg.attributes.position.array;for(let i=0;i<N;i++){p[i*3+1]-=dt*(0.55+(i%5)*0.08);p[i*3]+=Math.sin(t*1.3+i)*dt*0.5;p[i*3+2]+=Math.cos(t*0.9+i*1.7)*dt*0.3;if(p[i*3+1]<0.05){p[i*3+1]=10+Math.random()*3;}}
    gg.attributes.position.needsUpdate=true;leaves.position.set(camera.position.x,0,camera.position.z);
    smoke.forEach(s=>{const f=(t*0.12+s.userData.ph)%1;s.position.set(SM.x+Math.sin(t*0.8+f*6)*0.25*f,SM.y+f*3.6,SM.z+Math.cos(t*0.5+f*5)*0.2*f);s.scale.setScalar(0.3+f*1.6);s.material.opacity=0.34*Math.sin(f*Math.PI)*(1-f*0.4);});});
}

/* ---------- 4. az őrök pályához illő ruhája ---------- */
const dress=G.hooks.setup;
const outfit=()=>{G.ALLCOPS.forEach((c,i)=>{const kind=A.ROOF.actors[i];if(kind!=='guard'||c.mesh.userData.outfit)return;const Rr=c.mesh.userData.R;if(!Rr)return;c.mesh.userData.outfit=true;
  if(LV==='kikoto'){/* láthatósági mellény fényvisszaverő csíkkal, sisak */
    const v=new THREE.Mesh(new THREE.CylinderGeometry(0.225,0.197,0.44,10),lam(0xe89a1a));v.position.y=0.36;Rr.chest.add(v);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(0.228,0.215,0.045,10),new THREE.MeshBasicMaterial({color:0xdfe4dc}));st.position.y=0.3;Rr.chest.add(st);
    const st2=st.clone();st2.position.y=0.46;Rr.chest.add(st2);
    const hh=new THREE.Mesh(new THREE.SphereGeometry(0.145,12,6,0,Math.PI*2,0,Math.PI/2),lam(0xf0d030));hh.position.y=0.17;Rr.neck.add(hh);
    const br=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.02,12),lam(0xf0d030));br.position.y=0.17;Rr.neck.add(br);}
  else if(LV==='fogado'){/* téli kabátgallér, sál és kötött sapka */
    const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.115,0.13,0.09,10),lam(0x9a2c26));sc.position.y=0.0;Rr.neck.add(sc);
    const tail=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.22,0.025),lam(0x9a2c26));tail.position.set(0.06,-0.12,-0.2);tail.rotation.z=0.1;Rr.neck.add(tail);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.133,12,7,0,Math.PI*2,0,Math.PI/2),lam(0x3a4660));cap.position.y=0.16;Rr.neck.add(cap);
    const pom=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,6),lam(0xe8e4dc));pom.position.y=0.3;Rr.neck.add(pom);}
  else if(LV==='templom'){/* sötét hakama és fehér fejpánt: Naruse templomi testőrei */
    const hk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.33,0.78,12,1,true),new THREE.MeshLambertMaterial({color:0x26242c,side:THREE.DoubleSide}));hk.position.y=-0.42;Rr.hips.add(hk);
    const ob=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.08,12),lam(0x6a1e1a));ob.position.y=0.02;Rr.hips.add(ob);
    const hb=new THREE.Mesh(new THREE.CylinderGeometry(0.127,0.127,0.035,14,1,true),new THREE.MeshLambertMaterial({color:0xece6da,side:THREE.DoubleSide}));hb.position.y=0.17;Rr.neck.add(hb);}
  else if(LV==='fesztival'){/* biztonsági őr: vörös karszalag és fülhallgató */
    const arm=Rr.arms&&Rr.arms[0];if(arm&&arm.sh){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.07,8),lam(0xb02a22));b.position.y=-0.16;arm.sh.add(b);}
    const ear=new THREE.Mesh(new THREE.SphereGeometry(0.025,6,5),lam(0x111111));ear.position.set(0.12,0.13,0);Rr.neck.add(ear);}
});};
G.hooks.setup=()=>{if(dress)dress();outfit();};
})();
