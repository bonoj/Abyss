// Two host-local moss colonies, with slow growth and instanced shoots.
export function createMossExperiment(T,{parent,retina}){
 const root=new T.Group();root.name='Strand moss';parent.add(root);
 const hosts=[],colonies=[];
 const stone=new T.MeshStandardMaterial({color:0x888e86,roughness:1,flatShading:true});
 const wood=new T.MeshStandardMaterial({color:0x956b43,roughness:1,flatShading:true});
 const green=new T.MeshStandardMaterial({color:0x608d46,roughness:1,side:T.DoubleSide});
 const light=new T.MeshStandardMaterial({color:0x96bd61,roughness:1});
 const geo=new T.BoxGeometry(1.5,.7,1.1),sprout=new T.ConeGeometry(.024,.12,4);
 const dummy=new T.Object3D();let time=0,ticks=0,acc=0;
 for(let i=0;i<2;i++){
  const group=new T.Group();group.position.set(i===0?-1.6:1.6,1.9,i===0?-.5:.5);root.add(group);
  const block=new T.Mesh(geo,i===0?stone:wood);block.castShadow=true;block.receiveShadow=true;group.add(block);
  const patch=new T.Mesh(new T.CircleGeometry(1,32),green);patch.rotation.x=-Math.PI/2;patch.position.y=.355;group.add(patch);
  const shoots=new T.InstancedMesh(sprout,light,256);shoots.count=0;shoots.frustumCulled=false;group.add(shoots);
  hosts.push({group,patch,shoots,material:i===0?'stone':'wood'});
  colonies.push({host:i,age:0,radius:0,coverage:0,shoots:0});
  retina.register('moss-'+i,{position:()=>group.position,visible:v=>{group.visible=v}});
 }
 function grow(){
  for(const c of colonies){
   const h=hosts[c.host];c.age=time;
   c.radius=Math.min(.46,c.radius+.0016*(c.host===0?1:.78)*(1-c.radius/.55));
   c.coverage=(c.radius/.46)**2;
   h.patch.scale.setScalar(c.radius);h.patch.visible=c.radius>.01;
   const count=Math.min(256,Math.floor(c.coverage*256));
   for(let j=0;j<count;j++){
    const angle=j*2.399963,rr=Math.sqrt((j+.5)/256)*c.radius;
    dummy.position.set(Math.cos(angle)*rr,.4,Math.sin(angle)*rr);
    dummy.rotation.set(0,angle,0);dummy.scale.setScalar(.65+(j%7)*.09);
    dummy.updateMatrix();h.shoots.setMatrixAt(j,dummy.matrix);
   }
   h.shoots.count=count;h.shoots.instanceMatrix.needsUpdate=true;c.shoots=count;
  }
 }
 function update(dt){acc+=Math.min(.1,Math.max(0,dt));while(acc>=.25){acc-=.25;time+=.25;ticks++;grow();}}
 return {update,inspect:()=>({name:'Strand moss',biologySeconds:time,ticks,colonies:colonies.map(c=>({...c})),hosts:hosts.map(h=>({material:h.material,visible:h.group.visible})),shootInstances:colonies.reduce((n,c)=>n+c.shoots,0)})};
}
