import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createHermeticon} from '../hermeticon.js';
import {inspectObjectSpace} from '../observation/world-space.js';
import {createSphericalBody} from '../physics/spherical-body.js';

/**
 * DESIGN CONTRACT: see ./HERMETICON_EYE.md for character, anatomy,\n * attention and locomotion.\n * COMPOSABLE CONTRACT — nested Hermeticon eye.
 * Inputs: {parent,id}; parent is the rendered Genesis world.content.
 * Mount chain MUST be parent -> root -> vessel.group -> vessel.content
 * -> interior -> instanced BB eye. Both parent.add(root) and
 * vessel.group.add(vessel.content) are required (the missing first link
 * caused the entire eye orb to vanish on 2026-10-14).
 * Eye anatomy faces local +Z; brass meridian and iris rotate together.
 * World coordinates: mobile inside inner radius 10.07, scaled shell radius 1.28125;
 * Uses terrain.sample for collision; gaze follows interest, not camera lock.
 * Exposes {group,childWorld,update,contactBead,inspect}. This factory
 * does not own Genesis updates; caller must isolate experimental failures.
 * If invisible: inspect attachment and world-space diagnostics FIRST,
 * then deployed runtime; do not randomly move the eye or alter terrain.
 */
export function createHermeticonDrone({parent,id='drone-1',terrain=null,offset=()=>({x:0,z:0}),observe=()=>[]}={}){
 const root=new T.Group();root.name='Hermeticon eye '+id;
 const vessel=createHermeticon();
 vessel.group.scale.setScalar(.125);
 vessel.group.rotation.x=Math.PI/2; // brass equator normal points along the iris (+Z)
 // Glass remains spatially steady while the ocular meridian rotates around it.
 for(const child of [...vessel.group.children])if(child.name==='Hermeticon glass'){
  vessel.group.remove(child);child.scale.setScalar(.125);root.add(child);
 }
 root.add(vessel.group);
 if(parent)parent.add(root);
 vessel.group.add(vessel.content);
 const interior=new T.Group();interior.name='BB eye interior '+id;
 interior.rotation.x=-Math.PI/2; // cancel brass' fixed local mounting rotation
 vessel.content.add(interior);
 // Eye anatomy faces +Z. Cancel the static meridian alignment here;
 // the shared root then rotates both iris and brass together.
 const geometry=new T.IcosahedronGeometry(1,1);
 const material=new T.MeshStandardMaterial({roughness:.45,metalness:.03,emissive:0x161b24,emissiveIntensity:.12});
 const points=[],colors=[],base=[];
 const push=(x,y,z,r,color,kind=0,phase=0)=>{
  points.push([x,y,z,r,kind,phase]);colors.push(new T.Color(color));base.push([x,y,z]);
 };
 // The globe is white sclera; the iris and pupil are built into its forward surface.
 // Fibonacci distribution avoids latitude clustering and is cheap to animate.
 const N=2700,gr=(1+Math.sqrt(5))/2;
 for(let i=0;i<N;i++){
  const y=1-2*(i+.5)/N,a=2*Math.PI*i/gr,h=Math.sqrt(1-y*y);
  const x=Math.cos(a)*h,z=Math.sin(a)*h;
  const rho=Math.hypot(x,y),front=z>0;
  let color=0xf1e8df,r=.17,kind=0;
  // Projected iris radius must match raised fiber geometry: no white BBs underneath.
  if(front&&rho<.23){color=0x080e1a;r=.15;kind=2}
  else if(front&&rho<.69){
   const theta=Math.atan2(y,x),fiber=Math.sin(theta*73+rho*39)+Math.sin(theta*117-rho*27);
   color=fiber>1?0x95e5df:fiber>0?0x43a6b7:fiber>-.8?0x23667d:0x183c5b;
   r=.155;kind=1;
  }else if(front&&rho<.73){color=0x172b3c;kind=1}
  // Capillary veins are drawn below as coherent branching paths rather than
  // random red speckles selected from the Fibonacci globe.

  push(x*7.25,y*7.25,z*7.25,r,color,kind,i*2.399963);
 }
 // Branching scleral vessels: continuous dotted polylines following the globe.
 // Roots start at the rim, travel inward, and split into finer capillaries.
 // Each bead follows a spherical surface point so the veins remain anatomical.
 const vesselPoint=(rho,a)=>{
  const rr=Math.min(.9999,rho),z=Math.sqrt(1-rr*rr)*7.25+.11;
  return [Math.cos(a)*rr*7.25,Math.sin(a)*rr*7.25,z];
 };
 const vesselBranch=(startR,endR,startA,curve,thickness,seed)=>{
  const steps=Math.ceil((startR-endR)*115);
  for(let j=0;j<=steps;j++){
   const t=j/steps,rho=startR+(endR-startR)*t;
   const angle=startA+curve*t+.035*Math.sin(t*9+seed)+.015*Math.sin(t*21+seed*3);
   const [x,y,z]=vesselPoint(rho,angle);
   push(x,y,z,thickness*(.9-.45*t),t>.7?0xb95562:0xa42f42,3,seed+j);
  }
 };
 for(let k=0;k<21;k++){
  const a=k*Math.PI*2/21+.16*Math.sin(k*4.7);
  const inner=.76+.035*Math.sin(k*3.2);
  const bend=.12*Math.sin(k*2.6);
  vesselBranch(.985,inner,a,bend,.088,k);
  for(let b=0;b<2;b++){
   const fork=.35+b*.27;
   const r=.985+(inner-.985)*fork;
   const branchA=a+bend*fork+.035*Math.sin(fork*9+k);
   vesselBranch(r,Math.min(r-.045,inner+.035),branchA,(b?1:-1)*(.075+.035*Math.sin(k+b)),.055,k*3+b+1);
  }
 }
 // Raised iris radial fibers and dark, deep pupil give a human eye readable depth.
 for(let i=0;i<650;i++){
  const a=i*2.399963,rad=.25+.4*((i*37)%653)/653;
  const x=Math.cos(a)*rad*7.25,y=Math.sin(a)*rad*7.25;
  const z=Math.sqrt(1-rad*rad)*7.25+.17;
  const stripe=Math.sin(a*67+rad*40);
  push(x,y,z,.105,stripe>.25?0x9cdbd2:stripe<-.3?0x174257:0x3d9fb2,1,i);
 }
 // Subtle wet catchlight, assembled from small pale BBs.
 for(let i=0;i<45;i++){
  const a=i*2.399963,rad=Math.sqrt((i+.5)/45)*.11;
  const x=(-.23+Math.cos(a)*rad)*7.25,y=(.31+Math.sin(a)*rad)*7.25;
  const d=Math.hypot(x/7.25,y/7.25);
  push(x,y,Math.sqrt(1-d*d)*7.25+.35,.13,0xf9ffff,4,i);
 }
 const beads=new T.InstancedMesh(geometry,material,points.length);
 beads.name='Moving anatomical BBs';beads.frustumCulled=false;
 beads.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const dummy=new T.Object3D();
 for(let i=0;i<points.length;i++)beads.setColorAt(i,colors[i]);
 if(beads.instanceColor)beads.instanceColor.needsUpdate=true;
 interior.add(beads);
 let time=0,beadContacts=0,arrivals=0,blocked=0,glassVisits=0;
 let traveled=0,hoverTraveled=0,verticalTravel=0,verticalReversals=0,lastVerticalDirection=0;
 const EYE_RADIUS=1.30;
 const gaze=new T.Vector3(),velocity=new T.Vector3(),destination=new T.Vector3(0,5.2,5.1);
 const lookPoint=new T.Vector3();
 const cameraPosition=new T.Vector3(),trial=new T.Vector3(),probe=new T.Vector3(),direction=new T.Vector3();
 const targetQuat=new T.Quaternion(),lookMatrix=new T.Matrix4();
 const stationAnchor=new T.Vector3(),stationTarget=new T.Vector3(),stationVelocity=new T.Vector3();
 const meridianMount=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2);
 const UP=new T.Vector3(0,1,0);
 let cameraRef=null,mode='observe';
 let nextExploration=0;
 let decisions=0,observedChanges=0,investigations=0,explorationAttempts=0,successfulBoreRoutes=0;
 let lastInterest=0,quietSince=0,focusScore=0,attentionReason='none',lastDecision='initial';
 let wallCorrections=0,frameRebases=0;
 let lastOffset={...offset()};
 const crossingPoint=new T.Vector3();
 let rng=741;
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 // Terrain.sample is the authoritative signed field: positive is solid.
 // The geometry's local X/Z is shifted by Wanderer's offset, so undo that
 // shift for collision sampling. Above/below +/-3.6 is always clear.
 const solidAt=(x,y,z)=>{
  if(!terrain||y>3.6||y< -3.6)return false;
  const o=offset();return terrain.sample(x+o.x,y,z+o.z)>0;
 };
 const body=createSphericalBody({radius:EYE_RADIUS,innerRadius:10.07,solidAt,intersectsSphere:terrain?.intersectsSphere?.bind(terrain)??null,clearance:terrain?.sphereClearance?.bind(terrain)??null,margin:.13});
 const clearAt=p=>p.length()+EYE_RADIUS+.13<=10.07&&body.valid(p);
 const clearSegment=(a,b)=>clearAt(a)&&clearAt(b)&&body.sweep(a,b);
 // Crossing the slab is only legal where a whole eye fits through a bore.
 // The waypoint at the slab's midplane forces a real aperture crossing.

 // Betwixt Observer inheritance: sense -> acquire -> track -> investigate.
 // Observations are supplied by Genesis; the eye never knows species internals.
 let focus=null,focusSince=0,attentionChanges=0,lastObservationCount=0,nextSense=0;
 let belowVisits=0,belowSeconds=0,desiredHemisphere=-1;
 const memories=new Map();
 const seen=new Map();
 let observations=[];
 // Optical visibility is a point ray, not the full-body swept-volume
 // collision test. A subject on the ground must remain visible from above.
 const visibleTarget=entry=>{
  const p=entry.position;
  if(!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite))return false;
  const v=new T.Vector3(...p),distance=v.distanceTo(root.position);
  if(distance>14||distance<.01)return false;
  const steps=Math.max(1,Math.ceil(distance/.45));
  for(let i=1;i<steps;i++){
   probe.copy(root.position).lerp(v,i/steps);
   if(solidAt(probe.x,probe.y,probe.z))return false;
  }
  return true;
 };
 const sense=()=>{
  if(time<nextSense)return;
  nextSense=time+.35;
  try{observations=(observe()||[]).filter(visibleTarget)}catch(error){observations=[];console.warn('Eye observation unavailable',error)}
  lastObservationCount=observations.length;
  for(const c of observations){
   const prior=seen.get(c.id),delta=prior?new T.Vector3(...c.position).distanceTo(new T.Vector3(...prior.position)):0;
   if(prior&&delta>.15)observedChanges++;
   seen.set(c.id,{position:c.position.slice(),time,delta});
  }
  for(const [id,m] of seen)if(time-m.time>18)seen.delete(id);
  if(focus){const fresh=observations.find(c=>c.id===focus.id);
   if(fresh)focus=fresh;
   else if(time-focusSince>1.2)focus=null;
  }
 };
 // Flight-first Observer: terrain-clear waypoints, repeated vertical crossings,
 // continuous motion. Betwixt contributes the forward ocular quaternion.
 let flightLegs=0,flightFailures=0,flightPhase='ascending',lastFlightTarget=null;
 const flyTo=(point,phase)=>{
  if(!clearAt(point)||!clearSegment(root.position,point))return false;
  destination.copy(point);mode='flight';flightPhase=phase;lastFlightTarget=point.toArray();
  flightLegs++;lastDecision=phase;return true;
 };
 const chooseFlight=()=>{
  decisions++;explorationAttempts++;
  const here=root.position,sign=here.y>=0?1:-1;
  // Prefer a genuine whole-body-clear passage through the slab.
  // Find a nearby bore and cross in distinct collision-tested legs.
  const angles=16;
  for(let ring=0;ring<=5;ring++)for(let j=0;j<angles;j++){
   const angle=(j+flightLegs*3)*Math.PI*2/angles;
   const mid=new T.Vector3(here.x+Math.cos(angle)*ring*1.2,0,here.z+Math.sin(angle)*ring*1.2);
   const entry=mid.clone().setY(sign*5.2),exit=mid.clone().setY(-sign*5.2);
   if(!clearAt(mid)||!clearAt(entry)||!clearAt(exit))continue;
   if(!clearSegment(entry,mid)||!clearSegment(mid,exit))continue;
   if(!clearSegment(here,entry))continue;
   crossingPoint.copy(exit);desiredHemisphere=-sign;
   if(flyTo(entry,'approach-bore')){successfulBoreRoutes++;return}
  }
  // If there is no bore, actively survey the current hemisphere, with
  // alternating high/low altitude and broad lateral movement.
  for(let ring=4;ring>=1;ring--)for(let j=0;j<24;j++){
   const angle=(j+flightLegs*7)*Math.PI/12;
   const y=sign*(j%2===0?6.7:4.4);
   const p=new T.Vector3(Math.cos(angle)*ring*1.6,y,Math.sin(angle)*ring*1.6);
   if(p.distanceTo(here)>1.5&&flyTo(p,'survey-'+(y>0?'above':'below')))return;
  }
  // At a blocked location, probe shorter vertical and lateral moves so the
  // next frame can still progress rather than retrying the same impossible leg.
  for(let i=0;i<24;i++){
   const a=(i+flightFailures*5)*Math.PI/12;
   const p=here.clone().add(new T.Vector3(Math.cos(a)*1.8,(i%3-1)*1.8,Math.sin(a)*1.8));
   if(flyTo(p,'local-clearance'))return;
  }
  flightFailures++;lastDecision='no-clear-flight';mode='hover';
 };
 const render=()=>{
  for(let i=0;i<points.length;i++){
   const [x,y,z,r,kind,phase]=points[i];
   const pulse=kind===1?.035*Math.sin(time*2.1+phase*.017):kind===3?.025*Math.sin(time*1.4+phase):.012*Math.sin(time*1.2+phase);
   dummy.position.set(x*(1+pulse/7.25),y*(1+pulse/7.25),z*(1+pulse/7.25));
   dummy.scale.setScalar(r*(1+.09*Math.sin(time*2.3+phase)));
   dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);
  }
  beads.instanceMatrix.needsUpdate=true;
 };
 root.position.set(0,5.2,5.1);
 stationAnchor.copy(root.position);
 // The eye is a persistent terrain-world entity. The Hermeticon is a
 // viewport, not a leash or an existence boundary.
 let frameRebasesPreservingWorld=0;
 const rebase=()=>{
  const next=offset(),dx=next.x-lastOffset.x,dz=next.z-lastOffset.z;
  if(!dx&&!dz)return;
  root.position.x-=dx;root.position.z-=dz;
  destination.x-=dx;destination.z-=dz;
  stationAnchor.x-=dx;stationAnchor.z-=dz;
  stationTarget.x-=dx;stationTarget.z-=dz;
  crossingPoint.x-=dx;crossingPoint.z-=dz;
  if(focus)focus={...focus,position:[focus.position[0]-dx,focus.position[1],focus.position[2]-dz]};
  lastOffset={x:next.x,z:next.z};
  frameRebases++;frameRebasesPreservingWorld++;
 };
 const update=(dt,camera)=>{
  const step=Math.max(0,Math.min(dt,.06));time+=step;
  rebase();
  // Rendering is viewport-scoped; existence, memory and simulation are not.
  // Cull the whole eye only when its entire spherical body is outside.
  root.visible=true;
  if(camera?.position)cameraRef=camera;
  if(root.position.y< -1.4)belowSeconds+=step;
  if(mode==='observe'||mode==='hover')chooseFlight();
  if(mode==='flight'&&root.position.distanceTo(destination)<.35){
   arrivals++;
   if(flightPhase==='approach-bore'){
    const mid=crossingPoint.clone().setY(0);
    if(flyTo(mid,'enter-bore')){}else chooseFlight();
   }else if(flightPhase==='enter-bore'){
    if(flyTo(crossingPoint,'exit-bore')){}else chooseFlight();
   }else{
    if(flightPhase==='exit-bore')belowVisits++;
    chooseFlight();
   }
  }
  if(mode==='flight'){
   direction.copy(destination).sub(root.position);
   const distance=direction.length();
   if(distance>.001){
    direction.divideScalar(distance);
    const desiredSpeed=Math.min(3.5,Math.sqrt(2*3.5*distance));
    velocity.lerp(direction.multiplyScalar(desiredSpeed),Math.min(1,step*3.2));
    trial.copy(root.position).addScaledVector(velocity,step);
    const beforeTravel=root.position.clone();
    if(body.tryMove(root.position,trial.clone().sub(root.position))&&clearAt(root.position)){
     traveled+=root.position.distanceTo(beforeTravel);
     const dy=root.position.y-beforeTravel.y;verticalTravel+=Math.abs(dy);
     if(Math.abs(dy)>.0001){const sign=Math.sign(dy);if(lastVerticalDirection&&sign!==lastVerticalDirection)verticalReversals++;lastVerticalDirection=sign}
    }else{
     root.position.copy(beforeTravel);blocked++;velocity.set(0,0,0);
     mode='hover';lastDecision='blocked-flight';flightFailures++;
    }
   }
  }
  // Constant low-energy station keeping, independent of attention or travel.
  // Anchor follows deliberate travel but not every oscillation, preventing drift.
  if(mode==='flight')stationAnchor.copy(root.position);
  stationTarget.copy(stationAnchor).add(new T.Vector3(
   .45*Math.sin(time*.73)+.16*Math.sin(time*1.19+1.2),
   .62*Math.sin(time*.91+.5)+.18*Math.sin(time*1.67),
   .42*Math.cos(time*.61+.8)+.14*Math.sin(time*1.31)
  ));
  // While traveling, hover around the moving body; while idle, hover around anchor.
  direction.copy(stationTarget).sub(root.position).multiplyScalar(5.0);
  stationVelocity.addScaledVector(direction,step);
  stationVelocity.multiplyScalar(Math.exp(-step*2.3));
  trial.copy(root.position).addScaledVector(stationVelocity,step);
  const beforeHover=root.position.clone();
  if(body.tryMove(root.position,trial.clone().sub(root.position))&&clearAt(root.position)){
   const distance=root.position.distanceTo(beforeHover);hoverTraveled+=distance;traveled+=distance;
   verticalTravel+=Math.abs(root.position.y-beforeHover.y);
  }else{root.position.copy(beforeHover);stationVelocity.set(0,0,0)}
  // The meridian is the eye's forward-bearing hardware: rotate the entire
  // vessel and iris as one, never the anatomy independently.
  if(velocity.lengthSq()>.0001)lookPoint.copy(root.position).add(velocity);
  else if(stationVelocity.lengthSq()>.0001)lookPoint.copy(root.position).add(stationVelocity);
  else lookPoint.copy(destination);
  lookMatrix.lookAt(lookPoint,root.position,UP);
  targetQuat.setFromRotationMatrix(lookMatrix);
  vessel.group.quaternion.slerp(targetQuat.clone().multiply(meridianMount),Math.min(1,step*.85));
  render();
 };
 const contactBead=(x,y,z,r,vx,vy,vz)=>{
  const delta=root.position.clone().sub(new T.Vector3(x,y,z));
  const d=delta.length(),limit=1.29+r;
  if(d>=limit)return false;
  delta.normalize();velocity.addScaledVector(delta,Math.min(2,Math.hypot(vx,vy,vz)*.15+.15));
  beadContacts++;return true;
 };
 render();
 const childWorld={id:id+'-world',group:interior,seed:741,inspect:()=>({id:id+'-world',representation:'BB eye',beads:points.length})};
 return {group:root,childWorld,update,contactBead,inspect:()=>({name:'Hermeticon eye',id,position:root.position.toArray(),mode,worldPosition:[root.position.x+lastOffset.x,root.position.y,root.position.z+lastOffset.z],frameRebases,frameRebasesPreservingWorld,decisions,observedChanges,investigations,explorationAttempts,successfulBoreRoutes,attentionReason,lastDecision,focusScore,quietFor:time-quietSince,outsideVisibleVessel:root.position.length()+EYE_RADIUS+.13>10.07,flightLegs,flightFailures,flightPhase,lastFlightTarget,terrainClearance:terrain?.sphereClearance(root.position,EYE_RADIUS+.13,lastOffset)??null,wallCorrections,belowVisits,belowSeconds,focus:focus?.id||null,focusAge:focus?time-focusSince:null,attentionChanges,lastObservationCount,remembered:seen.size,visited:memories.size,velocity:velocity.toArray(),destination:destination.toArray(),arrivals,blocked,glassVisits,traveled,hoverTraveled,verticalTravel,verticalReversals,visible:root.visible,attached:!!root.parent,vesselVisible:vessel.group.visible,beadInstances:beads.count,space:inspectObjectSpace(root,cameraRef),beadContacts,physics:body.inspect(),childWorld:childWorld.inspect()})};
}
