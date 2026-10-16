// Shared signed-field top-surface lookup. Preserve Genesis's original crossing semantics.
export function createTerrainSurfaceQuery(terrain){
 return function terrainSurface(x,z){
  let prior=terrain.sample(x,3.58,z);
  for(let y=3.52;y>=-3.58;y-=.07){
   const value=terrain.sample(x,y,z);
   if(prior<=0&&value>0){
    let lo=y,hi=y+.07;
    for(let k=0;k<9;k++){const mid=(lo+hi)/2;if(terrain.sample(x,mid,z)>0)lo=mid;else hi=mid;}
    return (lo+hi)/2;
   }
   prior=value;
  }
  return null;
 };
}
