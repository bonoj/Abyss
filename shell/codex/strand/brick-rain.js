import {createStoneContacts} from '../../arcana/physics/stone-contacts.js';
import {createStrandEye} from './eye.js';
import {createFrostBacklitIce} from './ice-frost-backlit.js';
// Original Stone & Root bevel/profile/palette. Independent Strand rigid masonry.
export function createBrickRain(T,{parent,terrain,visibleEntity=()=>true}){
 const root=new T.Group();root.name='Stone & Root masonry';parent.add(root);
 const palette=[0xb4b2a3,0xc9c3ad,0xaaa99f,0xd2c8b0,0x979f9e,0xb9b8ad,0xe0d0b2].map(color=>new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));
 // Flesh is retained for future evaluation, but excluded from the active rain.
 const materials={stone:{density:1,friction:.82,restitution:.09},wood:{density:.45,friction:.62,restitution:.12},ice:{density:.65,friction:.08,restitution:.06},flesh:{density:.9,friction:1.05,restitution:.035}};
 const finishes={stone:palette,wood:[0x9b7047,0xb18a5b,0x806043].map(color=>new T.MeshStandardMaterial({color,roughness:.87,flatShading:true})),ice:[0xa8d9e8,0xd4edf5,0x82b9d4].map(color=>new T.MeshStandardMaterial({color,roughness:.22,metalness:.05,flatShading:true})),flesh:[0x9d5d64,0xb77579,0x824b57,0xc48c88].map(color=>new T.MeshStandardMaterial({color,roughness:.79,metalness:0}))};
 const originalIceFinishes=finishes.ice;
 const frostBacklitIce=createFrostBacklitIce(T);
 // Preserve the original finish palette as an independently selectable material.
 finishes.ice=[frostBacklitIce];
 // Pass 1: displace the existing rain in world coordinates; physics and picking share this frame.
 const stackOrigin={x:4.5,z:0};
 const SCALE=.5, w=.72*SCALE,h=.36*SCALE,d=.44*SCALE,b=.065*SCALE,bevel=.035*SCALE;
 const s=new T.Shape();s.moveTo(-w/2+b,-h/2);s.lineTo(w/2-b,-h/2);
 s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+b);s.lineTo(w/2,h/2-b);
 s.quadraticCurveTo(w/2,h/2,w/2-b,h/2);s.lineTo(-w/2+b,h/2);
 s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-b);s.lineTo(-w/2,-h/2+b);
 s.quadraticCurveTo(-w/2,-h/2,-w/2+b,-h/2);
 const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:2,steps:1});geo.translate(0,0,-d/2);
 // Same rounded brick profile for flesh, with more vertices for local dents.
 const fleshGeo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:4,steps:2});fleshGeo.translate(0,0,-d/2);

 const half=[w/2+bevel,h/2+bevel,d/2+bevel],bodies=[];
 const entityRadius=Math.hypot(...half);
 const contacts=createStoneContacts(T,terrain,half,materials);
 const eye=createStrandEye({bodies,contacts,terrain,stepSeconds:1/120});
 const rnd=i=>{const n=Math.sin(i*127.1+1917)*43758.5453;return n-Math.floor(n)};
 let spawned=0,clock=0,accumulator=0,steps=0,solverMs=0,solverPeakMs=0,sleepTransitions=0,lastStepSleepTransitions=0;
 const STEP=1/120,MAX_STEPS=8;
 const pendingBlasts=[];let blastCount=0,lastBlast=null,maxBlastDeltaV=0,maxStepTravelRatio=0,maxSpeedObserved=0;
 const core=.9,radius=3.2;
 const falloff=r=>r>=radius?0:(1/(1+(r/core)**2))*(1-(r/radius)**2)**2;
 function receiveBlast(event){pendingBlasts.push(event);return true;}
 function applyBlasts(){
  while(pendingBlasts.length){
   const event=pendingBlasts.shift(),point=new T.Vector3(event.point.x,event.point.y,event.point.z);
   const direct=bodies.find(b=>b.id===event.hit?.bodyId),counts={stone:0,wood:0,ice:0,flesh:0};
   let totalImpulse=0,woken=0,blastPeakDeltaV=0;
   for(const body of bodies){
    const delta=body.mesh.position.clone().sub(point),dist=delta.length();
    if(dist>=radius&&body!==direct)continue;
    const weight=falloff(dist),isDirect=body===direct;
    const outward=dist>1e-5?delta.divideScalar(dist):new T.Vector3(0,1,0);
    outward.y+=.35;outward.normalize();
    const impulse=18*event.magnitude*(isDirect?0.55:0.30*weight);
    if(isDirect)outward.set(0,-1,0);
    if(impulse<=0)continue;
    if(!body.awake){body.awake=true;body.quiet=0;woken++;}
    const deltaV=impulse/body.mass;maxBlastDeltaV=Math.max(maxBlastDeltaV,deltaV);blastPeakDeltaV=Math.max(blastPeakDeltaV,deltaV);
    body.v.addScaledVector(outward,deltaV);
    const arm=isDirect?point.clone().sub(body.mesh.position):outward.clone().multiplyScalar(.12);
    body.spin.addScaledVector(arm.cross(outward),impulse*body.invI);
    counts[body.material]++;totalImpulse+=impulse;
   }
   lastBlast={point:event.point,hit:event.hit||{kind:'terrain'},radius,core,affected:counts,impulse:totalImpulse,woken,maxDeltaV:blastPeakDeltaV,step:steps};blastCount++;
  }
 }

 function spawn(){
  const i=spawned++,kind=['stone','wood','ice'][i%3],mesh=new T.Mesh(kind==='flesh'?fleshGeo.clone():geo,finishes[kind][i%finishes[kind].length]);
  mesh.position.set(stackOrigin.x+(rnd(i*3)-.5)*2.2,6.4+rnd(i*3+1)*1.2,stackOrigin.z+(rnd(i*3+2)-.5)*2.2);
  mesh.rotation.set((rnd(i+80)-.5)*.6,rnd(i+90)*6.28,(rnd(i+100)-.5)*.6);
  mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
  const mass=5*Math.pow(SCALE,3)*materials[kind].density;
  bodies.push({mesh,v:new T.Vector3(),spin:new T.Vector3((rnd(i+11)-.5),(.5-rnd(i+12)),(rnd(i+13)-.5)),
   id:i,material:kind,indentations:[],deformationActive:false,restPositions:kind==='flesh'?new Float32Array(mesh.geometry.attributes.position.array):null,mass,invI:12/(mass*(w*w+h*h+d*d)),awake:true,quiet:0});
 }
 const rotation=new T.Quaternion(),axis=new T.Vector3();
 function step(){
  const start=performance.now();contacts.beginStep();lastStepSleepTransitions=0;applyBlasts();
  clock+=STEP;
  if(spawned<96&&clock>=.19){clock-=.19;spawn();}
  for(const body of bodies){
   if(body.carried)continue;
   if(!body.awake)continue;
   body.v.y-=contacts.gravity*STEP;
   const speedNow=body.v.length();maxSpeedObserved=Math.max(maxSpeedObserved,speedNow);
   maxStepTravelRatio=Math.max(maxStepTravelRatio,speedNow*STEP/(2*Math.min(...half)));
   body.mesh.position.addScaledVector(body.v,STEP);
   const speed=body.spin.length();
   if(speed>1e-7){rotation.setFromAxisAngle(axis.copy(body.spin).divideScalar(speed),speed*STEP);body.mesh.quaternion.premultiply(rotation).normalize();}
  }
  // Localized, contact-driven surface strain. Every flesh brick owns its vertices.
  // Existing dents decay with a damped recovery; nearby vertices displace along the
  // incoming contact normal, so a corner strike cannot flatten the whole brick.
  // Surface deformation runs at 30 Hz, independently of the 120 Hz contact solver.
  // Dormant bricks incur no vertex writes or normal recomputation.
  if(steps%4===0)for(const body of bodies)if(body.material==='flesh'){
   if(body.indentations.length===0&&!body.deformationActive)continue;
   for(const dent of body.indentations){
    dent.age+=STEP*4;
    dent.depth=Math.max(0,dent.depth*Math.exp(-STEP*4*1.4));
   }
   body.indentations=body.indentations.filter(dent=>dent.depth>.00015&&dent.age<4);
   const pos=body.mesh.geometry.attributes.position,rest=body.restPositions;
   const radius=.085,invRadius2=1/(2*radius*radius);
   for(let i=0;i<pos.count;i++){
    const x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2];
    let dx=0,dy=0,dz=0;
    for(const dent of body.indentations){
     const px=x-dent.point.x,py=y-dent.point.y,pz=z-dent.point.z;
     const weight=Math.exp(-(px*px+py*py+pz*pz)*invRadius2);
     dx+=dent.normal.x*dent.depth*weight;
     dy+=dent.normal.y*dent.depth*weight;
     dz+=dent.normal.z*dent.depth*weight;
    }
    pos.setXYZ(i,x+dx,y+dy,z+dz);
   }
   pos.needsUpdate=true;
   body.mesh.geometry.computeVertexNormals();
   body.deformationActive=body.indentations.length>0;
  }
  // Terrain is static; solve contact impulses iteratively alongside brick pairs.
  // Spatial bins restrict pair checks to local neighborhoods.
  const cells=new Map(),cellSize=1.1*SCALE;
  for(let i=0;i<bodies.length;i++){
   if(bodies[i].carried)continue;
   const p=bodies[i].mesh.position,k=[Math.floor(p.x/cellSize),Math.floor(p.y/cellSize),Math.floor(p.z/cellSize)].join(',');
   let bucket=cells.get(k);if(!bucket){bucket=[];cells.set(k,bucket);}bucket.push(i);
  }
  const candidates=[],seen=new Set();
  for(let i=0;i<bodies.length;i++){
   if(bodies[i].carried)continue;
   const p=bodies[i].mesh.position,cx=Math.floor(p.x/cellSize),cy=Math.floor(p.y/cellSize),cz=Math.floor(p.z/cellSize);
   for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
    const bucket=cells.get([cx+x,cy+y,cz+z].join(','));if(!bucket)continue;
    for(const j of bucket){if(j<=i)continue;const key=i+':'+j;if(seen.has(key))continue;seen.add(key);candidates.push([i,j]);}
   }
  }
  for(let pass=0;pass<5;pass++){
   for(const body of bodies)if(body.awake&&!body.carried)contacts.terrainBody(body);
   for(const [i,j] of candidates)if(bodies[i].awake||bodies[j].awake)contacts.pair(bodies[i],bodies[j]);
  }
  // Sleep only after sustained low motion with contact support. Wake on collision.
  for(const body of bodies){
   if(body.carried||!body.awake)continue;
   const p=body.mesh.position,below=terrain.sample(p.x,p.y-half[1]-.045*SCALE,p.z)>0;
   const supported=below||bodies.some(other=>other!==body&&!other.carried&&
    Math.abs(other.mesh.position.x-p.x)<w*.8&&Math.abs(other.mesh.position.z-p.z)<d*.9&&
    other.mesh.position.y<p.y&&p.y-other.mesh.position.y<h+.09*SCALE);
   if(supported&&body.v.lengthSq()<.0009&&body.spin.lengthSq()<.0009)body.quiet++;
   else body.quiet=0;
   if(body.quiet>100){sleepTransitions++;lastStepSleepTransitions++;body.awake=false;body.v.set(0,0,0);body.spin.set(0,0,0);}
  }
  steps++;solverMs=performance.now()-start;solverPeakMs=Math.max(solverPeakMs,solverMs);
 }
 function update(dt){
  accumulator=Math.min(.1,accumulator+Math.max(0,Math.min(.05,dt||0)));
  let n=0;while(accumulator>=STEP&&n++<MAX_STEPS){step();accumulator-=STEP;}
  // Same per-entity radius predicate as Arcana BB instance packing.
  for(const body of bodies){
   const p=body.mesh.position;body.mesh.visible=visibleEntity(p.x,p.y,p.z,entityRadius);
  }
 }
 function claimStone(position,maxDistance=2){let best=null,bestD=maxDistance*maxDistance;for(const body of bodies){if(body.material!=='stone'||body.carried||body.claimed||body.awake)continue;const d=body.mesh.position.distanceToSquared(position);if(d<bestD){best=body;bestD=d;}}if(best)best.claimed=true;return best;}
 function carryStone(body,position){if(!body||!body.claimed)return false;body.carried=true;body.awake=false;body.v.set(0,0,0);body.spin.set(0,0,0);body.mesh.position.copy(position);body.mesh.quaternion.identity();return true;}
 function placeStone(body,position){if(!body||!body.carried)return false;body.mesh.position.copy(position);body.carried=false;body.claimed=false;body.awake=true;body.quiet=0;body.v.set(0,0,0);body.spin.set(0,0,0);return true;}
 return {claimStone,carryStone,placeStone,update,receiveBlast,pickables:()=>bodies.filter(b=>b.mesh.visible).map(b=>b.mesh),bodyForMesh:mesh=>bodies.find(b=>b.mesh===mesh)||null,eye:()=>({...eye.snapshot(),scale:{linear:SCALE,dimensions:[w,h,d],halfExtents:half,massStone:5*Math.pow(SCALE,3),fixedStepSeconds:STEP},blast:{count:blastCount,last:lastBlast,maxDeltaV:maxBlastDeltaV,maxSpeedObserved,maxStepTravelRatio,warning:maxStepTravelRatio>1?'Per-step travel exceeded smallest brick diameter: possible tunneling':null},sleepTransitions:{total:sleepTransitions,lastStep:lastStepSleepTransitions},timing:{lastStepMs:solverMs,peakStepMs:solverPeakMs}}),inspect:()=>({name:'Strand mixed masonry rain',iceFinish:{active:frostBacklitIce.name,originalAvailable:originalIceFinishes.map(m=>m.color.getHexString()),frost:.33,backlight:.66,bubbles:false},scale:SCALE,dimensions:[w,h,d],count:bodies.length,materials:Object.fromEntries(Object.keys(materials).map(k=>[k,bodies.filter(b=>b.material===k).length])),awake:bodies.filter(b=>b.awake).length,
  terrainHits:contacts.stats.terrain,pairHits:contacts.stats.pairs,contactPoints:contacts.stats.contacts,
  candidatePairs:contacts.stats.candidates,steps,gravity:contacts.gravity,collision:'Arcana mixed-material contacts / fixed 120Hz / spatial bins'})};
}
