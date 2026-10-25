(function(){
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash3(x,y,z){let h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h);}
const lerp=(a,b,t)=>a+(b-a)*t;

/* ---------- Terep magassága (JS és GLSL ugyanaz) ---------- */
function H(x,z){return 1.5*Math.sin(x*0.043+1.1)*Math.cos(z*0.037-0.4)+0.9*Math.sin(x*0.097+z*0.071+2.0)+0.4*Math.sin(x*0.23-z*0.19+0.7)+0.25*Math.cos(x*0.31+z*0.27);}
const GLSL_H='float hgt(float x,float z){return 1.5*sin(x*0.043+1.1)*cos(z*0.037-0.4)+0.9*sin(x*0.097+z*0.071+2.0)+0.4*sin(x*0.23-z*0.19+0.7)+0.25*cos(x*0.31+z*0.27);}\n';
function normalAt(x,z){const e=0.4,dx=H(x+e,z)-H(x-e,z),dz=H(x,z+e)-H(x,z-e);return new THREE.Vector3(-dx,2*e,-dz).normalize();}

/* ---------- Renderelő ---------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
let PR=Math.min(window.devicePixelRatio||1,1.5);renderer.setPixelRatio(PR);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const FOG_COL=new THREE.Color(0x101b26);
scene.background=FOG_COL.clone();
scene.fog=new THREE.FogExp2(FOG_COL.getHex(),0.03);
const camera=new THREE.PerspectiveCamera(72,1,0.04,700);
camera.rotation.order='YXZ';scene.add(camera);
function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();

const MOON_DIR=new THREE.Vector3(-0.42,0.5,-0.76).normalize();
const hemi=new THREE.HemisphereLight(0x7890bb,0x1a2418,0.7);scene.add(hemi);
const moonLight=new THREE.DirectionalLight(0xb4c6e8,1.15);moonLight.castShadow=true;
moonLight.shadow.mapSize.set(1024,1024);Object.assign(moonLight.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:140});
moonLight.shadow.bias=-0.0006;moonLight.shadow.normalBias=0.05;scene.add(moonLight);scene.add(moonLight.target);

/* ---------- Textúrák ---------- */
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=4;return t;}
function radial(stops){return canvasTex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);stops.forEach(s=>gr.addColorStop(s[0],s[1]));g.fillStyle=gr;g.fillRect(0,0,128,128);});}
const glowTex=radial([[0,'rgba(255,255,255,1)'],[0.18,'rgba(255,255,255,0.75)'],[0.45,'rgba(255,255,255,0.18)'],[1,'rgba(255,255,255,0)']]);
const softTex=radial([[0,'rgba(255,255,255,0.9)'],[0.5,'rgba(255,255,255,0.35)'],[1,'rgba(255,255,255,0)']]);
const groundTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(4);g.fillStyle='#b9b8ac';g.fillRect(0,0,w,h);
  for(let i=0;i<2600;i++){const x=r()*w,y=r()*h,s=r()*3+0.6;g.fillStyle=['rgba(70,64,48,0.5)','rgba(220,222,205,0.35)','rgba(90,110,70,0.45)','rgba(40,36,28,0.4)'][i%4];g.beginPath();g.ellipse(x,y,s,s*0.7,r()*3,0,Math.PI*2);g.fill();}
  g.lineCap='round';for(let i=0;i<70;i++){const x=r()*w,y=r()*h,a=r()*6.28,l=8+r()*22;g.strokeStyle='rgba(60,46,32,0.55)';g.lineWidth=1+r()*1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  for(let i=0;i<160;i++){const x=r()*w,y=r()*h;g.fillStyle=['rgba(120,84,48,0.6)','rgba(150,110,60,0.5)','rgba(96,70,40,0.6)'][i%3];g.beginPath();g.ellipse(x,y,4+r()*4,2+r()*2,r()*3,0,Math.PI*2);g.fill();}},true);
groundTex.repeat.set(46,46);
const barkTex=canvasTex(64,256,(g,w,h)=>{const r=mulberry32(9);g.fillStyle='#8a7462';g.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){const x=r()*w;g.strokeStyle='rgba(30,22,16,'+(0.35+r()*0.4)+')';g.lineWidth=1+r()*3;g.beginPath();g.moveTo(x,0);for(let y=0;y<=h;y+=12)g.lineTo(x+Math.sin(y*0.05+i)*3,y);g.stroke();}
  for(let i=0;i<40;i++){const y=r()*h;g.strokeStyle='rgba(25,18,12,0.5)';g.lineWidth=1;g.beginPath();g.moveTo(r()*w,y);g.lineTo(r()*w,y+2);g.stroke();}},true);
