(function(){
const {scene,camera,H,normalAt,glowTex,softTex,canvasTex,mulberry32,merge,rgb,mixc,clamp}=window.AE;
const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
function limb(len,r0,r1,mat,seg){const g=new THREE.CylinderGeometry(r1,r0,len,seg||7);g.translate(0,-len/2,0);const m=new THREE.Mesh(g,mat);m.castShadow=true;return m;}
function pivot(x,y,z){const p=new THREE.Group();p.position.set(x,y,z);return p;}
function glowSprite(col,s,op){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));m.scale.setScalar(s);return m;}

/* ================= Ellenfelek ================= */
function buildNinja(){const g=new THREE.Group(),cloth=L(0x2a3140),dark=L(0x151922),wrap=L(0x454b58),skin=L(0xc79a7a),red=L(0xc42a24,{side:THREE.DoubleSide,emissive:0x3a0806}),steel=new THREE.MeshPhongMaterial({color:0xb8c2cc,shininess:90,specular:0xffffff});
  const R={};const hips=pivot(0,0.95,0);g.add(hips);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.17,0.62,9),cloth);torso.position.y=0.32;torso.castShadow=true;hips.add(torso);
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.19,0.08,9),wrap);belt.position.y=0.04;hips.add(belt);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(0.24,10,8),cloth);chest.scale.set(1,0.65,0.8);chest.position.y=0.55;hips.add(chest);
  const neck=pivot(0,0.7,0);hips.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.15,12,10),dark);head.position.y=0.14;head.castShadow=true;neck.add(head);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(0.165,12,10,0,Math.PI*2,0,Math.PI*0.62),cloth);hood.position.y=0.16;hood.rotation.x=-0.25;neck.add(hood);
  const slit=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.035,0.05),skin);slit.position.set(0,0.16,-0.13);neck.add(slit);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,5),new THREE.MeshBasicMaterial({color:0xe6eef5}));e.position.set(s*0.045,0.162,-0.155);neck.add(e);});
  const knot=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,5),red);knot.position.set(0,0.2,0.15);neck.add(knot);
  const scarfG=new THREE.PlaneGeometry(0.1,0.9,1,10);scarfG.translate(0,-0.45,0);const scarf=new THREE.Mesh(scarfG,red);scarf.position.set(0,0.2,0.17);scarf.rotation.x=1.2;neck.add(scarf);R.scarf=scarf;R.scarfBase=scarfG.attributes.position.array.slice();
  const sheath=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.95,0.04),dark);sheath.position.set(0,0.4,0.2);sheath.rotation.z=0.75;hips.add(sheath);
  const hilt=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.24,6),wrap);hilt.position.set(-0.36,0.79,0.2);hilt.rotation.z=0.75;hips.add(hilt);
  const arms=[-1,1].map(s=>{const sh=pivot(s*0.27,0.55,0);hips.add(sh);const up=limb(0.32,0.06,0.07,cloth);sh.add(up);const el=pivot(0,-0.32,0);sh.add(el);const lo=limb(0.3,0.05,0.06,wrap);el.add(lo);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.05,7,6),dark);hand.position.y=-0.32;el.add(hand);return{sh,el};});
  const legs=[-1,1].map(s=>{const hp=pivot(s*0.11,0,0);hips.add(hp);const th=limb(0.46,0.075,0.095,cloth);hp.add(th);const kn=pivot(0,-0.46,0);hp.add(kn);const sh=limb(0.44,0.055,0.075,wrap);kn.add(sh);
    const ft=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.06,0.22),dark);ft.position.set(0,-0.47,-0.05);kn.add(ft);return{hp,kn};});
  Object.assign(R,{hips,neck,arms,legs,torso});
  g.userData.anim=(t,spd,dt,st)=>{const ph=g.userData.ph=(g.userData.ph||0)+dt*spd*2.6;const k=clamp(spd/6,0,1),sw=Math.sin(ph)*0.75*k;
    legs[0].hp.rotation.x=sw;legs[1].hp.rotation.x=-sw;legs[0].kn.rotation.x=Math.max(0,-Math.sin(ph))*1.0*k+0.05;legs[1].kn.rotation.x=Math.max(0,Math.sin(ph))*1.0*k+0.05;
    arms[0].sh.rotation.x=-sw*0.8;arms[1].sh.rotation.x=sw*0.8;arms[0].el.rotation.x=-0.4-k*0.4;arms[1].el.rotation.x=-0.4-k*0.4;
    hips.position.y=0.95-Math.abs(Math.sin(ph))*0.05*k-(st==='investigate'?0.12:0);torso.rotation.x=0;hips.rotation.x=-0.12*k-(st==='chase'?0.18:0);
    neck.rotation.y=st==='investigate'?Math.sin(t*1.4)*0.7:0;
    const p=scarf.geometry.attributes.position,b=R.scarfBase;for(let i=0;i<p.count;i++){const y=b[i*3+1];p.setZ(i,Math.sin(t*7+y*6)*0.08*(-y)+(-y)*(0.3*k));}p.needsUpdate=true;scarf.rotation.x=0.4+0.9*(1-k);};
  return g;}
