// Extracted from examples/wanderer-separated/world.js (Mists Reeds, gallery index 0).
// Independent population: no DOM, global world state, or gallery dependencies.
export function createMistsReeds(T,{surface,center={x:-2,z:-1},offset=()=>({x:0,z:0}),characters=()=>[],radius=9.92,parent=null}={}){
 if(typeof surface!=='function')throw Error('Mists Reeds requires surface(x,z)');
 const seed=n=>{const v=Math.sin(n*127.1+41.7)*43758.5453;return v-Math.floor(v)};
 const stems=[];
 for(let k=0;k<76;k++){
  const angle=seed(k*3+1)*Math.PI*2,r=.55+Math.sqrt(seed(k*3+2))*2.2;
  const x=center.x+Math.cos(angle)*r,z=center.z+Math.sin(angle)*r;
  if(x>center.x+1.2&&z<center.z+.35)continue;
  const ground=surface(x,z);if(ground==null)continue;
  stems.push({x,z,ground,height:.42+seed(k*5+3)*.95,lean:(seed(k*7+4)-.5)*.18,phase:seed(k*11+5)*6.28,growth:0});
 }
 const geometry=new T.IcosahedronGeometry(.048,0);
 const material=new T.MeshStandardMaterial({vertexColors:false,roughness:.88});
 const mesh=new T.InstancedMesh(geometry,material,8000);
 mesh.count=0;mesh.frustumCulled=false;
 const group=new T.Group();group.name='Mists Reeds';group.add(mesh);if(parent)parent.add(group);
 const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastRotation=new T.Quaternion(),blastScale=new T.Vector3(),blastColor=new T.Color(),visibleOwners=[];
 const dummy=new T.Object3D();
 const palette=[0x537f70,0x779c87,0xa7a884,0xd3b68c].map(c=>new T.Color(c));
 const beads=[];
 for(let k=0;k<stems.length;k++){
  const st=stems[k],count=5+Math.floor(st.height*6);
  for(let j=0;j<count;j++){
   const t=j/(count-1);
   let side=0;
   if(k%3===0&&j>=Math.floor(count*.45)&&j<count-1)side=(j%2?1:-1)*.14;
   beads.push({stem:k,t,side,depth:0,height:t,head:j>=count-2});
  }
 }
 let time=0,visible=0;
 function blast(point,options,debris){
  const affected=new Set();
  for(let i=0;i<mesh.count;i++){
   mesh.getMatrixAt(i,blastMatrix);blastMatrix.decompose(blastPosition,blastRotation,blastScale);
   const o=offset(),dx=blastPosition.x+o.x-point.x,dy=blastPosition.y-point.y,dz=blastPosition.z+o.z-point.z;
   if(dx*dx+dy*dy+dz*dz<=options.radius*options.radius)affected.add(visibleOwners[i]);
  }
  if(!affected.size)return 0;
  const items=[];
  for(let i=0;i<mesh.count;i++){
   if(!affected.has(visibleOwners[i]))continue;
   mesh.getMatrixAt(i,blastMatrix);blastMatrix.decompose(blastPosition,blastRotation,blastScale);mesh.getColorAt(i,blastColor);
   const o=offset();items.push({x:blastPosition.x+o.x,y:blastPosition.y,z:blastPosition.z+o.z,r:blastScale.x*0.048,color:blastColor.clone()});
  }
  if(!debris.canAccept(items.length))return 0;
  // Every authored BB transfers exactly once, including clipped or retracted anatomy.
  const seen=new Map();for(let i=0;i<mesh.count;i++){const id=visibleOwners[i];if(affected.has(id))seen.set(id,(seen.get(id)||0)+1);}
  const required=new Map();for(const b of beads)if(affected.has(b.stem))required.set(b.stem,(required.get(b.stem)||0)+1);
  for(const [id,total] of required){const p=stems[id],missing=total-(seen.get(id)||0);if(missing<=0)continue;
   const hidden=beads.filter(b=>b.stem===id);for(let j=0;j<missing;j++){const b=hidden[j%hidden.length];items.push({x:p.x+(b.x||0),y:p.ground+p.height*b.height,z:p.z+(b.z||0),r:0.048,color:(palette[b.head?3:(b.stem%2)]).clone()});}
  }
  const emitted=debris.emit(items,point,options.impulse);
  for(const id of affected)stems[id].destroyed=true;
  return emitted;
 }
 function update(dt){
  time+=dt;
  const {x:ox=0,z:oz=0}=offset();
  const occupants=characters();
  for(const st of stems){if(st.destroyed)continue;
   const px=st.x-ox,pz=st.z-oz,height=st.height;
   const rimClear=radius-.16-Math.sqrt(px*px+pz*pz+Math.max(0,st.ground+height)**2);
   const threshold=.12+(Math.sin(st.x*3.7+st.z*2.9)+1)*.11;
   const occupied=occupants.some(c=>Math.hypot(st.x-c.x,st.z-c.z)<.55);
   const target=!occupied?T.MathUtils.smoothstep(rimClear,-.08,threshold+.42):0;
   st.growth+=(target-st.growth)*Math.min(1,dt*(target>st.growth?3.6:7.5));
  }
  visible=0;
  for(const b of beads){
   const st=stems[b.stem];if(st.destroyed)continue;const t=b.t;
   if(st.growth<.025||t>st.growth)continue;
   const wave=Math.sin(time*1.15+st.phase)*.09*t*t;
   const x=st.x-ox+st.lean*t+wave+b.side;
   const y=st.ground+st.height*b.height;
   const z=st.z-oz+Math.cos(time*1.3+st.phase)*.075*t*t;
   if(x*x+y*y+z*z>(radius-.08)**2)continue;
   dummy.position.set(x,y,z);
   dummy.scale.setScalar((b.head?1.38:(t<.2?.75:1))*Math.min(1,st.growth*9));
   dummy.updateMatrix();
   visibleOwners[visible]=b.stem;mesh.setMatrixAt(visible,dummy.matrix);
   mesh.setColorAt(visible,palette[b.head?3:(b.stem%2)]);
   visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,mesh,update,blast,inspect:()=>({name:'Mists Reeds',stems:stems.length,beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(stems[b.stem].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geometry.dispose();material.dispose()}};
}