barkTex.repeat.set(2,3);
const birchTex=canvasTex(64,256,(g,w,h)=>{const r=mulberry32(11);g.fillStyle='#d9d6ca';g.fillRect(0,0,w,h);
  for(let i=0;i<34;i++){const y=r()*h,x=r()*w,l=6+r()*26;g.fillStyle='rgba(20,20,18,'+(0.55+r()*0.4)+')';g.fillRect(x,y,l,1.5+r()*3);}
  for(let i=0;i<300;i++){g.fillStyle='rgba(120,116,100,0.25)';g.fillRect(r()*w,r()*h,1,1);}},true);
birchTex.repeat.set(1,3);
const fogTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(21);g.clearRect(0,0,w,h);
  for(let i=0;i<46;i++){const x=r()*w,y=r()*h,s=20+r()*60;for(const ox of [-w,0,w])for(const oy of [-h,0,h]){const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,s);gr.addColorStop(0,'rgba(255,255,255,'+(0.22+r()*0.15)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x+ox-s,y+oy-s,s*2,s*2);}}},true);

const leafTex=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();g.moveTo(4,32);g.quadraticCurveTo(26,6,60,32);g.quadraticCurveTo(26,58,4,32);g.fill();
  g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=2;g.beginPath();g.moveTo(4,32);g.lineTo(58,32);g.stroke();for(let i=1;i<5;i++){g.beginPath();g.moveTo(10+i*10,32);g.lineTo(16+i*10,22);g.moveTo(10+i*10,32);g.lineTo(16+i*10,42);g.stroke();}});
/* ---------- Geometria-segédek ---------- */
function merge(parts){let pos=[],nor=[],col=[];
  parts.forEach(p=>{let g=p.g;if(p.flat){g=g.index?g.toNonIndexed():g;g.computeVertexNormals();}else{g.computeVertexNormals();g=g.index?g.toNonIndexed():g;}
    const a=g.attributes.position,n=g.attributes.normal;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);pos.push(x,y,z);nor.push(n.getX(i),n.getY(i),n.getZ(i));
      const c=typeof p.c==='function'?p.c(x,y,z,n.getX(i),n.getY(i),n.getZ(i)):p.c;col.push(c[0],c[1],c[2]);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
function jitter(g,amt,seed,keepTop){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(keepTop&&y>keepTop)continue;
  const k=1+(hash3(x*3+seed,y*3,z*3)-0.5)*amt;p.setXYZ(i,x*k,y+(hash3(x+seed,y,z)-0.5)*amt*0.3,z*k);}return g;}
function rgb(hex){const c=new THREE.Color(hex);return[c.r,c.g,c.b];}
function mixc(a,b,t){return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}
const vcMat=(o)=>new THREE.MeshLambertMaterial(Object.assign({vertexColors:true},o||{}));

/* ---------- Égbolt ---------- */
const sky=new THREE.Mesh(new THREE.SphereGeometry(600,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{uMoon:{value:MOON_DIR},uHor:{value:FOG_COL},uZen:{value:new THREE.Color(0x03070f)}},
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position.z=gl_Position.w*0.9999;}',
  fragmentShader:'uniform vec3 uMoon,uHor,uZen;varying vec3 vD;void main(){float h=clamp(vD.y,0.0,1.0);vec3 c=mix(uHor,uZen,pow(h,0.45));float m=max(dot(normalize(vD),uMoon),0.0);c+=vec3(0.55,0.62,0.75)*(pow(m,600.0)*0.0+pow(m,90.0)*0.35+pow(m,10.0)*0.09);gl_FragColor=vec4(c,1.0);}'}));