function buildMonster(){const g=new THREE.Group(),fur=L(0x1d1612),hide=L(0x2a211b),horn=L(0xc9bba0),claw=L(0xd8cdb5);
  const body=pivot(0,1.55,0);g.add(body);
  const torso=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),fur);torso.scale.set(1.15,1.0,1.45);torso.rotation.x=0.35;torso.castShadow=true;body.add(torso);
  const belly=new THREE.Mesh(new THREE.SphereGeometry(0.8,10,8),hide);belly.position.set(0,-0.35,-0.25);belly.scale.set(1,0.9,1.1);body.add(belly);
  {const sp=new THREE.ConeGeometry(0.08,0.5,4);sp.translate(0,0.25,0);const im=new THREE.InstancedMesh(sp,fur,120),d=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),r=mulberry32(5);
    for(let i=0;i<120;i++){const v=new THREE.Vector3(r()*2-1,0.4+r()*0.8,(r()*2-1)*1.2).normalize();d.position.set(v.x*1.05,v.y*0.95,v.z*1.4);d.position.applyAxisAngle(new THREE.Vector3(1,0,0),0.35);
      d.quaternion.setFromUnitVectors(up,v.clone().add(new THREE.Vector3(0,0.3,0.6)).normalize());d.scale.setScalar(0.6+r()*0.9);d.updateMatrix();im.setMatrixAt(i,d.matrix);}im.castShadow=true;body.add(im);}
  const neck=pivot(0,0.35,-1.15);body.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.55,12,10),hide);head.scale.set(1,0.85,1.1);neck.add(head);
  const snout=new THREE.Mesh(new THREE.SphereGeometry(0.36,10,8),hide);snout.position.set(0,-0.15,-0.48);snout.scale.set(1,0.7,1.1);neck.add(snout);
  const jaw=pivot(0,-0.28,-0.2);neck.add(jaw);const jm=new THREE.Mesh(new THREE.SphereGeometry(0.33,10,6,0,Math.PI*2,Math.PI/2,Math.PI/2),hide);jm.scale.set(1,0.6,1.3);jm.position.z=-0.3;jaw.add(jm);
  for(let i=0;i<6;i++){const tth=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.12,4),claw);tth.rotation.x=Math.PI;tth.position.set(-0.2+i*0.08,-0.24,-0.72+Math.abs(i-2.5)*0.04);neck.add(tth);}
  [-1,1].forEach(s=>{const hg=new THREE.TorusGeometry(0.32,0.06,6,10,Math.PI*0.75);const h=new THREE.Mesh(hg,horn);h.position.set(s*0.38,0.3,0.05);h.rotation.set(0,s>0?0.3:Math.PI-0.3,Math.PI*0.15*s);neck.add(h);});
  const eyeM=new THREE.MeshBasicMaterial({color:0xff4a2a,fog:false});const eyes=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),eyeM);e.position.set(s*0.22,0.08,-0.5);neck.add(e);const gl=glowSprite(0xff3a1a,0.9,0.9);gl.position.copy(e.position);neck.add(gl);return gl;});
  const arms=[-1,1].map(s=>{const sh=pivot(s*0.95,0.15,-0.55);body.add(sh);const up=limb(0.95,0.2,0.26,fur,8);sh.add(up);const el=pivot(0,-0.95,0);sh.add(el);const lo=limb(0.85,0.15,0.2,fur,8);el.add(lo);
    for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.28,4),claw);c.position.set((k-1)*0.09,-0.95,-0.08);c.rotation.x=-2.6;el.add(c);}return{sh,el};});
  const legs=[-1,1].map(s=>{const hp=pivot(s*0.6,-0.55,0.75);body.add(hp);const th=limb(0.55,0.24,0.3,fur,8);hp.add(th);const kn=pivot(0,-0.55,0);hp.add(kn);const sh=limb(0.5,0.16,0.22,fur,8);kn.add(sh);return{hp,kn};});
  const light=new THREE.PointLight(0xff3a1a,0.8,7);light.position.set(0,0.1,-1.0);neck.add(light);
  g.userData.anim=(t,spd,dt,st)=>{const ph=g.userData.ph=(g.userData.ph||0)+dt*spd*1.7;const k=clamp(spd/5,0,1);const br=Math.sin(t*2)*0.03;
    torso.scale.set(1.15+br,1.0+br,1.45);body.position.y=1.55-Math.abs(Math.sin(ph))*0.12*k;body.rotation.z=Math.sin(ph)*0.06*k;
    arms[0].sh.rotation.x=Math.sin(ph)*0.7*k-0.2;arms[1].sh.rotation.x=-Math.sin(ph)*0.7*k-0.2;arms[0].el.rotation.x=-0.5;arms[1].el.rotation.x=-0.5;
    legs[0].hp.rotation.x=-Math.sin(ph)*0.6*k;legs[1].hp.rotation.x=Math.sin(ph)*0.6*k;legs[0].kn.rotation.x=0.4;legs[1].kn.rotation.x=0.4;
    jaw.rotation.x=0.15+(st==='chase'?0.35+Math.sin(t*9)*0.1:Math.sin(t*1.3)*0.06);neck.rotation.y=st==='investigate'?Math.sin(t*1.1)*0.6:0;neck.rotation.x=st==='investigate'?0.25:0;
    eyes.forEach(e=>e.material.opacity=0.65+0.3*Math.sin(t*3));light.intensity=st==='chase'?1.4:0.7;};
  return g;}
