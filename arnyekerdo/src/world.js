(function(){
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash3(x,y,z){let h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h);}
const lerp=(a,b,t)=>a+(b-a)*t;

/* ---------- Terep magassága (JS és GLSL ugyanaz) ----------
   Fix méretű völgy: |x|<XW és -ZN<z<ZS a járható rész, körülötte meredek gerincek (rdg).
   Északon (x≈0) egy szoros vezet ki az útra: ott van a kijárat. */
/* két pálya: 1. erdő (rendőrkordon), 2. falu (kiképzés). A falu a ?palya=falu címmel töltődik. */
const LV=/[?&]palya=falu/.test(location.search)?'falu':'erdo';
const XW=LV==='falu'?26:52,ZS=LV==='falu'?50:100,ZN=LV==='falu'?104:104,HB=LV==='falu'?0.15:1;
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function rdg(x,z){const ex=Math.max(Math.abs(x)-XW,0),ez=z>0?Math.max(z-ZS,0):Math.max(-z-ZN,0)*(LV==='falu'?1:sstep(5,12,Math.abs(x))),e=ex+ez;return e*(0.35+0.055*e)+0.6*Math.min(e,8)*Math.sin(x*0.21+z*0.17);}
function H(x,z){return HB*(1.5*Math.sin(x*0.043+1.1)*Math.cos(z*0.037-0.4)+0.9*Math.sin(x*0.097+z*0.071+2.0)+0.4*Math.sin(x*0.23-z*0.19+0.7)+0.25*Math.cos(x*0.31+z*0.27))+rdg(x,z);}
const GLSL_H='float rdg(float x,float z){float ex=max(abs(x)-'+XW.toFixed(1)+',0.0);float ez=z>0.0?max(z-'+ZS.toFixed(1)+',0.0):max(-z-'+ZN.toFixed(1)+',0.0)*'+(LV==='falu'?'1.0':'smoothstep(5.0,12.0,abs(x))')+';float e=ex+ez;return e*(0.35+0.055*e)+0.6*min(e,8.0)*sin(x*0.21+z*0.17);}\n'+
  'float hgt(float x,float z){return '+HB.toFixed(2)+'*(1.5*sin(x*0.043+1.1)*cos(z*0.037-0.4)+0.9*sin(x*0.097+z*0.071+2.0)+0.4*sin(x*0.23-z*0.19+0.7)+0.25*cos(x*0.31+z*0.27))+rdg(x,z);}\n';
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
groundTex.repeat.set(42,57);
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
/* ---------- Zseblámpák fénye (a rendőröké), pixelenként a Lambert-anyagokba fűzve ----------
   NFL darab kúpfény: helyzet, irány, erősség. A game.js tölti fel képenként (FLU). */
const NFL=6;
const FLU={uFLp:{value:[...Array(NFL)].map(()=>new THREE.Vector3(0,-999,0))},uFLd:{value:[...Array(NFL)].map(()=>new THREE.Vector3(0,-1,0))},uFLo:{value:new Array(NFL).fill(0)}};
const FLASH_GLSL='#define AE_NFL '+NFL+'\nuniform vec3 uFLp[AE_NFL];uniform vec3 uFLd[AE_NFL];uniform float uFLo[AE_NFL];varying vec3 vAEW;\n'+
  'vec3 aeFlash(vec3 w){vec3 s=vec3(0.0);for(int i=0;i<AE_NFL;i++){vec3 d=w-uFLp[i];float L=length(d);float c=dot(d/max(L,0.001),uFLd[i]);'+
  's+=uFLo[i]*smoothstep(0.9,0.975,c)*(1.0/(1.0+L*L*0.012))*vec3(1.0,0.93,0.78);}return s*2.2;}\n';
function flashPatch(mat){const prev=mat.onBeforeCompile;const key=(prev?prev.toString():'')+'|aeflash';
  mat.onBeforeCompile=(sh,r)=>{if(prev)prev.call(mat,sh,r);Object.assign(sh.uniforms,FLU);
    sh.vertexShader='varying vec3 vAEW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{vec4 aw=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\naw=instanceMatrix*aw;\n#endif\nvAEW=(modelMatrix*aw).xyz;}');
    sh.fragmentShader=FLASH_GLSL+sh.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb+=diffuseColor.rgb*aeFlash(vAEW);\n#include <tonemapping_fragment>');};
  mat.customProgramCacheKey=()=>key;return mat;}
const vcMat=(o)=>flashPatch(new THREE.MeshLambertMaterial(Object.assign({vertexColors:true},o||{})));

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
const terrain=(function(){const g=new THREE.PlaneGeometry(220,300,110,150);g.rotateX(-Math.PI/2);const p=g.attributes.position,c=[];const moss=rgb(0x2a3d26),dirt=rgb(0x3a3326),dark=rgb(0x16211a),pale=rgb(0x4a5a3a),rock=rgb(0x4c4f4c);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=H(x,z);p.setY(i,h);const n=hash3(Math.floor(x*0.5),0,Math.floor(z*0.5)),n2=0.5+0.5*Math.sin(x*0.08+Math.cos(z*0.06)*2)*Math.cos(z*0.07);
    let col=mixc(moss,dirt,clamp(n2*0.8+(n-0.5)*0.3,0,1));col=mixc(col,dark,clamp(-h*0.25,0,0.6));col=mixc(col,pale,clamp((h-1.5)*0.3,0,0.4));if(LV==='falu'&&Math.abs(x)<17&&z<48&&z>-103)col=mixc(col,mixc(rgb(0x5a5040),rgb(0x6a604c),n),0.7);const rg=rdg(x,z);if(rg>1.5)col=mixc(col,mixc(rock,dark,n*0.6),clamp((rg-1.5)*0.12+n*0.25,0,0.85));c.push(col[0],col[1],col[2]);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,flashPatch(new THREE.MeshLambertMaterial({map:groundTex,vertexColors:true})));m.receiveShadow=true;scene.add(m);return m;})();