sky.renderOrder=-10;scene.add(sky);
const moonTex=canvasTex(256,256,(g)=>{const r=mulberry32(3);const gr=g.createRadialGradient(118,112,10,128,128,120);gr.addColorStop(0,'#fbf6e6');gr.addColorStop(0.85,'#e7dfc8');gr.addColorStop(1,'#d6ccb2');g.fillStyle=gr;g.beginPath();g.arc(128,128,118,0,Math.PI*2);g.fill();
  for(let i=0;i<26;i++){const x=40+r()*176,y=40+r()*176,s=4+r()*20;if(Math.hypot(x-128,y-128)+s>116)continue;g.fillStyle='rgba(150,140,118,'+(0.18+r()*0.25)+')';g.beginPath();g.arc(x,y,s,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,245,0.25)';g.beginPath();g.arc(x-s*0.2,y-s*0.2,s*0.7,0,Math.PI*2);g.fill();}});
const moonSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex,fog:false,depthWrite:false}));moonSpr.scale.setScalar(34);moonSpr.renderOrder=-9;scene.add(moonSpr);
const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x9fb2d8,fog:false,depthWrite:false,transparent:true,opacity:0.45,blending:THREE.AdditiveBlending}));moonHalo.scale.setScalar(150);moonHalo.renderOrder=-9;scene.add(moonHalo);
const stars=(function(){const n=1400,p=new Float32Array(n*3),s=new Float32Array(n),r=mulberry32(7);for(let i=0;i<n;i++){const a=r()*Math.PI*2,e=Math.asin(0.08+r()*0.92);p.set([Math.cos(a)*Math.cos(e)*560,Math.sin(e)*560,Math.sin(a)*Math.cos(e)*560],i*3);s[i]=r();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aS',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{uT:{value:0}},
    vertexShader:'attribute float aS;uniform float uT;varying float vA;void main(){vA=(0.35+0.65*aS)*(0.7+0.3*sin(uT*(1.0+aS*3.0)+aS*40.0));vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=1.0+aS*1.8;gl_Position=projectionMatrix*mv;gl_Position.z=gl_Position.w*0.99985;}',
    fragmentShader:'varying float vA;void main(){vec2 d=gl_PointCoord-0.5;float a=smoothstep(0.5,0.0,length(d));gl_FragColor=vec4(0.85,0.9,1.0,a*vA);}'});
  const pts=new THREE.Points(g,m);pts.renderOrder=-9;scene.add(pts);return pts;})();
/* távoli erdő-sziluettek */
function silhouetteRing(radius,height,color,seed,mount){const tex=canvasTex(2048,256,(g,w,h)=>{const r=mulberry32(seed);g.clearRect(0,0,w,h);g.fillStyle='#fff';
    if(mount){g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=16){const y=h*0.35+Math.sin(x*0.004+seed)*h*0.16+Math.sin(x*0.013)*h*0.06;g.lineTo(x,y);}g.lineTo(w,h);g.fill();}
    else{g.fillRect(0,h*0.78,w,h);for(let i=0;i<260;i++){const x=r()*w,th=h*(0.25+r()*0.5),bw=th*0.22;g.beginPath();g.moveTo(x,h*0.8-th);for(let k=0;k<6;k++){const yy=h*0.8-th+th*(k+1)/6;g.lineTo(x+bw*(k+1)/6*(k%2?1.25:0.85),yy);}
      for(let k=5;k>=0;k--){const yy=h*0.8-th+th*(k+1)/6;g.lineTo(x-bw*(k+1)/6*(k%2?1.25:0.85),yy);}g.closePath();g.fill();}}});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,96,1,true),new THREE.MeshBasicMaterial({map:tex,color,transparent:true,fog:false,side:THREE.BackSide,depthWrite:false,alphaTest:0.02}));
  m.position.y=height/2-12;m.renderOrder=-8;scene.add(m);return m;}
const ring3=silhouetteRing(420,140,0x172331,5,true);
const ring2=silhouetteRing(260,70,0x111b26,6,false);
const ring1=silhouetteRing(170,55,0x0b131b,8,false);

/* ---------- Talaj ---------- */
const terrain=(function(){const g=new THREE.PlaneGeometry(240,240,150,150);g.rotateX(-Math.PI/2);const p=g.attributes.position,c=[];const moss=rgb(0x2a3d26),dirt=rgb(0x3a3326),dark=rgb(0x16211a),pale=rgb(0x4a5a3a);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=H(x,z);p.setY(i,h);const n=hash3(Math.floor(x*0.5),0,Math.floor(z*0.5)),n2=0.5+0.5*Math.sin(x*0.08+Math.cos(z*0.06)*2)*Math.cos(z*0.07);
    let col=mixc(moss,dirt,clamp(n2*0.8+(n-0.5)*0.3,0,1));col=mixc(col,dark,clamp(-h*0.25,0,0.6));col=mixc(col,pale,clamp((h-1.5)*0.3,0,0.4));c.push(col[0],col[1],col[2]);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:groundTex,vertexColors:true}));m.receiveShadow=true;scene.add(m);return m;})();