function buildGhost(){const g=new THREE.Group();
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uT:{value:0},uA:{value:1}},
    vertexShader:'uniform float uT;varying vec3 vN;varying vec3 vV;varying float vY;void main(){vec3 p=position;float k=clamp(1.0-p.y/2.0,0.0,1.0);p.x+=sin(uT*2.2+p.y*3.0+p.z*4.0)*0.12*k;p.z+=cos(uT*1.8+p.y*2.5+p.x*4.0)*0.12*k;vY=p.y;vec4 w=modelMatrix*vec4(p,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform float uT;uniform float uA;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=1.0-abs(dot(vN,vV));float a=(0.12+pow(f,2.2)*0.75)*smoothstep(-0.1,0.6,vY)*uA;vec3 c=mix(vec3(0.55,0.75,0.95),vec3(0.85,0.95,1.0),f);gl_FragColor=vec4(c*a,a);}'});
  const prof=[];for(let i=0;i<=12;i++){const y=i/12*2.0;const r=0.55-0.3*Math.pow(i/12,0.7)+Math.sin(i*1.3)*0.02;prof.push(new THREE.Vector2(Math.max(0.12,r),y));}
  const robe=new THREE.Mesh(new THREE.LatheGeometry(prof,24),mat);g.add(robe);
  const hmat=mat.clone();hmat.uniforms={uT:mat.uniforms.uT,uA:{value:1.9}};const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,16,12),hmat);head.position.y=2.12;g.add(head);
  const neckM=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,0.25,12,1,true),mat);neckM.position.y=1.95;g.add(neckM);
  const hollow=new THREE.MeshBasicMaterial({color:0x000000});[-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.055,8,6),hollow);e.scale.set(1,1.3,0.4);e.position.set(s*0.09,2.15,-0.235);g.add(e);});
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),hollow);mouth.scale.set(0.8,1.4,0.4);mouth.position.set(0,2.0,-0.24);g.add(mouth);
  const arms=[-1,1].map(s=>{const a=pivot(s*0.32,1.65,0);g.add(a);const m=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.9,8,1,true),mat);m.position.y=-0.45;m.rotation.x=Math.PI;a.add(m);return a;});
  const core=glowSprite(0x9fd8ff,3.2,0.35);core.position.y=1.4;g.add(core);
  const light=new THREE.PointLight(0x9fd8ff,1.1,11);light.position.y=1.5;g.add(light);
  const wisps=[];for(let i=0;i<10;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex,color:0xb8e2ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(0.6);scene.add(s);wisps.push({s,life:0});}
  let wt=0;g.userData.wisps=wisps;
  g.userData.anim=(t,spd,dt,st)=>{mat.uniforms.uT.value=t;arms[0].rotation.x=-0.5-Math.sin(t*1.3)*0.2-(st==='chase'?0.7:0);arms[1].rotation.x=-0.5-Math.cos(t*1.2)*0.2-(st==='chase'?0.7:0);
    arms[0].rotation.z=0.3;arms[1].rotation.z=-0.3;core.material.opacity=0.3+0.12*Math.sin(t*2.5);light.intensity=st==='chase'?1.8:1.0;
    wt-=dt;if(wt<=0){wt=0.12;const w=wisps.find(q=>q.life<=0);if(w){w.life=1.6;g.getWorldPosition(w.s.position);w.s.position.y+=0.3+Math.random()*1.4;w.s.position.x+=(Math.random()-0.5)*0.6;w.s.position.z+=(Math.random()-0.5)*0.6;}}
    wisps.forEach(w=>{if(w.life>0){w.life-=dt;w.s.position.y+=dt*0.4;w.s.material.opacity=Math.max(0,w.life/1.6)*0.35;w.s.scale.setScalar(0.4+(1.6-w.life)*0.5);}else w.s.material.opacity=0;});};
  g.userData.dispose=()=>wisps.forEach(w=>scene.remove(w.s));
  return g;}