/* ---------- Erdő ---------- */
let bushMesh=null;const CELL=8,grid=new Map(),bgrid=new Map(),trees=[],bushes=[];
const key=(a,b)=>a+','+b;
function addTo(g,o){const k=key(Math.floor(o.x/CELL),Math.floor(o.z/CELL));let a=g.get(k);if(!a){a=[];g.set(k,a);}a.push(o);}
function near(g,x,z,cb){const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=g.get(key(cx+i,cz+j));if(a)for(let n=0;n<a.length;n++)cb(a[n]);}}
function freeSpot(x,z,r){let ok=true;near(grid,x,z,t=>{if(ok&&Math.hypot(x-t.x,z-t.z)<(t.cr||t.r)+r)ok=false;});return ok;}
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
const trunkMat=flashPatch(new THREE.MeshLambertMaterial({map:barkTex,color:0x6a5a4c}));
/* nyírfa */
function birchCrown(seed){const parts=[],cols=[rgb(0x3e4a22),rgb(0x55602a),rgb(0x6d6a2a),rgb(0x2f3d1e)],r=mulberry32(seed);
  for(let i=0;i<14;i++){const g=new THREE.IcosahedronGeometry(1.0+r()*0.9,0);jitter(g,0.35,seed+i);const a=r()*6.28,rad=0.4+r()*1.7,y=6.5+r()*5.2;g.translate(Math.cos(a)*rad,y,Math.sin(a)*rad);
    const base=cols[i%4];parts.push({g,flat:true,c:(x,y2,z,nx,ny)=>mixc(base,mixc(base,[0.75,0.8,0.55],0.25),clamp(ny,0,1))});}
  return merge(parts);}
const birchTrunkGeo=new THREE.CylinderGeometry(0.7,1,1,7,1,true);birchTrunkGeo.translate(0,0.5,0);
/* száraz fa */
/* méterben épül egy 12 m-es fára, és egyenletesen skálázódik (t.h/12), így a törzs vékony marad */
function deadTree(seed){const r=mulberry32(seed),parts=[],c=rgb(0x4a4038),c2=rgb(0x5e5448),M=12;
  const tr=new THREE.CylinderGeometry(0.09,0.34,M,8);tr.translate(0,M/2,0);parts.push({g:tr,c:c});
  for(let i=0;i<7;i++){const y=(0.35+r()*0.55)*M,len=(0.22+r()*0.3)*M*0.6,a=r()*6.28,up=0.5+r()*0.6;const b=new THREE.CylinderGeometry(0.025,0.09,len,5);b.translate(0,len/2,0);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),up,Math.sin(a)).normalize());b.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));b.translate(0,y,0);parts.push({g:b,c:c2});
    const tip=new THREE.Vector3(Math.cos(a),up,Math.sin(a)).normalize().multiplyScalar(len*0.75);const b2=new THREE.CylinderGeometry(0.012,0.045,len*0.6,4);b2.translate(0,len*0.3,0);
    const q2=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a+1),up+0.6,Math.sin(a+1)).normalize());b2.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q2));b2.translate(tip.x,y+tip.y,tip.z);parts.push({g:b2,c:c2});}
  return merge(parts);}

