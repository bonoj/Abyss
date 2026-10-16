import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Reusable spherical-body collision gate. World queries are injected.
 * solidAt(x,y,z) must conservatively identify occupied terrain; this adapter
 * samples the sphere, so it is NOT a proof against features narrower than its
 * sampling resolution. For a strict guarantee supply intersectsSphere(center,r)
 * backed by actual geometry or a metric distance query.
 * No behavioral/player knowledge belongs here.
 */
export function createSphericalBody({radius,innerRadius=Infinity,solidAt=()=>false,intersectsSphere=null,clearance=null,margin=.04}={}){
 if(!(radius>0))throw new Error('Spherical body requires positive radius');
 const maxCenter=innerRadius-radius-margin;
 const samples=[[0,0,0]];
 // Multiple concentric shells detect internal occupancy as well as contacts.
 for(const scale of [.4,.7,1]){
  const n=scale===1?162:scale===.7?74:32;
  for(let i=0;i<n;i++){
   const y=1-2*(i+.5)/n,a=i*2.399963229728653,h=Math.sqrt(1-y*y);
   samples.push([scale*h*Math.cos(a),scale*y,scale*h*Math.sin(a)]);
  }
 }
 const wallClearance=p=>maxCenter-p.length();
 const availableClearance=p=>Math.min(wallClearance(p),clearance?clearance(p,radius+margin):Infinity);
 const valid=p=>{
  if(p.lengthSq()>maxCenter*maxCenter)return false;
  if(clearance)return clearance(p,radius+margin)>=0;
  if(intersectsSphere)return !intersectsSphere(p,radius+margin);
  for(const [x,y,z] of samples)if(solidAt(p.x+x*(radius+margin),p.y+y*(radius+margin),p.z+z*(radius+margin)))return false;
  return true;
 };
 const probe=new T.Vector3();
 let sweepQueries=0,contacts=0,unresolved=0;
 const sweep=(a,b)=>{
  if(!valid(a))return false;
  const length=a.distanceTo(b);
  if(length<1e-10)return true;
  if(clearance){
   // Both distance-to-triangle and spherical wall clearance are 1-Lipschitz
   // with respect to the sphere center. Advancing by <= available clearance
   // cannot cross a static surface, regardless of thin geometry.
   let traveled=0;
   for(let i=0;i<256;i++){
    probe.copy(a).lerp(b,traveled/length);
    sweepQueries++;
    const free=availableClearance(probe);
    if(free<0){contacts++;return false}
    if(length-traveled<=Math.max(0,free)*.8)return valid(b);
    if(free<=1e-6){contacts++;return false}
    traveled+=Math.min(length-traveled,free*.8);
   }
   unresolved++;return false; // never accept an unverified path
  }
  const n=Math.max(1,Math.ceil(length/Math.min(.10,radius*.08)));
  for(let i=1;i<=n;i++)if(!valid(probe.copy(a).lerp(b,i/n))){contacts++;return false}
  return true;
 };
 const tryMove=(position,displacement)=>{
  const end=position.clone().add(displacement);
  if(sweep(position,end)){position.copy(end);return true}
  // Axis and tangential sliding, never accepting an invalid end point.
  const candidates=[
   new T.Vector3(displacement.x,0,displacement.z),
   new T.Vector3(displacement.x,displacement.y,0),
   new T.Vector3(0,displacement.y,displacement.z),
   new T.Vector3(displacement.x,0,0),
   new T.Vector3(0,displacement.y,0),
   new T.Vector3(0,0,displacement.z)
  ];
  for(const d of candidates)if(d.lengthSq()>1e-12&&sweep(position,position.clone().add(d))){position.add(d);return true}
  return false;
 };
 // Emergency overlap recovery is local and bounded. Never teleport across
 // terrain to an arbitrary distant candidate. This is not continuous wall CCD.
 const resolveBoundary=(position)=>{
  if(valid(position))return {ok:true,corrected:false};
  // Only the Hermeticon wall is allowed to invoke this correction.
  // If terrain is occupied at the starting position, never guess a path
  // through it: return unresolved and let the caller handle the constraint.
  if(clearance&&clearance(position,radius+margin)<0){
   unresolved++;return {ok:false,corrected:false,reason:'Terrain overlap: no verified continuous correction'};
  }
  const radial=position.lengthSq()>1e-12?position.clone().normalize():new T.Vector3(0,1,0);
  const excess=Math.max(0,position.length()-maxCenter);
  if(excess<=0){
   unresolved++;return {ok:false,corrected:false,reason:'Invalid configuration without wall encroachment'};
  }
  // A radial segment is the minimum displacement for an enclosing sphere.
  // Its start lies outside the permitted wall, but the terrain clearance
  // remains valid throughout if the signed distance never falls below zero.
  const end=position.clone().addScaledVector(radial,-excess-1e-5);
  if(clearance){
   const distance=position.distanceTo(end);
   let traveled=0;
   for(let i=0;i<256&&traveled<distance;i++){
    const p=position.clone().lerp(end,traveled/distance);
    const free=clearance(p,radius+margin);
    if(free<0){unresolved++;return {ok:false,corrected:false,reason:'Terrain blocks wall correction'}}
    if(distance-traveled<=free*.8){traveled=distance;break}
    if(free<=1e-6){unresolved++;return {ok:false,corrected:false,reason:'Terrain contact blocks wall correction'}}
    traveled+=Math.min(distance-traveled,free*.8);
   }
   if(traveled<distance||clearance(end,radius+margin)<0){
    unresolved++;return {ok:false,corrected:false,reason:'Wall correction cannot be certified'};
   }
  }
  if(!valid(end)){
   unresolved++;return {ok:false,corrected:false,reason:'No valid radial wall correction'};
  }
  position.copy(end);
  return {ok:true,corrected:true,displacement:excess+1e-5};
 };
 return {radius,valid,sweep,tryMove,resolveBoundary,inspect:()=>({sweepQueries,contacts,unresolved,clearanceBackend:!!clearance})};
}