function buildEnemy(type){return type==='monster'?buildMonster():type==='ninja'?buildNinja():buildGhost();}

/* ================= Japán rendőr (zseblámpa bal kézben, revolver jobb kézben) =================
   Előre a −z irány. anim(t,spd,dt,o): o={st,bp (lámpa dőlése fel+),sweep (felsőtest elfordulása),shoot,fall,stagger} */
function buildPolice(seed){const g=new THREE.Group(),r=mulberry32(seed||1);
  const navy=L(0x22304d),pants=L(0x1a2236),shirt=L(0x9ab6dc),skin=L(0xc9a07e),black=L(0x111216),glove=L(0xe6e6dc),gold=L(0xd8b040,{emissive:0x3a2a08}),
    vest=L(0xb6d23c,{emissive:0x2c3608}),gunM=new THREE.MeshPhongMaterial({color:0x2a2c30,shininess:60,specular:0x666666});
  const body=pivot(0,0,0);g.add(body);const hips=pivot(0,0.98,0);body.add(hips);
  const legs=[-1,1].map(s=>{const hp=pivot(s*0.1,0,0);hips.add(hp);hp.add(limb(0.47,0.075,0.09,pants));const kn=pivot(0,-0.47,0);hp.add(kn);kn.add(limb(0.45,0.055,0.07,pants));
    const ft=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.07,0.25),black);ft.position.set(0,-0.48,-0.05);kn.add(ft);return{hp,kn};});
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(0.185,0.185,0.07,10),black);belt.position.y=0.03;hips.add(belt);
  const holster=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.15,0.1),black);holster.position.set(0.19,-0.03,0);hips.add(holster);
  const radio=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.11,0.04),black);radio.position.set(-0.17,0.0,0.1);hips.add(radio);
  const chest=pivot(0,0.06,0);hips.add(chest);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.18,0.6,10),navy);torso.position.y=0.3;torso.castShadow=true;chest.add(torso);
  const vestM=new THREE.Mesh(new THREE.CylinderGeometry(0.222,0.2,0.4,10,1,true),vest);vestM.position.y=0.32;chest.add(vestM);
  [0.2,0.42].forEach(y=>{const band=new THREE.Mesh(new THREE.CylinderGeometry(0.226,0.226,0.035,10,1,true),L(0xe8eef0,{emissive:0x505456}));band.position.y=y;chest.add(band);});
  const sh=new THREE.Mesh(new THREE.SphereGeometry(0.23,10,8),navy);sh.scale.set(1.08,0.55,0.75);sh.position.y=0.56;chest.add(sh);
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,0.06,8),shirt);collar.position.y=0.64;chest.add(collar);
  const neck=pivot(0,0.66,0);chest.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,10),skin);head.scale.set(0.95,1.08,1);head.position.y=0.12;head.castShadow=true;neck.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(0.124,10,8,0,Math.PI*2,0,Math.PI*0.5),black);hair.position.set(0,0.13,0.012);neck.add(hair);
  const capB=new THREE.Mesh(new THREE.CylinderGeometry(0.128,0.126,0.05,14),black);capB.position.y=0.2;neck.add(capB);
  const capT=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.128,0.07,14),navy);capT.position.y=0.255;capT.rotation.x=-0.08;neck.add(capT);
  const visor=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.012,14,1,false,Math.PI*0.5,Math.PI),black);visor.position.set(0,0.18,-0.06);visor.rotation.x=0.18;neck.add(visor);
  const badge=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.035,0.01),gold);badge.position.set(0,0.255,-0.15);neck.add(badge);
  const eyeM=new THREE.MeshBasicMaterial({color:0x1a1210});[-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,5),eyeM);e.position.set(s*0.04,0.13,-0.113);neck.add(e);});
  const arms=[-1,1].map(s=>{const shp=pivot(s*0.26,0.55,0);chest.add(shp);shp.add(limb(0.3,0.06,0.07,navy));const el=pivot(0,-0.3,0);shp.add(el);el.add(limb(0.27,0.05,0.06,navy));
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.048,7,6),glove);hand.position.y=-0.3;el.add(hand);return{sh:shp,el};});
  /* revolver a jobb kézben: a cső az alkar irányába mutat */
  const gun=new THREE.Group();gun.position.set(0,-0.31,0);arms[1].el.add(gun);
  {const grip=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.04,0.09),gunM);grip.position.set(0,0,0.03);grip.rotation.x=-0.3;gun.add(grip);
   const cyl=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.045,8),gunM);cyl.position.set(0,-0.04,-0.005);gun.add(cyl);
   const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.009,0.11,6),gunM);bar.position.set(0,-0.11,-0.01);gun.add(bar);}
  const muzzle=glowSprite(0xffd27a,0.55,0);muzzle.position.set(0,-0.19,-0.01);gun.add(muzzle);
  /* zseblámpa a bal kézben */
  const torch=new THREE.Group();torch.position.set(0,-0.31,0);arms[0].el.add(torch);
  {const tb=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.018,0.2,8),black);tb.position.y=-0.06;torch.add(tb);
   const th=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.022,0.06,10),black);th.position.y=-0.18;torch.add(th);
   const lens=new THREE.Mesh(new THREE.CircleGeometry(0.03,10),new THREE.MeshBasicMaterial({color:0xfff4d8}));lens.rotation.x=Math.PI/2;lens.position.y=-0.212;torch.add(lens);}
  const lensP=new THREE.Object3D();lensP.position.y=-0.22;torch.add(lensP);
  const lensGlow=glowSprite(0xfff0cc,0.7,0.9);lensGlow.position.y=-0.23;torch.add(lensGlow);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const R={hips,chest,neck,arms,legs,body,lensP,lensGlow,muzzle};g.userData.R=R;g.userData.ph=r()*6;
  g.userData.anim=(t,spd,dt,o)=>{const ph=g.userData.ph+=dt*spd*2.9;const k=clamp(spd/4,0,1)*(1-o.fall),sw=Math.sin(ph)*0.62*k;
    legs[0].hp.rotation.x=sw;legs[1].hp.rotation.x=-sw;legs[0].kn.rotation.x=Math.max(0,-Math.sin(ph))*0.9*k+0.04;legs[1].kn.rotation.x=Math.max(0,Math.sin(ph))*0.9*k+0.04;
    hips.position.y=0.98-Math.abs(Math.sin(ph))*0.04*k;hips.rotation.x=-0.05*k-o.stagger*0.35;chest.rotation.y=o.sweep*(1-o.fall);neck.rotation.x=-o.bp*0.5*(1-o.fall);
    const alert=o.st==='alert'?1:0,lo=(1-o.fall);
    arms[1].sh.rotation.x=lo*(alert?Math.PI/2-0.06+o.bp*0.5:0.25+sw*0.3)+o.fall*0.3;arms[1].el.rotation.x=alert?0:0.55*lo;arms[1].sh.rotation.z=alert?0.12:-0.06;
    arms[0].sh.rotation.x=lo*(Math.PI/2-0.15+o.bp)+o.fall*0.2;arms[0].el.rotation.x=0.12*lo;arms[0].sh.rotation.z=0.1*lo;
    body.rotation.x=o.fall*1.48;body.position.y=o.fall*0.12;body.position.z=o.fall*0.15;
    muzzle.material.opacity=o.shoot;muzzle.scale.setScalar(0.4+o.shoot*0.5);};
  return g;}

