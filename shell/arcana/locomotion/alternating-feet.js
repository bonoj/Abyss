import {createPlantedFoot} from './planted-foot.js';
// Two independent anchors; one loaded stance at a time.
// A handoff happens on release, not on an elapsed gait clock.
export function createAlternatingFeet({surface}={}){
 const feet=[createPlantedFoot({surface}),createPlantedFoot({surface})];
 let active=0,handoffs=0,unsupportedHandoffs=0,dualSwingSteps=0,dualSwing=false,groundedHandoffs=0,unplantedHandoffs=0,heldSteps=0,loadShares=[0,0],doubleSupportSteps=0,singleSupportSteps=0,noFootSupportSteps=0,loadTransferCount=0,lastLoaded=-1,verticalImpulseTotal=0,verticalSupportSteps=0,verticalSupportLostSteps=0,verticalCorrectionTotal=0,lastVerticalImpulse=0;
 function sample(body,context){
  const current=feet[active];
  const receiver=feet[1-active];
  if(!receiver.getAnchor()&&receiver.inspect().plantCount===0&&context.contact?.supported)receiver.sample(body,{...context,holdStance:true});
  const receiverReady=!!receiver.getAnchor();
  const force=current.sample(body,{...context,holdStance:!receiverReady});
  if(!receiverReady&&current.getAnchor())heldSteps++;
  if(receiverReady&&current.getAnchor()&&current.inspect().extension>=current.inspect().strokeEnd)current.release(body);
  if(current.inspect().phase==='swing'){
   const next=1-active;
   if(feet[next].inspect().phase==='swing'){
    dualSwingSteps++;
    if(!dualSwing){unsupportedHandoffs++;dualSwing=true;}
   }else{
    // The previous stance becomes unloaded; only one tether constrains body.
    if(feet[next].inspect().anchor)groundedHandoffs++;
    else unplantedHandoffs++;
    active=next;handoffs++;dualSwing=false;
   }
  }
  if(feet[active].inspect().phase!=='swing')dualSwing=false;
  return force;
 }
 function hasFootSupport(){return feet.some(f=>!!f.getAnchor());}
 function constrain(body,context){
  const planted=feet.map(f=>!!f.getAnchor());
  const count=planted.filter(Boolean).length;
  loadShares=planted.map(v=>v?1/count:0);
  if(count===2)doubleSupportSteps++;
  else if(count===1)singleSupportSteps++;
  else noFootSupportSteps++;
  const loaded=count===1?planted.indexOf(true):-1;
  if(loaded>=0&&lastLoaded>=0&&loaded!==lastLoaded)loadTransferCount++;
  if(loaded>=0)lastLoaded=loaded;
  // Unilateral vertical foot-ground reaction. No extra acceleration or second integrator.
  // A planted foot can push up but never pull down. Terrain body response is bypassed
  // on these steps by kinetic-body; contact sampling remains available.
  lastVerticalImpulse=0;
  if(count){
   const floor=Math.max(...feet.map(f=>f.getAnchor()?.y??-Infinity));
   const centerFloor=floor+0.18;
   if(body.y<centerFloor){verticalCorrectionTotal+=centerFloor-body.y;body.y=centerFloor;}
   if(body.y<=centerFloor+1e-7&&body.vy<0){lastVerticalImpulse=-body.vy;body.vy=0;verticalImpulseTotal+=lastVerticalImpulse;}
   verticalSupportSteps++;
  }else verticalSupportLostSteps++;
  feet.forEach((foot,i)=>{
   // Swing proceeds independently; only the loaded stance may constrain body.
   if(i===active||foot.inspect().phase==='swing')foot.constrain(body,context);
  });
 }
 function inspect(){return {name:'alternating feet',mode:'contact-derived load share witness; horizontal drive remains single stance',active,handoffs,unsupportedHandoffs,dualSwingSteps,groundedHandoffs,unplantedHandoffs,heldSteps,loadShares,doubleSupportSteps,singleSupportSteps,noFootSupportSteps,loadTransferCount,verticalImpulseTotal,verticalSupportSteps,verticalSupportLostSteps,verticalCorrectionTotal,lastVerticalImpulse,feet:feet.map(f=>f.inspect())}}
 return {sample,constrain,hasFootSupport,inspect,getFeet:()=>feet.map(f=>f.getFoot())};
}
