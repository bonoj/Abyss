import {createPlantedFoot} from './planted-foot.js';
// Two independent anchors; one loaded stance at a time.
// A handoff happens on release, not on an elapsed gait clock.
export function createAlternatingFeet({surface}={}){
 const feet=[createPlantedFoot({surface}),createPlantedFoot({surface})];
 let active=0,handoffs=0,unsupportedHandoffs=0;
 function sample(body,context){
  const current=feet[active];
  const force=current.sample(body,context);
  if(current.inspect().phase==='swing'){
   const next=1-active;
   if(feet[next].inspect().phase==='swing'){
    unsupportedHandoffs++;
   }else{
    // The previous stance becomes unloaded; only one tether constrains body.
    active=next;handoffs++;
   }
  }
  return force;
 }
 function constrain(body,context){
  feet.forEach((foot,i)=>{
   // Swing proceeds independently; only the loaded stance may constrain body.
   if(i===active||foot.inspect().phase==='swing')foot.constrain(body,context);
  });
 }
 function inspect(){return {name:'alternating feet',mode:'one loaded stance; two independent swing states',active,handoffs,unsupportedHandoffs,feet:feet.map(f=>f.inspect())}}
 return {sample,constrain,inspect,getFeet:()=>feet.map(f=>f.getFoot())};
}
