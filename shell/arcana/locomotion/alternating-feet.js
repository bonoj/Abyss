import {createPlantedFoot} from './planted-foot.js';
// Two independent planted anchors and two load-bearing struts.
// A handoff happens on release, not on an elapsed gait clock.
export function createAlternatingFeet({surface}={}){
 const feet=[createPlantedFoot({surface,offsetX:-.18}),createPlantedFoot({surface,offsetX:.18})];
 const hips=[-.12,.12]; // body-local x offsets; shared body-local y=-.24
 const groundContact={supported:true,normal:{x:0,y:1,z:0},friction:.86,source:'planted-foot'};
 let active=0,handoffs=0,unsupportedHandoffs=0,dualSwingSteps=0,dualSwing=false,groundedHandoffs=0,unplantedHandoffs=0,heldSteps=0,loadShares=[0,0],doubleSupportSteps=0,singleSupportSteps=0,noFootSupportSteps=0,loadTransferCount=0,lastLoaded=-1,verticalImpulseTotal=0,verticalSupportSteps=0,verticalSupportLostSteps=0,verticalCorrectionTotal=0,lastVerticalImpulse=0;
 let connectedSteps=0,disconnectedSteps=0,tensileSteps=0,peakTension=0;
 let strutForceTotal=0,strutPeakForce=0,strutLoadedSteps=0,lastStrut=null,lastLegs=[],lastWrench=null,connectedSupportSteps=0,noConnectedSupportSteps=0;
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
  // Each planted leg contributes its own force and moment at its own rotated hip.
  // Existing motor belongs to the active leg only; it is not duplicated.
  const motor={x:force.x,y:force.y,z:force.z};
  const total={x:0,y:0,z:0,torque:0};
  lastLegs=[];
  const pitch=body.pitch||0,omega=body.omega||0,cs=Math.cos(pitch),sn=Math.sin(pitch);
  for(let i=0;i<2;i++){
   const anchor=feet[i].getAnchor(),hx=hips[i],hy=-.24;
   const rx=hx*cs-hy*sn,ry=hx*sn+hy*cs;
   const hip={x:body.x+rx,y:body.y+ry,z:body.z};
   const leg={index:i,anchor:anchor?{...anchor}:null,hip:[hip.x,hip.y,hip.z],connected:false,force:[0,0,0],torque:0};
   if(anchor){
    const dx=hip.x-anchor.x,dy=hip.y-anchor.y,dz=hip.z-anchor.z;
    const length=Math.hypot(dx,dy,dz),restLength=.84,stiffness=180,damping=20,maxForce=80,maxLength=1.04;
    leg.length=length;leg.maxLength=maxLength;
    if(length>1e-8){
     const nx=dx/length,ny=dy/length,nz=dz/length;
     const hipVx=body.vx+omega*ry,hipVy=body.vy-omega*rx;
     const lengthRate=hipVx*nx+hipVy*ny+body.vz*nz;
     const compression=Math.max(0,restLength-length);
     const magnitude=Math.min(maxForce,Math.max(0,stiffness*compression-damping*lengthRate));
     const tension=Math.min(100,Math.max(0,240*Math.max(0,length-maxLength)+(length>restLength?24*Math.max(0,lengthRate):0)));
     const connected=length<=maxLength;
     leg.connected=connected;leg.lengthRate=lengthRate;leg.compression=compression;
     // A detached leg cannot transmit spring, tether or motor force.
     const axial=connected?magnitude-tension:0;
     let fx=axial*nx,fy=axial*ny,fz=axial*nz;
     if(i===active&&connected){fx+=motor.x;fy+=motor.y;fz+=motor.z;}
     leg.force=[fx,fy,fz];leg.torque=ry*fx-rx*fy;
     leg.magnitude=connected?magnitude:0;leg.tension=connected?tension:0;
     leg.direction=[nx,ny,nz];
     total.x+=fx;total.y+=fy;total.z+=fz;total.torque+=leg.torque;
     if(connected){connectedSteps++;if(magnitude>0)strutLoadedSteps++;strutForceTotal+=magnitude;strutPeakForce=Math.max(strutPeakForce,magnitude);}
     else disconnectedSteps++;
     if(connected&&tension>0){tensileSteps++;peakTension=Math.max(peakTension,tension);}
    }
   }
   lastLegs.push(leg);
  }
  const supporting=lastLegs.filter(l=>l.connected).length;
  if(supporting)connectedSupportSteps++;else noConnectedSupportSteps++;
  lastStrut=lastLegs[active]||null;
  lastWrench={force:[total.x,total.y,total.z],torque:total.torque,connectedLegs:supporting};
  return total;
 }
 function hasFootSupport(){return lastLegs.some(l=>l.connected);}
 function constrain(body,context){
  const planted=feet.map(f=>!!f.getAnchor());
  const count=planted.filter(Boolean).length;
  const loads=lastLegs.map(l=>Math.hypot(...l.force));
  const totalLoad=loads.reduce((a,b)=>a+b,0);
  loadShares=loads.map(v=>totalLoad>0?v/totalLoad:0);
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
   foot.constrain(body,{...context,supported:context.supported||feet.some(f=>!!f.getAnchor()),skipTether:true});
  });
 }
 function inspect(){return {name:'alternating feet',mode:'two independent finite-force struts; single stance motor',active,handoffs,unsupportedHandoffs,dualSwingSteps,groundedHandoffs,unplantedHandoffs,heldSteps,loadShares,doubleSupportSteps,singleSupportSteps,noFootSupportSteps,loadTransferCount,connectedSupportSteps,noConnectedSupportSteps,legs:lastLegs,wrench:lastWrench,strut:{restLength:.84,stiffness:180,damping:20,maxForce:80,loadedSteps:strutLoadedSteps,connectedSteps,disconnectedSteps,tensileSteps,peakTension,peakForce:strutPeakForce,forceTotal:strutForceTotal,last:lastStrut},geometry:{steps:geometrySteps,overextendedSteps,maxHorizontal,maxVerticalCorrection,largeCorrectionCount,last:lastGeometry,recentEvents:geometryEvents},verticalImpulseTotal,verticalSupportSteps,verticalSupportLostSteps,verticalCorrectionTotal,lastVerticalImpulse,feet:feet.map(f=>f.inspect())}}
 return {sample,constrain,hasFootSupport,inspect,getFeet:()=>feet.map(f=>f.getFoot())};
}