const pines=[],birches=[],deads=[],logs=[],giants=[];
/* a faluban fix helyen állnak a mászható óriásfák és a bokrok (a próbák ezekre épülnek) */
const FALU_GIANTS=[[-6,-10,1.0],[5,-20,1.0],[-7,-33,1.0],[-11,17,0.95],[-12,-86,1.05],[12,-88,1.0]];
const FALU_BUSHES=[[-10,44,0.9],[11,42,0.9],[3,20,0.9],[-5,15,1.0],[6,11.5,0.9],[-3,9,1.0],[-12,8,0.8],[11,-32,0.9],[-11,-45,1.0],[11,-47,1.0],
  [-11,-55,1.0],[9,-61,1.0],[-4,-63.5,0.9],[-9,-71,1.0],[8,-74,1.0],[-13,-81,1.0],[13,-81,1.0],[-6,-89,0.9],[6,-91,0.9],[0,-84,0.8]];
/* Ahová nem kerülhet fa: rajt (dél), kijárat és út (észak), rendőrautó. */
function keepClear(x,z,m){if(LV==='falu')return (Math.abs(x)<27+m&&z<51+m&&z>-105-m);return Math.hypot(x,z-96)<8+m||Math.hypot(x*0.7,z+106)<8+m||(Math.abs(x)<6+m&&z<-98)||Math.hypot(x-8,z-98)<5+m;}
const inField=(x,z,m)=>Math.abs(x)<XW-m&&z<ZS-m&&z>-ZN+m;
(function forest(){
  const r=mulberry32(1337);
  /* mászható óriásfák: sűrű lomb, vastag ágak, legalább 15 m-re egymástól */
  const fixed=LV==='falu'?FALU_GIANTS:[[-9,79],[11,73]];let tries=0;while(giants.length<(LV==='falu'?FALU_GIANTS.length:26)&&tries<4000){tries++;const fx=fixed[giants.length];const x=fx?fx[0]:(r()*2-1)*46,z=fx?fx[1]:-94+r()*182;if(!fx&&keepClear(x,z,4))continue;
    if(!fx&&giants.some(g=>Math.hypot(g.x-x,g.z-z)<15))continue;const s=fx&&fx[2]?fx[2]:0.92+r()*0.22;
    const t={kind:'giant',x,z,s,c:r(),r:1.05*s,col:1.6*s,cr:3.4*s,h:21*s,py:8.6*s,climb:true,i:giants.length};giants.push(t);trees.push(t);addTo(grid,t);}
  for(let i=0;i<1250;i++){const x=(r()*2-1)*82,z=-132+r()*262;const inside=inField(x,z,-3);if(!inside&&r()<0.45)continue;if(keepClear(x,z,0))continue;
    const kind=r();const t={x,z,c:r(),v:Math.floor(r()*3)};
    if(kind<0.82){t.kind='pine';t.h=16+r()*15;t.w=3+r()*2.2;t.r=0.3+t.h*0.02;if(!freeSpot(x,z,t.r+1.0))continue;pines.push(t);}
    else if(kind<0.93){t.kind='birch';t.h=12+r()*6;t.w=2+r()*1.2;t.r=0.24;if(!freeSpot(x,z,1.1))continue;birches.push(t);}
    else{t.kind='dead';t.h=9+r()*6;t.r=0.34*t.h/12+0.06;if(!freeSpot(x,z,1.0))continue;deads.push(t);}
    trees.push(t);addTo(grid,t);}
  for(let i=0;i<40;i++){const x=(r()*2-1)*48,z=-96+r()*188,a=r()*Math.PI,L=3.5+r()*3.5;if(keepClear(x,z,2))continue;
    const lg={x,z,a,L,rad:0.32+r()*0.15};logs.push(lg);for(let k=-L/2+0.6;k<=L/2-0.6;k+=1.1){const o={x:x+Math.cos(a)*k,z:z+Math.sin(a)*k,r:lg.rad+0.15,low:true};trees.push(o);addTo(grid,o);}}
  if(LV==='falu')FALU_BUSHES.forEach(q=>{const s=q[2];const b={x:q[0],z:q[1],r:1.45*s,s,c:r()};bushes.push(b);addTo(bgrid,b);});
  else for(let i=0;i<240;i++){const x=(r()*2-1)*51,z=-100+r()*198;if(keepClear(x,z,-2))continue;const s=0.8+r()*0.7;const b={x,z,r:1.45*s,s,c:r()};bushes.push(b);addTo(bgrid,b);}
})();
/* példányok */
const crownGeos=[pineCrown(1),pineCrown(7),pineCrown(13)];const crownMat=vcMat();
[0,1,2].forEach(v=>{const list=pines.filter(t=>t.v===v);list.forEach(t=>{t._col=TC.setHSL(0.36+t.c*0.05,0.25+t.c*0.15,0.42+t.c*0.25).clone();});
  inst(crownGeos[v],crownMat,list,t=>{D.position.set(t.x,H(t.x,t.z)-0.1,t.z);D.rotation.set(0,t.c*12,0);D.scale.set(t.w,t.h,t.w);},true);});
