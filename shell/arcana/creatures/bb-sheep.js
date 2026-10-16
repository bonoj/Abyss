import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
export function createSheep({surface,offset,wanderer,debris,parent,seed=741}){
 const group=new T.Group();group.name='White BB sheep';parent.add(group);
 const animals=[],beads=[],white=new T.Color(0xf3f0e8),cream=new T.Color(0xf5d7b0),red=new T.Color(0xb94444);
 const rand=n=>{const x=Math.sin(n*127.1+seed*19.7)*43758.5453;return x-Math.floor(x)};
 const herds=[[-8,-5],[3,6],[13,-7],[-14,10],[6,-14]];
 for(let h=0;h<herds.length;h++)for(let j=0;j<4;j++){
  const x=herds[h][0]+(rand(h*20+j*2)-.5)*4,z=herds[h][1]+(rand(h*20+j*2+1)-.5)*4;
  const y=surface(x,z);if(y==null)continue;
  const id=animals.length;animals.push({x,y,z,alive:true,herd:h});
  for(let k=0;k<240;k++){
   const a=k*2.399963,b=Math.acos(1-2*(k+.5)/240);
   const shell=k<170,rx=Math.sin(b)*Math.cos(a),ry=Math.cos(b),rz=Math.sin(b)*Math.sin(a);
   beads.push({id,x:rx*(shell?.43:.31),y:.58+ry*(shell?.34:.26),z:rz*(shell?.29:.22),r:shell?.045:.038,color:shell?white:(k%3===0?red:cream)});
  }
  for(let leg=0;leg<4;leg++)for(let k=0;k<7;k++)beads.push({id,x:(leg<2?-.26:.26),y:.35-k*.045,z:leg%2?-.19:.19,r:.043,color:white});
  for(let k=0;k<25;k++){const a=k*2.399,b=Math.acos(1-2*(k+.5)/25);beads.push({id,x:.45+Math.sin(b)*Math.cos(a)*.19,y:.76+Math.cos(b)*.17,z:Math.sin(b)*Math.sin(a)*.16,r:.044,color:white})}
 }
 const geo=new T.IcosahedronGeometry(1,0),mat=new T.MeshStandardMaterial({roughness:.9});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.frustumCulled=false;group.add(mesh);
 const dummy=new T.Object3D();let detonations=0;
 function update(){
  const w=wanderer(),o=offset();
  for(const a of animals){if(!a.alive)continue;const y=surface(a.x,a.z);if(y!=null)a.y=y;
   if(Math.hypot(a.x-w.x,a.z-w.z)<2.1){
    a.alive=false;detonations++;
    const items=beads.filter(b=>b.id===animals.indexOf(a)).map(b=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z,r:b.r,color:b.color.getHex()}));
    debris.emit(items,{x:a.x,y:a.y+.55,z:a.z},8);
   }
  }
  let n=0;for(const b of beads){const a=animals[b.id];if(!a.alive)continue;
   dummy.position.set(a.x+b.x-o.x,a.y+b.y,a.z+b.z-o.z);dummy.scale.setScalar(b.r);dummy.updateMatrix();
   mesh.setMatrixAt(n,dummy.matrix);mesh.setColorAt(n,b.color);n++;
  }mesh.count=n;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 update();
 return {update,inspect:()=>({name:'White BB sheep',herds:herds.length,sheep:animals.length,alive:animals.filter(a=>a.alive).length,detonations,authoredBeads:beads.length,visibleBeads:mesh.count})};
}
