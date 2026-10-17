// EUROPA-01: observable-only synthetic core instrument. Not a calibrated sensor.
// The observer receives generic material ID, depth, and position only; never geological truth.
const hash=(seed,key)=>{let h=seed>>>0;for(const c of key)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h/4294967296};
export function observeRecoveredCore(parcels,{seed=741,noiseSigma=.02,missingFraction=0,contaminationFraction=0}={}){
 if(!Number.isInteger(seed)||![noiseSigma,missingFraction,contaminationFraction].every(Number.isFinite)||noiseSigma<0||missingFraction<0||missingFraction>1||contaminationFraction<0||contaminationFraction>1)throw Error('invalid instrument configuration');
 if(!Array.isArray(parcels))throw Error('parcels required');
 const measurements=[];
 for(const p of parcels){
  if(p.disposition!=='recovered')continue;
  const {position,depth,materialId}=p;
  if(!Array.isArray(position)||position.length!==3||!position.every(Number.isFinite)||!Number.isFinite(depth)||depth<0)throw Error('invalid parcel geometry');
  const id=String(materialId),key=JSON.stringify([position,depth,id]);
  if(hash(seed,'missing:'+key)<missingFraction)continue;
  // Generic render-material contrast is an arbitrary instrument proxy, not chemistry.
  const baseline=(Number(materialId)%11)/10;
  const noise=(hash(seed,'noise:'+key)-.5)*Math.sqrt(12)*noiseSigma;
  const contaminated=hash(seed,'contam:'+key)<contaminationFraction;
  const signal=Math.max(0,Math.min(1,baseline+noise+(contaminated?.12:0)));
  measurements.push({depth,position:[...position],signal,uncertainty:noiseSigma,contaminationPossible:contaminationFraction>0});
 }
 return {schema:'europa-observable-core/v0',synthetic:true,calibrated:false,channel:'GENERIC_MATERIAL_CONTRAST',measurements,attempted:parcels.filter(p=>p.disposition==='recovered').length,observed:measurements.length,settings:{seed,noiseSigma,missingFraction,contaminationFraction},caveat:'No geological labels or synthetic composition are exposed; contrast comes from generic render IDs'};
}
export function compareObservableCores(a,b,{abstainThreshold=.05}={}){
 if(!Number.isFinite(abstainThreshold)||abstainThreshold<0)throw Error('invalid abstention threshold');
 const mean=o=>o.measurements.length?o.measurements.reduce((s,m)=>s+m.signal,0)/o.measurements.length:null;
 const ma=mean(a),mb=mean(b),difference=ma===null||mb===null?null:ma-mb;
 return {schema:'europa-observable-comparison/v0',means:[ma,mb],difference,decision:difference===null||Math.abs(difference)<=abstainThreshold?'abstain':difference>0?'first-higher':'second-higher',abstainThreshold,interpretation:'Descriptive generic-material contrast, not geological classification'};
}
