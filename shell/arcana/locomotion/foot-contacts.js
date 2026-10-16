// Terrain-coordinate stance/swing targets. No IK, rendering, or actor authority.
// Each foot keeps its own world-space contact until a deliberate release.
export function createFootContacts({surface,reach=.34,stepLength=.42,stepDuration=.27,lift=.14}={}){
 if(typeof surface!=='function')throw Error('Foot contacts require a terrain surface');
 const feet=[-1,1].map(side=>({side,phase:'stance',contact:null,start:null,landing:null,progress:0,steps:0,drift:0}));
 const sample=(x,z,fallback)=>{const h=surface(x,z);return h==null?fallback:h+.04};
 const targetFor=(p,side,forward,lateral,advance=0)=>({x:p.x+lateral.x*side*.25+forward.x*advance,z:p.z+lateral.z*side*.25+forward.z*advance});
 function update(dt,p,heading){
  const forward={x:Math.cos(heading),z:Math.sin(heading)},lateral={x:-forward.z,z:forward.x};
  const moving=!!p.target||p.travelSpeed>.05;
  for(const f of feet){
   const neutral=targetFor(p,f.side,forward,lateral);
   if(!f.contact){f.contact={...neutral,y:sample(neutral.x,neutral.z,p.y+.04)}}
   if(f.phase==='stance'){
    const separation=Math.hypot(f.contact.x-neutral.x,f.contact.z-neutral.z);
    // At most one foot in swing; a planted foot never follows the body.
    if(moving&&separation>reach&&feet.every(other=>other===f||other.phase==='stance')){
     const next=targetFor(p,f.side,forward,lateral,stepLength);
     const height=surface(next.x,next.z);
     if(height!=null){
      f.phase='swing';f.progress=0;f.start={...f.contact};f.landing={...next,y:height+.04};
     }
    }
   }else{
    f.progress=Math.min(1,f.progress+Math.max(0,dt)/stepDuration);
    const t=f.progress,blend=t*t*(3-2*t);
    f.contact={x:f.start.x+(f.landing.x-f.start.x)*blend,y:f.start.y+(f.landing.y-f.start.y)*blend+Math.sin(Math.PI*t)*lift,z:f.start.z+(f.landing.z-f.start.z)*blend};
    if(t>=1){f.contact={...f.landing};f.phase='stance';f.steps++}
   }
  }
  return feet.map(f=>({side:f.side,phase:f.phase,target:{...f.contact},steps:f.steps,drift:f.drift}));
 }
 return {update,inspect:()=>feet.map(f=>({side:f.side,phase:f.phase,steps:f.steps,contact:f.contact&&{...f.contact},drift:f.drift}))};
}
