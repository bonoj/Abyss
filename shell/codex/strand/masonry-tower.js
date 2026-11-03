import {createMasonryGeometry} from './brick-rain.js';

// One architectural entity. Courses interlock; foundation stones reach the sampled terrain.
// Impact damage removes individual masonry cells without inventing a second physics solver.
export function createMasonryTower(T,{parent,surface,x=-2.7,z=0}){
 const root=new T.Group();root.name='Strand masonry tower';parent.add(root);
 const {geo,w,h,d}=createMasonryGeometry(T);
 const stone=[0xc9c3ad,0xb4b2a3,0xaaa99f,0xd2c8b0,0x979f9e].map(color=>new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));
 const nx=5,nz=5,courses=8,dx=w+.012,dz=d+.012,wallX=(nx-1)*dx/2,wallZ=(nz-1)*dz/2;
 const blocks=[],footings=[],foundationMaterial=stone[1];
 let placement={status:'unplaced'},lastImpact=null,impacts=0,removed=0;
 const add=(px,py,pz,k,kind='wall')=>{
  const mesh=new T.Mesh(geo,stone[Math.abs((Math.round(px*17)+Math.round(pz*23)+k*11))%stone.length]);
  mesh.position.set(px,py,pz);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.towerBrick=true;
  root.add(mesh);const b={mesh,kind,alive:true};blocks.push(b);return b;
 };
 // Half-course offset along the run, with half-length end closures to avoid aligned seams.
 // Bricks on each side form a staggered running bond; corners alternate which wall owns them.
 for(let k=0;k<courses;k++){
  const odd=k%2===1;
  for(const side of [-1,1]){
   const z=side*wallZ;
   for(let i=0;i<=nx;i++){
    const cx=-wallX+(i-.5)*dx+(odd?dx/2:0);
    if(Math.abs(cx)>wallX+w*.45)continue;
    if(side===1&&Math.abs(cx)<w*.43&&k<4)continue;
    if(k===courses-1&&i%2===1)continue;
    const b=add(cx,(k+.5)*h,z,k);
    // End bricks are shortened visually at the boundary, retaining original material geometry.
    const over=Math.abs(cx)+w/2-wallX-w/2;
    if(over>0.001){b.mesh.scale.x=Math.max(.45,1-over/w);}
   }
  }
  for(const side of [-1,1]){
   const xx=side*wallX;
   for(let j=1;j<nz-1;j++){
    const cz=-wallZ+j*dz+(odd?dz/2:0);
    if(cz>wallZ+d*.45)continue;
    if(k===courses-1&&j%2===0)continue;
    add(xx,(k+.5)*h,cz,k);
   }
  }
 }
 // Sample each wall-bearing footprint location, not the empty tower interior.
 const probes=[];
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  if(i===0||i===nx-1||j===0||j===nz-1)
   probes.push({x:(i-(nx-1)/2)*dx,z:(j-(nz-1)/2)*dz});
 }
 // Foundation is a set of vertical stone piers whose bottoms meet the ground.
 // It stays part of the single tower entity; it is not a dynamic terrain collider.
 const footingGeo=new T.BoxGeometry(dx*.88,1,dz*.88);
 for(const p of probes){
  const m=new T.Mesh(footingGeo,foundationMaterial);
  m.castShadow=true;m.receiveShadow=true;m.userData.towerBrick=true;root.add(m);
  const b={mesh:m,kind:'footing',alive:true,probe:p};footings.push(b);blocks.push(b);
 }
 function place(px=x,pz=z){
  const samples=probes.map(p=>({...p,y:surface(px+p.x,pz+p.z)}));
  const valid=samples.filter(p=>Number.isFinite(p.y));
  if(!valid.length){placement={status:'no-terrain',validProbes:0};return placement;}
  const maxY=Math.max(...valid.map(p=>p.y)),minY=Math.min(...valid.map(p=>p.y));
  // Level wall base above highest terrain. Piers fill the difference to lower samples.
  const base=maxY+.07;
  root.position.set(px,base,pz);
  let supported=0,unsupported=0;
  for(let i=0;i<footings.length;i++){
   const b=footings[i],sample=samples[i];
   if(!b.alive)continue;
   if(!Number.isFinite(sample.y)){b.mesh.visible=false;unsupported++;continue;}
   const depth=Math.max(.07,base-sample.y);
   b.mesh.visible=true;b.mesh.scale.set(1,depth,1);
   b.mesh.position.set(b.probe.x,-depth/2,b.probe.z);
   supported++;
  }
  placement={status:unsupported?'partial-terrain':'supported-by-footings',origin:[px,base,pz],
   validProbes:valid.length,probeCount:probes.length,footings:supported,missing:unsupported,
   maxFoundationDepth:+(base-minY).toFixed(3),level:true,
   note:'Level kinematic masonry with terrain-fitted stone piers; no dynamic stability proof'};
  return placement;
 }
 function receiveBlast(event){
  const p=new T.Vector3(event.point.x,event.point.y,event.point.z);
  const radius=Math.max(.45,Math.min(1.5,.55+(event.magnitude||1)*.24));
  let broken=0;
  for(const b of blocks){
   if(!b.alive||!b.mesh.visible)continue;
   b.mesh.getWorldPosition(tmp);
   if(tmp.distanceTo(p)>radius)continue;
   b.alive=false;b.mesh.visible=false;broken++;removed++;
  }
  impacts++;lastImpact={point:event.point,radius,broken,totalRemoved:removed};
  return broken;
 }
 const tmp=new T.Vector3();
 const pickables=()=>blocks.filter(b=>b.alive&&b.mesh.visible).map(b=>b.mesh);
 const owns=mesh=>blocks.some(b=>b.mesh===mesh&&b.alive);
 // Re-query after excavation without moving the entire structure upward:
 // existing footings can extend to lower ground, but missing terrain is reported.
 function refreshSupport(){
  const px=root.position.x,pz=root.position.z,base=root.position.y;
  let supported=0,missing=0,maxDepth=0;
  for(const b of footings){
   if(!b.alive)continue;
   const y=surface(px+b.probe.x,pz+b.probe.z);
   if(!Number.isFinite(y)){b.mesh.visible=false;missing++;continue;}
   const depth=base-y;
   if(depth<=0){b.mesh.visible=false;missing++;continue;}
   b.mesh.visible=true;b.mesh.scale.y=depth;b.mesh.position.y=-depth/2;
   supported++;maxDepth=Math.max(maxDepth,depth);
  }
  placement={...placement,status:missing?'support-compromised':'supported-by-footings',
   footings:supported,missing,maxFoundationDepth:+maxDepth.toFixed(3)};
 }
 place(x,z);
 return {group:root,place,refreshSupport,receiveBlast,pickables,owns,
  inspect:()=>({name:'Strand masonry tower',entity:'intact kinematic assembly',
   bricks:blocks.filter(b=>b.alive).length,removed,impacts,lastImpact,placement})};
}