pines.forEach(t=>t._col=null);
inst(trunkGeo,trunkMat,pines,t=>{D.position.set(t.x,H(t.x,t.z)-0.3,t.z);D.rotation.set(0,t.c*9,0);D.scale.set(t.r,t.h*0.95,t.r);},true);
inst(birchTrunkGeo,flashPatch(new THREE.MeshLambertMaterial({map:birchTex,color:0xb8b6ae})),birches,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set((t.c-0.5)*0.08,t.c*9,(t.c-0.5)*0.06);D.scale.set(0.2,t.h,0.2);},true);
const bcG=[birchCrown(3),birchCrown(17)];[0,1].forEach(v=>{const list=birches.filter(t=>t.v%2===v);inst(bcG[v],vcMat(),list,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.setScalar(t.h/12);},true);});
const dG=[deadTree(5),deadTree(23)];[0,1].forEach(v=>{const list=deads.filter(t=>t.v%2===v);inst(dG[v],vcMat(),list,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.setScalar(t.h/12);},true);});
/* mászható óriásfák: törzs + ágak/gyökerek + sűrű lomb (méterben épül, egyenletes skálával) */
function giantParts(seed){const r=mulberry32(seed),wood=[],leaf=[],bark=rgb(0x4a3e33),bark2=rgb(0x5d4f40);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+r()*0.5,y0=6.4+r()*1.8,len=3.6+r()*1.4,up=0.35+r()*0.35;const b=new THREE.CylinderGeometry(0.16,0.34,len,7);b.translate(0,len/2,0);
    b.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),up,Math.sin(a)).normalize())));b.translate(0,y0,0);wood.push({g:b,c:bark2});}
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+r(),len=2.2+r();const b=new THREE.ConeGeometry(0.45,len,6);b.translate(0,len/2,0);
    b.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),-0.55,Math.sin(a)).normalize())));b.translate(Math.cos(a)*0.2,0.9,Math.sin(a)*0.2);wood.push({g:b,c:bark});}
  const cols=[rgb(0x1c3016),rgb(0x27401d),rgb(0x334c22),rgb(0x22381a)];
  for(let i=0;i<40;i++){const rad=Math.sqrt(r())*6.2,a=r()*6.28,sz=1.5+r()*1.3,g=new THREE.IcosahedronGeometry(sz,0);jitter(g,0.35,seed+i);
    /* belül a levélcsomók alja a fán ülő játékos feje fölött marad (10.2 m), kívül alacsonyabb "függöny" takar */
    let y=rad>4.6&&r()<0.55?9.2+r()*1.4:10.3+r()*7.2-rad*0.45;if(rad<4.6)y=Math.max(y,10.2+sz*0.95);g.translate(Math.cos(a)*rad,y,Math.sin(a)*rad);const base=cols[i%4];
    leaf.push({g,flat:true,c:(x,y2,z,nx,ny)=>mixc(base,mixc(base,[0.62,0.74,0.42],0.3),clamp(ny,0,1)*0.8)});}
  return{wood:merge(wood),leaf:merge(leaf)};}
const giantTrunkGeo=new THREE.CylinderGeometry(0.45,1,1,12,3,true);giantTrunkGeo.translate(0,0.5,0);jitter(giantTrunkGeo,0.12,77);
inst(giantTrunkGeo,trunkMat,giants,t=>{D.position.set(t.x,H(t.x,t.z)-0.3,t.z);D.rotation.set(0,t.c*9,0);D.scale.set(t.r,13*t.s,t.r);},true);
const GP=giantParts(5),GLEAF_BASE=[];
inst(GP.wood,vcMat(),giants,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.setScalar(t.s);},true);
giants.forEach(t=>{t._col=TC.setHSL(0.27+t.c*0.04,0.3,0.5+t.c*0.18).clone();GLEAF_BASE.push(t._col.clone());});
const giantLeaf=inst(GP.leaf,vcMat(),giants,t=>{D.position.set(t.x,H(t.x,t.z)-0.2,t.z);D.rotation.set(0,t.c*9,0);D.scale.setScalar(t.s);},true);
giants.forEach(t=>t._col=null);
/* halvány jelzés: a kiválasztott óriásfa lombja kivilágosodik (k: 0..1) */
function glowGiant(i,k){if(i<0)return;TC.copy(GLEAF_BASE[i]).multiplyScalar(1+k*1.5);giantLeaf.setColorAt(i,TC);giantLeaf.instanceColor.needsUpdate=true;}
/* fatörzsek a földön */
{const g=new THREE.CylinderGeometry(1,1,1,10,1);g.rotateZ(Math.PI/2);
  inst(g,flashPatch(new THREE.MeshLambertMaterial({map:barkTex,color:0x5a4c40})),logs,l=>{const y=H(l.x,l.z)+l.rad*0.6;D.position.set(l.x,y,l.z);D.rotation.set(0,-l.a,(H(l.x+Math.cos(l.a)*l.L/2,l.z+Math.sin(l.a)*l.L/2)-H(l.x-Math.cos(l.a)*l.L/2,l.z-Math.sin(l.a)*l.L/2))/l.L*0.9);D.scale.set(l.L,l.rad,l.rad);},true);
  const cap=new THREE.CircleGeometry(1,10);const capM=new THREE.MeshLambertMaterial({color:0x9a8260});const caps=[];logs.forEach(l=>{caps.push({l,s:1},{l,s:-1});});
  inst(cap,capM,caps,c=>{const l=c.l,ex=l.x+Math.cos(l.a)*l.L/2*c.s,ez=l.z+Math.sin(l.a)*l.L/2*c.s;D.position.set(ex,H(l.x,l.z)+l.rad*0.6+(H(ex,ez)-H(l.x,l.z))*0.9,ez);D.rotation.set(0,-l.a+(c.s>0?Math.PI/2:-Math.PI/2),0);D.scale.set(l.rad*0.95,l.rad*0.95,1);});}
