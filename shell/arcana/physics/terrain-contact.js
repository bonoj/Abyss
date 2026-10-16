// Terrain owns contact coefficients; this system owns their application.
// Heightfield top-contact only. No arbitrary underworld normals yet.
export function createTerrainContact({terrain,surface,profile='dissipative'}={}){
 if(!terrain?.contactProperties||typeof terrain.materialAt!=='function'||typeof surface!=='function')throw Error('terrain contact requires terrain and surface');
 function sample(x,z){
  const height=surface(x,z);
  if(!Number.isFinite(height))return null;
  const material=terrain.materialAt(x,height,z);
  const properties=terrain.contactProperties[profile];
  if(!properties||!Number.isFinite(properties.restitution)||!Number.isFinite(properties.friction))throw Error('incomplete terrain contact profile '+profile);
  return {height,materialId:material?.id??null,profile,friction:properties.friction,restitution:properties.restitution};
 }
 function resolve(body,{radius,dt,acceleration}){
  const hit=sample(body.x,body.z);
  if(!hit||body.y>hit.height+radius)return {supported:false,hit};
  const penetration=hit.height+radius-body.y;
  body.y=hit.height+radius;
  // Resolve normal velocity with terrain restitution. Below one gravity step,
  // hold resting contact to avoid numerical micro-bounces.
  const incoming=body.vy;
  const restThreshold=Math.abs(acceleration.y)*dt;
  body.vy=incoming< -restThreshold?-incoming*hit.restitution:Math.max(0,incoming);
  if(body.vy===0){
   const speed=Math.hypot(body.vx,body.vz);
   const loss=Math.min(speed,hit.friction*Math.max(0,-acceleration.y)*dt);
   if(speed>0){body.vx*=1-loss/speed;body.vz*=1-loss/speed}
  }
  return {supported:body.vy===0,hit,penetration,bounced:body.vy>0&&incoming<0};
 }
 function inspect(){return {name:'terrain contact',mode:'top-surface heightfield',profile,properties:{...terrain.contactProperties[profile]},source:'terrain.contactProperties'}}
 return {sample,resolve,inspect};
}
