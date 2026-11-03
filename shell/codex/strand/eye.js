// Strand Eye v1 — read-only, JSON-serializable physics evidence. No world mutation.
export function createStrandEye({bodies,contacts,terrain,stepSeconds}){
 const round=x=>Number.isFinite(x)?Math.round(x*1e5)/1e5:null;
 function snapshot(){
  const byMaterial={},samples=[];
  let kinetic=0,linear=0,angular=0,awake=0,sleeping=0,fastest=0,lowest=Infinity,highest=-Infinity;
  for(const b of bodies){
   const m=b.material||'stone',v2=b.v.lengthSq(),w2=b.spin.lengthSq();
   const bucket=byMaterial[m]||(byMaterial[m]={count:0,awake:0,sleeping:0,kinetic:0});
   bucket.count++;bucket.awake+=Number(b.awake);bucket.sleeping+=Number(!b.awake);
   const ke=.5*b.mass*v2+.5*(1/b.invI)*w2;kinetic+=ke;bucket.kinetic+=ke;
   linear+=v2;angular+=w2;fastest=Math.max(fastest,Math.sqrt(v2));
   lowest=Math.min(lowest,b.mesh.position.y);highest=Math.max(highest,b.mesh.position.y);
   awake+=Number(b.awake);sleeping+=Number(!b.awake);
   if(samples.length<12)samples.push({id:b.id,material:m,awake:b.awake,p:b.mesh.position.toArray().map(round),v:b.v.toArray().map(round),spin:b.spin.toArray().map(round)});
  }
  for(const bucket of Object.values(byMaterial))bucket.kinetic=round(bucket.kinetic);
  return {schema:'strand-eye/v1',kind:'runtime-snapshot',stepSeconds,bodyCount:bodies.length,awake,sleeping,
   byMaterial,energy:{kinetic:round(kinetic),linearSpeedSqSum:round(linear),angularSpeedSqSum:round(angular)},
   bounds:{minY:round(lowest===Infinity?0:lowest),maxY:round(highest===-Infinity?0:highest)},
   fastestSpeed:round(fastest),contacts:{terrainCalls:contacts.stats.terrain,pairCalls:contacts.stats.pairs,
    impulseCalls:contacts.stats.contacts,candidates:contacts.stats.candidates,
    byPair:{...contacts.stats.byPair},normalImpulseByPair:Object.fromEntries(Object.entries(contacts.stats.impulseByPair).map(([k,v])=>[k,round(v)])),
    byInterface:{...contacts.stats.byInterface},normalImpulseByInterface:Object.fromEntries(Object.entries(contacts.stats.impulseByInterface).map(([k,v])=>[k,round(v)]))},
   lastStep:{impulseApplications:contacts.frame.impulses,terrain:contacts.frame.terrainImpulses,body:contacts.frame.bodyImpulses,normalImpulse:round(contacts.frame.normalImpulse),frictionImpulse:round(contacts.frame.frictionImpulse),maxEstimatedDepth:round(contacts.frame.maxEstimatedDepth),meanEstimatedDepth:round(contacts.frame.depthSum/Math.max(1,contacts.frame.impulses)),meanPreSolveSlipSpeed:round(contacts.frame.slipSum/Math.max(1,contacts.frame.impulses)),upwardImpulseApplications:contacts.frame.supportImpulses,wakeEvents:contacts.frame.wakeEvents,byInterface:{...contacts.frame.byInterface}},
   wake:{total:contacts.wake.total,byReason:{...contacts.wake.byReason},last:contacts.wake.last?{...contacts.wake.last}:null},
   samples,limitations:['Contact counters cumulative across solver passes; not unique manifolds','Kinetic energy excludes gravitational potential and terrain deformation','Sampled bodies limited to first 12','Depth is estimated from nonmetric occupancy gradient, not measured geometric penetration','Runtime observation only; not proof of stable piles']};
 }
 return {snapshot};
}
