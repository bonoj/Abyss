import {WANDERER_PHYSICS as P,reflectContact,signedFieldNormal} from '../../arcana/physics/wanderer-contacts.js';
// Original Stone & Root bevel/profile/palette. Independent Strand rigid masonry.
export function createBrickRain(T,{parent,terrain}){
 const root=new T.Group();root.name='Stone & Root masonry';parent.add(root);
 const palette=[0xb4b2a3,0xc9c3ad,0xaaa99f,0xd2c8b0,0x979f9e,0xb9b8ad,0xe0d0b2].map(color=>new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));
 const w=.72,h=.36,d=.44,b=.065;
 const s=new T.Shape();s.moveTo(-w/2+b,-h/2);s.lineTo(w/2-b,-h/2);
 s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+b);s.lineTo(w/2,h/2-b);
 s.quadraticCurveTo(w/2,h/2,w/2-b,h/2);s.lineTo(-w/2+b,h/2);
 s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-b);s.lineTo(-w/2,-h/2+b);
 s.quadraticCurveTo(-w/2,-h/2,-w/2+b,-h/2);
 const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:1,curveSegments:2,steps:1});geo.translate(0,0,-d/2);
 const half=[w/2+.035,h/2+.035,d/2+.035],bodies=[];
 const rnd=i=>{const n=Math.sin(i*127.1+1917)*43758.5453;return n-Math.floor(n)};
 let spawned=0,clock=0,terrainHits=0,pairHits=0;
 function spawn(){
  const i=spawned++,mesh=new T.Mesh(geo,palette[i%palette.length]);
  mesh.position.set((rnd(i*3)-.5)*2.2,6.4+rnd(i*3+1)*1.2,(rnd(i*3+2)-.5)*2.2);
  mesh.rotation.set((rnd(i+80)-.5)*.6,rnd(i+90)*6.28,(rnd(i+100)-.5)*.6);
  mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
  bodies.push({mesh,v:new T.Vector3(0,0,0),spin:new T.Vector3((rnd(i+11)-.5),(.5-rnd(i+12)),(rnd(i+13)-.5)),mass:5});
 }
 const sample=terrain.sample.bind(terrain),normal=new T.Vector3(),point=new T.Vector3(),rotation=new T.Quaternion();
 function terrainContact(body){
  const mesh=body.mesh,p=mesh.position;let penetration=0,contact=null;
  for(let x of [-1,1])for(let y of [-1,1])for(let z of [-1,1]){
   point.set(x*half[0],y*half[1],z*half[2]).applyQuaternion(mesh.quaternion).add(p);
   const field=sample(point.x,point.y,point.z);
   if(field>penetration){penetration=field;const n=signedFieldNormal(sample,point.x,point.y,point.z);contact=new T.Vector3(n.x,n.y,n.z);}
  }
  if(contact){
   p.addScaledVector(contact,Math.min(.3,penetration+.005));
   const v={vx:body.v.x,vy:body.v.y,vz:body.v.z};
   if(reflectContact(v,{x:contact.x,y:contact.y,z:contact.z},P.microRestitution,1-P.microFriction)){
    body.v.set(v.vx,v.vy,v.vz);body.spin.multiplyScalar(.8);terrainHits++;
   }
   if(contact.y>.7&&body.v.length()<.3){body.v.multiplyScalar(.65);body.spin.multiplyScalar(.7);}
  }
 }
 function collide(a,b){
  const delta=b.mesh.position.clone().sub(a.mesh.position);if(delta.lengthSq()>2.5)return;
  const qa=a.mesh.quaternion,qb=b.mesh.quaternion;
  const unit=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)];
  const A=unit.map(v=>v.clone().applyQuaternion(qa)),B=unit.map(v=>v.clone().applyQuaternion(qb));
  let depth=Infinity,axis=null;
  function test(n){
   const len=n.length();if(len<1e-6)return true;n.divideScalar(len);
   const ra=A.reduce((sum,v,i)=>sum+half[i]*Math.abs(v.dot(n)),0);
   const rb=B.reduce((sum,v,i)=>sum+half[i]*Math.abs(v.dot(n)),0);
   const signed=delta.dot(n),overlap=ra+rb-Math.abs(signed);
   if(overlap<=0)return false;
   if(overlap<depth){depth=overlap;axis=n.clone().multiplyScalar(signed>=0?1:-1);}return true;
  }
  for(const n of [...A,...B])if(!test(n.clone()))return;
  for(const x of A)for(const y of B)if(!test(new T.Vector3().crossVectors(x,y)))return;
  if(!axis)return;
  a.mesh.position.addScaledVector(axis,-depth*.51);b.mesh.position.addScaledVector(axis,depth*.51);
  const relative=b.v.clone().sub(a.v),vn=relative.dot(axis);
  if(vn<0){
   const impulse=-(1+.1)*vn/(1/a.mass+1/b.mass);
   a.v.addScaledVector(axis,-impulse/a.mass);b.v.addScaledVector(axis,impulse/b.mass);
   const tangent=relative.addScaledVector(axis,-vn);
   a.v.addScaledVector(tangent,.09);b.v.addScaledVector(tangent,-.09);
   a.spin.multiplyScalar(.9);b.spin.multiplyScalar(.9);pairHits++;
  }
 }
 function update(dt){
  dt=Math.min(.05,Math.max(0,dt||0));clock+=dt;
  if(spawned<72&&clock>=.19){clock-=.19;spawn();}
  const count=Math.max(1,Math.ceil(dt/.008)),step=dt/count;
  for(let k=0;k<count;k++){
   for(const body of bodies){
    body.v.y-=P.gravity*step;body.mesh.position.addScaledVector(body.v,step);
    const speed=body.spin.length();
    if(speed>.00001){rotation.setFromAxisAngle(body.spin.clone().normalize(),speed*step);body.mesh.quaternion.premultiply(rotation);}
    terrainContact(body);
   }
   for(let pass=0;pass<2;pass++)for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++)collide(bodies[i],bodies[j]);
  }
 }
 return {update,inspect:()=>({name:'Stone & Root brick rain',count:bodies.length,terrainHits,pairHits,mass:5,gravity:P.gravity,terrainRestitution:P.microRestitution,brickRestitution:.1,collision:'signed field + oriented box SAT'})};
}
