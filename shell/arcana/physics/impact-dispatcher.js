// World-agnostic radial impact dispatch. Receiver ordering and diagnostics are intentional.
export function createImpactDispatcher({debris,creatures,plants,terrain,surface,radiusPerMagnitude=3.2,impulsePerMagnitude=18,craterLift=.12}){
 let lastImpact=null;
 const dispatch=({point,magnitude})=>{
  const t0=performance.now();
  const force={radius:radiusPerMagnitude*magnitude,impulse:impulsePerMagnitude*magnitude};
  const loose=debris.receiveImpulse(point,force);
  const t1=performance.now();
  const creatureCount=creatures.reduce((n,s)=>n+(s.blast?.(point,force,debris)||0),0);
  const t2=performance.now();
  const plantCount=plants.reduce((n,s)=>n+(s.blast?.(point,force,debris)||0),0);
  const t3=performance.now();
  const received=loose+creatureCount+plantCount;
  const ground=surface(point.x,point.z);
  const crater=ground==null?null:terrain.impact({...point,y:ground+craterLift},{magnitude});
  const t4=performance.now();
  lastImpact={point,magnitude,crater,force:{...force,receivers:received,loose,creatures:creatureCount,plants:plantCount},timingMs:{loose:t1-t0,creatures:t2-t1,plants:t3-t2,craterAndSurface:t4-t3,total:t4-t0}};
  return lastImpact;
 };
 return {dispatch,inspect:()=>lastImpact};
}