/* ---------- Erdő ---------- */
const CELL=8,grid=new Map(),bgrid=new Map(),trees=[],bushes=[];
const key=(a,b)=>a+','+b;
function addTo(g,o){const k=key(Math.floor(o.x/CELL),Math.floor(o.z/CELL));let a=g.get(k);if(!a){a=[];g.set(k,a);}a.push(o);}
function near(g,x,z,cb){const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=g.get(key(cx+i,cz+j));if(a)for(let n=0;n<a.length;n++)cb(a[n]);}}
function freeSpot(x,z,r){let ok=true;near(grid,x,z,t=>{if(ok&&Math.hypot(x-t.x,z-t.z)<t.r+r)ok=false;});return ok;}
const D=new THREE.Object3D(),TC=new THREE.Color();
function inst(geo,mat,list,set,shadow){const m=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((it,i)=>{set(it,i);D.updateMatrix();m.setMatrixAt(i,D.matrix);if(it._col)m.setColorAt(i,it._col);});
  m.frustumCulled=false;m.castShadow=!!shadow;m.receiveShadow=true;scene.add(m);return m;}

/* fenyő koronák (3 változat) */
function pineCrown(seed){const parts=[],tiers=7,dark=rgb(0x0f1d14),mid=rgb(0x21392a),tip=rgb(0x48664a),r=mulberry32(seed);
  for(let k=0;k<tiers;k++){const f=k/(tiers-1),r0=(1-f*0.82)*(0.9+r()*0.2),hh=0.2-f*0.06,base=0.3+f*0.62;const N=16;const g=new THREE.ConeGeometry(r0,hh,N,1,true);g.translate(0,base+hh/2,0);
    const p=g.attributes.position,ofs=r()*6.28;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>base+hh*0.9)continue;const a=Math.atan2(z,x)+ofs,rr=Math.hypot(x,z);
      const idx=Math.round((Math.atan2(z,x)+Math.PI)/(Math.PI*2)*N)%N;const star=idx%2?0.55:1.0+(hash3(idx,k,seed)-0.5)*0.35;const droop=star>0.9?hh*0.45:0;p.setXYZ(i,x*star,y-droop,z*star);}
    parts.push({g,flat:true,c:(x,y,z,nx,ny)=>{const ty=clamp((y-base+hh*0.5)/(hh*1.5),0,1),rr=Math.hypot(x,z)/r0;let c=mixc(dark,mid,clamp(rr*0.8+ty*0.3,0,1));if(ny>0.2)c=mixc(c,tip,clamp((ny-0.2)*1.4,0,0.75)*rr);return c;}});}
  const top=new THREE.ConeGeometry(0.1,0.12,6);top.translate(0,0.98,0);parts.push({g:top,flat:true,c:mid});
  return merge(parts);}
const trunkGeo=new THREE.CylinderGeometry(0.35,1,1,8,1,true);trunkGeo.translate(0,0.5,0);
const trunkMat=new THREE.MeshLambertMaterial({map:barkTex,color:0x6a5a4c});
/* nyírfa */
function birchCrown(seed){const parts=[],cols=[rgb(0x3e4a22),rgb(0x55602a),rgb(0x6d6a2a),rgb(0x2f3d1e)],r=mulberry32(seed);
  for(let i=0;i<14;i++){const g=new THREE.IcosahedronGeometry(1.0+r()*0.9,0);jitter(g,0.35,seed+i);const a=r()*6.28,rad=0.4+r()*1.7,y=6.5+r()*5.2;g.translate(Math.cos(a)*rad,y,Math.sin(a)*rad);
    const base=cols[i%4];parts.push({g,flat:true,c:(x,y2,z,nx,ny)=>mixc(base,mixc(base,[0.75,0.8,0.55],0.25),clamp(ny,0,1))});}
  return merge(parts);}
