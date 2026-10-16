import {applyRadialImpulse} from '../physics/impulse.js';
import {stepGrounded} from '../locomotion/grounding.js';
// First Bestiary foundation: deterministic, terrain-supported BB Pebblebacks.
// No independent mesh per bead; all anatomy is composed in one InstancedMesh.
export function createFirstBestiary(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 if(typeof surface!=='function')throw Error('Bestiary requires surface(x,z)');
 const group=new T.Group();group.name='First Bestiary';parent?.add(group);
 const rnd=n=>{const v=Math.sin(n*127.1+seed*19.71)*43758.5453;return v-Math.floor(v)};
 const creatures=[],beads=[],palette=[0x9a593a,0xd39b58,0xe5cda1,0x453e46,0x6f8b7b].map(v=>new T.Color(v));
 function add(id,x,y,z,r,c,part=0,phase=0){beads.push({id,x,y,z,r,c,part,phase})}
 for(let i=0;i<6;i++){
  const a=i*2.399+1.3,rr=2.2+(i%3)*.65,x=Math.cos(a)*rr,z=Math.sin(a)*rr,y=surface(x,z);
  if(y==null)continue;
  const id=creatures.length,p={id,x,z,y,homeX:x,homeZ:z,heading:rnd(i*3)*6.28,phase:rnd(i*9)*6.28,state:'explore',timer:0,curl:0,speed:.12+rnd(i*7)*.06,steps:0};creatures.push(p);
  // Seven armored cross-sections, bead texture over an oval body.
  for(let seg=0;seg<7;seg++){const longitudinal=(seg-3)*.115,width=.22*Math.sqrt(Math.max(.12,1-((seg-3)/4)**2));
   for(let j=0;j<22;j++){const t=j*Math.PI*2/22;
    add(id,longitudinal,.24+Math.sin(t)*.14,Math.cos(t)*width,.027+(j%5===0?.009:0),j%4===0?2:seg%2,0,seg*.4)
   }
  }
  // Six jointed legs, two BB chains each; each leg follows its own gait phase.
  for(let side of [-1,1])for(let leg=0;leg<3;leg++){
   for(let j=0;j<13;j++){const t=j/12;
    add(id,(leg-1)*.23+(t>.5?(t-.5)*.13:0),.21-.19*t,side*(.16+.20*t),.022,leg%2?1:0,1,leg*Math.PI+ (side===1?0:Math.PI)+t*.4);
   }
  }
  for(let side of [-1,1]){for(let j=0;j<7;j++)add(id,.39+j*.033,.24+j*.025,side*(.07+j*.012),.019,2,2,j*.2);
   add(id,.36,.29,side*.105,.048,3,0);
  }
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.83,metalness:.02});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const visibleOwners=[];const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastScale=new T.Vector3(),blastRotation=new T.Quaternion(),blastColor=new T.Color();
 const dummy=new T.Object3D();let elapsed=0,visible=0;
 function blast(point,options,debris){
  let hits=0;const destroyed=new Set();
  for(const p of creatures){
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
  if(!debris.canAccept(items.length)){for(const p of creatures)if(destroyed.has(p.id))p.destroyed=false;return 0;}
  const seen=new Map();for(let i=0;i<mesh.count;i++){const id=visibleOwners[i];if(destroyed.has(id))seen.set(id,(seen.get(id)||0)+1);}
  const required=new Map();for(const b of beads)if(destroyed.has(b.id))required.set(b.id,(required.get(b.id)||0)+1);
  for(const [id,total] of required){const p=creatures[id],missing=total-(seen.get(id)||0);if(missing<=0)continue;const hidden=beads.filter(b=>b.id===id);
   for(let j=0;j<missing;j++){const b=hidden[j%hidden.length],co=Math.cos(p.heading),si=Math.sin(p.heading);items.push({x:p.x+b.x*co-b.z*si,y:p.y+b.y,z:p.z+b.x*si+b.z*co,r:b.r,color:(palette[b.c]).clone()});}
  }
  debris.emit(items,point,options.impulse);
  return hits;
 }
 function update(dt){
  dt=Math.max(0,Math.min(.1,dt));elapsed+=dt;
  const actor=wanderer(),{x:ox=0,z:oz=0}=offset();
  for(const p of creatures){
   if(p.destroyed)continue;
   const near=Math.hypot(actor.x-p.x,actor.z-p.z)<1.05;
   p.state=near?'curl':'explore';
   p.curl+=( (near?1:0)-p.curl)*Math.min(1,dt*(near?5:2.2));
   if(near){stepGrounded(p,dt,{surface,radius:radius-1.1,homeRadius:2.2,stepHeight:.18,footprint:.20,speed:0});continue;}
   p.timer-=dt;if(p.timer<=0){p.timer=1.3+rnd(p.id*31+p.steps++)*2.3;p.heading+=(rnd(p.id*13+p.steps*3)-.5)*1.8}
  stepGrounded(p,dt,{surface,speed:p.speed,radius:radius-1.1,homeRadius:2.2,stepHeight:.18,footprint:.20});

  }
  visible=0;
  for(const b of beads){const p=creatures[b.id];if(p.destroyed)continue;const co=Math.cos(p.heading),si=Math.sin(p.heading),curl=p.curl;
   let x=b.x,y=b.y,z=b.z;
   if(b.part===1){const gait=Math.sin(elapsed*9+p.phase+b.phase)*.055*(1-curl);x+=gait;y+=Math.max(0,gait)*.6}
   if(b.part===2){y+=Math.sin(elapsed*3+p.phase+b.phase)*.016}
   x=x*(1-.5*curl);y=.17+(y-.17)*(1-.65*curl);z=z*(1-.35*curl);
   const xx=p.x-ox+x*co-z*si,zz=p.z-oz+x*si+z*co,yy=p.y+y+Math.sin(elapsed*8+p.phase)*.008*(1-curl);
   if(xx*xx+yy*yy+zz*zz>(radius-.1)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r);dummy.updateMatrix();visibleOwners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,palette[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'First Bestiary — Pebbleback trial',creatures:creatures.filter(p=>!p.destroyed).map(p=>({species:'pebbleback',x:+p.x.toFixed(2),z:+p.z.toFixed(2),state:p.state,curl:+p.curl.toFixed(2)})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(creatures[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
