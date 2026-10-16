// Authored inventory and detached material are separate, conserved inventories.
// Accept live systems so every survey reflects the current world state.
export function createMaterialSurvey({populations,debris}){
 return function materialSurvey(){
  const snapshots=populations.map(s=>s.inspect());
  const loose=debris.inspect();
  const inventory=s=>(s.activeBeads??s.beads??s.descriptors??0);
  const authored=snapshots.reduce((n,s)=>n+inventory(s),0);
  const visibleAuthored=snapshots.reduce((n,s)=>n+(s.visible??0),0);
  return {authored,detached:loose.count,total:authored+loose.count,visible:visibleAuthored+loose.visible,visibleAuthored,visibleDetached:loose.visible,ownership:loose.ownership,allocated:loose.allocated,populations:snapshots.map(s=>({name:s.name,inventory:inventory(s),visible:s.visible??0}))};
 };
}
