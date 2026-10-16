// Bellwraiths: BB-only floating bells with delayed articulated tentacle chains.
export function createBellwraiths(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 if(typeof surface!=='function')throw Error('Bellwraiths require surface(x,z)');
 const group=new T.Group();group.name='Bellwraiths';parent?.add(group);
 const hash=n=>{const v=Math.sin(n*127.1+seed*29.13)*43758.5453;return v-Math.floor(v)};
 const agents=[],beads=[],colors=[0x79b8d8,0xb1e0ec,0xceb8eb,0xf3d3a1,0x6a84b7].map(v=>new T.Color(v));
 function bead(id,x,y,z,r,c,kind=0,arm=0,t=0){beads.push({id,x,y,z,r,c,kind,arm,t})}
 for(let i=0;i<5;i++){
  const a=i*2.399+3.4,dist=2.8+(i%3)*.6,x=Math.cos(a)*dist,z=Math.sin(a)*dist,ground=surface(x,z);
  if(ground==null)continue;
  const id=agents.length;
  agents.push({id,x,z,y:ground+1.25+i*.1,homeX:x,homeZ:z,phase:hash(i*11)*6.283,heading:hash(i*7)*6.283,timer:0,step:0,state:'drift'});
  // A domed bell of discrete latitude rings, hollow beneath.
  for(let ring=0;ring<9;ring++){const theta=(ring+.35)/9*Math.PI*.51,rr=Math.sin(theta)*.33,yy=Math.cos(theta)*.29;
   const count=Math.max(10,Math.round(12+ring*5));
   for(let j=0;j<count;j++){const a=j*Math.PI*2/count;bead(id,Math.cos(a)*rr,yy,Math.sin(a)*rr,.019+(ring===8?.008:0),ring%3===0?1:ring%2?0:2)}
  }
  // Warm central light is a cluster of BBs, not a light or solid bulb.
  for(let j=0;j<28;j++){const a=j*2.399,rr=.035+.055*Math.sqrt(j/28);bead(id,Math.cos(a)*rr,.035+Math.sin(j*1.7)*.045,Math.sin(a)*rr,.025,j%3===0?3:2)}
  for(let arm=0;arm<10;arm++){const a=arm*2*Math.PI/10;
   for(let j=0;j<17;j++){const t=j/16;bead(id,Math.cos(a)*(.24+t*.08),-.04-t*.64,Math.sin(a)*(.24+t*.08),.015+(j%5===0?.005:0),arm%3===0?3:arm%2?2:1,1,arm,t)}
  }
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.58,metalness:.06,transparent:false});
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
   const close=Math.hypot(actor.x-p.x,actor.z-p.z)<1.35;p.state=close?'rise':'drift';
   p.timer-=dt;if(p.timer<=0){p.timer=2+hash(p.id*31+p.step++)*2.5;p.heading+=(hash(p.id*43+p.step*7)-.5)*1.8}
   if(close)p.heading=Math.atan2(p.z-actor.z,p.x-actor.x);
   if(Math.hypot(p.x-p.homeX,p.z-p.homeZ)>1.65)p.heading=Math.atan2(p.homeZ-p.z,p.homeX-p.x);
   const speed=close?.20:.085,nx=p.x+Math.cos(p.heading)*speed*dt,nz=p.z+Math.sin(p.heading)*speed*dt;
   const ground=surface(nx,nz);
   if(ground!=null&&Math.hypot(nx,nz)<radius-1.2){p.x=nx;p.z=nz}
   const floor=surface(p.x,p.z);
   if(floor!=null){const target=floor+(close?1.85:1.28)+Math.sin(elapsed*1.3+p.phase)*.16;p.y+=(target-p.y)*Math.min(1,dt*1.8)}
  }
  visible=0;
  for(const b of beads){
   const p=agents[b.id];if(p.destroyed)continue;const pulse=Math.sin(elapsed*2.5+p.phase),co=Math.cos(p.heading),si=Math.sin(p.heading);
   let x=b.x,z=b.z,y=b.y;
   if(b.kind===1){const lag=elapsed*1.7+p.phase-b.t*2.4-b.arm*.35;
    const sway=Math.sin(lag)*(.02+b.t*.15),sway2=Math.cos(lag*.8)*(.01+b.t*.09);
    x+=sway;z+=sway2;y+=Math.sin(lag*.7)*b.t*.045;
   }else{x*=1+pulse*.045;z*=1+pulse*.045;y+=pulse*.022}
   const xx=p.x-ox+x*co-z*si,zz=p.z-oz+x*si+z*co,yy=p.y+y;
   if(xx*xx+yy*yy+zz*zz>(radius-.1)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r);dummy.updateMatrix();owners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,colors[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Bellwraiths',creatures:agents.filter(p=>!p.destroyed).map(p=>({species:'bellwraith',x:+p.x.toFixed(2),z:+p.z.toFixed(2),altitude:+p.y.toFixed(2),state:p.state})),beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(agents[b.id].destroyed?0:1),0),visible}),dispose(){group.removeFromParent();geo.dispose();mat.dispose()}};
}
