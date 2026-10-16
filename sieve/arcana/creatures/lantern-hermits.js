import {applyRadialImpulse} from '../physics/impulse.js';
import {stepGrounded} from '../locomotion/grounding.js';
// Lantern Hermits: asymmetric BB-shell collectors, terrain-supported walking.
export function createLanternHermits(T,{surface,offset=()=>({x:0,z:0}),wanderer=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72}={}){
 if(typeof surface!=='function')throw Error('Lantern Hermits require surface(x,z)');
 const group=new T.Group();group.name='Lantern Hermits';parent?.add(group);
 const hash=n=>{const v=Math.sin(n*127.1+seed*31.71)*43758.5453;return v-Math.floor(v)};
 const agents=[],beads=[],palette=[0x917654,0xc4a47c,0xf0d19b,0x6e887f,0x443d46,0xe7b85d].map(v=>new T.Color(v));
 function bead(id,x,y,z,r,c,part=0,phase=0){beads.push({id,x,y,z,r,c,part,phase})}
 for(let i=0;i<4;i++){
  const a=i*2.399+5.1,d=2.6+i*.58,x=Math.cos(a)*d,z=Math.sin(a)*d,y=surface(x,z);
  if(y==null)continue;
  const id=agents.length,p={id,x,z,y,homeX:x,homeZ:z,heading:hash(i*9)*6.283,phase:hash(i*17)*6.283,timer:0,step:0,state:'search',gesture:0,speed:.095+hash(i*5)*.045};agents.push(p);
  // Compact asymmetrical body, each visible feature assembled from BBs.
  for(let s=0;s<8;s++){const lx=(s-3.5)*.075,profile=Math.sqrt(Math.max(.15,1-((s-3.5)/4.5)**2));
   for(let j=0;j<16;j++){const t=j*2*Math.PI/16;bead(id,lx,.20+Math.sin(t)*.12*profile,Math.cos(t)*.14*profile,.023+(j%5===0?.008:0),s%3===0?1:0)}
  }
  // Offset, luminous carried shell: hollow concentric BB rings, not a solid mesh.
  for(let ring=0;ring<9;ring++){const phi=(ring+.5)*Math.PI/10,rr=.25*Math.sin(phi),yy=.24+.25*Math.cos(phi);
   for(let j=0;j<22;j++){const a=j*2*Math.PI/22;bead(id,-.08+Math.cos(a)*rr,yy,.09+Math.sin(a)*rr,.021+(ring%3===0?.006:0),ring%3===0?5:ring%2?2:1,3)}
  }
  for(let j=0;j<28;j++){const a=j*2.399,rr=.025+.065*Math.sqrt(j/28);bead(id,-.08+Math.cos(a)*rr,.30+Math.sin(j*1.7)*.06,.09+Math.sin(a)*rr,.021,j%4===0?2:5,3)}
  // Four stepping legs, each two bead-chain links.
  for(const side of [-1,1])for(let leg=0;leg<2;leg++)for(let j=0;j<13;j++){const t=j/12;
   bead(id,(leg===0?.20:-.21)+t*(leg===0?.10:-.06),.20-.19*t,side*(.12+.20*t),.019,leg?3:0,1,(side===1?0:Math.PI)+leg*Math.PI+t*.3);
  }
  // Two grasping arms with jointed collecting gestures.
  for(const side of [-1,1])for(let j=0;j<13;j++){const t=j/12;
   bead(id,.22+.24*t,.25-.14*t,side*(.10+.10*t),.019,j===12?5:1,2,side*1.1+t);
  }
  for(const side of [-1,1])bead(id,.31,.30,side*.09,.041,4);
 }
 const geo=new T.IcosahedronGeometry(1,1),mat=new T.MeshStandardMaterial({roughness:.79,metalness:.035});
 const mesh=new T.InstancedMesh(geo,mat,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const visibleOwners=[];const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastScale=new T.Vector3(),blastRotation=new T.Quaternion(),blastColor=new T.Color();
 const dummy=new T.Object3D();let elapsed=0,visible=0;
 function blast(point,options,debris){
  let hits=0;const destroyed=new Set();
  for(const p of agents){
   if(p.destroyed)continue;
   if(Math.hypot(p.x-point.x,p.y+.2-point.y,p.z-point.z)<opt