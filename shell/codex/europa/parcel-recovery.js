// Exact deterministic parcel disposition for synthetic lattice-node extraction.
// Allocation is per generic material ID, never a claim of calibrated mass.
export function allocateRecoveredParcels(parcels, recovered){
 if(!Array.isArray(parcels)||!recovered||typeof recovered!=='object')throw Error('invalid parcel allocation');
 const remaining={...recovered};
 for(const [id,count] of Object.entries(remaining))if(!Number.isInteger(count)||count<0)throw Error('invalid recovered count');
 const assigned=parcels.map(parcel=>{
  if(!parcel||!Object.hasOwn(remaining,String(parcel.materialId)))throw Error('unaccounted parcel material');
  const id=String(parcel.materialId);
  const disposition=remaining[id]>0?'recovered':'dispersed';
  if(disposition==='recovered')remaining[id]--;
  return {...parcel,disposition};
 });
 if(Object.values(remaining).some(n=>n!==0))throw Error('recovered inventory exceeds parcels');
 return assigned;
}
export function recoveredIntervals(parcels,{step=.25}={}){
 if(!Number.isFinite(step)||step<=0)throw Error('invalid interval step');
 const recovered=parcels.filter(p=>p.disposition==='recovered').sort((a,b)=>a.depth-b.depth||a.position[0]-b.position[0]||a.position[2]-b.position[2]);
 const intervals=new Map();
 for(const p of recovered){
  const start=Math.floor(p.depth/step)*step;
  const key=String(start);
  if(!intervals.has(key))intervals.set(key,{fromDepth:+start.toFixed(6),toDepth:+(start+step).toFixed(6),count:0,units:{},materials:{}});
  const i=intervals.get(key);i.count++;i.units[p.unit]=(i.units[p.unit]||0)+1;
  const id=String(p.materialId);i.materials[id]=(i.materials[id]||0)+1;
 }
 return {step,ordered:recovered,intervals:[...intervals.values()].sort((a,b)=>a.fromDepth-b.fromDepth)};
}