/* látható fénycsóva: csúcsa az origóban, +y felé nyílik; a game.js irányítja */
const beamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uA:{value:1}},
  vertexShader:'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 w=modelMatrix*vec4(position,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uA;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(vN,vV)),1.3);float a=pow(1.0-vY,2.2)*smoothstep(0.0,0.03,vY)*e*0.13*uA;gl_FragColor=vec4(vec3(1.0,0.94,0.8),a);}'});
const beamGeo=new THREE.CylinderGeometry(2.9,0.04,18,18,1,true);beamGeo.translate(0,9,0);
function makeBeam(){const m=new THREE.Mesh(beamGeo,beamMat.clone());m.frustumCulled=false;m.renderOrder=6;scene.add(m);return m;}

/* ================= Nyomok a talajon ================= */
const printTex=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(20,14,10,0.85)';g.beginPath();g.ellipse(64,78,26,32,0,0,Math.PI*2);g.fill();
  [[-26,-4],[-10,-14],[10,-14],[26,-4]].forEach(q=>{g.beginPath();g.ellipse(64+q[0],40+q[1],8,11,q[0]*0.02,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(64+q[0]-3,30+q[1]);g.lineTo(64+q[0],12+q[1]);g.lineTo(64+q[0]+3,30+q[1]);g.fill();});});
