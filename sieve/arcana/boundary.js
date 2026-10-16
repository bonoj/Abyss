// Pure boundary extraction. Positive signed density is solid; zero and negative are void.
// Probe a supplied vertical curve; return every solid interval, including entirely solid columns.
export function extractIntervals(sample, point, yMin, yMax, steps=96, refine=7){
 const crossings=[], intervals=[];
 const classify=y=>sample(...point(y).slice(0,1),y,point(y)[1])>0;
 let previousY=yMin, previousSolid=classify(yMin),start=previousSolid?yMin:null;
 for(let j=1;j<=steps;j++){
  const y=yMin+(yMax-yMin)*j/steps,solid=classify(y);
  if(solid!==previousSolid){
   let lo=previousY,hi=y;
   for(let k=0;k<refine;k++){
    const mid=(lo+hi)/2;
    if(classify(mid)===previousSolid)lo=mid;else hi=mid;
   }
   const crossing=(lo+hi)/2;
   crossings.push({y:crossing,fromSolid:previousSolid,toSolid:solid});
   if(previousSolid){intervals.push({from:start,to:crossing});start=null}
   else start=crossing;
  }
  previousY=y;previousSolid=solid;
 }
 if(previousSolid)intervals.push({from:start,to:yMax});
 return {crossings,intervals,startsSolid:classify(yMin),endsSolid:previousSolid};
}
