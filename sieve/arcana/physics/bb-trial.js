import {applyRadialImpulse} from './impulse.js';
import {WANDERER_PHYSICS as P,reflectContact,signedFieldNormal,catchVesselUnderside} from './wanderer-contacts.js';
// A deliberately tiny, optional live fixture: one BB, geological terrain, vessel-relative bowl.
export function createBBTrial(T,{terrain,innerRadius,offset=()=>({x:0,z:0}),parent}){
 const radius=.075,body={x:0,y:0,z:0,vx:0,vy:0,vz:0};
 const mesh=new T.Mesh(new T.IcosahedronGeometry(radius,1),new T.MeshStandardMaterial({color:0xf4ae59,metalness:.35,roughness:.32}));
 mesh.name='Physics BB trial';parent?.add(mesh);
 let impulseEvents=0,lastImpulse=0;
 let active=false,terrainHits=0,vesselHits=0,vesselCorrections=0,frames=0,peakSpeed=0,initialEnergy=0,peakEnergy=0;
 function launch(){
  const o=offset();body.x=2.4;body.z=-1.7;body.y=4.8;
  body.vx=1.15;body.vy=0;body.vz=.35;active=true;frames=0;terrainHits=0;vesselHits=0;vesselCorrections=0;peakSpeed=0;initialEnergy=.5*(body.vx**2+body.vy**2+body.vz**2)+P.gravity*body.y;peakEnergy=initialEnergy;
 }
 function receiveImpulse(origin,options){const o=offset();lastImpulse=applyRadialImpulse(body,{x:origin.x-o.x,y:origin.y,z:origin.z-o.z},options);if(lastImpulse>0)impulseEvents++;return lastImpulse;}
 function update(dt){
  if(!active)return;
  const o=offset(),sample=(x,y,z)=>terrain.sample(x+o.x,y,z+o.z);
  let remaining=Math.min(.1,Math.max(0,dt));
  while(remaining>0){
   const step=Math.min(.008,remaining);remaining-=step;frames++;
   const old={x:body.x,y:body.y,z:body.z};
   body.vy-=P.gravity*step;
   const nx=body.x+body.vx*step,ny=body.y+body.vy*step,nz=body.z+body.vz*step;
   const count=Math.max(1,Math.ceil(Math.hypot(nx-old.x,ny-old.y,nz-old.z)/P.terrainSweepStep));
   let hit=false;
   for(let j=1;j<=count;j++){
    const t=j/count,x=old.x+(nx-old.x)*t,y=old.y+(ny-old.y)*t,z=old.z+(nz-old.z)*t;
    if(sample(old.x,old.y,old.z)<-radius&&sample(x,y,z)>=-radius){
     const normal=signedFieldNormal(sample,x,y,z);
     reflectContact(body,normal,P.terrainRestitution,P.terrainTangentDamping);
     const safeT=(j-1)/count;
     body.x=old.x+(nx-old.x)*safeT+normal.x*.004;
     body.y=old.y+(ny-old.y)*safeT+normal.y*.004;
     body.z=old.z+(nz-old.z)*safeT+normal.z*.004;
     terrainHits++;hit=true;break;
    }
   }
   if(!hit){body.x=nx;body.y=ny;body.z=nz}
   const vessel=catchVesselUnderside(body,{innerRadius,beadRadius:radius});
   if(vessel.caught){vesselCorrections++;if(vessel.bounced)vesselHits++;}
   const speed=Math.hypot(body.vx,body.vy,body.vz);peakSpeed=Math.max(peakSpeed,speed);peakEnergy=Math.max(peakEnergy,.5*speed*speed+P.gravity*body.y);
  }
  const rr=Math.hypot(body.x,body.y,body.z);
  mesh.visible=rr+radius<innerRadius;
  mesh.position.set(body.x,body.y,body.z);
 }
 function inspect(){return {active,position:[body.x,body.y,body.z],velocity:[body.vx,body.vy,body.vz],terrainHits,vesselHits,vesselCorrections,impulseEvents,lastImpulse,frames,peakSpeed,initialEnergy,peakEnergy,energy:.5*(body.vx**2+body.vy**2+body.vz**2)+P.gravity*body.y,visible:mesh.visible}}
 function dispose(){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose()}
 mesh.visible=false;
 return {launch,receiveImpulse,update,inspect,dispose};
}