const frostTex=canvasTex(128,128,(g,w,h)=>{const r=mulberry32(4);const gr=g.createRadialGradient(64,64,4,64,64,60);gr.addColorStop(0,'rgba(220,240,255,0.7)');gr.addColorStop(1,'rgba(220,240,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=1.2;for(let i=0;i<14;i++){const a=r()*6.28;let x=64,y=64;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=Math.cos(a+(r()-0.5))*10;y+=Math.sin(a+(r()-0.5))*10;g.lineTo(x,y);}g.stroke();}});
const prints=[];{const pg=new THREE.PlaneGeometry(1,1);for(let i=0;i<70;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({map:printTex,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-2}));m.visible=false;m.renderOrder=2;scene.add(m);prints.push({m,life:0});}}
let printI=0;
function dropPrint(x,z,ry,kind,side){const p=prints[printI=(printI+1)%prints.length];const m=p.m;m.material.map=kind==='frost'?frostTex:printTex;m.material.needsUpdate=true;
  const n=normalAt(x,z);m.position.set(x+Math.cos(ry)*side*0.35,H(x,z)+0.03,z-Math.sin(ry)*side*0.35);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);m.rotateZ(-ry+Math.PI);
  const s=kind==='frost'?1.4:0.75;m.scale.set(s,s*(kind==='frost'?1:1.25),1);m.visible=true;p.life=kind==='frost'?25:70;p.max=p.life;p.kind=kind;}
function stepPrints(dt){prints.forEach(p=>{if(p.life>0){p.life-=dt;p.m.material.opacity=clamp(p.life/p.max,0,1)*(p.kind==='frost'?0.7:0.75);if(p.life<=0)p.m.visible=false;}});}
function clearPrints(){prints.forEach(p=>{p.life=0;p.m.visible=false;});}

/* ================= Célpont ================= */
const beacon=new THREE.Group();scene.add(beacon);
{const bm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uT:{value:0}},
    vertexShader:'varying vec2 vU;varying vec3 vN;varying vec3 vV;void main(){vU=uv;vec4 w=modelMatrix*vec4(position,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform float uT;varying vec2 vU;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(vN,vV)),1.5);float a=pow(1.0-vU.y,1.3)*e*(0.62+0.15*sin(uT*3.0-vU.y*20.0));gl_FragColor=vec4(vec3(0.5,0.85,0.95)*a,a);}'});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,60,24,1,true),bm);beam.position.y=30;beacon.add(beam);beacon.userData.bm=bm;
  const rg=new THREE.Mesh(new THREE.RingGeometry(5.4,6,64),new THREE.MeshBasicMaterial({color:0x7fd3e6,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));rg.rotation.x=-Math.PI/2;rg.position.y=0.15;beacon.add(rg);beacon.userData.ring=rg;
  const light=new THREE.PointLight(0x7fd3e6,1.6,16);light.position.y=1.5;beacon.add(light);
  const parts=[];for(let i=0;i<26;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xa8ecff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.8}));s.scale.setScalar(0.18);s.userData={a:Math.random()*6.28,r:Math.random()*1.4,y:Math.random()*8,sp:0.6+Math.random()*1.2};beacon.add(s);parts.push(s);}
  beacon.userData.parts=parts;}
