(function(){
/* Árnyékerdő – 2. pálya: kiképzés a mester falujában (a próbák menete).
   © 2026 Fejes Géza. Minden jog fenntartva.
   Minden udvar egy próba. A mester magyarul szól (felirattal és felolvasással), a feladat a felső panelen áll.
   Ha elrontod, a mester megszólal, és az udvar elejéről kezded újra. */
const A=window.AE;if(A.LV!=='falu')return;
const G=A.G,F=A.FALU,{$,H,clamp}=A,{P,S,COPS,ALLCOPS,GOAL}=G;
const isTouch=matchMedia('(pointer:coarse)').matches;
document.body.classList.add('falu');

/* a tanítványok nem rendőrök: más a szövegük */
Object.assign(G.LINES,{
  spot:[['見つけた！','Mitsuketa!','Megvagy!'],['そこだ！','Soko da!','Ott vagy!'],['見えたぞ！','Mieta zo!','Látlak!']],
  body:[['倒れてる！','Taoreteru!','Valaki itt fekszik!'],['誰がやった！？','Dare ga yatta!?','Ki tette ezt?!']],
  lost:[['どこへ行った？','Doko e itta?','Hová lett?'],['消えた…','Kieta…','Eltűnt…']],
  smoke:[['煙だ！','Kemuri da!','Füst!'],['目が…！','Me ga…!','A szemem…!']]});
G.setDiff('normal');

/* ---------- a mester szövegei ---------- */
const L={
  intro:['よく来た。影の道を学べ。','Yoku kita. Kage no michi o manabe.','Jó, hogy eljöttél. Tanuld meg az árnyék útját.'],
  ten:['十二の試練がある。最後は明日、昼に。','Jūni no shiren ga aru. Saigo wa ashita, hiru ni.','Tizenkét próba vár rád. Az utolsó holnap délben, a dódzsó előtt.'],
  crouch:['しゃがめ。音を立てるな。','Shagame. Oto o tateru na.','Guggolj le, és ne csapj zajt.'],
  heard:['聞こえたぞ。もう一度。','Kikoeta zo. Mō ichido.','Hallottalak. Még egyszer.'],
  seen:['見えたぞ。やり直せ。','Mieta zo. Yarinaose.','Láttalak. Kezdd újra.'],
  caught:['捕まったな。もう一度。','Tsukamatta na. Mō ichido.','Elkaptak. Még egyszer.'],
  body:['見つかったぞ。隠すのが遅い。','Mitsukatta zo. Kakusu no ga osoi.','Megtalálták. Későn rejtetted el.'],
  above:['上からだ。もう一度。','Ue kara da. Mō ichido.','Felülről! Még egyszer.'],
  front:['正面からか？背後に回れ。','Shōmen kara ka? Haigo ni maware.','Szemből? Kerülj mögé.'],
  ok:[['よし。','Yoshi.','Jó.'],['見事だ。','Migoto da.','Szép munka.'],['悪くない。','Warukunai.','Nem rossz.']],
  dart:['吹き矢を使え。','Fukiya o tsukae.','A köpőcsövet használd.'],
  spike:['まきびしを使え。','Makibishi o tsukae.','Használd a tüskéket.'],
  day:['昼の試験だ。隠れる影は少ないぞ。','Hiru no shiken da. Kakureru kage wa sukunai zo.','Nappali vizsga. Kevés az árnyék, ahová elbújhatsz.'],
  final:['合格だ。お前はもう影だ。','Gōkaku da. Omae wa mō kage da.','Átmentél. Mostantól árnyék vagy.']};
const K=(t,g)=>isTouch?t:g;
/* a tizenkét próba: hol kezdődik, mit kell tenni, mitől sikerül, mitől bukik */
const ST=[
  {name:'Érkezés',say:null,task:'Menj oda a mesterhez a kapu előtt.'},
  {name:'Csend',say:['あの者は耳がいい。しゃがんで通れ。','Ano mono wa mimi ga ii. Shagande tōre.','Annak jó a füle. Guggolva menj el mögötte.'],
    task:'A tanítvány háttal áll, csukott szemmel, de mindent hall. Guggolj le ('+K('Guggol gomb','jobb egérgomb')+'), és osonj el mögötte a jobb oldali kapuig: guggolva csak 3–4 méterről hall meg. A sarokban álló bambuszcső (shishi-odoshi) időnként koppan: utána egy pillanatig elnyomja a lépteid zaját. Ha nem mersz, dobj kavicsot ('+K('Kavics','5')+') a túlsó sarokba: odamegy megnézni, és közben átjutsz. Három kavicsod van.',open:true,pass:true},
  {name:'Bokor',say:['茂みに隠れろ。灯りを避けよ。','Shigemi ni kakurero. Akari o sakeyo.','Bújj a bokrokba, kerüld a lámpást.'],
    task:'Egy tanítvány lámpással járőrözik. Guggolva a bokorban nem látszol. Figyeld a feje fölötti jelet: a ? a gyanúval telik, ha megtelik, észrevett. Juss át a bal oldali kapun.',open:true,pass:true},
  {name:'Bábuk',say:['背後から打て。三体とも。','Haigo kara ute. Santai tomo.','Hátulról üss. Mindhármat.'],
    task:'Három szalmabábu áll az udvaron, arccal különböző irányba. Kerülj mögéjük, és üss ('+K('Szúr/Üt gomb','kattintás vagy E')+'). A tantó (1) öl, a tekko (2) csak leüt; itt egyik sem sebez. Próbáld ki mindkettőt.'},
  {name:'Kampó',say:['壁は越えるものだ。','Kabe wa koeru mono da.','A fal arra való, hogy átjuss rajta.'],
    task:'A magas falon nincs kapu. Válaszd a kampót ('+K('Kampó','3')+'), célozz a közeli óriásfa lombjára, és húzd fel magad. Fentről dobd át a kampót a fal túloldalán álló fára, majd ugorj le ('+K('Le gomb','szóköz')+').',open:true},
  {name:'Karmok',say:['木に登り、上から襲え。','Ki ni nobori, ue kara osoe.','Mássz fel a fára, és támadj felülről.'],
    task:'Válaszd a karmokat ('+K('Karmok','4')+'), állj az óriásfa törzséhez, és mássz fel. Várd meg, amíg a tanítvány alattad halad el, és ugorj rá ('+K('Le gomb','szóköz')+'). Csak a felülről jövő támadás számít.'},
  {name:'Kavics',say:['石で気をそらせ。','Ishi de ki o sorase.','Kaviccsal tereld el a figyelmét.'],
    task:'Az őr a kaput figyeli. Válaszd a kavicsot ('+K('Kavics','5')+'), és dobd messzire oldalra ('+K('Dob gomb','kattintás')+'). Amíg a koppanás felé megy, osonj át a kapun. Három kavicsod van.',open:true,pass:true},
  {name:'Test',say:['倒れた者を隠せ。','Taoreta mono o kakuse.','Rejtsd el a földön fekvőt, mielőtt meglátják.'],
    task:'Egy „leütött” tanítvány fekszik az udvar közepén. Fogd meg ('+K('Húz gomb','G')+'), húzd be egy bokorba, és engedd el, mielőtt a járőr meglátja.'},
  {name:'Füst',say:['見つかったら、煙だ。','Mitsukattara, kemuri da.','Ha meglátnak: füst, és fuss.'],
    task:'Két idősebb tanítvány vár, és azonnal meglát. Várd meg, amíg egészen közel érnek, és akkor dobj füstöt ('+K('Füst gomb','F')+'): csak a közelieket vakítja el. Aztán fuss ('+K('Fut gomb','Q')+') közöttük a mögöttük lévő kapuig.',open:true,pass:true},
  {name:'Köpőcső',say:['吹き矢で眠らせろ。','Fukiya de nemurasero.','Altasd el a köpőcsővel.'],
    task:'Az őr a kapu előtt áll, és messzire ellát. Guggolj le, válaszd a köpőcsövet ('+K('Köpőcső','7')+'), célozz rá, és fújd ki az altatónyilat ('+K('Fúj gomb','kattintás')+'). Ha a célkereszt felderül, talál. Három nyilad van.'},
  {name:'Tüskék',say:['追われたら、まきびしだ。','Owaretara, makibishi da.','Ha üldöznek: tüskék.'],
    task:'Egy idősebb tanítvány rád ront, a kapu zárva. Válaszd a tüskéket ('+K('Tüskék','6')+'): állva előre dobod őket, futás közben magad mögé szórod. Aki belelép, megáll. Ha belelépett, kinyílik a kapu.',pass:true},
  {name:'Vizsga',say:['最後の試練だ。私のところまで来い。','Saigo no shiren da. Watashi no tokoro made koi.','Az utolsó próba. Gyere el hozzám, a dódzsó elé.'],
    task:'Nappali vizsga: három tanítvány őrzi a dódzsó udvarát, és fényes nappal messzebbre látnak. Juss el a mesterig. Minden eszközöd megvan. Ha nem látnak meg, Árnyék pecsétet kapsz.'}];
const EX=ST.length-1;
/* a tanítványok szobák szerint */
const byRoom={};F.students.forEach((s,i)=>{(byRoom[s.room]=byRoom[s.room]||[]).push(i);});
const MSPOT=[[0,40],[-13.5,27],[-14,21],[-13,3],[13.5,-9],[13,-28],[-14,-43],[14.5,-60],[-14,-69],[14,-80],[14,-92],[0,-117.5]];

/* ---------- állapot ---------- */
const T={i:0,done:false,wait:0,q:[],qt:0,fails:0,stFails:0,grace:0,resetT:0,why:null,dropT:-9,examAl:0,used:{tanto:0,tekko:0},spoke:false,fust:false};
G.station='';
function placeStudent(i){const c=ALLCOPS[i],s=F.students[i],p=s.route[0];c.route=s.route;c.ri=0;c.x=p.x;c.z=p.z;c.ry=s.ry;c.tx=p.x;c.tz=p.z;
  Object.assign(c,{st:'patrol',aw:0,hp:3,down:false,dead:false,koT:0,fall:0,stagger:0,shootCd:0,aimT:0,shoot:0,lostT:0,searchT:0,found:false,wait:s.delay||2.5,blind:0,saidT:-99,hiddenBody:false,lookUpT:-6,active:false,spd:0,sleepT:0,spikeT:0,spiked:false,slept:false});
  c.eyesClosed=!!s.listen;{const R=c.mesh.userData.R;if(R&&R.lensGlow)R.lensGlow.visible=!s.listen;}c.seenBody.clear();c.lens.set(c.x,H(c.x,c.z)+1.3,c.z);c.dir.set(-Math.sin(c.ry),-0.35,-Math.cos(c.ry)).normalize();c.mesh.visible=true;c.beam.visible=true;c.mark.visible=false;
  if(s.body){c.down=true;c.koT=1e9;c.fall=1;c.st='down';}}
function roomCops(i){return(byRoom[F.ROOMS[i].id]||[]).map(k=>ALLCOPS[k]);}
function activate(i,on){roomCops(i).forEach(c=>{c.active=on&&!F.students[c.id].body;});}
G.hooks.setup=()=>{ALLCOPS.forEach((c,i)=>placeStudent(i));};

/* ---------- a mester ---------- */
const M=F.master,MS={x:0,z:40,ry:0};
function masterTo(i){const p=MSPOT[i];MS.x=p[0];MS.z=p[1];}
function speak(l){G.sayLine(l,MS.x,MS.z,0.55);}
function queue(lines,gap){T.q=lines.slice();T.qt=0.2;T.gap=gap||3.4;}
function okLine(){return L.ok[Math.floor(Math.random()*L.ok.length)];}

/* ---------- panel ---------- */
function panel(){const st=ST[T.i];$('tut').hidden=false;$('tutStep').textContent='Próba '+(T.i+1)+' / '+ST.length+' · '+st.name;
  $('tutText').textContent=T.done&&T.i<ST.length-1?'Kész. Menj tovább a nyitott kapun.':st.task;G.station='Próba '+(T.i+1)+'/'+ST.length+' · '+st.name;}

/* ---------- próbák indítása ---------- */
function startStation(i){T.i=i;T.done=false;T.resetT=0;T.grace=0.8;T.stFails=0;T.fust=false;masterTo(i);
  const st=ST[i];ALLCOPS.forEach(c=>c.active=false);roomCops(i).forEach(c=>placeStudent(c.id));activate(i,i!==8&&i!==10&&i!==EX);if(st.open)F.GATES[F.ROOMS[i].id]&&F.GATES[F.ROOMS[i].id].setOpen(true);
  tools(i);if(i===EX){T.examAl=S.alarms;T.fadeT=3.4;dayFade(true);}
  if(st.say&&i!==EX)queue([st.say]);panel();G.tone(0.07,660,990,0.14);}
function tools(i){if(i===1||i===6)G.setStones(3);if(i===8)G.setSmoke(2);if(i===9)G.setDarts(3);if(i===10)G.setSpikes(2);
  if(i===EX){G.setStones(3);G.setSmoke(2);G.setDarts(3);G.setSpikes(2);G.setStars(5);}}
function complete(){if(T.done)return;T.done=true;const i=T.i;G.tone(0.08,880,1320,0.16);
  activate(i,false);roomCops(i).forEach(c=>{if(!F.students[c.id].body&&!c.down){c.st='patrol';c.aw=0;c.mark.visible=false;}});
  const g=F.GATES[F.ROOMS[i].id];if(g)g.setOpen(true);
  if(i===EX){finish();return;}
  if(i!==0)speak(okLine());
  if(ST[i].pass)startStation(i+1);else panel();}
function checkpoint(i){if(i===0)return{x:G.START.x,z:G.START.z};if(i===EX)return{x:0,z:-103.6};const r=F.ROOMS[i-1];return{x:r.gx,z:F.ROOMS[i].top+1.4};}
function fail(why){if(T.resetT>0||T.grace>0)return;T.resetT=1.3;T.why=why;T.fails++;(T.log=T.log||[]).push(T.i+':'+why);T.stFails++;speak(L[why]);G.showMsg(why==='caught'?'Elkaptak.':why==='heard'?'Meghallott.':why==='body'?'Megtalálták a testet.':why==='above'?'Felülről kellett volna.':why==='dart'?'A köpőcsövet használd.':why==='spike'?'A tüskéket használd.':'Észrevettek.');G.thump(0.4);}
function doReset(){const i=T.i,cp=checkpoint(i);
  Object.assign(P,{x:cp.x,z:cp.z,yaw:0,pitch:0,mode:'ground',tree:null,anim:null,drag:null,crouch:true,run:false,pend:null,camY:0.95,hp:100});A.setRope(0,0,0,0,0,0,false);
  roomCops(i).forEach(c=>placeStudent(c.id));ALLCOPS.forEach(c=>{if(c.st==='search'||c.st==='alert'||c.st==='suspect'){if(!c.down){c.st='patrol';c.aw=0;}}});
  S.alarm=0;S.smokeT=0;G.clearSpikes();activate(i,i!==8&&i!==10);T.fust=false;tools(i);if(i===10&&F.GATES.tuske)F.GATES.tuske.setOpen(false);
  T.grace=1.5;G.updateButtons();panel();}

/* ---------- bábuk: a játék ide küldi az ütést, ha nincs tanítvány előtted ---------- */
G.hooks.melee=it=>{if(T.i!==3||T.done)return;const f=G.fwd();let best=null,bd=2.0;
  F.DUMMIES.forEach(d=>{const dx=d.x-P.x,dz=d.z-P.z,dist=Math.hypot(dx,dz);if(dist>bd)return;if(Math.acos(clamp((dx*f.x+dz*f.z)/(dist||1),-1,1))>0.95)return;bd=dist;best=d;});
  if(!best)return;const tx=P.x-best.x,tz=P.z-best.z,tl=Math.hypot(tx,tz)||1;best.wob=0.9;G.noiseHit(0.25,500,'bandpass',0.2,1.2);
  if((best.fx*tx+best.fz*tz)/tl>-0.3){speak(L.front);G.showMsg('Szemből ütötted. Kerülj mögé.');return;}
  if(best.hit){G.showMsg('Ezt már eltaláltad.');return;}
  best.hit=true;best.how=it;best.mark.visible=true;T.used[it]++;const n=F.DUMMIES.filter(d=>d.hit).length;
  G.showMsg(n<3?'Talált! Még '+(3-n)+' bábu.':'Mindhárom bábu megvan.');
  if(n<3){if(n===1)speak(it==='tanto'?['次は鉄拳で。','Tsugi wa tekken de.','Most a tekkóval.']:['次は短刀で。','Tsugi wa tantō de.','Most a tantóval.']);else speak(okLine());}
  else complete();};
G.hooks.caught=c=>{if((T.i===8||T.i===10||T.i===EX)&&roomCops(T.i).includes(c))fail('caught');};

/* ---------- körönként ---------- */
G.hooks.newRound=()=>{Object.assign(T,{i:0,done:false,wait:0,q:[],qt:0,fails:0,stFails:0,grace:0,resetT:0,dropT:-9,examAl:0,used:{tanto:0,tekko:0},spoke:false,fust:false,onQ:null,onQT:0});
  Object.values(F.GATES).forEach(g=>g.setOpen(g.kind==='open',true));F.DUMMIES.forEach(d=>{d.hit=false;d.how=null;d.mark.visible=false;});
  GOAL.x=MS.x;GOAL.z=MS.z;G.setStones(0);G.setSmoke(0);G.setDarts(0);G.setSpikes(0);G.setStars(0);G.clearSpikes();setDay(false);$('dayFade').style.opacity=0;T.fadeT=0;startStation(0);
  G.showMsg('A mester a kapu előtt vár.');};

G.hooks.noiseMul=(x,z)=>(F.SHISHI.maskT>0&&Math.hypot(x-F.SHISHI.x,z-F.SHISHI.z)<18?0.25:1)*(F.gravelAt(x,z)?1.7:1);
G.hooks.update=dt=>{
  const t=S.time;F.stepGates(dt);F.stepDummies(dt,t);
  if(F.stepFalu(dt,t)){const d=Math.hypot(P.x-F.SHISHI.x,P.z-F.SHISHI.z);if(d<40){G.tone(0.16*Math.max(0.15,1-d/40),620,380,0.1,'triangle');G.noiseHit(0.1*Math.max(0.15,1-d/40),900,'bandpass',0.08,2);}}
  /* mester: a játékos felé fordul, nem lehet átmenni rajta */
  {const dx=P.x-MS.x,dz=P.z-MS.z,d=Math.hypot(dx,dz);MS.ry+=G.wrapA(Math.atan2(-dx,-dz)-MS.ry)*Math.min(1,dt*2);
    if(P.mode==='ground'&&d<0.9&&d>1e-4){P.x=MS.x+dx/d*0.9;P.z=MS.z+dz/d*0.9;}
    M.position.set(MS.x,H(MS.x,MS.z),MS.z);M.rotation.y=MS.ry;M.userData.anim(t,0,dt,{st:'patrol',bp:-0.1,sweep:0,shoot:0,fall:0,stagger:0});}
  GOAL.x=MS.x;GOAL.z=MS.z;
  if(!G.day)F.lampGlow.forEach((s,i)=>s.material.opacity=0.5+0.12*Math.sin(t*3.1+i*1.7)+0.05*Math.sin(t*11+i));
  /* beszédsor */
  if(T.q.length){T.qt-=dt;if(T.qt<=0){speak(T.q.shift());T.qt=T.gap;if(!T.q.length&&T.onQ)T.onQT=1.8;}}
  if(T.onQT>0){T.onQT-=dt;if(T.onQT<=0&&T.onQ){const f=T.onQ;T.onQ=null;f();}}
  if(T.fadeT>0){T.fadeT-=dt;const fd=$('dayFade');
    if(T.fadeT<=1.2)fd.style.opacity=Math.max(0,T.fadeT/1.2).toFixed(3);
    if(T.fadeT<=0){fd.style.opacity=0;activate(EX,true);queue([L.day,ST[EX].say],3.6);}
    return;}
  if(T.grace>0)T.grace-=dt;
  if(T.resetT>0){T.resetT-=dt;if(T.resetT<=0)doReset();return;}
  if(P.mode==='drop')T.dropT=t;
  const i=T.i,r=F.ROOMS[i],pz=P.z,dM=Math.hypot(P.x-MS.x,P.z-MS.z);
  /* kész próba után: a következő akkor indul, ha átléptél a kapun */
  if(T.done){if(i<EX&&pz<r.bot-0.3)startStation(i+1);return;}
  const cops=roomCops(i),act=cops.filter(c=>c.active);
  if(i!==8&&i!==10&&i!==EX&&T.grace<=0&&act.some(c=>c.st==='alert')){fail('seen');return;}
  switch(i){
    case 0:if(!T.spoke&&dM<3.2){T.spoke=true;T.onQ=()=>{complete();G.showMsg('Kinyílt a kapu.');};queue([L.intro,L.ten,L.crouch],3.6);}break;
    case 1:if(T.grace<=0&&act.some(c=>c.st!=='patrol'&&Math.hypot(c.tx-P.x,c.tz-P.z)<4.5&&Math.hypot(c.x-P.x,c.z-P.z)<12))fail('heard');else if(pz<r.bot-0.3)complete();break;
    case 2:if(pz<r.bot-0.3)complete();break;
    case 4:if(P.mode==='ground'&&pz<-16.2)complete();break;
    case 5:{const c=cops[0];if(c&&c.down){if(t-T.dropT<1.6)complete();else fail('above');}}break;
    case 6:if(pz<r.bot-0.3)complete();break;
    case 7:{const b=cops.find(c=>F.students[c.id].body);if(act.some(c=>c.seenBody.has(b.id))){fail('body');break;}if(b.hiddenBody&&P.drag!==b)complete();}break;
    case 8:{if(!T.fust&&pz<r.top-1.6){T.fust=true;cops.forEach(c=>{c.active=true;c.st='alert';c.aw=1;c.lostT=0;c.stagger=1.1;G.say(c,'spot');});S.lastKnown.x=P.x;S.lastKnown.z=P.z;S.alarm=40;}
      if(pz<r.bot-0.3)complete();}break;
    case 9:{const c=cops[0];if(c.slept)complete();else if(c.down)fail('dart');}break;
    case 10:{const c=cops[0];if(!T.fust&&pz<r.top-1.6){T.fust=true;c.active=true;c.st='alert';c.aw=1;c.lostT=0;c.stagger=1.1;G.say(c,'spot');S.lastKnown.x=P.x;S.lastKnown.z=P.z;S.alarm=40;}
      if(c.spiked&&!F.GATES.tuske.open){F.GATES.tuske.setOpen(true);speak(okLine());G.showMsg('Belelépett! Nyitva a kapu.');panel();}
      if(c.down&&!c.spiked)fail('spike');
      if(pz<r.bot-0.3)complete();}break;
    case EX:if(dM<2.3)complete();break;
  }
};

/* ---------- nappal: a vizsga másnap délben ---------- */
const NIGHT={};
function setDay(on){if(!NIGHT.saved)Object.assign(NIGHT,{saved:true,li:F.LIGHTS.map(l=>l.intensity),sh:F.shojiM.emissiveIntensity});
  G.setDaylight(on);F.LIGHTS.forEach((l,k)=>l.intensity=on?0:NIGHT.li[k]);F.shojiM.emissiveIntensity=on?0.08:NIGHT.sh;F.lampGlow.forEach(s=>s.material.opacity=on?0.08:0.5);}
G.setDay=setDay;
function dayFade(on){const fd=$('dayFade');fd.style.opacity=1;
  setDay(true);Object.assign(P,{x:0,z:-103.6,yaw:0,pitch:0,crouch:true,run:false,mode:'ground',camY:0.95});G.clearSpikes();G.updateButtons();}
{const fd=document.createElement('div');fd.id='dayFade';fd.innerHTML='<div><small>Másnap délben</small><b>Vizsga</b></div>';document.body.appendChild(fd);}

/* ---------- vége: rang és pecsétek ---------- */
function seals(){const out=[];if(S.alarms-T.examAl===0)out.push('Árnyék');if(T.fails===0)out.push('Türelmes');if(S.time<600)out.push('Gyors');return out;}
function finish(){speak(L.final);S.running=false;const sl=seals();T.sl=sl;G.saveProgress({l2:true,r2:G.hooks.rank()[0],s2:sl});setTimeout(()=>{G.endGame(true,'Átmentél a kiképzésen',
  ST.length+' próba '+G.fmt(S.time)+' alatt. '+(T.fails?'Újrakezdések: '+T.fails+'.':'Egyszer sem kellett újrakezdened.'));$('endEyebrow').textContent='Kiképzés vége';},2600);}
G.hooks.rank=()=>{const sl=T.sl||seals(),n=sl.length,names=['Tanítvány','Nindzsa','Mester','Árnyékmester'];
  const miss=['Árnyék (vizsga riasztás nélkül)','Türelmes (egy újrakezdés sem)','Gyors (10 perc alatt)'].filter((s,k)=>!sl.includes(['Árnyék','Türelmes','Gyors'][k]));
  return[names[n],'',(n?'Pecsétek: '+sl.join(' · ')+'.':'Nincs pecsét.')+(miss.length?' Még megszerezhető: '+miss.join(', ')+'.':' Minden pecsét a tiéd.')];};

/* ---------- kezdőképernyő ---------- */
$('startEyebrow')&&($('startEyebrow').textContent='2. fejezet · Kiképzés');
const lead=$('lead');if(lead)lead.textContent='Miután kijutottál a völgyből, egy idős mester elvezetett rejtett hegyi falujába. Tizenkét udvar, tizenkét próba: csend, bokor, penge, kampó, karmok, kavics, test, füst, köpőcső és tüskék. A vizsga másnap délben vár, a dódzsó előtt. Ha elrontasz egy próbát, az udvar elejéről kezded.';
$('go').querySelector('span').textContent='Cél: a dódzsó. A mester minden próbánál elmondja, mit kell tenni.';
if(/[?&]aetest/.test(location.search))window.AE_FALU={setDay,EX,T,ST,F,startStation,complete,fail,MS,masterTo,doReset};
})();
