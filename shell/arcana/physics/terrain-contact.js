// Volumetric contact: geometry from terrain, coefficients from terrain.
// Contact normal is oriented from solid into free space.
export function createTerrainContact({terrain,profile='dissipative'}={}){
 if(typeof terrain?.sphereContact!=='function'||!terrain.contactProperties)throw Error('volumetric terrain contact required');
 function resolve(body,{radius,dt,acceleration,activeDrive=false,footSupport=false}){
  const hit=terrain.sphereContact(body,radius);
  if(!hit)return {supported:false,hit:null};
  const props=terrain.contactProperties[profile];
  if(!props||!Number.isFinite(props.friction)||!Number.isFinite(props.restitution))throw Error('incomplete terrain contact profile '+profile);
  const n=hit.normal;
  if(!footSupport){body.x+=n.x*hit.penetration;body.y+=n.y*hit.penetration;body.z+=n.z*hit.penetration;}
  const vn=body.vx*n.x+body.vy*n.y+body.vz*n.z;
  const load=Math.max(0,-(acceleration.x*n.x+acceleration.y*n.y+acceleration.z*n.z));
  const resting=vn>=-load*dt*1.5;
  let bounced=false;
  let reboundNormalSpeed=vn;
  if(vn<0&&!footSupport){
   const rebound=resting?0:-vn*props.restitution;
   const delta=rebound-vn;
   body.vx+=n.x*delta;body.vy+=n.y*delta;body.vz+=n.z*delta;
   bounced=rebound>0;
   reboundNormalSpeed=rebound;
  }
  const normalSpeed=body.vx*n.x+body.vy*n.y+body.vz*n.z;
  const tx=body.vx-n.x*normalSpeed,ty=body.vy-n.y*normalSpeed,tz=body.vz-n.z*normalSpeed;
  const tangentSpeed=Math.hypot(tx,ty,tz);
  const loss=(activeDrive||footSupport)?0:Math.min(tangentSpeed,props.friction*load*dt);
  if(tangentSpeed>0){const k=loss/tangentSpeed;body.vx-=tx*k;body.vy-=ty*k;body.vz-=tz*k}
  return {supported:resting&&n.y>0.5,footSupportBypass:footSupport,hit:{...hit,...props,profile},penetration:hit.penetration,bounced,contactObservation:{point:hit.point,normal:{...n},materialId:hit.materialId,inside:hit.inside,penetration:hit.penetration,incomingNormalSpeed:vn,reboundNormalSpeed,normalLoad:load,supported:resting&&n.y>0.5}};
 }
 function inspect(){return {name:'terrain contact',mode:'volumetric triangle surface',profile,properties:{...terrain.contactProperties[profile]},source:'terrain.contactProperties',geometry:'terrain.sphereContact'}}
 return {resolve,inspect};
}