/* bokrok */
{const parts=[],r=mulberry32(31),dk=rgb(0x16261a),lt=rgb(0x35503a);for(let i=0;i<8;i++){const g=new THREE.IcosahedronGeometry(0.45+r()*0.35,0);jitter(g,0.3,i);const a=r()*6.28,rr=r()*0.75;g.translate(Math.cos(a)*rr,0.3+r()*0.55,Math.sin(a)*rr);parts.push({g,flat:true,c:(x,y,z,nx,ny)=>mixc(dk,lt,clamp(ny*0.6+y*0.35,0,1))});}
  const g=merge(parts);bushes.forEach(b=>b._col=TC.setHSL(0.3+b.c*0.06,0.3,0.5+b.c*0.35).clone());
  bushes.forEach((b,i)=>b.i=i);bushMesh=inst(g,vcMat(),bushes,b=>{D.position.set(b.x,H(b.x,b.z)-0.1,b.z);D.rotation.set(0,b.c*9,0);D.scale.set(1.5*b.s,1.05*b.s,1.5*b.s);},true);}
function shakeBush(b,k,t){if(!bushMesh||!b)return;D.position.set(b.x,H(b.x,b.z)-0.1,b.z);D.rotation.set(Math.sin(t*23+b.c*9)*0.07*k,b.c*9+Math.sin(t*17)*0.05*k,Math.cos(t*19+b.c)*0.07*k);D.scale.set(1.5*b.s,1.05*b.s*(1-0.03*k),1.5*b.s);D.updateMatrix();bushMesh.setMatrixAt(b.i,D.matrix);bushMesh.instanceMatrix.needsUpdate=true;}
/* páfrányok */
{const pos=[],col=[],dk=rgb(0x13240f),lt=rgb(0x3f6a2c);for(let f=0;f<7;f++){const a=f/7*Math.PI*2+0.3;const ca=Math.cos(a),sa=Math.sin(a);
  for(let s=0;s<6;s++){const t0=s/6,t1=(s+1)/6;const px=(t)=>t*0.9,py=(t)=>Math.sin(t*2.2)*0.45;const x0=px(t0),y0=py(t0),x1=px(t1),y1=py(t1),wl=0.16*(1-t0*0.8);
    const P=(x,y,o)=>[ca*x-sa*o,y,sa*x+ca*o];[[x0,y0,0],[x1,y1,0],[(x0+x1)/2,(y0+y1)/2-0.04,wl]].concat([[x0,y0,0],[(x0+x1)/2,(y0+y1)/2-0.04,-wl],[x1,y1,0]]).forEach((q,qi)=>{pos.push(...P(q[0],q[1],q[2]));const c=mixc(dk,lt,t0*0.7+(Math.abs(q[2])>0?0.2:0));col.push(c[0],c[1],c[2]);});}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const r=mulberry32(41),list=[];for(let i=0;i<560;i++){const x=(r()*2-1)*54,z=-104+r()*206;if(keepClear(x,z,-3))continue;list.push({x,z,s:0.6+r()*0.9,a:r()*6.28});}
  inst(g,vcMat({side:THREE.DoubleSide}),list,f=>{D.position.set(f.x,H(f.x,f.z)-0.02,f.z);D.rotation.set(0,f.a,0);D.scale.setScalar(f.s);});}
/* kövek */
{const g=jitter(new THREE.DodecahedronGeometry(1,0),0.45,5);const grey=rgb(0x55585a),moss=rgb(0x34502c);const m=merge([{g,flat:true,c:(x,y,z,nx,ny)=>mixc(grey,moss,clamp((ny-0.45)*2.4,0,1))}]);
  const r=mulberry32(51),list=[];for(let i=0;i<380;i++){const out=i>=270,x=out?(r()<0.5?-1:1)*(52+r()*22):(r()*2-1)*52,z=out?-125+r()*250:-102+r()*202,s=out?0.9+r()*2.4:0.25+Math.pow(r(),2.2)*1.6;if(!out&&keepClear(x,z,0))continue;list.push({x,z,s,sy:s*(0.55+r()*0.35),a:r()*6.28,c:r()});
    if(s>0.42&&!out){const o={x,z,r:s*1.02,low:s<1.3,kind:'rock'};trees.push(o);addTo(grid,o);}}
  list.forEach(k=>k._col=TC.setHSL(0.3,0.05,0.55+k.c*0.35).clone());
  inst(m,vcMat(),list,k=>{D.position.set(k.x,H(k.x,k.z)-k.sy*0.3,k.z);D.rotation.set(k.c,k.a,k.c*0.5);D.scale.set(k.s,k.sy,k.s*(0.8+k.c*0.4));},true);}
/* avar */
{const g=new THREE.PlaneGeometry(0.16,0.16);g.rotateX(-Math.PI/2);const r=mulberry32(61),list=[],cols=[0x9a6a36,0xb08a44,0x7a4a26,0xa07a3a,0x6a5a36];
  for(let i=0;i<5600;i++){const x=(r()*2-1)*55,z=-108+r()*212;list.push({x,z,a:r()*6.28,s:0.7+r()*0.9,_col:new THREE.Color(cols[i%5])});}
  inst(g,flashPatch(new THREE.MeshLambertMaterial({side:THREE.DoubleSide,map:leafTex,alphaTest:0.5})),list,l=>{D.position.set(l.x,H(l.x,l.z)+0.03,l.z);D.rotation.set(0,l.a,0);D.scale.setScalar(l.s);});}
/* világító gombák */
const glowSprites=[];
{const parts=[],r=mulberry32(71);for(let i=0;i<3;i++){const a=r()*6.28,rr=r()*0.22,h=0.06+r()*0.08;const st=new THREE.CylinderGeometry(0.008,0.012,h,5);st.translate(Math.cos(a)*rr,h/2,Math.sin(a)*rr);parts.push({g:st,c:[0.55,0.85,0.8]});
  const cp=new THREE.SphereGeometry(0.035+r()*0.03,6,3,0,Math.PI*2,0,Math.PI/2);cp.scale(1,0.6,1);cp.translate(Math.cos(a)*rr,h,Math.sin(a)*rr);parts.push({g:cp,c:[0.45,1,0.9]});}
  const g=merge(parts);const r2=mulberry32(72),list=[];for(let i=0;i<80;i++){const x=(r2()*2-1)*50,z=-100+r2()*196;list.push({x,z,s:0.8+r2()*1.2});}
  inst(g,new THREE.MeshBasicMaterial({vertexColors:true}),list,m=>{D.position.set(m.x,H(m.x,m.z),m.z);D.rotation.set(0,m.s*5,0);D.scale.setScalar(m.s);});
  const gm=new THREE.SpriteMaterial({map:glowTex,color:0x5fe8d0,transparent:true,opacity:0.42,depthWrite:false,blending:THREE.AdditiveBlending});
  list.forEach(m=>{const s=new THREE.Sprite(gm);s.position.set(m.x,H(m.x,m.z)+0.12,m.z);s.scale.setScalar(0.9*m.s);scene.add(s);glowSprites.push(s);});}
/* holdfény-csóvák a tisztásokon */
const shafts=[];
{const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uT:{value:0}},
  vertexShader:'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 w=modelMatrix*vec4(position,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uT;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float edge=pow(abs(dot(vN,vV)),1.6);float a=(1.0-vY)*smoothstep(0.0,0.06,vY)*edge*0.11*(0.85+0.15*sin(uT*0.7+vY*6.0));gl_FragColor=vec4(0.62,0.72,0.95,a);}'});
  const r=mulberry32(81);let tries=0;while(shafts.length<8&&tries<400){tries++;const x=(r()*2-1)*46,z=-92+r()*180;let ok=true;near(grid,x,z,t=>{if(!t.low&&Math.hypot(x-t.x,z-t.z)<6)ok=false;});if(!ok)continue;
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
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});const U={uCam:{value:new THREE.Vector2()},uT:{value:0},uTile:{value:T},uPush:{value:new THREE.Vector3(0,0,-99)},uPC:{value:[0,1,2,3].map(()=>new THREE.Vector3(0,0,0))}};
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.vertexShader='attribute vec2 aRoot;uniform vec2 uCam;uniform float uT;uniform float uTile;uniform vec3 uPush;uniform vec3 uPC[4];\n'+GLSL_H+sh.vertexShader.replace('#include <begin_vertex>',
    'vec2 wp=aRoot+uTile*floor((uCam-aRoot)/uTile+0.5);float dd=length(wp-uCam);float fade=1.0-smoothstep(uTile*0.3,uTile*0.5,dd);vec3 transformed=position*vec3(1.0,fade,1.0);'+
    'float sway=sin(uT*1.6+wp.x*0.35+wp.y*0.27)*0.1+sin(uT*3.3+wp.x*1.7)*0.025;vec2 pd=wp-uPush.xy;float pl=length(pd);float pk=(1.0-smoothstep(0.0,0.9,pl))*uPush.z;'+
    'transformed.xz+=(vec2(sway,sway*0.6)+normalize(pd+0.0001)*pk*0.35)*position.y;for(int i=0;i<4;i++){vec2 qd=wp-uPC[i].xy;float qk=(1.0-smoothstep(0.0,0.8,length(qd)))*uPC[i].z;transformed.xz+=normalize(qd+0.0001)*qk*0.3*position.y;}transformed.xz+=wp;transformed.y+=hgt(wp.x,wp.y)-0.02;')};
  flashPatch(mat);const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.receiveShadow=true;scene.add(m);m.userData.U=U;return m;})();

