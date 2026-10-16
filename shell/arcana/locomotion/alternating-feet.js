import {createPlantedFoot} from './planted-foot.js';
// Two independent anchors; one loaded stance at a time.
// A handoff happens on release, not on an elapsed gait clock.
export function createAlternatingFeet({surface}={}){
 const feet=[createPlantedFoot({surface}),createPlantedFoot({surface})];
 const groundContact={supported:true,normal:{x:0,y:1,z:0},friction:.86,source:'planted-foot'};
 let active=0,handoffs=0,unsupportedHandoffs=0,dualSwingSteps=0,dualSwing=false,groundedHandoffs=0,unplantedHandoffs=0,heldSteps=0,loadShares=[0,0],doubleSupportSteps=0,singleSupportSteps=0,noFootSupportSteps=0,loadTransferCount=0,lastLoaded=-1,verticalImpulseTotal=0,verticalSupportSteps=0,verticalSupportLostSteps=0,verticalCorrectionTotal=0,lastVerticalImpulse=0;
 let connectedSteps=0,disconnectedSteps=0,tensileSteps=0,peakTension=0;
 let strutForceTotal=0,strutPeakForce=0,strutLoadedSteps=0,lastStrut=null;
 let geometrySteps=0,overextendedSteps=0,maxHorizontal=0,maxVerticalCorrection=0,largeCorrectionCount=0,lastGeometry=null;
 const geometryEvents=[];
 function sample(body,context){
  // Initial stance comes from the terrain beneath the feet, not a torso collision.
  if(!feet.some(f=>f.getAnchor())&&feet.every(f=>f.inspect().plantCount===0)){
   const y=surface?.(body.x,body.z);
   if(Number.isFinite(y))feet.forEach(f=>f.sample(body,{...context,contact:groundContact,holdStance:true}));
  }
  const stanceContact=feet.some(f=>!!f.getAnchor())?groundContact:null;
  const current=feet[active];
  const receiver=feet[1-active];
  if(!receiver.getAnchor()&&receiver.inspect().plantCount===0&&stanceContact?.supported)receiver.sample(body,{...context,contact:stanceContact,holdStance:true});
  const receiverReady=!!receiver.getAnchor();
  const force=current.sample(body,{...context,contact:stanceContact,holdStance:!receiverReady});
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
  const stance=feet[active].getAnchor()||feet.find(f=>f.getAnchor())?.getAnchor();
  lastStrut=null;
  if(stance){
   const hipX=body.x-.24*Math.sin(body.pitch||0),hipY=body.y-.24*Math.cos(body.pitch||0);
   const dx=hipX-stance.x,dy=hipY-stance.y,dz=body.z-stance.z;
   const length=Math.hypot(dx,dy,dz),restLength=.84,stiffness=180,damping=20,maxForce=80;
   if(length>1e-8){
    const nx=dx/length,ny=dy/length,nz=dz/length;
    const hipVx=body.vx-.24*Math.cos(body.pitch||0)*(body.omega||0),hipVy=body.vy+.24*Math.sin(body.pitch||0)*(body.omega||0);
    const lengthRate=hipVx*nx+hipVy*ny+body.vz*nz;
    const compression=Math.max(0,restLength-length);
    const magnitude=Math.min(maxForce,Math.max(0,stiffness*compression-damping*lengthRate));
    // Finite tensile linkage prevents an anchored foot from becoming an infinite reach motor.
    const maxLength=1.04,tensionStiffness=240,tensionDamping=24,maxTension=100;
    const tension=Math.min(maxTension,Math.max(0,tensionStiffness*Math.max(0,length-maxLength)+ (length>restLength?tensionDamping*Math.max(0,lengthRate):0)));
    const connected=length<=maxLength;
    if(connected)connectedSteps++;else disconnectedSteps++;
    if(tension>0){tensileSteps++;peakTension=Math.max(peakTension,tension);}
    // Stance drive is transmitted only through a connected leg, not by anchor ownership.
    if(!connected){force.x=0;force.y=0;force.z=0;}
    force.x+=(magnitude-tension)*nx;force.y+=(magnitude-tension)*ny;force.z+=(magnitude-tension)*nz;
    strutForceTotal+=magnitude;strutPeakForce=Math.max(strutPeakForce,magnitude);
    if(magnitude>0)strutLoadedSteps++;
    lastStrut={time:body.time,hip:[hipX,hipY,body.z],active,length,restLength,compression,lengthRate,magnitude,tension,connected,maxLength,direction:[nx,ny,nz]};
   }
  }
  // Leg actuator loads the body at a hip below its center of mass.
  // Planar torque follows the same force; no authored fall trigger.
  const hipOffset=.24,hipX=-hipOffset*Math.sin(body.pitch||0),hipY=-hipOffset*Math.cos(body.pitch||0);
  force.torque=hipY*force.x-hipX*force.y;
  return force;
 }
 function hasFootSupport(){return feet.some(f=>!!f.getAnchor())&&!!lastStrut?.connected;}
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
  // Strut force was applied through the body's sole velocity integrator in sample().
  // Observe geometry here; never project position or zero downward velocity.
  lastVerticalImpulse=0;
  if(count){
   const stance=feet[active].getAnchor()||feet.find(f=>f.getAnchor())?.getAnchor();
   const dx=stance?body.x-stance.x:0,dz=stance?body.z-stance.z:0;
   const horizontal=Math.hypot(dx,dz),legLength=.84;
   geometrySteps++;maxHorizontal=Math.max(maxHorizontal,horizontal);
   if(horizontal>legLength)overextendedSteps++;
   const centerFloor=(stance?.y??0)+Math.sqrt(Math.max(0,legLength*legLength-horizontal*horizontal));
   lastGeometry={time:body.time,active,anchor:stance?{...stance}:null,horizontal,legLength,overextended:horizontal>legLength,centerFloor,bodyY:body.y,vy:body.vy,correction:0};
   if(horizontal>legLength){geometryEvents.push({...lastGeometry});if(geometryEvents.length>16)geometryEvents.shift();}
   verticalSupportSteps++;
  }else verticalSupportLostSteps++;
  feet.forEach((foot,i)=>{
   // Swing proceeds independently; only the loaded stance may constrain body.
   if(i===active||foot.inspect().phase==='swing')foot.constrain(body,{...context,supported:context.supported||feet.some(f=>!!f.getAnchor()),skipTether:true});
  });
 }
 function inspect(){return {name:'alternating feet',mode:'finite-force unilateral compliant strut; single stance drive',active,handoffs,unsupportedHandoffs,dualSwingSteps,groundedHandoffs,unplantedHandoffs,heldSteps,loadShares,doubleSupportSteps,singleSupportSteps,noFootSupportSteps,loadTransferCount,strut:{restLength:.84,stiffness:180,damping:20,maxForce:80,loadedSteps:strutLoadedSteps,connectedSteps,disconnectedSteps,tensileSteps,peakTension,peakForce:strutPeakForce,forceTotal:strutForceTotal,last:lastStrut},geometry:{steps:geometrySteps,overextendedSteps,maxHorizontal,maxVerticalCorrection,largeCorrectionCount,last:lastGeometry,recentEvents:geometryEvents},verticalImpulseTotal,verticalSupportSteps,verticalSupportLostSteps,verticalCorrectionTotal,lastVerticalImpulse,feet:feet.map(f=>f.inspect())}}
 return {sample,constrain,hasFootSupport,inspect,getFeet:()=>feet.map(f=>f.getFoot())};
}
