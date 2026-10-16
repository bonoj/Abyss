// One planted foot: a fixed world-space anchor and a finite stance stroke.
// It requests bounded acceleration; the kinetic body remains authoritative.
export function createPlantedFoot({mass=1,force=4,reach=.9,brakeAt=2.75}={}){
 if(!(mass>0&&force>0&&reach>0))throw Error('positive mass, force and reach required');
 let anchor=null,phase='awaiting support',forceX=0,peakExtension=0,slip=0,plantCount=0,poweredSteps=0;
 function sample(body,{dt,acceleration,contact}){
  forceX=0;
  if(!contact?.supported){phase='airborne';anchor=null;return {x:0,y:0,z:0}}
  if(!anchor){anchor={x:body.x,y:body.y-.18,z:body.z};plantCount++;phase='stance'}
  const extension=anchor.x-body.x;
  peakExtension=Math.max(peakExtension,extension);
  if(body.time>=brakeAt){phase='release';return {x:0,y:0,z:0}}
  if(extension>=reach){phase='stroke limit';return {x:0,y:0,z:0}}
  const n=contact.normal;
  const load=Math.max(0,-(acceleration.x*n.x+acceleration.y*n.y+acceleration.z*n.z));
  forceX=-Math.min(force,contact.friction*mass*load);
  if(forceX)poweredSteps++;
  phase='powered stance';
  return {x:forceX/mass,y:0,z:0};
 }
 function inspect(){return {name:'planted foot',mode:'fixed world anchor; bounded stance force',phase,anchor,reach,extension:anchor?peakExtension:null,slip,plantCount,poweredSteps,forceX}}
 return {sample,inspect,getAnchor:()=>anchor};
}
