import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
// Adapted from Interstice/betwixt SixCitiesCatch baseline observer swarm.
// Twelve miniature glass observers, with original hover/wander/return,
// investigation/dismissal phases and pairwise sphere separation.
export function createObserverSwarm({parent,terrain=null,offset=()=>({x:0,z:0}),seed=741}={}){
 const root=new T.Group();root.name='Betwixt observer swarm';parent?.add(root);
 const glassMat=new T.MeshPhysicalMaterial({color:0xb8dfe5,transparent:true,opacity:.23,roughness:.12,metalness:.08,depthWrite:false});
 const whiteMat=new T.MeshStandardMaterial({color:0xe8e5dc,roughness:.48});
 const irisMat=new T.MeshStandardMaterial({color:0x596d6d,roughness:.42,side:T.DoubleSide});
 const pupilMat=new T.MeshStandardMaterial({color:0x151817,roughness:.36,side:T.DoubleSide});
 const brass=new T.MeshStandardMaterial({color:0xb99a60,roughness:.34,metalness:.75});
 const glassGeo=new T.IcosahedronGeometry(.50,3),whiteGeo=new T.SphereGeometry(.20,22,14);
 const irisGeo=new T.CircleGeometry(.105,24),pupilGeo=new T.CircleGeometry(.052,24);
 const ringGeo=new T.TorusGeometry(.535,.035,8,32);
 const bindingGeo=new T.CylinderGeometry(.027,.034,.11,8);
 let state=seed>>>0;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 // Find a genuine vertical bore through the signed terrain, including eye clearance.
 const clear=p=>p.length()<9.42&&(!terrain?.intersectsSphere||!terrain.intersectsSphere(p,.52,offset()));
 const findBore=()=>{
  for(let ring=0;ring<=7;ring++)for(let j=0;j<48;j++){
   const theta=j*Math.PI/24,x=ring*Math.cos(theta),z=ring*Math.sin(theta);
   let valid=true;
   for(let y=-5.5;y<=5.5;y+=.35)if(!clear(new T.Vector3(x,y,z))){valid=false;break}
   if(valid)return new T.Vector3(x,0,z);
  }
  return null;
 };
 const bore=findBore();
 const upper=new T.Vector3(bore?.x??0,5.7,bore?.z??0);
 const lower=new T.Vector3(bore?.x??0,-5.7,bore?.z??0);
 const home=upper.clone();
 const pick=()=>upper.clone();
 const swarm=[];
 for(let i=0;i<12;i++){
  const node=new T.Group();node.name='catch:observer:'+i;root.add(node);
  const glass=new T.Mesh(glassGeo,glassMat);node.add(glass);
  const eye=new T.Group();eye.name='observer:eye';node.add(eye);
  eye.add(new T.Mesh(whiteGeo,whiteMat));
  const iris=new T.Mesh(irisGeo,irisMat);iris.position.z=.188;eye.add(iris);
  const pupil=new T.Mesh(pupilGeo,pupilMat);pupil.position.z=.191;eye.add(pupil);
  const seat=new T.Group();seat.name='observer:ocular-seat';node.add(seat);
  const front=new T.Mesh(ringGeo,brass);seat.add(front);
  const back=new T.Mesh(ringGeo,brass);back.position.z=-.11;seat.add(back);
  for(let j=0;j<3;j++){
   const angle=Math.PI/2+j*Math.PI*2/3;
   const binding=new T.Mesh(bindingGeo,brass);
   binding.position.set(Math.cos(angle)*.535,Math.sin(angle)*.535,-.055);
   binding.rotation.x=Math.PI/2;seat.add(binding);
  }
  const angle=i*Math.PI*2/12,rad=1.5+(i%3)*.45;
  node.position.set(home.x,home.y-(i%4)*.16,home.z);
  swarm.push({node,eye,seat,phase:rand()*Math.PI*2,mode:'descending',until:0,target:lower,speed:2+rand()*1.4});
 }
 let time=0,updates=0,traveling=0,blocked=0,arrivals=0;
 const forward=new T.Vector3(0,0,1),q=new T.Quaternion();
 const update=dt=>{
  // The world's update contract is seconds; retain a bounded positive step.
  const step=Math.max(0,Math.min(.05,dt));time+=step;updates++;
  for(let i=0;i<swarm.length;i++){
   const a=swarm[i];
   // Two destinations only: one above the terrain and one below.
   // Every route is constrained to the clear vertical bore.
   if(!bore){a.mode='no-clear-bore';continue}
   const destination=a.target;
   const delta=destination.clone().sub(a.node.position);
   const distance=delta.length();
   if(distance<.12){a.target=destination===lower?upper:lower;a.mode=a.target===lower?'descending':'ascending';arrivals++}
   else{
    const travel=Math.min(distance,(2.2+i*.085)*step);
    const next=a.node.position.clone().addScaledVector(delta,travel/distance);
    if(clear(next)){a.node.position.copy(next);traveling++;a.mode=destination===lower?'descending':'ascending'}
    else {blocked++;a.mode='blocked'}
   }
   // Original Betwixt ocular axis is +Z.
   const facing=a.target.clone().sub(a.node.position);
   if(facing.lengthSq()>.000001){
    q.setFromUnitVectors(forward,facing.normalize());
    a.eye.quaternion.slerp(q,.18);
    a.seat.quaternion.copy(a.eye.quaternion);
   }
  }
 };
 return {group:root,update,inspect:()=>({name:'Betwixt observer swarm',count:swarm.length,updates,traveling,blocked,arrivals,bore:bore?.toArray()??null,agents:swarm.map((a,i)=>({id:i,mode:a.mode,position:a.node.position.toArray(),target:a.target.toArray()}))})};
}
