import {WANDERER_PHYSICS as P,reflectContact,signedFieldNormal,catchVesselUnderside} from './wanderer-contacts.js';
export function createBeadDebris(T,{terrain,offset,innerRadius,parent,abiogenesis=null,wanderer=null}){
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.8,metalness:.04});
 let mesh=null,allocated=0;const perf={growths:0,lastGrowthMs:0,peakGrowthMs:0,lastEmitMs:0,peakEmitMs:0,lastPhysicsMs:0,peakPhysicsMs:0,lastRenderMs:0,peakRenderMs:0};
 function ensureMesh(required){if(required<=allocated)return;const t=performance.now();const next=Math.max(required,allocated?allocated*2:256);const replacement=new T.InstancedMesh(geo,mat,next);replacement.frustumCulled=false;replacement.count=0;parent.add(replacement);if(mesh)parent.remove(mesh);mesh=replacement;allocated=next;perf.growths++;perf.lastGrowthMs=performance.now()-t;perf.peakGrowthMs=Math.max(perf.peakGrowthMs,perf.lastGrowthMs);}
 ensureMesh(256);
 const beads=[],dummy=new T.Object3D(),ownership={terrain:0,vessel:0,abiogenesis:0,wanderer:0};let wandererCaptures=0,wandererInteriorHits=0,wandererPulses=0,wandererLastAffected=0,wandererPulseClock=0;
 let terrainHits=0,vesselHits=0,emitted=0,abiogenesisCaptures=0,abiogenesisInteriorHits=0,abiogenesisExteriorHits=0,abiogenesisPulses=0,abiogenesisLastAffected=0;
 function canAccept(){return true;}
 function emit(items,point,impulse=18){const t=performance.now();
  const o=offset();
  for(const item of items){
   const x=item.x,y=item.y,z=item.z,dx=x-point.x,dy=y-point.y,dz=z-point.z;
   const dist=Math.hypot(dx,dy,dz)||.001,fall=Math.max(.25,1-Math.min(1,dist/3.2));
   const power=impulse*fall*(.65+.35*Math.sin(emitted*12.9898)**2),inv=1/dist;
   const b={x,y,z,vx:dx*inv*power,vy:dy*inv*power+3,vz:dz*inv*power,r:item.r,color:item.color,ax:Math.sin(emitted*3.7)*14,ay:Math.cos(emitted*2.3)*14,az:Math.sin(emitted*1.9)*14,owner:'terrain',rx:0,ry:0,rz:0};
   beads.push(b);emitted++;
  }
  perf.lastEmitMs=performance.now()-t;perf.peakEmitMs=Math.max(perf.peakEmitMs,perf.lastEmitMs);return items.length;
 }
 function receiveImpulse(point,{radius=3.2,impulse=18}={}){
  let affected=0;const o=offset();
  for(const b of beads){
   if(b.owner==='abiogenesis'||b.owner==='wanderer')continue;
   const x=b.x+(b.owner==='vessel'?o.x:0),z=b.z+(b.owner==='vessel'?o.z:0),dx=x-point.x,dy=b.y-point.y,dz=z-point.z,d=Math.hypot(dx,dy,dz);
   if(d>=radius)continue;
   const force=impulse*(1-d/radius)**2,inv=1/Math.max(.001,d);
   b.vx+=dx*inv*force;b.vy+=dy*inv*force;b.vz+=dz*inv*force;b.ax+=force*1.3;b.ay+=force*.9;affected++;
  }
  return affected;
 }
 function collideSphere(center,radius,receive){
  const o=offset();let hits=0;
  for(const b of beads){
   if(b.owner==='abiogenesis'||b.owner==='wanderer')continue;
   const x=b.x-(b.owner==='terrain'?o.x:0),z=b.z-(b.owner==='terrain'?o.z:0);
   const dx=x-center.x,dy=b.y-center.y,dz=z-center.z,d=Math.hypot(dx,dy,dz);
   if(d>=radius+b.r)continue;
   const nx=d>.0001?dx/d:0,ny=d>.0001?dy/d:1,nz=d>.0001?dz/d:0;
   if(receive(x,b.y,z,b.r,b.vx,b.vy,b.vz)){
    const approach=b.vx*nx+b.vy*ny+b.vz*nz;
    if(approach<0){b.vx-=1.5*approach*nx;b.vy-=1.5*approach*ny;b.vz-=1.5*approach*nz;}
    hits++;
   }
  }
  return hits;
 }
 // One-shot, position-selected velocity assignment. No tracking after launch.
 let lastDirected=0,directionCommands=0;
 function directRegionToward({maxY=0,target,speed=22}){
  const o=offset();let directed=0;
  for(const b of beads){
   if(b.owner==='abiogenesis'||b.owner==='wanderer'||b.y>maxY)continue;
   const x=b.x-(b.owner==='terrain'?o.x:0),z=b.z-(b.owner==='terrain'?o.z:0);
   const dx=target.x-x,dy=target.y-b.y,dz=target.z-z;
   const distance=Math.hypot(dx,dy,dz);
   if(distance<1e-6)continue;
   const factor=speed/distance;
   b.vx=dx*factor;b.vy=dy*factor;b.vz=dz*factor;
   directed++;
  }
  directionCommands++;lastDirected=directed;
  return directed;
 }
 function update(dt){const physicsStart=performance.now();
  const o=offset(),sample=terrain.sample.bind(terrain);
  const count=Math.max(1,Math.ceil(Math.min(.05,dt)/.008)),step=Math.min(.05,dt)/count;
  const cradle=abiogenesis?.position,cradleRadius=abiogenesis?abiogenesis.innerRadius*abiogenesis.scale:0;
  const wi=wanderer?.inspect(),wc=wi?{x:wi.x-o.x,y:wi.centerY,z:wi.z-o.z}:null;
  // A once-per-second surface collector. One horizontal disk, no 3D
  // proximity test against the elevated Wanderer and no geometry allocation.
  // Only terrain-owned, surface-contact BBs are eligible; free-flying and
  // vessel-owned material cannot be vacuumed through terrain or glass.
  wandererPulseClock+=Math.max(0,dt);
  if(wc&&wandererPulseClock>=1){
   wandererPulseClock%=1;wandererPulses++;wandererLastAffected=0;
   const footprintRadius=1.23,footprint2=footprintRadius*footprintRadius;
   for(const b of beads){
    if(b.owner!=='terrain')continue;
    const dx=wc.x+o.x-b.x,dz=wc.z+o.z-b.z;
    if(dx*dx+dz*dz>footprint2)continue;
    // Positive signed field is solid. A narrow surface band prevents
    // collecting buried or high-flying beads.
    const field=sample(b.x,b.y,b.z);
    if(field>Math.max(.015,b.r*.35)||field< -Math.max(.12,b.r*2))continue;
    const dy=wc.y-b.y,dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(dist<.001)continue;
    // Ballistic one-shot launch: enough upward speed to reach the moving
    // cavity under gravity, with a small margin. No persistent suction.
    const flight=Math.max(.16,Math.sqrt(2*Math.max(.01,dy)/P.gravity));
    const invTime=1/flight;
    b.vx=dx*invTime;b.vz=dz*invTime;
    b.vy=dy*invTime+.5*P.gravity*flight+1.5;
    wandererLastAffected++;
   }
  }
  for(const b of beads){
   for(let k=0;k<count;k++){
    // Physics uses the current owner's coordinates; terrain queries always use geology.
    const ox=b.x,oy=b.y,oz=b.z;b.vy-=P.gravity*step;
    if(b.owner==='abiogenesis'){
     const limit=abiogenesis.innerRadius*abiogenesis.scale-b.r-.003;
     b.x+=b.vx*step;b.y+=b.vy*step;b.z+=b.vz*step;
     const rr2=b.x*b.x+b.y*b.y+b.z*b.z;
     if(rr2>limit*limit&&rr2>1e-14){
      const rr=Math.sqrt(rr2);
      const normal={x:-b.x/rr,y:-b.y/rr,z:-b.z/rr};
      b.x=-normal.x*limit;b.y=-normal.y*limit;b.z=-normal.z*limit;
      if(reflectContact(b,normal,P.vesselRestitution))abiogenesisInteriorHits++;
     }
     b.rx+=b.ax*step;b.ry+=b.ay*step;b.rz+=b.az*step;
     b.ax*=.999;b.ay*=.999;b.az*=.999;
     continue;
    }
    if(b.owner==='wanderer'){
     const limit=wanderer.innerRadius-b.r-.003;
     b.x+=b.vx*step;b.y+=b.vy*step;b.z+=b.vz*step;
     const rr2=b.x*b.x+b.y*b.y+b.z*b.z;
     if(rr2>limit*limit&&rr2>1e-14){
      const rr=Math.sqrt(rr2),normal={x:-b.x/rr,y:-b.y/rr,z:-b.z/rr};
      b.x=-normal.x*limit;b.y=-normal.y*limit;b.z=-normal.z*limit;
      if(reflectContact(b,normal,P.vesselRestitution))wandererInteriorHits++;
     }
     b.rx+=b.ax*step;b.ry+=b.ay*step;b.rz+=b.az*step;
     b.ax*=.999;b.ay*=.999;b.az*=.999;continue;
    }
    if(wc){
     const dx=ox-(b.owner==='terrain'?o.x:0)-wc.x,dy=oy-wc.y,dz=oz-(b.owner==='terrain'?o.z:0)-wc.z;
     const sx=b.vx*step,sy=b.vy*step,sz=b.vz*step,r=wanderer.innerRadius-b.r-.003;
     if(r>0&&Math.min(dx,dx+sx)<=r&&Math.max(dx,dx+sx)>=-r&&Math.min(dy,dy+sy)<=r&&Math.max(dy,dy+sy)>=-r&&Math.min(dz,dz+sz)<=r&&Math.max(dz,dz+sz)>=-r){
      const e2=(dx+sx)**2+(dy+sy)**2+(dz+sz)**2,d2=dx*dx+dy*dy+dz*dz;
      let captured=e2<r*r;
      if(!captured&&d2>=r*r){
       const aa=sx*sx+sy*sy+sz*sz,bb=dx*sx+dy*sy+dz*sz,disc=bb*bb-aa*(d2-r*r);
       captured=aa>0&&bb<0&&disc>=0&&(-bb-Math.sqrt(disc))/aa<=1;
      }
      if(captured){
       const ex=dx+sx,ey=dy+sy,ez=dz+sz,fit=Math.min(1,r/(Math.sqrt(e2)||1));
       b.x=ex*fit;b.y=ey*fit;b.z=ez*fit;b.owner='wanderer';wandererCaptures++;continue;
      }
     }
    }
    // Passive one-way entry: exterior glass does not bounce BBs.
    // Swept segment/sphere intersection catches fast crossings.
    if(abiogenesis){
     const dx=ox-(b.owner==='terrain'?o.x:0)-cradle.x;
     const dy=oy-cradle.y,dz=oz-(b.owner==='terrain'?o.z:0)-cradle.z;
     const sx=b.vx*step,sy=b.vy*step,sz=b.vz*step;
     const radius=cradleRadius-b.r-.003;
     // Swept AABB rejection: cannot cross the capture sphere this substep.
     if(Math.min(dx,dx+sx)>radius||Math.max(dx,dx+sx)<-radius||
        Math.min(dy,dy+sy)>radius||Math.max(dy,dy+sy)<-radius||
        Math.min(dz,dz+sz)>radius||Math.max(dz,dz+sz)<-radius){
      // Distant BB: no quadratic or square root necessary.
     }else{
     const r2=radius*radius;
     const d2=dx*dx+dy*dy+dz*dz;
     const ex=dx+sx,ey=dy+sy,ez=dz+sz;
     const e2=ex*ex+ey*ey+ez*ez;
     // Crossing from outside, or already inside on the first encounter.
     let captured=e2<r2;
     if(!captured&&d2>=r2){
      const aa=sx*sx+sy*sy+sz*sz;
      const bb=dx*sx+dy*sy+dz*sz;
      const disc=bb*bb-aa*(d2-r2);
      captured=aa>0&&bb<0&&disc>=0&&(-bb-Math.sqrt(disc))/aa<=1;
     }
     if(captured){
      const d=Math.sqrt(e2)||1;
      const fit=Math.min(1,radius/d);
      b.x=ex*fit;b.y=ey*fit;b.z=ez*fit;
      b.owner='abiogenesis';abiogenesisCaptures++;continue;
     }
     }
    }
    const nx=ox+b.vx*step,ny=oy+b.vy*step,nz=oz+b.vz*step;
    const shiftX=b.owner==='vessel'?o.x:0,shiftZ=b.owner==='vessel'?o.z:0;
    const start=sample(ox+shiftX,oy,oz+shiftZ),end=sample(nx+shiftX,ny,nz+shiftZ);
    if(start< -b.r&&end>=-b.r){
     let lo=0,hi=1;
     for(let j=0;j<7;j++){const mid=(lo+hi)/2;if(sample(ox+(nx-ox)*mid+shiftX,oy+(ny-oy)*mid,oz+(nz-oz)*mid+shiftZ)>=-b.r)hi=mid;else lo=mid;}
     const x=ox+(nx-ox)*lo,y=oy+(ny-oy)*lo,z=oz+(nz-oz)*lo;
     const normal=signedFieldNormal(sample,x+shiftX,y,z+shiftZ);
     reflectContact(b,normal,P.microRestitution,1-P.microFriction);
     b.x=x+normal.x*.004;b.y=y+normal.y*.004;b.z=z+normal.z*.004;terrainHits++;
     if(b.owner!=='terrain'){b.x+=o.x;b.z+=o.z;b.owner='terrain';}
    }else{b.x=nx;b.y=ny;b.z=nz;}
    // Bowl containment is always evaluated in Hermeticon space.
    const vesselBody=b.owner==='terrain'?{x:b.x-o.x,y:b.y,z:b.z-o.z,vx:b.vx,vy:b.vy,vz:b.vz}:b;
    const wall=catchVesselUnderside(vesselBody,{innerRadius,beadRadius:b.r});
    if(wall.caught){
     if(b.owner!=='vessel'){b.x=vesselBody.x;b.y=vesselBody.y;b.z=vesselBody.z;b.owner='vessel';}
     b.vx=vesselBody.vx;b.vy=vesselBody.vy;b.vz=vesselBody.vz;
     if(wall.bounced)vesselHits++;
    }
    b.rx+=b.ax*step;b.ry+=b.ay*step;b.rz+=b.az*step;
    b.ax*=.999;b.ay*=.999;b.az*=.999;
   }
  }
  perf.lastPhysicsMs=performance.now()-physicsStart;perf.peakPhysicsMs=Math.max(perf.peakPhysicsMs,perf.lastPhysicsMs);const renderStart=performance.now();
  ensureMesh(beads.length);
  let n=0,terrainOwned=0,vesselOwned=0,abiogenesisOwned=0,wandererOwned=0;
  for(const b of beads){
   if(b.owner==='terrain')terrainOwned++;else if(b.owner==='vessel')vesselOwned++;else if(b.owner==='abiogenesis')abiogenesisOwned++;else wandererOwned++;
   const x=b.owner==='wanderer'?wc.x+b.x:b.owner==='abiogenesis'?abiogenesis.position.x+b.x:b.x-(b.owner==='terrain'?o.x:0);
   const y=b.owner==='wanderer'?wc.y+b.y:b.owner==='abiogenesis'?abiogenesis.position.y+b.y:b.y;
   const z=b.owner==='wanderer'?wc.z+b.z:b.owner==='abiogenesis'?abiogenesis.position.z+b.z:b.z-(b.owner==='terrain'?o.z:0);
   if(Math.hypot(x,y,z)+b.r>innerRadius)continue;
   dummy.position.set(x,y,z);dummy.rotation.set(b.rx,b.ry,b.rz);dummy.scale.setScalar(b.r);dummy.updateMatrix();
   mesh.setMatrixAt(n,dummy.matrix);mesh.setColorAt(n,b.color);n++;
  }
  mesh.count=n;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  ownership.terrain=terrainOwned;ownership.vessel=vesselOwned;ownership.abiogenesis=abiogenesisOwned;ownership.wanderer=wandererOwned;perf.lastRenderMs=performance.now()-renderStart;perf.peakRenderMs=Math.max(perf.peakRenderMs,perf.lastRenderMs);
 }

 return {emit,canAccept,receiveImpulse,collideSphere,directRegionToward,update,inspect:()=>({name:'Detached anatomical BBs',count:beads.length,visible:mesh.count,terrainHits,vesselHits,wandererCaptures,wandererInteriorHits,wandererPulses,wandererLastAffected,vacuumFootprintRadius:1.23,abiogenesisCaptures,abiogenesisInteriorHits,abiogenesisExteriorHits,abiogenesisPulses,abiogenesisLastAffected,directionCommands,lastDirected,emitted,allocated,perf:{...perf},ownership:{...ownership}})};
}
