// One authoritative state. Rendering and instrumentation only observe it.
export function createKineticBody({surface,x=1.3,z=0,radius=.18,gravity,friction=.65,step=1/120,height=1.4}={}){
 if(typeof surface!=='function')throw Error('surface required');
 if(!gravity||typeof gravity.sample!=='function')throw Error('gravity system required');
 const ground=surface(x,z);
 if(!Number.isFinite(ground))throw Error('initial surface required');
 const state={x,y:ground+radius+height,z,vx:0,vy:0,vz:0,contact:false,time:0,steps:0,impacts:0,maxCorrection:0};
 let accumulator=0;
 const events=[];
 function impulse(vx=0,vy=0,vz=0){state.vx+=vx;state.vy+=vy;state.vz+=vz;events.push({t:+state.time.toFixed(4),type:'impulse',velocity:[vx,vy,vz]})}
 function tick(){
  const s=state;
  if(s.contact){
   const a=gravity.sample(s,s.time);
   const speed=Math.hypot(s.vx,s.vz),loss=Math.min(speed,friction*Math.max(0,-a.y)*step);
   if(speed>0){s.vx*=1-loss/speed;s.vz*=1-loss/speed}
  }
  const acceleration=gravity.sample(s,s.time);
  s.vx+=acceleration.x*step;s.vy+=acceleration.y*step;s.vz+=acceleration.z*step;
  s.x+=s.vx*step;s.y+=s.vy*step;s.z+=s.vz*step;
  const h=surface(s.x,s.z);
  if(Number.isFinite(h)&&s.y<=h+radius){
   s.maxCorrection=Math.max(s.maxCorrection,h+radius-s.y);
   s.y=h+radius;
   if(!s.contact){s.impacts++;events.push({t:+((s.steps+1)*step).toFixed(4),type:'contact',x:+s.x.toFixed(4)})}
   s.vy=0;s.contact=true;
  }else if(s.contact){s.contact=false;events.push({t:+((s.steps+1)*step).toFixed(4),type:'support-lost',x:+s.x.toFixed(4)})}
  s.steps++;s.time=s.steps*step;
 }
 function update(dt){accumulator+=Math.min(Math.max(0,dt),.1);let count=0;while(accumulator>=step&&count<12){tick();accumulator-=step;count++}}
 function inspect(){return {name:'kinetic body',mode:'live fixed-step',step,time:+state.time.toFixed(4),steps:state.steps,position:[state.x,state.y,state.z].map(v=>+v.toFixed(5)),velocity:[state.vx,state.vy,state.vz].map(v=>+v.toFixed(5)),contact:state.contact,impacts:state.impacts,maxPreCorrectionPenetration:+state.maxCorrection.toFixed(6),events:events.slice(-12)}}
 return {state,update,impulse,inspect};
}