/* ---------- Szentjánosbogarak, hulló levelek ---------- */
const flies=[];{const r=mulberry32(101);for(let i=0;i<36;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xd8f27a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));s.scale.setScalar(0.35);s.userData={ox:(r()*2-1)*20,oz:(r()*2-1)*20,y:0.5+r()*2.2,ph:r()*6.28,sp:0.4+r()*0.6};scene.add(s);flies.push(s);}}
const falling=(function(){const N=50,g=new THREE.PlaneGeometry(0.12,0.12),m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xa0743a,side:THREE.DoubleSide,map:leafTex,alphaTest:0.5}),N),r=mulberry32(111),L=[];
  for(let i=0;i<N;i++)L.push({x:(r()*2-1)*12,y:r()*9,z:(r()*2-1)*12,ph:r()*6.28,sp:0.25+r()*0.3});m.frustumCulled=false;scene.add(m);m.userData.L=L;return m;})();

/* ---------- Kijárat északon: hegyi út, korlát, utcai lámpa, italautomata ---------- */
const EXIT={x:0,z:-108};
const exitGroup=new THREE.Group();scene.add(exitGroup);
if(LV==='erdo'){const asph=flashPatch(new THREE.MeshLambertMaterial({color:0x2a2c2e})),line=new THREE.MeshBasicMaterial({color:0x8a8a78});
  const rg=new THREE.PlaneGeometry(7,52,4,26);rg.rotateX(-Math.PI/2);const p=rg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)-124;p.setZ(i,z);p.setY(i,H(x,z)+0.05);}rg.computeVertexNormals();
  const road=new THREE.Mesh(rg,asph);road.receiveShadow=true;exitGroup.add(road);
  for(let z=-100;z>-148;z-=4){const d=new THREE.Mesh(new THREE.PlaneGeometry(0.14,1.8),line);d.rotation.x=-Math.PI/2;d.position.set(0,H(0,z)+0.07,z);exitGroup.add(d);}
  const steel=flashPatch(new THREE.MeshLambertMaterial({color:0x9aa0a4}));
  [-1,1].forEach(sd=>{for(let z=-104;z>-146;z-=3){const x=sd*3.9,post=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.8,0.1),steel);post.position.set(x,H(x,z)+0.4,z);exitGroup.add(post);}
    const rail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.3,42),steel);rail.position.set(sd*3.85,H(sd*3.9,-125)+0.65,-125);exitGroup.add(rail);});
  /* utcai lámpa: nátriumfény */
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.11,6.5,8),steel);pole.position.set(-4.6,H(-4.6,-104)+3.25,-104);exitGroup.add(pole);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.08,0.08),steel);arm.position.set(-3.9,H(-4.6,-104)+6.4,-104);exitGroup.add(arm);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.12,0.25),new THREE.MeshBasicMaterial({color:0xffd59a}));head.position.set(-3.2,H(-4.6,-104)+6.32,-104);exitGroup.add(head);
  const lamp=new THREE.PointLight(0xffa850,1.5,24,1.6);lamp.position.set(-3.2,H(-4.6,-104)+6,-104);exitGroup.add(lamp);
  const lg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb060,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending}));lg.scale.setScalar(4);lg.position.copy(head.position);exitGroup.add(lg);
  /* italautomata (jidō hanbaiki) */
  const vtex=canvasTex(128,256,(g,w,h)=>{g.fillStyle='#e8eef2';g.fillRect(0,0,w,h);g.fillStyle='#c8202a';g.fillRect(0,0,w,26);
    const cs=['#d33','#36c','#eb3','#3a5','#fff','#932','#29a','#e73'];for(let row=0;row<4;row++)for(let k=0;k<6;k++){g.fillStyle=cs[(row*3+k)%8];g.fillRect(9+k*19,36+row*36,12,24);g.fillStyle='#222';g.fillRect(9+k*19,62+row*36,12,3);}
    g.fillStyle='#2a2e33';g.fillRect(14,190,100,36);g.fillStyle='#111';g.fillRect(24,232,80,14);});
  const vm=new THREE.Group();const box=new THREE.Mesh(new THREE.BoxGeometry(1.05,1.85,0.75),flashPatch(new THREE.MeshLambertMaterial({color:0xd8dde0})));box.position.y=0.92;vm.add(box);
  const front=new THREE.Mesh(new THREE.PlaneGeometry(0.95,1.75),new THREE.MeshBasicMaterial({map:vtex}));front.position.set(0,0.93,0.38);vm.add(front);
  const vl=new THREE.PointLight(0xd8ecff,0.9,9,1.8);vl.position.set(0,1.1,1.0);vm.add(vl);
  vm.position.set(4.9,H(4.9,-103),-103);vm.rotation.y=-0.35;exitGroup.add(vm);
  exitGroup.userData={lamp};
  [{x:4.9,z:-103,r:0.8},{x:-4.6,z:-104,r:0.3}].forEach(o=>{o.kind='prop';trees.push(o);addTo(grid,o);});}