function stepBeacon(t,dt){if(!beacon.visible)return;beacon.userData.bm.uniforms.uT.value=t;const rg=beacon.userData.ring;rg.material.opacity=0.35+0.2*Math.sin(t*2.4);rg.scale.setScalar(1+0.03*Math.sin(t*2.4));
  beacon.userData.parts.forEach(s=>{const u=s.userData;u.y+=u.sp*dt;if(u.y>9){u.y=0;u.r=Math.random()*1.4;}u.a+=dt*0.6;s.position.set(Math.cos(u.a)*u.r,u.y,Math.sin(u.a)*u.r);s.material.opacity=0.8*(1-u.y/9);});}

/* ================= Füst ================= */
const smoke=[];for(let i=0;i<34;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex,color:0x7d878e,transparent:true,depthWrite:false,opacity:0}));scene.add(s);smoke.push({s,life:0,v:new THREE.Vector3()});}
function puffSmoke(x,y,z){smoke.forEach((p,i)=>{p.life=5+Math.random()*2;p.max=p.life;p.s.position.set(x+(Math.random()-0.5)*0.6,y+0.4+Math.random()*0.6,z+(Math.random()-0.5)*0.6);const a=Math.random()*6.28,sp=1.2+Math.random()*2.2;p.v.set(Math.cos(a)*sp,0.25+Math.random()*0.5,Math.sin(a)*sp);p.s.scale.setScalar(0.6);});}
function stepSmoke(dt){smoke.forEach(p=>{if(p.life<=0){p.s.material.opacity=0;return;}p.life-=dt;p.s.position.addScaledVector(p.v,dt);p.v.multiplyScalar(Math.exp(-dt*1.4));const k=1-p.life/p.max;p.s.scale.setScalar(0.8+k*5.5);p.s.material.opacity=Math.min(1,p.life/1.5)*0.38*(k<0.08?k/0.08:1);});}

/* ================= Kezek (belső nézet) =================
   Eszközök: tanto (rövid kés), tekko (vas ököl), kampo (kaginawa, kötélkampó), karom (shuko, mászókarmok). */
const hands=new THREE.Group();camera.add(hands);
{const sleeve=L(0x1a1e28),wrap=L(0x3a3a40),steel=new THREE.MeshPhongMaterial({color:0xcfd8e0,shininess:120,specular:0xffffff}),iron=new THREE.MeshPhongMaterial({color:0x6c737a,shininess:70,specular:0x999999}),grip=L(0x241a14),rope=L(0x8a7350);
  function arm(){const G=new THREE.Group();
    const fist=new THREE.Mesh(new THREE.SphereGeometry(0.036,10,8),L(0x2b2c33));fist.scale.set(1.1,0.85,1.25);G.add(fist);const kn=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.018,0.03),wrap);kn.position.set(0,0.022,-0.02);G.add(kn);
    const fa=new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.05,0.42,8),sleeve);fa.rotation.x=Math.PI/2-0.4;fa.position.set(0,-0.08,0.2);G.add(fa);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(0.044,0.044,0.08,8),wrap);band.position.set(0,-0.02,0.06);band.rotation.x=Math.PI/2-0.4;G.add(band);return G;}
  const R=arm(),Lh=arm();
  const items={tanto:new THREE.Group(),tekko:new THREE.Group(),kampo:new THREE.Group(),karom:new THREE.Group()},itemsL={kampo:new THREE.Group(),karom:new THREE.Group()};
  {const G=items.tanto;const h=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.014,0.12,6),grip);h.rotation.x=Math.PI/2;h.position.set(0,0.005,-0.02);G.add(h);
    const gd=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.04,0.008),L(0x6a5a3a));gd.position.set(0,0.005,-0.085);G.add(gd);
    const bl=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.024,0.3),steel);bl.position.set(0,0.008,-0.24);G.add(bl);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(0.0045,0.004,0.3),new THREE.MeshBasicMaterial({color:0xe8f0f8}));edge.position.set(0,-0.004,-0.24);G.add(edge);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.012,0.05,4),steel);tip.rotation.x=-Math.PI/2;tip.scale.set(0.35,1,1);tip.position.set(0,0.008,-0.415);G.add(tip);}
  {const G=items.tekko;const plate=new THREE.Mesh(new THREE.BoxGeometry(0.085,0.028,0.03),iron);plate.position.set(0,0.012,-0.04);G.add(plate);
    for(let i=0;i<4;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.008,0.026,5),steel);sp.rotation.x=-Math.PI/2;sp.position.set(-0.03+i*0.02,0.016,-0.065);G.add(sp);}
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.09,6),iron);bar.rotation.z=Math.PI/2;bar.position.set(0,-0.022,-0.01);G.add(bar);}
  {const G=items.kampo;const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.12,6),iron);sh.rotation.x=Math.PI/2;sh.position.set(0,0.01,-0.07);G.add(sh);
    for(let i=0;i<4;i++){const pr=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.005,4,8,Math.PI*0.9),iron);pr.position.set(0,0.01,-0.14);pr.rotation.set(0,Math.PI/2,0);pr.rotateX(i*Math.PI/2);G.add(pr);}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.012,0.004,4,8),iron);ring.position.set(0,0.01,-0.005);G.add(ring);
    const coil=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.014,6,14),rope);coil.rotation.set(0.3,0.6,0);coil.position.set(0.02,0.01,-0.02);itemsL.kampo.add(coil);}
  [items.karom,itemsL.karom].forEach(G=>{const bandC=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.025,10,1,true),iron);bandC.rotation.x=Math.PI/2-0.4;bandC.position.set(0,-0.005,0.02);G.add(bandC);
    for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(0.006,0.04,4),steel);c.position.set(-0.024+i*0.016,-0.03,-0.03);c.rotation.x=-2.2;G.add(c);}});
  Object.values(items).forEach(G=>R.add(G));Object.values(itemsL).forEach(G=>Lh.add(G));
  R.position.set(0.24,-0.25,-0.42);R.rotation.set(0.12,-0.18,-0.25);hands.add(R);
  Lh.position.set(-0.3,-0.31,-0.45);Lh.rotation.set(0.25,0.35,0.3);hands.add(Lh);
  hands.userData={R,Lh,items,itemsL,item:'tanto'};hands.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.fog=false;}});}
