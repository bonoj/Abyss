// Reversible BB-only botanical grammar. Geological roots, no non-spherical plant meshes.
export function createBBGarden(T,{surface,offset=()=>({x:0,z:0}),characters=()=>[],parent=null,radius=9.72,seed=741}={}){
 if(typeof surface!=='function')throw Error('BB garden requires geological surface(x,z)');
 const group=new T.Group();group.name='BB botanical garden';if(parent)parent.add(group);
 const rand=n=>{const v=Math.sin(n*127.1+seed*311.7)*43758.5453;return v-Math.floor(v)};
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const species=[
  {name:'amethyst-parasols',center:[-3.1,3.4],count:7,palette:[0xb49dc7,0x9275b0,0xcdb6d8],reach:.72},
  {name:'amber-gourds',center:[-3.6,-1.6],count:6,palette:[0xd58b40,0xf1b45c,0x8eaa77],reach:.75},
  {name:'crown-lanterns',center:[4.3,3.4],count:6,palette:[0x658d7a,0xe7b85f,0xffd88a],reach:.8},
  {name:'chalice-succulents',center:[3.3,-.5],count:7,palette:[0x86a78a,0xb5c4a1,0xd3ca9b],reach:.65},
  {name:'ruby-pendants',center:[4,-3],count:7,palette:[0x60515e,0xbb4569,0xe37692],reach:.72}
 ];
 // Descriptor: local position, radius, palette index, growth order, deformation weights.
 const plants=[],descriptors=[];
 function add(plant,x,y,z,r,color,rank,tip=0,phase=0){
  descriptors.push({plant:plant.id,x,y,z,r,color,rank:clamp(rank),tip,phase});
 }
 function chain(p,points,n,r,color,start,end){
  for(let i=0;i<n;i++){const t=n===1?0:i/(n-1),a=t*(points.length-1),j=Math.min(points.length-2,Math.floor(a)),u=a-j,A=points[j],B=points[j+1];add(p,A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u,A[2]+(B[2]-A[2])*u,r*(.85+.3*rand(p.id*400+i)),color,start+(end-start)*t,t,i*.3)}
 }
 function clump(p,c,rx,ry,rz,n,color,start,end,r=.045){
  for(let i=0;i<n;i++){const a=i*2.399963,yy=1-2*(i+.5)/n,rr=Math.sqrt(Math.max(0,1-yy*yy)),x=Math.cos(a)*rr,z=Math.sin(a)*rr;
   add(p,c[0]+x*rx,c[1]+yy*ry,c[2]+z*rz,r*(.8+.45*rand(p.id*1800+i)),typeof color==='function'?color(i):color,start+(end-start)*((i+.5)/n),.15,i*.13)}
 }
 function ring(p,c,rx,rz,n,color,start,end,r=.045){
  for(let i=0;i<n;i++){const a=i*2*Math.PI/n;add(p,c[0]+Math.cos(a)*rx,c[1]+Math.sin(a*3)*.03,c[2]+Math.sin(a)*rz,r,color,start+(end-start)*i/n,.6,a)}
 }
 for(let s=0;s<species.length;s++){
  const spec=species[s];for(let i=0;i<spec.count;i++){
   const id=plants.length,a=rand(id*7+1)*Math.PI*2,rr=Math.sqrt(rand(id*7+2))*1.1,x=spec.center[0]+Math.cos(a)*rr,z=spec.center[1]+Math.sin(a)*rr,y=surface(x,z);
   if(y==null||Math.hypot(x,z)<.8)continue;
   const p={id,s,x,z,y,phase:rand(id*7+3)*6.283,size:.72+rand(id*7+4)*.48,growth:0,reach:spec.reach};plants.push(p);
   const h=(1.1+rand(id*7+5)*.75)*p.size;
   if(s===0){ // violet parasol tiers: BB stalk and horizontal radial bead canopies
    chain(p,[[0,.035,0],[.03,h*.5,0],[.08,h,0]],22,.042,0,.04,.68);
    for(let tier=0;tier<3;tier++){const yy=h*(.55+tier*.21),rad=(.43+tier*.12)*p.size;
     for(let layer=0;layer<3;layer++)ring(p,[.07,yy+layer*.037,0],rad*(.48+layer*.26),rad*(.48+layer*.26),20,tier%2?1:2,.57+tier*.11,.83+tier*.05,.039);
    }
   }else if(s===1){ // gourd: densely stippled bulb, leaflets also BB chains
    clump(p,[0,.44*p.size,0],.53*p.size,.47*p.size,.53*p.size,165,i=>i%9===0?1:0,.12,.92,.052);
    for(let k=0;k<6;k++){const a=k*Math.PI/3;chain(p,[[0,.10,0],[Math.cos(a)*.28,.15,Math.sin(a)*.28],[Math.cos(a)*.52,.06,Math.sin(a)*.52]],10,.037,2,.15,.5)}
   }else if(s===2){ // lantern: bead-chain branches and golden fruit clusters
    chain(p,[[0,.04,0],[0,h*.6,0],[.04,h,0]],24,.041,0,.04,.66);
    for(let k=0;k<3;k++){const a=k*2.4+p.phase,yy=h*(.46+k*.22),xx=Math.cos(a)*(.33+k*.06),zz=Math.sin(a)*(.33+k*.06);
     chain(p,[[0,yy-.1,0],[xx*.65,yy+.08,zz*.65],[xx,yy+.04,zz]],13,.035,0,.45,.78);
     clump(p,[xx,yy-.19,zz],.18,.24,.18,76,j=>j%7===0?2:1,.72,.98,.042);
    }
   }else if(s===3){ // open bowl of rings, no cups or polygons
    for(let layer=0;layer<7;layer++){const t=layer/6,rad=(.13+.38*t)*p.size;ring(p,[0,.10+.43*t*p.size,0],rad,rad,28,layer%3===0?1:0,.08+.67*t,.3+.7*t,.043)}
    clump(p,[0,.33*p.size,0],.20*p.size,.08,.20*p.size,36,2,.55,.98,.032);
   }else{ // ruby hanging clusters on bead-chain stems
    chain(p,[[0,.04,0],[0,h*.55,0],[.07,h,0]],25,.041,0,.04,.7);
    for(let k=0;k<3;k++){const a=k*2.4+p.phase,yy=h*(.49+k*.19),xx=Math.cos(a)*(.29+k*.08),zz=Math.sin(a)*(.29+k*.08);
     chain(p,[[0,yy,0],[xx*.65,yy-.08,zz*.65],[xx,yy-.18,zz]],12,.033,0,.5,.78);
     clump(p,[xx,yy-.39,zz],.17,.28,.17,82,j=>j%8===0?2:1,.72,.99,.043);
    }
   }
  }
 }
 const palette=species.flatMap(s=>s.palette.map(c=>new T.Color(c)));
 const geometry=new T.IcosahedronGeometry(1,1),material=new T.MeshStandardMaterial({roughness:.79,metalness:.015});
 const mesh=new T.InstancedMesh(geometry,material,descriptors.length);mesh.name='BB botanical instances';mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastRotation=new T.Quaternion(),blastScale=new T.Vector3(),blastColor=new T.Color(),visibleOwners=[];
 const dummy=new T.Object3D();let time=0,visible=0;
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
   const o=offset();items.push({x:blastPosition.x+o.x,y:blastPosition.y,z:blastPosition.z+o.z,r:blastScale.x*1,color:blastColor.clone()});
  }

  // Every authored BB transfers exactly once, including clipped or retracted anatomy.
  const seen=new Map();for(let i=0;i<mesh.count;i++){const id=visibleOwners[i];if(affected.has(id))seen.set(id,(seen.get(id)||0)+1);}
  const required=new Map();for(const b of descriptors)if(affected.has(b.plant))required.set(b.plant,(required.get(b.plant)||0)+1);
  for(const [id,total] of required){const p=plants[id],missing=total-(seen.get(id)||0);if(missing<=0)continue;
   const hidden=descriptors.filter(b=>b.plant===id);for(let j=0;j<missing;j++){const b=hidden[j%hidden.length];items.push({x:p.x+(b.x||0),y:p.y+b.y,z:p.z+(b.z||0),r:b.r,color:(palette[p.s*3+b.color]).clone()});}
  }
  const emitted=debris.emit(items,point,options.impulse);
  for(const id of affected)plants[id].destroyed=true;
  return emitted;
 }
 function update(dt){
  dt=Math.min(.1,Math.max(0,dt));time+=dt;const {x:ox=0,z:oz=0}=offset(),actors=characters();visible=0;
  for(const p of plants){if(p.destroyed)continue;
   const occupied=actors.some(a=>Math.hypot(a.x-p.x,a.z-p.z)<p.reach);
   const target=occupied?0:1;p.growth+=(target-p.growth)*Math.min(1,dt*(target>p.growth?3.6:7.5));
  }
  for(const b of descriptors){
   const p=plants[b.plant];if(!p||p.destroyed)continue;
   const progress=clamp((p.growth-b.rank)*15);if(progress<=.01)continue;
   const sway=Math.sin(time*(.74+p.size*.12)+p.phase)*.06;
   const lag=Math.sin(time*.83+p.phase+b.phase*.05)*.035;
   // Collapse toward root, descending beneath geological surface on withdrawal.
   const retract=1-progress,xx=p.x-ox+(b.x+sway*b.tip+lag*b.tip)*progress,yy=p.y+b.y*progress-.10*retract,zz=p.z-oz+(b.z+Math.cos(time*.71+p.phase)*.045*b.tip)*progress;
   if(xx*xx+yy*yy+zz*zz>(radius-.1)**2)continue;
   dummy.position.set(xx,yy,zz);
   const scale=b.r*(.3+.7*progress);dummy.scale.setScalar(scale);dummy.updateMatrix();
   visibleOwners[visible]=b.plant;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,palette[p.s*3+b.color]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'BB botanical garden',plants:plants.length,descriptors:descriptors.length,activeBeads:descriptors.reduce((n,b)=>n+(plants[b.plant].destroyed?0:1),0),visible,bySpecies:species.map((s,i)=>({name:s.name,roots:plants.filter(p=>p.s===i).length}))}),dispose(){group.removeFromParent();geometry.dispose();material.dispose()}};
}
