import {applyRadialImpulse} from '../physics/impulse.js';
import {stepGrounded} from '../locomotion/grounding.js';
// Lantern Hermits: asymmetric BB-shell collectors, terrain-supported walking.
export function createLanternHermits(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 if(typeof surface!=='function')throw Error('Lantern Hermits require surface(x,z)');
 const group=new T.Group();group.name='Lantern Hermits';parent?.add(group);
 const hash=n=>{const v=Math.sin(n*127.1+seed*31.71)*43758.5453;return v-Math.floor(v)};
 const agents=[],beads=[],palette=[0x917654,0xc4a47c,0xf0d19b,0x6e887f,0x443d46,0xe7b85d].map(v=>new T.Color(v));
 function bead(id,x,y,z,r,c,part=0,phase=0){beads.push({id,x,y,z,r,c,part,phase})}
 for(let i=0;i<4;i++){
  const a=i*2.399+5.1,d=2.6+i*.58,x=Math.cos(a)*d,z=Math.sin(a)*d,y=surface(x,z);
  if(y==null)continue;
  const id=agents.length,p={id,x,z,y,homeX:x,homeZ:z,heading:hash(i*9)*6.283,phase:hash(i*17)*6.283,timer:0,step:0,state:'search',gesture:0,speed:.095+hash(i*5)*.045};agents.push(p);
  // Compact asymmetrical body, each visible feature assembled from BBs.
  for(let s=0;s<8;s++){const lx=(s-3.5)*.075,profile=Math.sqrt(Math.max(.15,1-((s-3.5)/4.5)**2));
   for(let j=0;j<16;j++){const t=j*2*Math.PI/16;bead(id,lx,.20+Math.sin(t)*.12*profile,Math.cos(t)*.14*profile,.023+(j%5===0?.008:0),s%3===0?1:0)}
  }
  // Offset, luminous carried shell: hollow concentric BB rings, not a solid mesh.
  for(let ring=0;ring<9;ring++){const phi=(ring+.5)*Math.PI/10,rr=.25*Math.sin(phi),yy=.24+.25*Math.cos(phi);
   for(let j=0;j<22;j++){const a=j*2*Math.PI/22;bead(id,-.08+Math.cos(a)*rr,yy,.09+Math.sin(a)*rr,.021+(ring%3===0?.006:0),ring%3===0?5:ring%2?2:1,3)}
  }
  for(let j=0;j<28;j++){const a=j*2.399,rr=.025+.065*Math.sqrt(j/28);bead(id,-.08+Math.cos(a)*rr,.30+Math.sin(j*1.7)*.06,.09+Math.sin(a)*rr,.021,j%4===0?2:5,3)}
  // Four stepping legs, each two bead-chain links.
  for(const side of [-1,1])for(let leg=0;leg<2;leg++)for(let j=0;j<13;j++){const t=j/12;
   bead(id,(leg===0?.20:-.21)+t*(leg===0?.10:-.06),.20-.19*t,side*(.12+.20*t),.019,leg?3:0,1,(side===1?0:Math.PI)+leg*Math.PI+t*.3);
  }
  // Two grasping arms with jointed collecting gestures.
  for(const side of [-1,1])for(let j=0;j<13;j++){const t=j/12;
   bead(id,.22+.24*t,.25-.14*t,side*(.10+.10*t),.019,j===12?5:1,2,side*1.1+t);
  }
  for(const side of [-1,1])bead(id,.31,.30,side*.09,.041,4);
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.79,metalness:.035});
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
   const close=Math.hypot(actor.x-p.x,actor.z-p.z)<1.2;
   p.timer-=dt;
   if(close){p.state='observe';p.heading=Math.atan2(actor.z-p.z,actor.x-p.x)}
   else if(p.timer<=0){p.step++;p.timer=1.4+hash(p.id*29+p.step)*2.6;
    p.state=hash(p.id*37+p.step*7)>.58?'collect':'search';
    p.heading+=(hash(p.id*41+p.step*11)-.5)*1.8;
   }
   p.gesture+=((p.state==='collect'?1:0)-p.gesture)*Math.min(1,dt*3.2);
   if(p.state!=='search'){stepGrounded(p,dt,{surface,speed:0,radius:radius-1.1,homeRadius:2.3,stepHeight:.15,footprint:.22});continue;}
   stepGrounded(p,dt,{surface,speed:p.speed,radius:radius-1.1,homeRadius:2.3,stepHeight:.15,footprint:.22});

  }
  visible=0;
  for(const b of beads){
   const p=agents[b.id];if(p.destroyed)continue;const co=Math.cos(p.heading),si=Math.sin(p.heading);
   let x=b.x,y=b.y,z=b.z;
   if(b.part===1){const gait=p.state==='search'?Math.sin(elapsed*9+p.phase+b.phase)*.045:0;x+=gait;y+=Math.max(0,gait)*.65}
   if(b.part===2){const g=p.gesture;x+=g*.09;y+=g*.12+Math.sin(elapsed*3+b.phase+p.phase)*.014}
   if(b.part===3){y+=Math.sin(elapsed*2+p.phase)*.016;z+=Math.sin(elapsed*1.6+p.phase)*.012}
   const xx=p.x-ox+x*co-z*si,zz=p.z-oz+x*si+z*co,yy=p.y+y;
   if(xx*xx+yy*yy+zz*zz>(radius-.1)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r);dummy.updateMatrix();visibleOwners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,palette[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Lantern Hermits',creatures:agents.filter(p=>!p.destroyed).map(p=>({species:'lantern-hermit',x:+p.x.toFixed(2),z:+p.z.toFixed(2),state:p.state,gesture:+p.gesture.toFixed(2)})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(agents[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
