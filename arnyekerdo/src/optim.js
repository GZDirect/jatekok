(function(){
/* Shinobi – mozdulatlan pályaelemek összevonása (kevesebb rajzolási hívás → hűvösebb telefon).
   © 2026 Mom’s Couch Studios. Minden jog fenntartva.
   Indulás után megfigyeljük a tárgyakat; amelyik nem mozdult, nem tűnt el és nem változott, azokat azonos szülő és
   anyag szerint egyetlen hálóba vonjuk össze. Az eredetik a helyükön maradnak (csak nem rajzolódnak ki), és fél
   másodpercenként ellenőrizzük őket: ha a játék bármelyiket mozgatja, elrejti vagy kiveszi, az érintett csoport
   azonnal visszaáll az eredeti darabokra. Így ajtók, kapuk, daruk és hasonlók biztonságban vannak. */
const A=window.AE;if(!A||!A.G)return;
const {scene}=A;const HIDE=30;   /* ezen a rétegen lévő tárgyat a kamera nem rajzolja */
const actorRoots=new Set();
function collectActors(){(A.G.ALLCOPS||[]).forEach(c=>c.mesh&&actorRoots.add(c.mesh));(A.CIVS||[]).forEach(g=>actorRoots.add(g));if(A.FALU&&A.FALU.master)actorRoots.add(A.FALU.master);if(A.hands)actorRoots.add(A.hands);}
function underActor(o){for(let p=o;p;p=p.parent){if(actorRoots.has(p))return true;}return false;}
function snap(o){const m=o.material||{};return [o.position.x,o.position.y,o.position.z,o.quaternion.x,o.quaternion.y,o.quaternion.z,o.quaternion.w,o.scale.x,o.scale.y,o.scale.z,o.visible?1:0,
  m.color?m.color.getHex():0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity||0,m.opacity===undefined?1:m.opacity,m.visible===false?0:1];}
/* az azonos kinézetű anyagok (külön példányok is) egy csoportba kerülhetnek */
function matKey(m){return [m.type,m.color?m.color.getHex():'',m.emissive?m.emissive.getHex():'',m.emissiveIntensity,m.map?m.map.uuid:'',m.side,m.flatShading?1:0,m.alphaTest,m.fog?1:0,m.depthWrite?1:0,m.polygonOffset?m.polygonOffsetFactor:'n',m.onBeforeCompile&&m.onBeforeCompile.toString().length>20?m.uuid:''].join(',');}
function same(a,b){if(!a||!b||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>1e-5)return false;return true;}
function eligible(o){if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||!o.parent||Array.isArray(o.material))return false;
  const m=o.material;if(!m||m.transparent||m.vertexColors||m.isShaderMaterial||m.isRawShaderMaterial||m.morphTargets||m.skinning)return false;
  const g=o.geometry;if(!g||!g.isBufferGeometry||!g.attributes.position||g.morphAttributes&&Object.keys(g.morphAttributes).length)return false;
  if(g.attributes.position.count>6000)return false;if(o.children.length)return false;if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return false;
  return !underActor(o);}
let watch=null,groups=[];
function start(){collectActors();const c=[];scene.traverse(o=>{if(eligible(o))c.push({o,s:snap(o)});});watch=c;setTimeout(merge,4500);}
function merge(){if(!watch)return;const byKey=new Map();
  watch.forEach(w=>{const o=w.o;if(!o.parent||!same(w.s,snap(o))||!o.visible||!eligible(o))return;
    for(let p=o.parent;p;p=p.parent)if(!p.visible)return;
    const g=o.geometry,k=o.parent.uuid+'|'+matKey(o.material)+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+(g.attributes.normal?1:0)+(g.attributes.uv?1:0);
    let L=byKey.get(k);if(!L)byKey.set(k,L=[]);L.push(w);});
  byKey.forEach(L=>{if(L.length<3)return;
    let n=0;const parts=L.map(w=>{const g=w.o.geometry.index?w.o.geometry.toNonIndexed():w.o.geometry;n+=g.attributes.position.count;return g;});
    const hasN=!!parts[0].attributes.normal,hasUV=!!parts[0].attributes.uv;
    const pos=new Float32Array(n*3),nor=hasN?new Float32Array(n*3):null,uv=hasUV?new Float32Array(n*2):null;let off=0;
    const v=new THREE.Vector3(),nm=new THREE.Matrix3();
    L.forEach((w,i)=>{const o=w.o,g=parts[i],P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;o.updateMatrix();nm.getNormalMatrix(o.matrix);
      for(let j=0;j<P.count;j++){v.fromBufferAttribute(P,j).applyMatrix4(o.matrix);pos[(off+j)*3]=v.x;pos[(off+j)*3+1]=v.y;pos[(off+j)*3+2]=v.z;
        if(nor){v.fromBufferAttribute(N,j).applyMatrix3(nm).normalize();nor[(off+j)*3]=v.x;nor[(off+j)*3+1]=v.y;nor[(off+j)*3+2]=v.z;}
        if(uv){uv[(off+j)*2]=U.getX(j);uv[(off+j)*2+1]=U.getY(j);}}
      off+=P.count;});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));if(nor)geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));if(uv)geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    geo.computeBoundingSphere();
    const o0=L[0].o,mm=new THREE.Mesh(geo,o0.material);mm.castShadow=o0.castShadow;mm.receiveShadow=o0.receiveShadow;mm.matrixAutoUpdate=false;mm.userData.merged=true;
    o0.parent.add(mm);L.forEach(w=>{w.o.layers.set(HIDE);w.s=snap(w.o);});groups.push({mm,L});});
  watch=null;setInterval(check,500);}
function restore(G){G.L.forEach(w=>w.o.layers.set(0));if(G.mm.parent)G.mm.parent.remove(G.mm);G.mm.geometry.dispose();G.dead=true;}
function check(){for(const G of groups){if(G.dead)continue;for(const w of G.L){if(!w.o.parent||!same(w.s,snap(w.o))){restore(G);break;}}}groups=groups.filter(G=>!G.dead);}
A.optimStats=()=>({groups:groups.length,objs:groups.reduce((s,G)=>s+G.L.length,0)});
/* a játék indulása után kezdünk (addigra a pálya és a szereplők felépültek) */
const iv=setInterval(()=>{if(A.G.S&&A.G.S.running){clearInterval(iv);setTimeout(start,1500);}},500);
})();
