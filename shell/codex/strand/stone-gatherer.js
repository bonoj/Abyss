// Strand's first resident: local discover -> claim -> travel -> carry -> place.
// The resident never creates stone or credits inventory; brick-rain owns physical bodies.
export function createStoneGatherer(T,{parent,surface,bricks,visibleEntity=()=>true}){
 const root=new T.Group();root.name='Stone gatherer';parent.add(root);
 const mat=new T.MeshStandardMaterial({color:0x9c7855,roughness:1,flatShading:true});
 const headMat=new T.MeshStandardMaterial({color:0xd1c09c,roughness:1,flatShading:true});
 const body=new T.Mesh(new T.CapsuleGeometry(.11,.24,3,5),mat);
 const head=new T.Mesh(new T.IcosahedronGeometry(.125,0),headMat);
 head.position.y=.39;root.add(body,head);
 const home=new T.Vector3(4.5,0,2.0),position=new T.Vector3(4.5,0,2.0);
 let state='search',stone=null,delivered=0,elapsed=0,wait=0;
 const speed=.65,handHeight=.30,homeRadius=.65;
 function ground(x,z){const y=surface(x,z);return y===null?null:y;}
 function move(target,dt){
  const dx=target.x-position.x,dz=target.z-position.z,dist=Math.hypot(dx,dz);
  if(dist<.18)return true;
  const stride=Math.min(dist,speed*dt),nx=position.x+dx/dist*stride,nz=position.z+dz/dist*stride;
  const y=ground(nx,nz);
  if(y===null||Math.abs(y-position.y)>0.5)return false;
  position.set(nx,y,nz);root.rotation.y=Math.atan2(dx,dz);return dist<=stride+.18;
 }
 const startY=ground(position.x,position.z);if(startY!==null)position.y=startY;
 function update(dt){
  const delta=Math.min(.05,Math.max(0,dt||0));elapsed+=delta;
  if(state==='search'){
   wait-=delta;
   if(wait<=0){stone=bricks.claimStone(position,3.2);if(stone)state='approach';else wait=1.5;}
  }else if(state==='approach'){
   if(!stone||!stone.claimed){stone=null;state='search';}
   else if(move(stone.mesh.position,delta)){
    if(bricks.carryStone(stone,new T.Vector3(position.x,position.y+handHeight,position.z)))state='return';
    else{stone=null;state='search';}
   }
  }else if(state==='return'){
   move(home,delta);
   if(stone)bricks.carryStone(stone,new T.Vector3(position.x,position.y+handHeight,position.z));
   if(Math.hypot(home.x-position.x,home.z-position.z)<homeRadius){
    // Real stone is released into existing rigid-body physics, not credited remotely.
    const column=delivered%5,row=Math.floor(delivered/5);
    const x=home.x+(column-2)*.40,z=home.z+row*.47;
    const y=ground(x,z);
    if(y!==null&&stone){bricks.placeStone(stone,new T.Vector3(x,y+.42,z));delivered++;stone=null;state='search';wait=.5;}
   }
  }
  root.position.copy(position);root.visible=visibleEntity(position.x,position.y+.2,position.z,.55);
 }
 return {update,inspect:()=>({name:'Stone gatherer',state,delivered,carrying:stone?.id??null,position:position.toArray(),elapsed})};
}
