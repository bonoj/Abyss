// Strand's first temperate landscape: surface-following weathered stone and vegetation.
export function createTemperateLandscape(T,{parent,surface}){
 const group=new T.Group();group.name='Strand temperate cover';parent.add(group);
 const random=n=>{const x=Math.sin(n*127.1+741)*43758.5453;return x-Math.floor(x)};
 const stone=new T.IcosahedronGeometry(1,1);
 const rockMaterial=new T.MeshStandardMaterial({color:0x74766b,roughness:1,flatShading:true});
 const mossMaterial=new T.MeshStandardMaterial({color:0x49633c,roughness:1,side:T.DoubleSide});
 const fernMaterial=new T.MeshStandardMaterial({color:0x52794a,roughness:1,side:T.DoubleSide});
 const rootMaterial=new T.MeshStandardMaterial({color:0x514538,roughness:1});
 const at=(x,z)=>x*x+z*z<75?surface(x,z):null;
 let rocks=0,moss=0,ferns=0,roots=0;
 for(let i=0;i<36;i++){
  const angle=random(i*5)*Math.PI*2,r=Math.sqrt(random(i*5+1))*3.3;
  const x=-2+Math.cos(angle)*r,z=1+Math.sin(angle)*r,y=at(x,z);if(y==null)continue;
  const size=.3+random(i+30)*.8,mesh=new T.Mesh(stone,rockMaterial);
  mesh.position.set(x,y+size*.2,z);mesh.scale.set(size*(.8+random(i+50)),size*(.4+random(i+70)),size*(.7+random(i+90)));
  mesh.rotation.set(random(i+100),random(i+120)*6.28,random(i+140)*.6);group.add(mesh);rocks++;
 }
 const patchGeo=new T.CircleGeometry(1,7),leafGeo=new T.ConeGeometry(.13,.55,4);
 for(let i=0;i<380;i++){
  const x=(random(i*7)-.5)*16,z=(random(i*7+1)-.5)*16,y=at(x,z);if(y==null)continue;
  if(random(i*7+2)>.6+.2*Math.sin(x*.5+z*.4))continue;
  if(i%9===0){const fern=new T.Group();fern.position.set(x,y+.1,z);
   for(let k=0;k<6;k++){const leaf=new T.Mesh(leafGeo,fernMaterial);leaf.rotation.z=.65;leaf.rotation.y=k*Math.PI/3;leaf.position.set(Math.cos(k*Math.PI/3)*.14,.24,Math.sin(k*Math.PI/3)*.14);fern.add(leaf)}group.add(fern);ferns++;
  }else{const patch=new T.Mesh(patchGeo,mossMaterial);patch.rotation.x=-Math.PI/2;patch.position.set(x,y+.035,z);patch.scale.setScalar(.12+random(i+400)*.22);group.add(patch);moss++}
 }
 for(let i=0;i<16;i++){
  const x=-2+(random(i+800)-.5)*5,z=1+(random(i+900)-.5)*5,points=[];
  for(let j=0;j<7;j++){const xx=x+j*.16,zz=z+Math.sin(j*.5+i)*.15,y=at(xx,zz);if(y!=null)points.push(new T.Vector3(xx,y+.07,zz))}
  if(points.length<3)continue;const root=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),16,.025,5,false),rootMaterial);group.add(root);roots++;
 }
 const mistMaterial=new T.MeshBasicMaterial({color:0xb4c3b6,transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide});
 let mist=0;for(let i=0;i<8;i++){const x=(random(i+1000)-.5)*12,z=(random(i+1100)-.5)*12,y=at(x,z);if(y==null)continue;
  const plane=new T.Mesh(new T.PlaneGeometry(2.8,1.3),mistMaterial);plane.rotation.x=-Math.PI/2;plane.position.set(x,y+.2,z);group.add(plane);mist++}
 return {group,inspect:()=>({name:'Strand temperate cover',rocks,moss,ferns,roots,mist,seed:741})};
}
