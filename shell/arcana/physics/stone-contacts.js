// Arcana stone contact kernel. Coordinates are terrain-space; positive field is solid.
// Body: {mesh,v,spin,mass,invI,awake,quiet}; contact normal points from A to B.
export function createStoneContacts(T,terrain,half,materials={stone:{friction:.82,restitution:.09}}){
 const sample=terrain.sample.bind(terrain),g=9.8,eps=.035;
 const scratch=new T.Vector3(),r=new T.Vector3(),rv=new T.Vector3(),t=new T.Vector3();
 const axes=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)];
 const stats={terrain:0,pairs:0,contacts:0,candidates:0,byPair:{},impulseByPair:{},byInterface:{},impulseByInterface:{}};
 const frame={impulses:0,terrainImpulses:0,bodyImpulses:0,normalImpulse:0,frictionImpulse:0,maxEstimatedDepth:0,depthSum:0,slipSum:0,supportImpulses:0,byInterface:{}};
 function beginStep(){for(const k of ['impulses','terrainImpulses','bodyImpulses','normalImpulse','frictionImpulse','maxEstimatedDepth','depthSum','slipSum','supportImpulses'])frame[k]=0;frame.byInterface={};}
 const pairKey=(a,b)=>[a||'stone',b||'stone'].sort().join('/');
 function response(a,b){const ma=materials[a]||materials.stone,mb=materials[b]||materials.stone;return {friction:Math.sqrt(ma.friction*mb.friction),restitution:Math.max(ma.restitution,mb.restitution)};}
 function gradient(x,y,z){
  const nx=sample(x-eps,y,z)-sample(x+eps,y,z),ny=sample(x,y-eps,z)-sample(x,y+eps,z),nz=sample(x,y,z-eps)-sample(x,y,z+eps);
  const len=Math.hypot(nx,ny,nz);
  return {n:new T.Vector3(nx,ny,nz).multiplyScalar(1/(len||1)),slope:len/(2*eps)};
 }
 function impulse(a,b,n,point,depth,law){
  const ia=a?1/a.mass:0,ib=b?1/b.mass:0;
  if(ia+ib===0)return;
  const pa=a?.mesh.position,pb=b?.mesh.position;
  const ra=pa?point.clone().sub(pa):new T.Vector3(),rb=pb?point.clone().sub(pb):new T.Vector3();
  const va=a?a.v.clone().add(scratch.copy(a.spin).cross(ra)):new T.Vector3();
  const vb=b?b.v.clone().add(scratch.copy(b.spin).cross(rb)):new T.Vector3();
  rv.copy(vb).sub(va);const vn=rv.dot(n);
  const angular=(body,arm,dir)=>body?arm.clone().cross(dir).lengthSq()*body.invI:0;
  const denom=ia+ib+angular(a,ra,n)+angular(b,rb,n);
  const restitution=vn< -1.1?law.restitution:0;
  // Baumgarte bias handles resting penetration without velocity-wide damping.
  const j=Math.max(0,(-(1+restitution)*vn+Math.min(.8,Math.max(0,depth-.006)*8))/Math.max(denom,1e-8));
  function apply(dir,magnitude){
   if(a){a.v.addScaledVector(dir,-magnitude*ia);a.spin.addScaledVector(scratch.copy(ra).cross(dir),-magnitude*a.invI);a.awake=true;}
   if(b){b.v.addScaledVector(dir,magnitude*ib);b.spin.addScaledVector(scratch.copy(rb).cross(dir),magnitude*b.invI);b.awake=true;}
  }
  apply(n,j);
  const tangent=rv.addScaledVector(n,-vn),speed=tangent.length();
  frame.slipSum+=speed;
  if(speed>1e-7){
   tangent.divideScalar(speed);
   const td=ia+ib+angular(a,ra,tangent)+angular(b,rb,tangent);
   const jt=Math.min(j*law.friction,speed/Math.max(td,1e-8));
   frame.frictionImpulse+=jt;apply(tangent,-jt);
  }
  if(depth>.003){
   const correction=Math.min(.08,(depth-.003)*.45)/(ia+ib);
   if(a)pa.addScaledVector(n,-correction*ia);
   if(b)pb.addScaledVector(n,correction*ib);
  }
  stats.contacts++;
  frame.impulses++;frame.normalImpulse+=j;frame.maxEstimatedDepth=Math.max(frame.maxEstimatedDepth,depth);frame.depthSum+=depth;
  if(a&&b)frame.bodyImpulses++;else frame.terrainImpulses++;
  if(n.y>.55&&j>0)frame.supportImpulses++;
  const key=pairKey(a?.material,b?.material);stats.byPair[key]=(stats.byPair[key]||0)+1;stats.impulseByPair[key]=(stats.impulseByPair[key]||0)+j;
  const iface=a&&b?'body/body':'terrain/body',label=iface+':'+key;
  stats.byInterface[label]=(stats.byInterface[label]||0)+1;frame.byInterface[label]=(frame.byInterface[label]||0)+1;
  stats.impulseByInterface[label]=(stats.impulseByInterface[label]||0)+j;
 }
 function terrainBody(body){
  const p=body.mesh.position,q=body.mesh.quaternion;
  let hit=false;
  for(let x of [-1,1])for(let y of [-1,1])for(let z of [-1,1]){
   const corner=new T.Vector3(x*half[0],y*half[1],z*half[2]).applyQuaternion(q).add(p);
   const value=sample(corner.x,corner.y,corner.z);
   if(value<=0)continue;
   const {n,slope}=gradient(corner.x,corner.y,corner.z);
   if(slope<1e-5)continue;
   // The field is nonmetric: local gradient gives a first-order distance estimate.
   const depth=Math.min(.12,value/slope);
   if(!Number.isFinite(depth))continue;
   impulse(null,body,n,corner,depth,response('stone',body.material));hit=true;
  }
  if(hit)stats.terrain++;
  return hit;
 }
 function pair(a,b){
  const delta=b.mesh.position.clone().sub(a.mesh.position);
  if(delta.lengthSq()>1.8)return false;
  stats.candidates++;
  const A=axes.map(v=>v.clone().applyQuaternion(a.mesh.quaternion));
  const B=axes.map(v=>v.clone().applyQuaternion(b.mesh.quaternion));
  let depth=Infinity,axis=null;
  function test(raw){
   const len=raw.length();if(len<1e-6)return true;
   const n=raw.multiplyScalar(1/len);
   const ra=A.reduce((s,v,i)=>s+half[i]*Math.abs(v.dot(n)),0);
   const rb=B.reduce((s,v,i)=>s+half[i]*Math.abs(v.dot(n)),0);
   const signed=delta.dot(n),overlap=ra+rb-Math.abs(signed);
   if(overlap<=0)return false;
   if(overlap<depth){depth=overlap;axis=n.clone().multiplyScalar(signed>=0?1:-1);}
   return true;
  }
  for(const v of A)if(!test(v.clone()))return false;
  for(const v of B)if(!test(v.clone()))return false;
  for(const x of A)for(const y of B)if(!test(new T.Vector3().crossVectors(x,y)))return false;
  if(!axis)return false;
  // Support point halfway between projected opposing faces, rather than center-to-center.
  const pa=a.mesh.position.clone().addScaledVector(axis,half[1]);
  const pb=b.mesh.position.clone().addScaledVector(axis,-half[1]);
  const contact=pa.add(pb).multiplyScalar(.5);
  impulse(a,b,axis,contact,Math.min(depth,.15),response(a.material,b.material));
  stats.pairs++;return true;
 }
 return {terrainBody,pair,stats,frame,beginStep,gravity:g};
}
