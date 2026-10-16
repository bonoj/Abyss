import {solveTwoBone} from './two-bone-ik.js';
// Visual IK trial, driven by the existing Wanderer's authoritative position.
// No navigation or force ownership. Two alternating planted feet and terrain targets.
export function createArticulatedTrial(T,{parent,surface,actor,offset}){
 const group=new T.Group();group.name='Articulated Wanderer trial';parent.add(group);
 const material=new T.MeshStandardMaterial({color:0xd8b681,roughness:.64,metalness:.22});
 const jointMaterial=new T.MeshStandardMaterial({color:0x5d9caa,roughness:.48,metalness:.4});
 const geometry=new T.SphereGeometry(1,10,8),linkGeometry=new T.CylinderGeometry(1,1,1,8);
 const torso=new T.Mesh(geometry,material);group.add(torso);
 const legs=[-1,1].map(side=>{
  const links=[0,1].map(()=>{const mesh=new T.Mesh(linkGeometry,material);group.add(mesh);return mesh});
  const joints=[0,1].map(()=>{const mesh=new T.Mesh(geometry,jointMaterial);mesh.scale.setScalar(.055);group.add(mesh);return mesh});
  return {side,links,joints,foot:null,phase:side<0?0:Math.PI,error:0,planted:false};
 });
 const axis=new T.Vector3(0,1,0),a=new T.Vector3(),b=new T.Vector3(),mid=new T.Vector3();
 const setLink=(mesh,start,end,radius)=>{a.set(start.x,start.y,start.z);b.set(end.x,end.y,end.z);mid.copy(a).add(b).multiplyScalar(.5);mesh.position.copy(mid);mesh.scale.set(radius,a.distanceTo(b),radius);mesh.quaternion.setFromUnitVectors(axis,b.sub(a).normalize())};
 let previous=null,heading=0,elapsed=0;
 function update(dt){
  const p=actor(),o=offset(),step=Math.min(.05,Math.max(0,dt));elapsed+=step;
  if(previous){const dx=p.x-previous.x,dz=p.z-previous.z;if(Math.hypot(dx,dz)>.001)heading=Math.atan2(dz,dx)}
  const moving=!!p.target||p.travelSpeed>.05;
  const forward={x:Math.cos(heading),z:Math.sin(heading)},lateral={x:-forward.z,z:forward.x};
  const body={x:p.x-o.x,y:p.centerY,z:p.z-o.z};
  torso.position.set(body.x,body.y,body.z);torso.scale.set(.23,.18,.30);
  for(const leg of legs){
   const root={x:body.x+lateral.x*leg.side*.16,y:body.y-.08,z:body.z+lateral.z*leg.side*.16};
   const phase=elapsed*7+leg.phase;
   const stride=moving?Math.sin(phase)*.25:0;
   const lift=moving?Math.max(0,Math.cos(phase))*.16:0;
   const tx=p.x+lateral.x*leg.side*.25+forward.x*stride;
   const tz=p.z+lateral.z*leg.side*.25+forward.z*stride;
   const ground=surface(tx,tz);
   const target={x:tx-o.x,y:(ground??p.y)+.04+lift,z:tz-o.z};
   const pole={x:lateral.x*leg.side*.7-forward.x*.15,y:.12,z:lateral.z*leg.side*.7-forward.z*.15};
   const solution=solveTwoBone(root,target,{upper:.48,lower:.48,pole});
   setLink(leg.links[0],solution.root,solution.joint,.044);
   setLink(leg.links[1],solution.joint,solution.end,.035);
   leg.joints[0].position.set(solution.joint.x,solution.joint.y,solution.joint.z);
   leg.joints[1].position.set(solution.end.x,solution.end.y,solution.end.z);
   leg.error=solution.error;leg.planted=ground!=null&&lift<.015;
  }
  previous={x:p.x,z:p.z};
 }
 return {group,update,inspect:()=>({name:'articulated IK trial',mode:'visual follower; locomotion still owned by Wanderer',legs:legs.map(l=>({side:l.side,error:+l.error.toFixed(4),contactCandidate:l.planted}))})};
}