/* ---------- Rendőrautó a rajtnál, forgó villogóval ---------- */
const patrolCar=new THREE.Group();scene.add(patrolCar);
if(LV==='erdo'){const wht=flashPatch(new THREE.MeshLambertMaterial({color:0xe6e8ea})),blk=flashPatch(new THREE.MeshLambertMaterial({color:0x15171a})),glass=new THREE.MeshLambertMaterial({color:0x1c2834});
  const low=new THREE.Mesh(new THREE.BoxGeometry(1.75,0.62,4.4),blk);low.position.y=0.62;patrolCar.add(low);
  const mid=new THREE.Mesh(new THREE.BoxGeometry(1.76,0.22,4.42),wht);mid.position.y=1.04;patrolCar.add(mid);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.55,2.2),wht);cab.position.set(0,1.42,0.15);patrolCar.add(cab);
  const win=new THREE.Mesh(new THREE.BoxGeometry(1.57,0.38,2.0),glass);win.position.set(0,1.45,0.15);patrolCar.add(win);
  const tire=new THREE.CylinderGeometry(0.34,0.34,0.24,12);tire.rotateZ(Math.PI/2);[[-0.82,1.4],[0.82,1.4],[-0.82,-1.4],[0.82,-1.4]].forEach(q=>{const t=new THREE.Mesh(tire,blk);t.position.set(q[0],0.34,q[1]);patrolCar.add(t);});
  const barM=new THREE.MeshBasicMaterial({color:0xff2a22});const bar=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.14,0.28),barM);bar.position.set(0,1.77,0.15);patrolCar.add(bar);
  const red=new THREE.PointLight(0xff2020,1.2,18,1.5);red.position.set(0,2.2,0.15);patrolCar.add(red);
  const rs=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff3020,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending}));rs.scale.setScalar(2.6);rs.position.copy(bar.position);patrolCar.add(rs);
  patrolCar.position.set(8,H(8,98)+0.02,98);