const birchTrunkGeo=new THREE.CylinderGeometry(0.7,1,1,7,1,true);birchTrunkGeo.translate(0,0.5,0);
/* száraz fa */
function deadTree(seed){const r=mulberry32(seed),parts=[],c=rgb(0x4a4038),c2=rgb(0x5e5448);
  const tr=new THREE.CylinderGeometry(0.12,0.3,1,7);tr.translate(0,0.5,0);parts.push({g:tr,c:c});
  for(let i=0;i<7;i++){const y=0.35+r()*0.55,len=0.25+r()*0.35,a=r()*6.28,up=0.5+r()*0.6;const b=new THREE.CylinderGeometry(0.015,0.05,len,5);b.translate(0,len/2,0);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),up,Math.sin(a)).normalize());b.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));b.translate(0,y,0);parts.push({g:b,c:c2});
    const tip=new THREE.Vector3(Math.cos(a),up,Math.sin(a)).normalize().multiplyScalar(len*0.75);const b2=new THREE.CylinderGeometry(0.006,0.022,len*0.6,4);b2.translate(0,len*0.3,0);
    const q2=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a+1),up+0.6,Math.sin(a+1)).normalize());b2.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q2));b2.translate(tip.x,y+tip.y,tip.z);parts.push({g:b2,c:c2});}
  return merge(parts);}

const pines=[],birches=[],deads=[],logs=[];
(function forest(){
  const r=mulberry32(1337);
  for(let i=0;i<900;i++){const x=(r()*2-1)*96,z=(r()*2-1)*96;if(Math.hypot(x,z-84)<8||Math.hypot(x,z+84)<6)continue;
    const kind=r();const t={x,z,c:r(),v:Math.floor(r()*3)};
    if(kind<0.82){t.kind='pine';t.h=11+r()*12;t.w=2.2+r()*1.6;t.r=0.26+t.h*0.017;if(!freeSpot(x,z,t.r+0.9))continue;pines.push(t);}
    else if(kind<0.93){t.kind='birch';t.h=9+r()*5;t.w=2+r()*1.2;t.r=0.2;if(!freeSpot(x,z,1.0))continue;birches.push(t);}
    else{t.kind='dead';t.h=7+r()*5;t.r=0.28;if(!freeSpot(x,z,1.0))continue;deads.push(t);}
    trees.push(t);addTo(grid,t);}
  for(let i=0;i<46;i++){const x=(r()*2-1)*90,z=(r()*2-1)*90,a=r()*Math.PI,L=3.5+r()*3.5;if(Math.hypot(x,z-84)<9||Math.hypot(x,z+84)<7)continue;
    const lg={x,z,a,L,rad:0.32+r()*0.15};logs.push(lg);for(let k=-L/2+0.6;k<=L/2-0.6;k+=1.1){const o={x:x+Math.cos(a)*k,z:z+Math.sin(a)*k,r:lg.rad+0.15,low:true};trees.push(o);addTo(grid,o);}}
  for(let i=0;i<230;i++){const x=(r()*2-1)*94,z=(r()*2-1)*94;const s=0.8+r()*0.7;const b={x,z,r:1.45*s,s,c:r()};bushes.push(b);addTo(bgrid,b);}
})();
/* példányok */
const crownGeos=[pineCrown(1),pineCrown(7),pineCrown(13)];const crownMat=vcMat();
[0,1,2].forEach(v=>{const list=pines.filter(t=>t.v===v);list.forEach(t=>{t._col=TC.setHSL(0.36+t.c*0.05,0.25+t.c*0.15,0.42+t.c*0.25).clone();});
  inst(crownGeos[v],crownMat,list,t=>{D.position.set(t.x,H(t.x,t.z)-0.1,t.z);D.rotation.set(0,t.c*12,0);D.scale.set(t.w,t.h,t.w);},true);});
