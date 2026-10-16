// Composable acceleration field: injectors add acceleration, never move bodies.
// Position is world/terrain coordinates; sample is pure and deterministic for fixed inputs.
export function createGravitySystem({components=[]}={}){
 const sources=new Map();
 function add(component){
  if(!component||typeof component.id!=='string'||!component.id||typeof component.sample!=='function')throw Error('gravity component requires id and sample(position,time)');
  if(sources.has(component.id))throw Error('duplicate gravity component '+component.id);
  sources.set(component.id,component);
  return ()=>sources.delete(component.id);
 }
 for(const c of components)add(c);
 function sample(position,time=0){
  const total={x:0,y:0,z:0};
  for(const c of sources.values()){
   const a=c.sample(position,time);
   if(!a)continue;
   for(const axis of ['x','y','z']){const v=a[axis]??0;if(!Number.isFinite(v))throw Error('nonfinite gravity '+c.id);total[axis]+=v}
  }
  return total;
 }
 function inspect(){return {name:'gravity',mode:'additive acceleration field',components:[...sources.values()].map(c=>({id:c.id,kind:c.kind??'custom'}))}}
 return {add,sample,inspect};
}
export function uniformGravity({id='surface',x=0,y=-9.8,z=0}={}){
 return {id,kind:'uniform',sample:()=>({x,y,z})};
}
// A radial component can represent localized wells, inverted regions, or underworld pulls.
export function radialGravity({id,center={x:0,y:0,z:0},strength=9.8,softening=1}={}){
 if(!(softening>0))throw Error('softening must be positive');
 return {id,kind:'radial',sample:p=>{
  const dx=center.x-p.x,dy=center.y-p.y,dz=center.z-p.z;
  const r2=dx*dx+dy*dy+dz*dz;
  const factor=strength/Math.pow(r2+softening*softening,1.5);
  return {x:dx*factor,y:dy*factor,z:dz*factor};
 }};
}
