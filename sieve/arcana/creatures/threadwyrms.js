import {applyRadialImpulse} from '../physics/impulse.js';
import {stepGrounded} from '../locomotion/grounding.js';
// Threadwyrms: BB-only articulated chains, terrain-supported undulation and existing-hole avoidance.
export function createThreadwyrms(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 if(typeof surface!=='function')throw Error('Threadwyrms require surface(x,z)');
 const group=new T.Group();group.name='Threadwyrms';parent?.add(group);
 const rnd=n=>{const v=Math.sin(n*127.1+seed*21.3)*43758.5453;return v-Math.floor(v)};
 const agents=[],beads=[],palette=[0x648e8b,0x83b5a1,0xc0ba86,0x4d6170,0xd5a36e].map(c=>new T.Color(c));
 function bead(id,seg,x,y,z,r,c,part=0){beads.push({id,seg,x,y,z,r,c,part})}
 for(let i=0;i<3;i++){
  const a=i*2.399+4.2,rr=3.2+i*.45,x=Math.cos(a)*rr,z=Math.sin(a)*rr,y=surface(x,z);
  if(y==null)continue;
  const id=agents.length,p={id,x,z,y,homeX:x,homeZ:z,heading:rnd(i*3)*6.283,phase:rnd(i*11)*6.283,state:'explore',timer:0,step:0,speed:.10+rnd(i*7)*.04,trail:[]};agents.push(p);
  for(let s=0;s<24;s++){
   const taper=.52+.48*Math.sin(Math.PI*(s+.5)/24);
   for(let j=0;j<11;j++){const theta=j*2*Math.PI/11;bead(id,s,0,Math.sin(theta)*.09*taper,Math.cos(theta)*.09*taper,.025+(j%5===0?.008:0),j%4===0?2:s%2,0)}
   for(const side of [-1,1])for(let j=0;j<6;j++){const t=j/5;bead(id,s,-.015*t,-.025-.08*t,side*(.07+.14*t),.017,side===1?1:3,1)}
  }
  for(const side of [-1,1])bead(id,0,.055,.04,side*.065,.044,4,2);
  // All trailing segments start at the same supported root, then follow recorded motion.
  for(let s=0;s<24;s++)p.trail.push({x,z,y,heading:p.heading});
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.84});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const visibleOwners=[];const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastScale=new T.Vector3(),blastRotation=new T.Quaternion(),blastColor=new T.Color();
 const dummy=new T.Object3D();let elapsed=0,visible=0;
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
   for(let j=0;j<missing;j++){const b=hidden[j%hidden.length],co=Math.cos(p.heading),si=Math.sin(p.heading);items.push({x:p.x+b.x*co-b.z*si,y:p.y+b.y,z:p.z+b.x*si+b.z*co,r:b.r,color:(palette[b.c]).clone()});}
  }
  debris.emit(items,point,options.impulse);
  return hits;
 }
 function update(dt){
  dt=Math.max(0,Math.min(.1,dt));elapsed+=dt;const actor=wanderer(),{x:ox=0,z:oz=0}=offset();
  for(const p of agents){
   if(p.destroyed)continue;
   const near=Math.hypot(actor.x-p.x,actor.z-p.z)<1.1;p.state=near?'avoid':'explore';
   if(near)p.heading=Math.atan2(p.z-actor.z,p.x-actor.x);
   p.timer-=dt;if(p.timer<=0&&!near){p.timer=1.4+rnd(p.id*37+p.step++)*2.1;p.heading+=(rnd(p.id*53+p.step*7)-.5)*1.5}
   stepGrounded(p,dt,{surface,speed:p.speed*(near?1.5:1),radius:radius-1,homeRadius:2.5,stepHeight:.13,footprint:.12});
   p.trail.unshift({x:p.x,z:p.z,y:p.y,heading:p.heading});
   if(p.trail.length>240)p.trail.pop();
  }
  visible=0;
  for(const b of beads){
   const p=agents[b.id];if(p.destroyed)continue;const lag=Math.min(p.trail.length-1,b.seg*7),t=p.trail[lag],wave=Math.sin(elapsed*5+p.phase-b.seg*.6);
   const heading=t.heading,co=Math.cos(heading),si=Math.sin(heading);
   const localX=b.x,localZ=b.z+Math.sin(elapsed*3+p.phase-b.seg*.45)*.028,localY=b.y+.12+Math.sin(elapsed*6+p.phase-b.seg*.7)*.018;
   const xx=t.x-ox+localX*co-localZ*si,zz=t.z-oz+localX*si+localZ*co,yy=t.y+localY+(b.part===1?Math.max(0,wave)*.022:0);
   if(xx*xx+yy*yy+zz*zz>(radius-.12)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r);dummy.updateMatrix();visibleOwners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,palette[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Threadwyrms',creatures:agents.filter(p=>!p.destroyed).map(p=>({species:'threadwyrm',x:+p.x.toFixed(2),z:+p.z.toFixed(2),state:p.state,trail:p.trail.length})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(agents[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
