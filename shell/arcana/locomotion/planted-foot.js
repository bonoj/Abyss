// A single anchored stance with a unilateral, inextensible tether.
// Kinetic body invokes this constraint inside its sole fixed-step solver.
export function createPlantedFoot({mass=1,force=4,reach=.9,surface}={}){
 if(!(mass>0&&force>0&&reach>0))throw Error('positive mass, force and reach required');
 let anchor=null,phase='awaiting support',forceX=0,plantCount=0,poweredSteps=0;
 let extension=0,maxViolation=0,correctionTotal=0,radialImpulseTotal=0,unsupportedSteps=0;
 let swingTarget=null,swingFrom=null,swingProgress=0,swingCount=0,releaseCount=0,failedPlants=0;
 const strokeEnd=reach*.72,lead=reach*.55,swingRate=2.2;
 function sample(body,{dt,acceleration,contact,holdStance=false}){
  forceX=0;
  if(!contact?.supported){unsupportedSteps++;if(phase!=='swing')phase=anchor?'suspended':'airborne';return {x:0,y:0,z:0}}
  if(phase==='swing')return {x:0,y:0,z:0};
  if(!anchor){anchor={x:body.x,y:body.y-.18,z:body.z};plantCount++}
  extension=Math.hypot(body.x-anchor.x,body.z-anchor.z);
  if(extension>=strokeEnd&&!holdStance){
   swingFrom=anchor;swingTarget={x:body.x-lead,z:body.z};swingProgress=0;
   anchor=null;phase='swing';releaseCount++;
   return {x:0,y:0,z:0};
  }
  const n=contact.normal;
  const load=Math.max(0,-(acceleration.x*n.x+acceleration.y*n.y+acceleration.z*n.z));
  forceX=-Math.min(force,contact.friction*mass*load);
  if(forceX)poweredSteps++;
  phase='powered stance';
  return {x:forceX/mass,y:0,z:0};
 }
 function constrain(body,{dt,supported}){
  if(phase==='swing'){
   swingProgress=Math.min(1,swingProgress+swingRate*dt);
   if(swingProgress>=1&&swingTarget&&supported){
    const y=surface?.(swingTarget.x,swingTarget.z);
    if(Number.isFinite(y)){
     anchor={x:swingTarget.x,y,z:swingTarget.z};
     phase='stance';plantCount++;swingCount++;swingTarget=null;swingFrom=null;
    }else{failedPlants++;swingProgress=0;}
   }
   return;
  }
  if(!anchor)return;
  // Horizontal tether: vertical support is exclusively terrain's responsibility.
  const dx=body.x-anchor.x,dz=body.z-anchor.z,d=Math.hypot(dx,dz);
  extension=d;
  if(d<=reach)return;
  const nx=dx/d,nz=dz/d,excess=d-reach;
  maxViolation=Math.max(maxViolation,excess);
  // Constraint projection plus the matching velocity correction, in the
  // existing body solver. Neither the foot nor rendering integrates motion.
  body.x-=nx*excess;body.z-=nz*excess;correctionTotal+=excess;
  const outward=body.vx*nx+body.vz*nz;
  if(outward>0){body.vx-=nx*outward;body.vz-=nz*outward;radialImpulseTotal+=mass*outward;}
  extension=reach;phase='taut';
 }
 function release(body){
  if(!anchor)return false;
  swingFrom=anchor;swingTarget={x:body.x-lead,z:body.z};swingProgress=0;
  anchor=null;phase='swing';releaseCount++;return true;
 }
 function retire(){anchor=null;swingTarget=null;swingFrom=null;phase='retired';forceX=0;}
 function inspect(){return {name:'planted foot',mode:'stance / unloaded swing / terrain replant',phase,anchor,swingTarget,swingProgress,strokeEnd,reach,extension,maxPreCorrectionViolation:maxViolation,correctionTotal,radialImpulseTotal,plantCount,swingCount,releaseCount,failedPlants,poweredSteps,unsupportedSteps,forceX}}
 return {sample,constrain,release,retire,inspect,getAnchor:()=>anchor,getFoot:()=>anchor||(swingFrom&&swingTarget?{x:swingFrom.x+(swingTarget.x-swingFrom.x)*swingProgress,y:swingFrom.y+Math.sin(Math.PI*swingProgress)*.25,z:swingFrom.z+(swingTarget.z-swingFrom.z)*swingProgress}:null)};
}
