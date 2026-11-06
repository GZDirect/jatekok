(function(){
/* Shinobi – Blenderben készült, csontvázas szereplők (glTF) a régi, kódból rakott figurák helyett.
   © 2026 Fejes Géza. Minden jog fenntartva.
   Működés: a régi figura „csontváza” (hips, chest, neck, arms, legs pivotok) marad, és továbbra is a régi
   anim() mozgatja; mi ennek a forgatásait másoljuk át minden képkockában a modell csontjaira.
   Így a zseblámpa iránya, a célzás, a lövés, az elesés és az ütéstől megtántorodás változatlanul működik,
   a régi testrészek pedig láthatatlanok lesznek (a találatvizsgálat továbbra is rajtuk fut).
   Ha a modell nem töltődik be (pl. offline első indításkor), a régi figura marad. */
const A=window.AE;if(!A||!A.G||!THREE.GLTFLoader||!THREE.SkeletonUtils)return;
const G=A.G,LV=A.LV;
/* pálya + szereplőfajta → modell (modellek/<név>.glb) */
function kindOf(c){const k=A.ROOF&&A.ROOF.actors?A.ROOF.actors[c.id]:null;
  switch(LV){case 'erdo':return c.mesh.userData.pol?'rendor':null;
    case 'falu':return 'tanitvany';
    case 'varos':return k==='boss'?'kuroda':'testor';
    case 'vonat':return k==='boss'?'mori':(k==='conductor'||k==='driver')?'kalauz':'testor';
    case 'kikoto':return 'testor_kikoto';
    case 'fesztival':return k==='vip'?'vip_roka':'testor_fesztival';
    case 'fogado':return 'testor_fogado';
    case 'templom':return k==='naruse'?'naruse':'testor_templom';}
  return null;}
const jobs=[];G.ALLCOPS.forEach(c=>{const k=kindOf(c);if(k)jobs.push([c.mesh,k]);});
if(LV==='falu'&&A.FALU&&A.FALU.master)jobs.push([A.FALU.master,'mester']);
/* civilek: utasok a vonaton, vendégek az ünnepen, a könyvelő a fogadóban */
(A.CIVS||[]).forEach((g,i)=>{if(G.ALLCOPS.some(c=>c.mesh===g))return;jobs.push([g,LV==='fogado'?'konyvelo':(i%2?'civil_b':'civil_a')]);});
if(!jobs.length)return;
const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_v=new THREE.Vector3(),_v2=new THREE.Vector3(),_m=new THREE.Matrix4();
function prepMaterials(root){
  root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=false;
    const mk=m=>{const n=new THREE.MeshLambertMaterial({color:m.color?m.color.clone():0xffffff,map:m.map||null,skinning:!!o.isSkinnedMesh,
        transparent:false,alphaTest:m.transparent||m.alphaTest>0||(m.map&&m.name&&/haj|szemold/i.test(m.name))?0.5:0,side:THREE.FrontSide});
      if(!m.map)n.color.convertLinearToSRGB();
      if(n.map){n.map.encoding=THREE.LinearEncoding;n.map.anisotropy=2;}
      return n;};
    o.material=Array.isArray(o.material)?o.material.map(mk):mk(o.material);});
}
function upgrade(g,src){
  const R=g.userData.R;if(!R||g.userData.model)return;
  const torch=R.lensP.parent,gun=R.muzzle.parent;
  const keep=new Set();[torch,gun].forEach(t=>t.traverse(o=>keep.add(o)));
  const els=new Set(R.arms.map(a=>a.el));
  const inHand=o=>{for(let p=o;p&&p!==g;p=p.parent){if(p.userData.handProp)return true;if(els.has(p.parent)&&!p.userData.orig)return true;}return false;};
  g.traverse(o=>{if(o.isMesh&&!keep.has(o)&&!inHand(o))o.visible=false;});
  /* a később a fejre/törzsre tett régi kiegészítők (maszk, sál stb.) is rejtve maradjanak */
  [R.neck,R.chest,R.hips].forEach(p=>{const add=p.add.bind(p);p.add=function(...o){o.forEach(x=>x.traverse(m=>{if(m.isMesh&&!m.userData.handProp)m.visible=false;}));return add(...o);};});
  const model=THREE.SkeletonUtils.clone(src);
  const cont=new THREE.Group();cont.rotation.y=Math.PI;cont.add(model);
  /* nyugalmi helyzet: minden csont forgása a test (body pivot) keretében */
  R.body.add(cont);
  const B={};model.traverse(o=>{if(o.isBone)B[o.name]=o;});
  /* ujjak markolásra hajlítva (a modell A-pózban nyitott tenyérrel készült); a csont saját x tengelye körül */
  const ax=new THREE.Vector3(1,0,0);
  Object.values(B).forEach(b=>{const m=/^(index|middle|ring|pinky|thumb)_0([123])_/.exec(b.name);if(!m)return;
    b.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(ax,m[1]==='thumb'?0.4:1.1));});
  g.updateMatrixWorld(true);
  const bodyInv=new THREE.Quaternion();R.body.getWorldQuaternion(bodyInv);bodyInv.invert();
  const RW=new Map();const rw=o=>{if(!RW.has(o)){const q=new THREE.Quaternion();o.getWorldQuaternion(q);RW.set(o,bodyInv.clone().multiply(q));}return RW.get(o);};
  Object.values(B).forEach(b=>{rw(b);rw(b.parent);});
  /* a karok A-pózból lefelé lógó helyzetbe (a régi figura nyugalmi állása) */
  const base={};
  [['l',-1],['r',1]].forEach(([s,sx])=>{const ua=B['upperarm_'+s],la=B['lowerarm_'+s];if(!ua||!la)return;
    const p1=new THREE.Vector3(),p2=new THREE.Vector3();ua.getWorldPosition(p1);la.getWorldPosition(p2);
    const inv=new THREE.Matrix4().copy(R.body.matrixWorld).invert();p1.applyMatrix4(inv);p2.applyMatrix4(inv);
    const dir=p2.sub(p1).normalize();base[s]=new THREE.Quaternion().setFromUnitVectors(dir,new THREE.Vector3(sx*0.12,-1,0.02).normalize());
    base[s+'i']=base[s].clone().invert();});
  /* pivot → csont párok; extra: a pivot forgatása elé/mögé tett nyugalmi korrekció */
  const map=[['pelvis',R.hips],['spine_02',R.chest],['neck_01',R.neck],
    ['thigh_l',R.legs[0].hp],['calf_l',R.legs[0].kn],['thigh_r',R.legs[1].hp],['calf_r',R.legs[1].kn],
    ['upperarm_l',R.arms[0].sh,'l','up'],['lowerarm_l',R.arms[0].el,'l','lo'],['upperarm_r',R.arms[1].sh,'r','up'],['lowerarm_r',R.arms[1].el,'r','lo']]
    .filter(m=>B[m[0]]).map(m=>({b:B[m[0]],p:m[1],s:m[2],k:m[3],rp:rw(B[m[0]].parent).clone().invert(),rb:rw(B[m[0]]).clone()}));
  const hands=[B.hand_l,B.hand_r];
  const D=new THREE.Quaternion();
  function sync(){
    for(const m of map){D.setFromEuler(m.p.rotation);
      if(m.k==='up')D.multiply(base[m.s]);else if(m.k==='lo')D.premultiply(base[m.s+'i']).multiply(base[m.s]);
      m.b.quaternion.copy(m.rp).multiply(D).multiply(m.rb);}
    cont.position.y=R.hips.position.y-0.98;
    model.updateMatrixWorld(true);
    /* zseblámpa és fegyver a modell kezébe */
    /* a régi alkar végén lévő tárgyak (zseblámpa, revolver, legyező…) az új kézbe kerülnek */
    for(let i=0;i<2;i++){const el=R.arms[i].el,h=hands[i];if(!h)continue;h.getWorldPosition(_v);el.updateMatrixWorld(true);el.worldToLocal(_v);
      _v.y+=0.31-0.05;
      for(const ch of el.children){if(ch.userData.orig&&ch!==torch&&ch!==gun)continue;
        if(!ch.userData.basePos)ch.userData.basePos=ch.position.clone();ch.position.copy(ch.userData.basePos).add(_v);}}
  }
  const old=g.userData.anim;g.userData.anim=function(t,spd,dt,o){old(t,spd,dt,o);sync();};
  g.userData.model=model;sync();
}
const loader=new THREE.GLTFLoader();
const byKind={};jobs.forEach(([g,k])=>{(byKind[k]=byKind[k]||[]).push(g);});
Object.keys(byKind).forEach(k=>loader.load('modellek/'+k+'.glb',gl=>{
  const src=gl.scene;prepMaterials(src);
  byKind[k].forEach(g=>{try{upgrade(g,src);}catch(e){console.warn('modell',e);}});
},undefined,e=>console.warn('modell betöltése nem sikerült',e)));
A.upgradeActor=(g,k)=>loader.load('modellek/'+k+'.glb',gl=>{prepMaterials(gl.scene);upgrade(g,gl.scene);});
})();
