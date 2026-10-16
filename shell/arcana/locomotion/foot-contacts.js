// Terrain-coordinate contacts and velocity-aware predictive steps.
// Contact targets remain fixed in stance. No actor, IK or rendering ownership.
export function createFootContacts({surface,reach=.34,stepLength=.42,stepDuration=.27,lift=.14}={}){
 if(typeof surface!=='function')throw Error('Foot contacts require a terrain surface');
 const feet=[-1,1].map(side=>({side,phase:'stance',contact:null,start:null,landing:null,progress:0,steps:0,drift:0}));
 const sample=(x,z,fallback)=>{const h=surface(x,z);return h==null?fallback:h+.04};
 const targetFor=(p,side,forward,lateral,advance=0)=>({x:p.x+lateral.x*side*.25+forward.x*advance,z:p.z+lateral.z*side*.25+forward.z*advance});
 let previous=null,velocity={x:0,z:0};
 function update(dt,p,heading){
  const delta=Math.max(0,Math.min(.05,dt));
  if(previous&&delta>.0001){
   const vx=(p.x-previous.x)/delta,vz=(p.z-previous.z)/delta;
   velocity={x:velocity.x*.65+vx*.35,z:velocity.z*.65+vz*.35};
  }
  previous={x:p.x,z:p.z};
  const speed=Math.hypot(velocity.x,velocity.z);
  const forward=speed>.06?{x:velocity.x/speed,z:velocity.z/speed}:{x:Math.cos(heading),z:Math.sin(heading)};
  const lateral={x:-forward.z,z:forward.x};
  const moving=speed>.045;
  const swingTime=Math.max(.15,Math.min(stepDuration,.12+.12/Math.max(.35,speed)));
  for(const f of feet){
   const neutral=targetFor(p,f.side,forward,lateral);
   if(!f.contact)f.contact={...neutral,y:sample(neutral.x,neutral.z,p.y+.04)};
   if(f.phase==='swing'){
    f.progress=Math.min(1,f.progress+delta/swingTime);
    const t=f.progress,blend=t*t*(3-2*t);
    f.contact={x:f.start.x+(f.landing.x-f.start.x)*blend,y:f.start.y+(f.landing.y-f.start.y)*blend+Math.sin(Math.PI*t)*lift,z:f.start.z+(f.landing.z-f.start.z)*blend};
    if(t>=1){f.contact={...f.landing};f.phase='stance';f.steps++}
    continue;
   }
   const dx=neutral.x-f.contact.x,dz=neutral.z-f.contact.z;
   const forwardLag=dx*forward.x+dz*forward.z;
   const separation=Math.hypot(dx,dz);
   const anticipation=Math.min(.18,speed*swingTime*.65);
   const trigger=Math.max(.10,reach-anticipation);
   // Prioritize the trailing foot and prevent a second simultaneous swing.
   const other=feet.find(x=>x!==f);
   const emergency=separation>reach*.95;
   if((moving||emergency)&&other.phase==='stance'&&(forwardLag>trigger||separation>reach*.78)){
    const lookAhead=Math.min(.32,speed*swingTime*.65);
    const advance=Math.min(stepLength,.18+lookAhead);
    const next=targetFor(p,f.side,forward,lateral,advance);
    const height=surface(next.x,next.z);
    if(height!=null){
     f.phase='swing';f.progress=0;f.start={...f.contact};f.landing={...next,y:height+.04};
    }
   }
  }
  return feet.map(f=>({side:f.side,phase:f.phase,target:{...f.contact},steps:f.steps,drift:f.drift}));
 }
 return {update,inspect:()=>feet.map(f=>({side:f.side,phase:f.phase,steps:f.steps,contact:f.contact&&{...f.contact},drift:f.drift}))};
}