function setHandItem(name){const u=hands.userData;u.item=name;Object.keys(u.items).forEach(k=>u.items[k].visible=k===name);Object.keys(u.itemsL).forEach(k=>u.itemsL[k].visible=k===name);}
setHandItem('tanto');
/* atk: 0..1 a csapás ideje; climb: mászás közben a kezek felváltva nyúlnak */
function stepHands(t,dt,bob,moving,running,crouch,lookDX,atk,climb){const u=hands.userData;const a=moving?(running?1.6:1):0;
  hands.position.set(Math.cos(bob*0.5)*0.012*a-lookDX*0.02,-Math.abs(Math.sin(bob*0.5))*0.018*a+Math.sin(t*1.6)*0.004-(crouch?0.02:0),0);
  const k=atk>0?Math.sin(Math.min(1,atk)*Math.PI):0,isT=u.item==='tanto';
  u.R.rotation.set(0.12-k*(isT?0.25:0.1),-0.18+k*0.22,-0.25+Math.sin(bob*0.5)*0.03*a);
  u.R.position.set(0.24-k*0.12,-0.25+(running?-0.04:0)+(crouch?0.02:0)+k*0.06,-0.42-k*0.2);
  u.Lh.position.set(-0.3,-0.31+(running?-0.03:0)+Math.sin(bob*0.5+Math.PI)*0.01*a,-0.45);
  if(climb){const c=Math.sin(t*9);u.R.position.y+=0.08+c*0.06;u.Lh.position.y+=0.08-c*0.06;u.R.position.z-=0.06;u.Lh.position.z-=0.06;}}
/* kötélkampó: repülő kampó + kötél a kéztől */
const hookFly=new THREE.Group();scene.add(hookFly);hookFly.visible=false;
{const iron=L(0x6c737a);for(let i=0;i<4;i++){const pr=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.02,4,8,Math.PI*0.9),iron);pr.rotation.set(0,Math.PI/2,0);pr.rotateX(i*Math.PI/2);hookFly.add(pr);}}
const ropeGeo=new THREE.BufferGeometry();ropeGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));
const rope=new THREE.Line(ropeGeo,new THREE.LineBasicMaterial({color:0x9a8260}));rope.frustumCulled=false;rope.visible=false;scene.add(rope);
function setRope(ax,ay,az,bx,by,bz,on){rope.visible=hookFly.visible=on;if(!on)return;const p=ropeGeo.attributes.position;p.setXYZ(0,ax,ay,az);p.setXYZ(1,bx,by,bz);p.needsUpdate=true;hookFly.position.set(bx,by,bz);hookFly.lookAt(ax,ay,az);}

Object.assign(window.AE,{buildEnemy,buildPolice,makeBeam,dropPrint,stepPrints,clearPrints,beacon,stepBeacon,puffSmoke,stepSmoke,hands,stepHands,setHandItem,setRope});
})();
