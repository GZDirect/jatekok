/* ================= PARKOLT: a régi ellenfelek (szörny, nindzsa, szellem) =================
   Árnyékerdő. © 2026 Fejes Géza. Minden jog fenntartva.
   A rendőrös küldetés miatt most nincsenek a játékban, de később visszajönnek.
   A modellek az actors.js-ben vannak (buildEnemy), itt a beállításaik és a viselkedésük áll,
   pontosan úgy, ahogy a 2026. október 25-i változatban működtek. A game.js most nem hívja ezeket.
   Visszakapcsoláshoz: E.mesh=AE.buildEnemy(típus), majd minden képben AE.parked.stepOldEnemy(...). */
(function(){
const A=window.AE,{clamp}=A;
const TYPES={
  monster:{name:'Szörny',patrol:2.2,chase:5.3,range:14,fov:1.1,hear:1.8,motion:false,prints:'claw',
    clues:['Mély morgás valahol a fák között.','Friss, karmos nyomok a sárban. Valami nehéz járt erre.','Recsegnek az ágak. Valami nagy közeledik.'],
    reveal:'Szörny. Rosszul lát, de mindent hall. Maradj csendben.',tip:'A szörny hallásra vadászik. Guggolva, lassan szinte észrevétlen vagy.'},
  ninja:{name:'Nindzsa',patrol:3.0,chase:6.0,range:30,fov:0.75,hear:1.0,motion:false,prints:null,
    clues:['Túl nagy a csend. Még a madarak is elhallgattak.','Egy levágott ág, tiszta vágással.','Mintha egy árnyék mozdult volna a fák között.'],
    reveal:'Egy másik nindzsa. Messzire lát. Bújj el a bokrokban.',tip:'A nindzsa szeme a veszélyes. Bokorban guggolva nem lát meg, és futva le tudod hagyni.'},
  ghost:{name:'Szellem',patrol:2.6,chase:6.9,range:26,fov:Math.PI,hear:0,motion:true,prints:'frost',
    clues:['Hirtelen lehűl a levegő.','Sűrűsödik a köd, pedig nincs szél. Dér csillog a fűben.','Halk, éneklő hang, mintha a fákból jönne.'],
    reveal:'Szellem. Csak a mozgást látja. Ha jön, dermedj meg.',tip:'A szellem gyorsabb nálad, de ha mozdulatlan maradsz, elveszít.'}
};
/* E: ellenfél állapota {cfg,x,z,ry,state,tx,tz,ttimer,lost,look,blind,known,seenCount,spd,printD,side}
   P: játékos {x,z,crouch,hidden,moving,noise}; h: {blocked,pushOut,pickPatrol,showMsg,onCaught,setFoe}
   Visszaadja a játékos távolságát. */
function stepOldEnemy(E,P,dt,h){
  const c=E.cfg,dx=P.x-E.x,dz=P.z-E.z,dist=Math.hypot(dx,dz);
  E.blind=Math.max(0,E.blind-dt);
  let sees=false;
  if(E.blind<=0&&dist<c.range*(P.crouch?0.65:1)){
    const fx=-Math.sin(E.ry),fz=-Math.cos(E.ry),ang=Math.acos(clamp((fx*dx+fz*dz)/(dist||1),-1,1));
    if(ang<c.fov&&!(P.hidden&&dist>2.5)&&!(c.motion&&!P.moving)&&!h.blocked(E.x,E.z,P.x,P.z))sees=true;
  }
  if(sees){if(E.state!=='chase'){E.seenCount++;}E.state='chase';E.lost=0;E.tx=P.x;E.tz=P.z;}
  else if(E.state!=='chase'&&c.hear>0&&E.blind<=0&&P.noise>0&&dist<P.noise*c.hear){E.state='investigate';E.tx=P.x+(Math.random()*2-1)*3;E.tz=P.z+(Math.random()*2-1)*3;E.look=0;}
  if(!E.known&&(sees||dist<9)){E.known=true;h.setFoe(c.name);h.showMsg(c.reveal);}
  let sp=c.patrol;
  if(E.state==='chase'){sp=c.chase;if(!sees){E.lost+=dt;if(E.lost>(c.motion&&!P.moving?0.9:3.2)){E.state='investigate';E.look=0;}}}
  else if(E.state==='investigate'){sp=c.patrol*1.35;}
  else{E.ttimer-=dt;if(E.ttimer<=0||Math.hypot(E.tx-E.x,E.tz-E.z)<2)h.pickPatrol();}
  if(E.blind>0)sp*=0.4;
  const tdx=E.tx-E.x,tdz=E.tz-E.z,td=Math.hypot(tdx,tdz);const ox=E.x,oz=E.z;
  if(E.state==='investigate'&&td<1.6){E.look+=dt;E.ry+=dt*1.6;if(E.look>3.2){E.state='patrol';h.pickPatrol();}}
  else if(td>0.3){E.x+=tdx/td*sp*dt;E.z+=tdz/td*sp*dt;h.pushOut(E,0.5);
    let want=Math.atan2(-tdx,-tdz),diff=want-E.ry;diff=Math.atan2(Math.sin(diff),Math.cos(diff));E.ry+=diff*Math.min(1,dt*6);}
  const moved=Math.hypot(E.x-ox,E.z-oz);E.spd+=(moved/dt-E.spd)*Math.min(1,dt*8);
  if(c.prints){E.printD+=moved;if(E.printD>(c.prints==='frost'?2.6:1.3)){E.printD=0;E.side=-E.side;A.dropPrint(E.x,E.z,E.ry,c.prints,c.prints==='frost'?0:E.side);}}
  const nd=Math.hypot(P.x-E.x,P.z-E.z);if(nd<1.3)h.onCaught();
  return nd;
}
A.parked={TYPES,stepOldEnemy};
})();
