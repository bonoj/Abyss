// Glasswings: BB-lattice flying creatures, bounded autonomous flight.
export function createGlasswings(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 const group=new T.Group();group.name='Glasswings';parent?.add(group);
 const hash=n=>{const v=Math.sin(n*127.1+seed*21.37)*43758.5453;return v-Math.floor(v)};
 const agents=[],beads=[],colors=[0x81c7d0,0xb4e0df,0x86a6db,0xe2d7a9,0x415c74].map(x=>new T.Color(x));
 function bead(id,x,y,z,r,c,wing=0){beads.push({id,x,y,z,r,c,wing})}
 for(let i=0;i<4;i++){
  const a=i*2.399+1.2,d=3.1+i*.35,x=Math.cos(a)*d,z=Math.sin(a)*d,ground=surface(x,z);
  if(ground==null)continue;
  const id=agents.length;
  agents.push({id,x,z,y:ground+1.1+i*.16,homeX:x,homeZ:z,heading:hash(i*9)*6.283,phase:hash(i*11)*6.283,turn:0,clock:0,step:0,state:'patrol'});
  for(let s=0;s<9;s++){const t=s/8;for(let j=0;j<10;j++){const a=j*Math.PI*2/10;bead(id,(t-.5)*.42,.055*Math.sin(a),.075*Math.cos(a),.023,j%4===0?3:4)}}
  for(const side of [-1,1]){
   // Triangular, open BB lattice wings; no transparent membrane mesh.
   for(let u=0;u<=13;u++){const span=u/13,reach=.12+span*.86,chord=.46*(1-span)+.035;
    for(let v=0;v<=8;v++){const along=v/8,x=(along-.5)*chord+.07*span;
     bead(id,x,.025*Math.sin(span*Math.PI),side*reach,.012+(v===0||v===8||u%4===0?.008:0),u%4===0?1:0,side);
    }
   }
   for(let j=0;j<8;j++)bead(id,.20+j*.028,.035+j*.012,side*(.035+j*.007),.013,3);
   bead(id,.18,.06,side*.07,.036,4);
  }
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.58,metalness:.09});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const dummy=new T.Object3D();let elapsed=0,visible=0;
 const owners=[];const m=new T.Matrix4(),pos=new T.Vector3(),rot=new T.Quaternion(),scale=new T.Vector3(),col=new T.Color();
 function blast(point,options,debris){
  const hit=new Set();for(const p of agents)if(!p.destroyed&&Math.hypot(p.x-point.x,p.y-point.y,p.z-point.z)<options.radius)hit.add(p.id);
  if(!hit.size)return 0;
  const items=[],o=offset();for(let i=0;i<mesh.count;i++){if(!hit.has(owners[i]))continue;mesh.getMatrixAt(i,m);m.decompose(pos,rot,scale);mesh.getColorAt(i,col);items.push({x:pos.x+o.x,y:pos.y,z:pos.z+o.z,r:scale.x,color:col.clone()});}
  // Every authored BB transfers exactly once, including clipped or retracted anatomy.
  const seen=new Map();for(let i=0;i<mesh.count;i++){const id=owners[i];if(hit.has(id))seen.set(id,(seen.get(id)||0)+1);}
  const required=new Map();for(const b of beads)if(hit.has(b.id))required.set(b.id,(required.get(b.id)||0)+1);
  for(const [id,total] of required){const p=agents[id],missing=total-(seen.get(id)||0);if(missing<=0)continue;
   const hidden=beads.filter(b=>b.id===id);for(let j=0;j<missing;j++){const b=hidden[j%hidden.length];items.push({x:p.x+(b.x||0),y:p.y+b.y,z:p.z+(b.z||0),r:b.r,color:(colors[b.c]).clone()});}
  }
  debris.emit(items,point,options.impulse);for(const p of agents)if(hit.has(p.id))p.destroyed=true;return hit.size;
 }

 function update(dt){
  dt=Math.max(0,Math.min(.1,dt));elapsed+=dt;const actor=wanderer(),{x:ox=0,z:oz=0}=offset();
  for(const p of agents){
   if(p.destroyed)continue;
   const close=Math.hypot(actor.x-p.x,actor.z-p.z)<1.2;p.state=close?'evade':'patrol';
   p.clock-=dt;if(p.clock<=0){p.clock=1.2+hash(p.id*19+p.step++)*2;p.turn=(hash(p.id*41+p.step*3)-.5)*.8}
   const desired=close?Math.atan2(p.z-actor.z,p.x-actor.x):Math.atan2(p.homeZ-p.z,p.homeX-p.x);
   const homeDist=Math.hypot(p.x-p.homeX,p.z-p.homeZ);
   const target=homeDist>1.8||close?desired:p.heading+p.turn;
   const delta=Math.atan2(Math.sin(target-p.heading),Math.cos(target-p.heading));
   p.heading+=Math.max(-dt*.85,Math.min(dt*.85,delta));
   const speed=close?.36:.22,nx=p.x+Math.cos(p.heading)*speed*dt,nz=p.z+Math.sin(p.heading)*speed*dt;
   const floor=surface(nx,nz);
   if(Math.hypot(nx,nz)<radius-1.25&&floor!=null){p.x=nx;p.z=nz}
   else p.heading+=dt*2;
   const currentFloor=surface(p.x,p.z);
   if(currentFloor!=null){const targetY=currentFloor+1.15+Math.sin(elapsed*.85+p.phase)*.25;p.y+=(targetY-p.y)*Math.min(1,dt*1.4)}
  }
  visible=0;
  for(const b of beads){const p=agents[b.id];if(p.destroyed)continue;const co=Math.cos(p.heading),si=Math.sin(p.heading);
   const flap=b.wing?Math.sin(elapsed*3.2+p.phase)*.13*(Math.abs(b.z)/.98):0;
   const bank=Math.sin(elapsed*.8+p.phase)*.08*b.z;
   const x=b.x,y=b.y+flap+bank,z=b.z;
   const xx=p.x-ox+x*co-z*si,zz=p.z-oz+x*si+z*co,yy=p.y+y;
   if(xx*xx+yy*yy+zz*zz>(radius-.1)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r);dummy.updateMatrix();owners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,colors[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Glasswings',creatures:agents.filter(p=>!p.destroyed).map(p=>({species:'glasswing',x:+p.x.toFixed(2),z:+p.z.toFixed(2),altitude:+p.y.toFixed(2),state:p.state})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(agents[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