[-1.45,0,1.45].forEach(k=>{const o={x:8+Math.sin(0.5)*k,z:98+Math.cos(0.5)*k,r:1.05,kind:'prop'};trees.push(o);addTo(grid,o);});patrolCar.rotation.y=0.5;patrolCar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  patrolCar.userData={red,rs};}
function stepScenery(t){const u=patrolCar.userData;if(!u.red)return;const k=Math.max(0,Math.sin(t*7.5));u.red.intensity=0.25+k*1.6;u.rs.material.opacity=0.25+k*0.7;}

window.AE={LV,$,clamp,mulberry32,hash3,lerp,H,GLSL_H,normalAt,renderer,scene,camera,resize,MOON_DIR,moonLight,hemi,FOG_COL,canvasTex,radial,glowTex,softTex,merge,jitter,rgb,mixc,vcMat,
  sky,moonSpr,moonHalo,stars,ring1,ring2,ring3,terrain,grid,bgrid,trees,bushes,near,shafts,fogSheets,grass,flies,falling,glowSprites,CELL,addTo,XW,ZS,ZN,rdg,EXIT,exitGroup,patrolCar,stepScenery,giants,shakeBush,glowGiant,FLU,NFL,flashPatch,freeSpot,keepClear,inField,setPR:(v)=>{PR=v;renderer.setPixelRatio(v);resize();}};
})();
