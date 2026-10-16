import {applyRadialImpulse} from '../physics/impulse.js';
import {stepGrounded} from '../locomotion/grounding.js';
// BB-only Velvet Drifters: peristaltic bodies, tendrils and bounded geological locomotion.
export function createVelvetDrifters(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 const group=new T.Group();group.name='Velvet Drifters';parent?.add(group);
 const hash=n=>{const x=Math.sin(n*127.1+seed*17.3)*43758.5453;return x-Math.floor(x)};
 const agents=[],beads=[],colors=[0x805ca8,0xb37bc5,0xd99bd4,0x4b456f,0xe3d1ac].map(c=>new T.Color(c));
 function bead(id,x,y,z,r,c,segment,kind=0,phase=0){beads.push({id,x,y,z,r,c,segment,kind,phase})}
 for(let i=0;i<4;i++){
  const angle=i*2.399+2.1,distance=3.3+(i%2)*.8,x=Math.cos(angle)*distance,z=Math.sin(angle)*distance,y=surface(x,z);
  if(y==null)continue;
  const id=agents.length,p={id,x,z,y,homeX:x,homeZ:z,heading:hash(i*13)*Math.PI*2,phase:hash(i*17)*6.283,step:0,timer:0,state:'forage',speed:.095+hash(i*7)*.045};agents.push(p);
  // Elongated, tapering BB hull; 17 anatomical sections, no solid body mesh.
  for(let s=0;s<17;s++){const t=s/16,profile=Math.pow(Math.sin(Math.PI*(.04+.92*t)),.8),width=.17*profile;
   for(let j=0;j<16;j++){const a=j*Math.PI*2/16;
    bead(id,(t-.5)*1.15,.19+Math.sin(a)*.13*profile,Math.cos(a)*width,.023+(j%7===0?.01:0),j%5===0?2:s%3===0?1:0,s);
   }
   if(s%3===0)for(const side of [-1,1])for(let j=0;j<9;j++){const u=j/8;
    bead(id,(t-.5)*1.15-.08*u,.23+u*.12,side*(width+.08*u),.018+(j===8?.012:0),j===8?2:1,s,1,side*1.2+u*2);
   }
  }
  for(const side of [-1,1])bead(id,.57,.28,side*.09,.045,4,16,2);
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.85});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const visibleOwners=[];const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastScale=new T.Vector3(),blastRotation=new T.Quaternion(),blastColor=new T.Color();
 const d=new T.Object3D();let time=0,visible=0;
 function blast(point,options,debris){
  let hits=0;const destroyed=new Set();
  for(const p of agents){
   if(p.destroyed)continue;
   if(Math.hypot(p.x-point.x,p.y+.2-point.y,p.z-point.z)<options.radius){p.destroyed=true;destroyed.add(p.id);hits++;}
  }
  if(!hits)return 0;
  const {x:ox=0,z:oz=0}=offset(),items=[];
  for(let i=0;i<mesh.count;i++){
   if(!destroyed.has(visibleOwners[i]))continue;
   mesh.getMatrixAt(i,blastMatrix);blastMatrix.decompose(blastPosition,blastRotation,blastScale);mesh.getColorAt(i,blastColor);
   items.push({x:blastPosition.x+ox,y:blastPosition.y,z:blastPosition.z+oz,r:blastScale.x,color:blastColor.clone()});
  }
  const seen=new Map();for(let i=0;i<mesh.count;i++){const id=visibleOwners[i];if(destroyed.has(id))seen.set(id,(seen.get(id)||0)+1);}
  const required=new Map();for(const b of beads)if(destroyed.has(b.id))required.set(b.id,(required.get(b.id)||0)+1);
  for(const [id,total] of required){const p=agents[id],missing=total-(seen.get(id)||0);if(missing<=0)continue;const hidden=beads.filter(b=>b.id===id);
   for(let j=0;j<missing;j++){const b=hidden[j%hidden.length],co=Math.cos(p.heading),si=Math.sin(p.heading);items.push({x:p.x+b.x*co-b.z*si,y:p.y+b.y,z:p.z+b.x*si+b.z*co,r:b.r,color:(colors[b.c]).clone()});}
  }
  debris.emit(items,point,options.impulse);
  return hits;
 }
 function update(dt){dt=Math.max(0,Math.min(.1,dt));time+=dt;const actor=wanderer(),{x:ox=0,z:oz=0}=offset();
  for(const p of agents){
   if(p.destroyed)continue;
   const near=Math.hypot(actor.x-p.x,actor.z-p.z)<1.4;p.state=near?'avoid':'forage';
   if(near){p.heading=Math.atan2(p.z-actor.z,p.x-actor.x);p.speed=.16}else p.speed=.105;
   p.timer-=dt;if(p.timer<=0&&!near){p.timer=1.8+hash(p.id*29+p.step++)*2.4;p.heading+=(hash(p.id*41+p.step*3)-.5)*1.6}
  stepGrounded(p,dt,{surface,speed:p.speed,radius:radius-1.2,homeRadius:2.4,stepHeight:.12,footprint:.24});

  }
  visible=0;
  for(const b of beads){const p=agents[b.id];if(p.destroyed)continue;const wave=Math.sin(time*6+p.phase-b.segment*.65),twist=Math.sin(time*2.2+p.phase-b.segment*.25),co=Math.cos(p.heading),si=Math.sin(p.heading);
   const x=b.x+Math.sin(time*2+p.phase-b.segment*.38)*.035*(1-b.segment/20);
   const zz=b.z+Math.sin(time*2.7+p.phase-b.segment*.4)*.043+(b.kind===1?twist*.035:0);
   const y=b.y+wave*.028+(b.kind===1?Math.sin(time*3+b.phase+p.phase)*.06:0);
   const xx=p.x-ox+x*co-zz*si,worldZ=p.z-oz+x*si+zz*co,worldY=p.y+y;
   if(xx*xx+worldY*worldY+worldZ*worldZ>(radius-.12)**2)continue;
   d.position.set(xx,worldY,worldZ);d.scale.setScalar(b.r*(1+wave*.08));d.updateMatrix();visibleOwners[visible]=b.id;mesh.setMatrixAt(visible,d.matrix);mesh.setColorAt(visible,colors[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Velvet Drifters',creatures:agents.filter(p=>!p.destroyed).map(p=>({species:'velvet-drifter',x:+p.x.toFixed(2),z:+p.z.toFixed(2),state:p.state})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(agents[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