pines.forEach(t=>t._col=null);
inst(trunkGeo,trunkMat,pines,t=>{D.position.set(t.x,H(t.x,t.z)-0.3,t.z);D.rotation.set(0,t.c*9,0);D.scale.set(t.r,t.h*0.95,t.r);},true);
inst(birchTrunkGeo,new THREE.MeshLambertMaterial({map:birchTex,color:0xb8b6ae}),birches,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set((t.c-0.5)*0.08,t.c*9,(t.c-0.5)*0.06);D.scale.set(0.2,t.h,0.2);},true);
const bcG=[birchCrown(3),birchCrown(17)];[0,1].forEach(v=>{const list=birches.filter(t=>t.v%2===v);inst(bcG[v],vcMat(),list,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.setScalar(t.h/12);},true);});
const dG=[deadTree(5),deadTree(23)];[0,1].forEach(v=>{const list=deads.filter(t=>t.v%2===v);inst(dG[v],vcMat(),list,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.set(t.h,t.h,t.h);},true);});
/* fatörzsek a földön */
{const g=new THREE.CylinderGeometry(1,1,1,10,1);g.rotateZ(Math.PI/2);
  inst(g,new THREE.MeshLambertMaterial({map:barkTex,color:0x5a4c40}),logs,l=>{const y=H(l.x,l.z)+l.rad*0.6;D.position.set(l.x,y,l.z);D.rotation.set(0,-l.a,(H(l.x+Math.cos(l.a)*l.L/2,l.z+Math.sin(l.a)*l.L/2)-H(l.x-Math.cos(l.a)*l.L/2,l.z-Math.sin(l.a)*l.L/2))/l.L*0.9);D.scale.set(l.L,l.rad,l.rad);},true);
  const cap=new THREE.CircleGeometry(1,10);const capM=new THREE.MeshLambertMaterial({color:0x9a8260});const caps=[];logs.forEach(l=>{caps.push({l,s:1},{l,s:-1});});
  inst(cap,capM,caps,c=>{const l=c.l,ex=l.x+Math.cos(l.a)*l.L/2*c.s,ez=l.z+Math.sin(l.a)*l.L/2*c.s;D.position.set(ex,H(l.x,l.z)+l.rad*0.6+(H(ex,ez)-H(l.x,l.z))*0.9,ez);D.rotation.set(0,-l.a+(c.s>0?Math.PI/2:-Math.PI/2),0);D.scale.set(l.rad*0.95,l.rad*0.95,1);});}
/* bokrok */
{const parts=[],r=mulberry32(31),dk=rgb(0x16261a),lt=rgb(0x35503a);for(let i=0;i<8;i++){const g=new THREE.IcosahedronGeometry(0.45+r()*0.35,0);jitter(g,0.3,i);const a=r()*6.28,rr=r()*0.75;g.translate(Math.cos(a)*rr,0.3+r()*0.55,Math.sin(a)*rr);parts.push({g,flat:true,c:(x,y,z,nx,ny)=>mixc(dk,lt,clamp(ny*0.6+y*0.35,0,1))});}
  const g=merge(parts);bushes.forEach(b=>b._col=TC.setHSL(0.3+b.c*0.06,0.3,0.5+b.c*0.35).clone());
  inst(g,vcMat(),bushes,b=>{D.position.set(b.x,H(b.x,b.z)-0.1,b.z);D.rotation.set(0,b.c*9,0);D.scale.set(1.5*b.s,1.05*b.s,1.5*b.s);},true);}
