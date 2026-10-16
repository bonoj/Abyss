// Reusable terrain tap routing and bounded ownership diagnostics.
// Terrain remains authoritative for hit classification; the actor owns movement.
export function createTerrainNavigation({terrain,actor}){
 let view=null;
 const report={total:0,underside:0,navigation:0,rayMiss:0,last:null,recent:[]};
 const attachView=next=>{view=next};
 const tap=(x,y)=>{
  if(!view)return;
  report.total++;
  const result=terrain.interact(x,y,view,actor.getWalkingHeight());
  if(!result.hit)report.rayMiss++;
  if(result.owner==='terrain-underside')report.underside++;
  else if(result.target){report.navigation++;actor.moveTo(result.target.x,result.target.z)}
  const record={owner:result.owner,normalY:result.normalY,point:result.point,hit:result.hit,screen:[Math.round(x),Math.round(y)]};
  report.last=record;report.recent.push(record);
  if(report.recent.length>16)report.recent.shift();
 };
 return {attachView,tap,inspect:()=>({...report,recent:[...report.recent]})};
}
