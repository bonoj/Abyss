// A commanded contact actuator, not a motion authority. Uses the existing
// supported contact and terrain-owned friction to bound horizontal force.
export function createContactDrive({mass=1,force=4,accelerateUntil=2.5,coastUntil=2.75}={}){
 if(!(mass>0&&force>0))throw Error('positive actuator mass and force required');
 const state={phase:'waiting',appliedSteps:0,peakSpeed:0,forceX:0};
 function sample(body,{dt,acceleration,contact}){
  const t=body.time;
  const phase=t<accelerateUntil?'accelerate':t<coastUntil?'coast':'brake';
  state.phase=contact?.supported?phase:'unsupported';
  state.forceX=0;
  if(!contact?.supported)return {x:0,y:0,z:0};
  const normal=contact.normal;
  const load=Math.max(0,-(acceleration.x*normal.x+acceleration.y*normal.y+acceleration.z*normal.z));
  const limit=contact.friction*mass*load;
  const desired=phase==='accelerate'?-force:phase==='brake'?Math.min(force,Math.abs(body.vx)*mass/dt)*(-Math.sign(body.vx)):0;
  state.forceX=Math.max(-limit,Math.min(limit,desired));
  if(state.forceX)state.appliedSteps++;
  state.peakSpeed=Math.max(state.peakSpeed,Math.abs(body.vx));
  return {x:state.forceX/mass,y:0,z:0};
 }
 function inspect(){return {name:'contact drive',mode:'bounded contact force',mass,commandForce:force,accelerateUntil,coastUntil,phase:state.phase,forceX:state.forceX,appliedSteps:state.appliedSteps,peakSpeed:state.peakSpeed}}
 return {sample,inspect};
}