/* páfrányok */
{const pos=[],col=[],dk=rgb(0x13240f),lt=rgb(0x3f6a2c);for(let f=0;f<7;f++){const a=f/7*Math.PI*2+0.3;const ca=Math.cos(a),sa=Math.sin(a);
  for(let s=0;s<6;s++){const t0=s/6,t1=(s+1)/6;const px=(t)=>t*0.9,py=(t)=>Math.sin(t*2.2)*0.45;const x0=px(t0),y0=py(t0),x1=px(t1),y1=py(t1),wl=0.16*(1-t0*0.8);
    const P=(x,y,o)=>[ca*x-sa*o,y,sa*x+ca*o];[[x0,y0,0],[x1,y1,0],[(x0+x1)/2,(y0+y1)/2-0.04,wl]].concat([[x0,y0,0],[(x0+x1)/2,(y0+y1)/2-0.04,-wl],[x1,y1,0]]).forEach((q,qi)=>{pos.push(...P(q[0],q[1],q[2]));const c=mixc(dk,lt,t0*0.7+(Math.abs(q[2])>0?0.2:0));col.push(c[0],c[1],c[2]);});}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const r=mulberry32(41),list=[];for(let i=0;i<800;i++){const x=(r()*2-1)*95,z=(r()*2-1)*95;list.push({x,z,s:0.6+r()*0.9,a:r()*6.28});}
  inst(g,vcMat({side:THREE.DoubleSide}),list,f=>{D.position.set(f.x,H(f.x,f.z)-0.02,f.z);D.rotation.set(0,f.a,0);D.scale.setScalar(f.s);});}
/* kövek */
{const g=jitter(new THREE.DodecahedronGeometry(1,0),0.45,5);const grey=rgb(0x55585a),moss=rgb(0x34502c);const m=merge([{g,flat:true,c:(x,y,z,nx,ny)=>mixc(grey,moss,clamp((ny-0.45)*2.4,0,1))}]);
  const r=mulberry32(51),list=[];for(let i=0;i<320;i++){const x=(r()*2-1)*95,z=(r()*2-1)*95,s=0.25+Math.pow(r(),2.2)*1.6;list.push({x,z,s,sy:s*(0.55+r()*0.35),a:r()*6.28,c:r()});
    if(s>0.95&&!(Math.hypot(x,z-84)<9||Math.hypot(x,z+84)<7)){const o={x,z,r:s*0.9,low:s<1.3};trees.push(o);addTo(grid,o);}}
  list.forEach(k=>k._col=TC.setHSL(0.3,0.05,0.55+k.c*0.35).clone());
  inst(m,vcMat(),list,k=>{D.position.set(k.x,H(k.x,k.z)-k.sy*0.25,k.z);D.rotation.set(k.c,k.a,k.c*0.5);D.scale.set(k.s,k.sy,k.s*(0.8+k.c*0.4));},true);}
/* avar */
{const g=new THREE.PlaneGeometry(0.16,0.16);g.rotateX(-Math.PI/2);const r=mulberry32(61),list=[],cols=[0x9a6a36,0xb08a44,0x7a4a26,0xa07a3a,0x6a5a36];
  for(let i=0;i<7000;i++){const x=(r()*2-1)*96,z=(r()*2-1)*96;list.push({x,z,a:r()*6.28,s:0.7+r()*0.9,_col:new THREE.Color(cols[i%5])});}
  inst(g,new THREE.MeshLambertMaterial({side:THREE.DoubleSide,map:leafTex,alphaTest:0.5}),list,l=>{D.position.set(l.x,H(l.x,l.z)+0.03,l.z);D.rotation.set(0,l.a,0);D.scale.setScalar(l.s);});}
/* világító gombák */
const glowSprites=[];
{const parts=[],r=mulberry32(71);for(let i=0;i<3;i++){const a=r()*6.28,rr=r()*0.22,h=0.06+r()*0.08;const st=new THREE.CylinderGeometry(0.008,0.012,h,5);st.translate(Math.cos(a)*rr,h/2,Math.sin(a)*rr);parts.push({g:st,c:[0.55,0.85,0.8]});
  const cp=new THREE.SphereGeometry(0.035+r()*0.03,6,3,0,Math.PI*2,0,Math.PI/2);cp.scale(1,0.6,1);cp.translate(Math.cos(a)*rr,h,Math.sin(a)*rr);parts.push({g:cp,c:[0.45,1,0.9]});}
  const g=merge(parts);const r2=mulberry32(72),list=[];for(let i=0;i<90;i++){const x=(r2()*2-1)*92,z=(r2()*2-1)*92;list.push({x,z,s:0.8+r2()*1.2});}
  inst(g,new THREE.MeshBasicMaterial({vertexColors:true}),list,m=>{D.position.set(m.x,H(m.x,m.z),m.z);D.rotation.set(0,m.s*5,0);D.scale.setScalar(m.s);});
  const gm=new THREE.SpriteMaterial({map:glowTex,color:0x5fe8d0,transparent:true,opacity:0.42,depthWrite:false,blending:THREE.AdditiveBlending});
  list.forEach(m=>{const s=new THREE.Sprite(gm);s.position.set(m.x,H(m.x,m.z)+0.12,m.z);s.scale.setScalar(0.9*m.s);scene.add(s);glowSprites.push(s);});}
/* holdfény-csóvák a tisztásokon */
const shafts=[];
{const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uT:{value:0}},
  vertexShader:'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 w=modelMatrix*vec4(position,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uT;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float edge=pow(abs(dot(vN,vV)),1.6);float a=(1.0-vY)*smoothstep(0.0,0.06,vY)*edge*0.11*(0.85+0.15*sin(uT*0.7+vY*6.0));gl_FragColor=vec4(0.62,0.72,0.95,a);}'});
  const r=mulberry32(81);let tries=0;while(shafts.length<9&&tries<400){tries++;const x=(r()*2-1)*80,z=(r()*2-1)*80;let ok=true;near(grid,x,z,t=>{if(!t.low&&Math.hypot(x-t.x,z-t.z)<6)ok=false;});if(!ok)continue;
    const L=60,g=new THREE.CylinderGeometry(1.8,4.2,L,20,1,true);g.translate(0,-L/2,0);const m=new THREE.Mesh(g,mat);const top=new THREE.Vector3(x,H(x,z),z).addScaledVector(MOON_DIR,L);m.position.copy(top);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),MOON_DIR);scene.add(m);shafts.push(m);}
  shafts.mat=mat;}
