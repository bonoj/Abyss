// Second Garden: six distinct BB topologies, geological attachments and reversible assembly.
// All visible plant geometry is instanced spheres. No changes to terrain or host.
export function createSecondGarden(T,{terrain,surface,offset=()=>({x:0,z:0}),characters=()=>[],parent=null,radius=9.72,seed=741}={}){
 if(!terrain?.sample||!surface)throw Error('Second Garden requires terrain.sample and surface');
 const group=new T.Group();group.name='Second Garden';if(parent)parent.add(group);
 const rnd=n=>{const v=Math.sin(n*127.1+seed*19.71)*43758.5453;return v-Math.floor(v)};
 const clamp=x=>Math.max(0,Math.min(1,x));
 const species=['mycelial-lace','glassfall','star-anemones','cinder-chimneys','geode-hearts','tumble-orbs'];
 const colors=[0x248ca7,0x69ced4,0xd9ca8a,0xf2e7c9,0x8862c8,0xd58acb,0x86694f,0xc19b70,0x8066a9,0xc9b3de,0xb87949,0xe2c99a].map(x=>new T.Color(x));
 const plants=[],beads=[];
 function plant(s,x,z,y,scale=1){const p={id:plants.length,s,x,z,y,scale,phase:rnd(plants.length*9+4)*6.28,growth:0};plants.push(p);return p}
 function bb(p,x,y,z,r,c,rank,tip=0){beads.push({id:p.id,x,y,z,r,c,rank:clamp(rank),tip})}
 function chain(p,pts,n,r,c,lo,hi){
  for(let i=0;i<n;i++){const t=i/(n-1),q=t*(pts.length-1),j=Math.min(pts.length-2,Math.floor(q)),f=q-j,a=pts[j],b=pts[j+1];bb(p,a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,r*(.8+.35*rnd(i+p.id*99)),c,lo+(hi-lo)*t,t)}
 }
 function ring(p,y,rx,rz,n,c,rank,cx=0,cz=0){
  for(let i=0;i<n;i++){const a=i*2*Math.PI/n;bb(p,cx+Math.cos(a)*rx,y,cz+Math.sin(a)*rz,.032+.009*rnd(i+p.id*13),c,rank+.025*i/n,.6)}
 }
 function clump(p,x,y,z,rx,ry,rz,n,c,lo,hi){
  for(let i=0;i<n;i++){const a=i*2.399963,v=1-2*(i+.5)/n,w=Math.sqrt(Math.max(0,1-v*v));bb(p,x+Math.cos(a)*w*rx,y+v*ry,z+Math.sin(a)*w*rz,.028+.017*rnd(i+p.id*101),c,lo+(hi-lo)*(i+.5)/n,.4)}
 }
 // Find an actual downward-facing signed-field boundary at a fixed geological x,z.
 function underside(x,z){
  let prev=terrain.sample(x,-3.58,z);
  for(let y=-3.51;y<3.55;y+=.065){const v=terrain.sample(x,y,z);
   if(prev<=0&&v>0){let a=y-.065,b=y;for(let k=0;k<8;k++){const m=(a+b)/2;if(terrain.sample(x,m,z)>0)b=m;else a=m}return (a+b)/2}
   prev=v;
  }return null;
 }
 // Mycelial Lace: surface-hugging branching paths, no straight floating bridges.
 for(let k=0;k<3;k++){
  const x=-5.7+k*.62,z=-3.5+k*.47,y=surface(x,z);if(y==null)continue;
  const p=plant(0,x,z,y);
  for(let branch=0;branch<7;branch++){const a=branch*2.399+k*.7,len=.7+rnd(k*19+branch)*1.1;let prev=null;
   for(let j=0;j<28;j++){const t=j/27,xx=x+Math.cos(a+t*.38)*len*t,zz=z+Math.sin(a+t*.38)*len*t,yy=surface(xx,zz);if(yy==null){prev=null;continue}
    const point=[xx-x,yy-y+.055,zz-z];if(prev&&Math.hypot(point[0]-prev[0],point[1]-prev[1],point[2]-prev[2])<.24)
     chain(p,[prev,point],3,.027,branch%4===0?1:0,t*.8,(t+.02)*.8);
    if(j%7===0)bb(p,...point,.055,1,t*.82,.2);prev=point;
   }
  }
 }
 // Glassfall: real underside roots; grow away from ceiling in negative Y.
 for(let k=0;k<10;k++){
  const x=-5.3+(k%5)*.32,z=-4.5+Math.floor(k/5)*.55,y=underside(x,z);
  if(y==null||surface(x,z)==null||surface(x,z)-y<.3)continue;
  const p=plant(1,x,z,y),length=.45+rnd(k*8+3)*.85;
  for(let strand=0;strand<5;strand++){const a=strand*2.4,dx=Math.cos(a)*.12,dz=Math.sin(a)*.12;
   chain(p,[[dx,0,dz],[dx*.9,-length*.45,dz*.9],[dx*.5,-length,dz*.5]],19,.033,strand%2?3:2,.05,.94);
   bb(p,dx*.5,-length,dz*.5,.065,3,.99,1);
  }
 }
 // Star Anemones: radial articulated arms and dense nucleus.
 for(let k=0;k<4;k++){const x=.8+(k%2)*1.15,z=-3.6+Math.floor(k/2)*1.1,y=surface(x,z);if(y==null)continue;
  const p=plant(2,x,z,y);clump(p,0,.20,0,.24,.20,.24,110,4,.05,.36);
  for(let a=0;a<16;a++){const angle=a*Math.PI/8,len=.58+rnd(k*20+a)*.38;
   const pts=[[0,.24,0],[Math.cos(angle)*len*.48,.36,Math.sin(angle)*len*.48],[Math.cos(angle)*len,.24+Math.sin(a)*.09,Math.sin(angle)*len]];
   chain(p,pts,20,.032,4,.35,.94);bb(p,...pts[2],.065,5,.98,1);
  }
 }
 // Cinder Chimneys: hollow BB wall rings, open throats.
 for(let k=0;k<5;k++){const x=4.6+(k%3)*.48,z=-.8+Math.floor(k/3)*.65,y=surface(x,z);if(y==null)continue;
  const p=plant(3,x,z,y),h=.7+rnd(k*7+2)*.9;
  for(let j=0;j<20;j++){const t=j/19,rad=(.23-.085*t)*(1+.05*Math.sin(t*13+k));
   ring(p,h*t,rad,rad,19,j%4===0?7:6,.05+.9*t);
  }
 }
 // Geode Hearts: shell rings around *existing* exposed cavity walls; no excavation.
 for(let k=0;k<3;k++){const x=4.1+k*.46,z=-5.3+k*.22,y=surface(x,z);if(y==null)continue;
  const p=plant(4,x,z,y);
  for(let layer=0;layer<7;layer++){const r=.20+layer*.07;for(let j=0;j<42;j++){
   const a=j*2*Math.PI/42;bb(p,Math.cos(a)*r,.11+Math.sin(a*3)*.04,Math.sin(a)*r,.035,layer<3?8:9,.12+layer*.12+j*.0003,.2)
  }}
  clump(p,0,.10,0,.22,.10,.22,85,8,.3,.92);
 }
 // Tumble Orbs: freely oriented spherical BB lattice, rocking in place until locomotion exists.
 for(let k=0;k<4;k++){const x=5.2+(k%2)*.85,z=2.2+Math.floor(k/2)*.85,y=surface(x,z);if(y==null)continue;
  const p=plant(5,x,z,y),R=.31+rnd(k*11+3)*.12;
  for(let loop=0;loop<8;loop++){const tilt=loop*Math.PI/8;
   for(let j=0;j<45;j++){const a=j*2*Math.PI/45,xx=Math.cos(a)*R,yy=Math.sin(a)*R,zz=xx*Math.sin(tilt),xp=xx*Math.cos(tilt);
    bb(p,xp,R+yy,zz,.032+(j%9===0?.018:0),loop%2?10:11,.08+.85*j/45,.8)
   }
  }
 }
 const geometry=new T.IcosahedronGeometry(1,1),material=new T.MeshStandardMaterial({roughness:.83,metalness:.025});
 const mesh=new T.InstancedMesh(geometry,material,beads.length);mesh.count=0;mesh.frustumCulled=false;group.add(mesh);
 const blastMatrix=new T.Matrix4(),blastPosition=new T.Vector3(),blastRotation=new T.Quaternion(),blastScale=new T.Vector3(),blastColor=new T.Color(),visibleOwners=[];
 const dummy=new T.Object3D();let elapsed=0,visible=0;
 // Index authored anatomy once; impacts must not repeatedly filter the full garden.
 const beadsByPlant=plants.map(()=>[]);
 for(const bead of beads)beadsByPlant[bead.id].push(bead);
 function blast(point,options,debris){
  const affected=new Set(),radiusSq=options.radius*options.radius;
  const o=offset(),px=point.x-o.x,pz=point.z-o.z;
  const matrices=mesh.instanceMatrix.array;
  // Matrix translation is stored directly in column-major slots 12–14.
  for(let i=0;i<mesh.count;i++){
   const m=i*16,dx=matrices[m+12]-px,dy=matrices[m+13]-point.y,dz=matrices[m+14]-pz;
   if(dx*dx+dy*dy+dz*dz<=radiusSq)affected.add(visibleOwners[i]);
  }
  if(!affected.size)return 0;
  const items=[],seen=new Map();
  for(let i=0;i<mesh.count;i++){
   const id=visibleOwners[i];if(!affected.has(id))continue;
   seen.set(id,(seen.get(id)||0)+1);
   mesh.getMatrixAt(i,blastMatrix);
   blastMatrix.decompose(blastPosition,blastRotation,blastScale);
   mesh.getColorAt(i,blastColor);
   items.push({x:blastPosition.x+o.x,y:blastPosition.y,z:blastPosition.z+o.z,r:blastScale.x,color:blastColor.clone()});
  }
  if(!debris.canAccept(items.length))return 0;
  // Preserve existing hidden-anatomy fallback order and BB conservation.
  for(const id of affected){
   const hidden=beadsByPlant[id],p=plants[id],missing=hidden.length-(seen.get(id)||0);
   for(let j=0;j<missing;j++){
    const bead=hidden[j%hidden.length];
    items.push({x:p.x+(bead.x||0),y:p.y+bead.y,z:p.z+(bead.z||0),r:bead.r,color:colors[bead.c].clone()});
   }
  }
  const emitted=debris.emit(items,point,options.impulse);
  for(const id of affected)plants[id].destroyed=true;
  return emitted;
 }
 function update(dt){dt=Math.max(0,Math.min(dt,.1));elapsed+=dt;const {x:ox=0,z:oz=0}=offset(),actors=characters();
  for(const p of plants){if(p.destroyed)continue;const nearby=actors.some(a=>Math.hypot(a.x-p.x,a.z-p.z)<.68);const target=nearby?0:1;p.growth+=(target-p.growth)*Math.min(1,dt*(target>p.growth?3.6:7.5))}
  visible=0;
  for(const b of beads){const p=plants[b.id];if(p.destroyed)continue;const g=clamp((p.growth-b.rank)*14);if(g<=.01)continue;
   const wave=Math.sin(elapsed*.82+p.phase)*.035*b.tip,xx=p.x-ox+(b.x+wave)*g,yy=p.y+b.y*g-(1-g)*.12,zz=p.z-oz+(b.z+Math.cos(elapsed*.73+p.phase)*.027*b.tip)*g;
   if(xx*xx+yy*yy+zz*zz>(radius-.13)**2)continue;
   dummy.position.set(xx,yy,zz);dummy.scale.setScalar(b.r*(.25+.75*g));dummy.updateMatrix();visibleOwners[visible]=b.id;mesh.setMatrixAt(visible,dummy.matrix);mesh.setColorAt(visible,colors[b.c]);visible++;
  }
  mesh.count=visible;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 }
 return {group,update,blast,inspect:()=>({name:'Second Garden',roots:plants.length,beads:beads.length,activeBeads:beads.reduce((n,b)=>n+(plants[b.id].destroyed?0:1),0),visible,species:species.map((name,s)=>({name,roots:plants.filter(p=>p.s===s).length}))}),dispose(){group.removeFromParent();geometry.dispose();material.dispose()}};
}
