// One authoritative state. Rendering and instrumentation only observe it.
export function createKineticBody({surface,x=1.3,z=0,radius=.18,gravity,contact,actuator=null,step=1/120,height=1.4}={}){
 if(typeof surface!=='function')throw Error('surface required');
 if(!gravity||typeof gravity.sample!=='function')throw Error('gravity system required');
 if(!contact||typeof contact.resolve!=='function')throw Error('contact system required');
 const ground=surface(x,z);
 if(!Number.isFinite(ground))throw Error('initial surface required');
 const state={x,y:ground+radius+height,z,vx:0,vy:0,vz:0,contact:false,time:0,steps:0,impacts:0,maxCorrection:0};
 let lastContact=null,wallContacts=0,activeContact=null;
 let accumulator=0;
 const events=[];
 function impulse(vx=0,vy=0,vz=0){state.vx+=vx;state.vy+=vy;state.vz+=vz;events.push({t:+state.time.toFixed(4),type:'impulse',velocity:[vx,vy,vz]})}
 function tick(){
  const s=state;
  const acceleration=gravity.sample(s,s.time);
  if(actuator){const drive=actuator.sample(s,{dt:step,acceleration,contact:activeContact});acceleration.x+=drive.x;acceleration.y+=drive.y;acceleration.z+=drive.z;}
  s.vx+=acceleration.x*step;s.vy+=acceleration.y*step;s.vz+=acceleration.z*step;
  s.x+=s.vx*step;s.y+=s.vy*step;s.z+=s.vz*step;
  const wasSupported=s.contact;
  const result=contact.resolve(s,{radius,dt:step,acceleration});
  if(result.penetration)s.maxCorrection=Math.max(s.maxCorrection,result.penetration);
  s.contact=result.supported;
  activeContact=result.supported?{supported:true,normal:result.contactObservation.normal,friction:result.hit.friction}:null;
  if(result.contactObservation){lastContact=result.contactObservation;if(Math.abs(lastContact.normal.y)<0.5)wallContacts++;}
  if(result.hit&&result.penetration!==undefined&&!wasSupported){
   s.impacts++;events.push({t:+((s.steps+1)*step).toFixed(4),type:'contact',x:+s.x.toFixed(4),restitution:result.hit.restitution,observation:result.contactObservation});
  }
  if(result.bounced)events.push({t:+((s.steps+1)*step).toFixed(4),type:'bounce',vy:+s.vy.toFixed(5),normal:result.contactObservation?.normal,incomingNormalSpeed:result.contactObservation?.incomingNormalSpeed,reboundNormalSpeed:result.contactObservation?.reboundNormalSpeed});
  if(wasSupported&&!s.contact)events.push({t:+((s.steps+1)*step).toFixed(4),type:'support-lost',x:+s.x.toFixed(4)});
  s.steps++;s.time=s.steps*step;
 }
 function update(dt){accumulator+=Math.min(Math.max(0,dt),.1);let count=0;while(accumulator>=step&&count<12){tick();accumulator-=step;count++}}
 function inspect(){return {name:'kinetic body',mode:'live fixed-step',step,time:+state.time.toFixed(4),steps:state.steps,position:[state.x,state.y,state.z].map(v=>+v.toFixed(5)),velocity:[state.vx,state.vy,state.vz].map(v=>+v.toFixed(5)),contact:state.contact,impacts:state.impacts,wallContacts,lastContact,maxPreCorrectionPenetration:+state.maxCorrection.toFixed(6),events:events.slice(-12)}}
 return {state,update,impulse,inspect};
}