/* ködpadok */
const fogSheets=[0.2,1.3].map((y,i)=>{const t=fogTex.clone();t.needsUpdate=true;t.repeat.set(2.5,2.5);const m=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.MeshBasicMaterial({map:t,color:0x8fa3bc,transparent:true,opacity:i?0.16:0.26,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.y=y;m.renderOrder=5;scene.add(m);m.userData={y,sp:i?0.7:0.4};return m;});

/* ---------- Fű a játékos körül (a csempe a kamerával vándorol) ---------- */
const grass=(function(){const T=40,N=26000,r=mulberry32(91),pos=[],root=[],col=[],nor=[];
  for(let i=0;i<N;i++){const rx=r()*T,rz=r()*T,a=r()*6.28,w=0.012+r()*0.022,h=0.15+Math.pow(r(),1.6)*0.6,lean=(r()-0.5)*0.35,ca=Math.cos(a),sa=Math.sin(a);
    const dry=r()<0.18,base=[0.06+r()*0.03,0.1+r()*0.04,0.06],tipc=dry?[0.36+r()*0.1,0.32+r()*0.08,0.18]:[0.17+r()*0.12,0.28+r()*0.14,0.12+r()*0.06];
    [[-w,0,base],[w,0,base],[lean*0.6,h,tipc]].forEach(q=>{pos.push(ca*q[0]+(q[1]?lean*0.4*sa:0),q[1],sa*q[0]);root.push(rx,rz);col.push(...q[2]);nor.push(0,1,0);});}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('aRoot',new THREE.Float32BufferAttribute(root,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});const U={uCam:{value:new THREE.Vector2()},uT:{value:0},uTile:{value:T},uPush:{value:new THREE.Vector3(0,0,-99)}};
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.vertexShader='attribute vec2 aRoot;uniform vec2 uCam;uniform float uT;uniform float uTile;uniform vec3 uPush;\n'+GLSL_H+sh.vertexShader.replace('#include <begin_vertex>',
    'vec2 wp=aRoot+uTile*floor((uCam-aRoot)/uTile+0.5);float dd=length(wp-uCam);float fade=1.0-smoothstep(uTile*0.3,uTile*0.5,dd);vec3 transformed=position*vec3(1.0,fade,1.0);'+
    'float sway=sin(uT*1.6+wp.x*0.35+wp.y*0.27)*0.1+sin(uT*3.3+wp.x*1.7)*0.025;vec2 pd=wp-uPush.xy;float pl=length(pd);float pk=(1.0-smoothstep(0.0,0.9,pl))*uPush.z;'+
    'transformed.xz+=(vec2(sway,sway*0.6)+normalize(pd+0.0001)*pk*0.35)*position.y;transformed.xz+=wp;transformed.y+=hgt(wp.x,wp.y)-0.02;')};
  const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.receiveShadow=true;scene.add(m);m.userData.U=U;return m;})();

/* ---------- Szentjánosbogarak, hulló levelek ---------- */
const flies=[];{const r=mulberry32(101);for(let i=0;i<36;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xd8f27a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));s.scale.setScalar(0.35);s.userData={ox:(r()*2-1)*20,oz:(r()*2-1)*20,y:0.5+r()*2.2,ph:r()*6.28,sp:0.4+r()*0.6};scene.add(s);flies.push(s);}}
const falling=(function(){const N=50,g=new THREE.PlaneGeometry(0.12,0.12),m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xa0743a,side:THREE.DoubleSide,map:leafTex,alphaTest:0.5}),N),r=mulberry32(111),L=[];
  for(let i=0;i<N;i++)L.push({x:(r()*2-1)*12,y:r()*9,z:(r()*2-1)*12,ph:r()*6.28,sp:0.25+r()*0.3});m.frustumCulled=false;scene.add(m);m.userData.L=L;return m;})();

window.AE={$,clamp,mulberry32,hash3,lerp,H,GLSL_H,normalAt,renderer,scene,camera,resize,MOON_DIR,moonLight,hemi,FOG_COL,canvasTex,radial,glowTex,softTex,merge,jitter,rgb,mixc,vcMat,
  sky,moonSpr,moonHalo,stars,ring1,ring2,ring3,terrain,grid,bgrid,trees,bushes,near,shafts,fogSheets,grass,flies,falling,glowSprites,CELL,addTo,setPR:(v)=>{PR=v;renderer.setPixelRatio(v);resize();}};
})();
