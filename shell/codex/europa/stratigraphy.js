// Synthetic geological hypotheses, never inferred Europa measurements.
// Provenance is independent of the generic render-material IDs.
export function createStratigraphy({seed=741,surfaceAt=null}={}){
 if(!Number.isInteger(seed))throw Error('integer seed required');
 const sample=(x,y,z)=>{
  if(![x,y,z].every(Number.isFinite))throw Error('invalid coordinates');
  const top=surfaceAt?surfaceAt(x,z):1.15+0.13*Math.sin(x*.47+seed*.001)*Math.cos(z*.31);
  const depth=Math.max(0,top-y);
  const boundary1=.28+.07*Math.sin(x*.45+z*.24);
  const boundary2=.83+.12*Math.cos(x*.23-z*.37);
  const fault=Math.abs(x-(1.8+0.34*z+0.25*Math.sin(z*.8)));
  const fracture=fault<.38;
  const lens=Math.pow((x+3.1)/2.4,2)+Math.pow((z-2.2)/3.4,2)+Math.pow((depth-.75)/.34,2)<1;
  const unit=lens?'transported-lens':depth<boundary1?'radiolytic-skin':depth<boundary2?'reworked-ice':'inherited-ice';
  const exchange=unit==='transported-lens'?.67:unit==='inherited-ice'?.48:unit==='reworked-ice'?.22:.05;
  const alteration=Math.exp(-depth/.24);
  const exogenic=unit==='radiolytic-skin'?.26:.035;
  const composition={waterIce:1,soluteProxy:Math.min(.25,.015+.09*exchange+.025*exogenic+(fracture?.018:0))};
  composition.waterIce=1-composition.soluteProxy;
  return {unit,depth:+depth.toFixed(4),composition,
   provenance:{hypothesis:'synthetic-stratigraphy/v0',endogenicProxy:exchange,exogenicProxy:exogenic,
    alterationIndex:+alteration.toFixed(4),fracture,transportedLens:lens},
   uncertainty:'unconstrained: illustrative synthetic scenario'};
 };
 const crossSection=({x=0,zStart=-8,zEnd=8,yTop=1.8,yBottom=-1.5,columns=41,rows=24}={})=>{
  if(![x,zStart,zEnd,yTop,yBottom].every(Number.isFinite)||zStart>=zEnd||yBottom>=yTop||columns<2||rows<2||columns>256||rows>256)throw Error('invalid section');
  const cells=[];
  for(let j=0;j<rows;j++){const row=[];for(let i=0;i<columns;i++){
   const z=zStart+(zEnd-zStart)*i/(columns-1),y=yTop-(yTop-yBottom)*j/(rows-1);
   row.push(sample(x,y,z));
  }cells.push(row)}
  return {schema:'europa-cross-section/v0',synthetic:true,x,zStart,zEnd,yTop,yBottom,columns,rows,cells};
 };
 const surfaceMap=({xStart=-8,xEnd=8,zStart=-8,zEnd=8,columns=41,rows=41,depth=0.15}={})=>{
  if(![xStart,xEnd,zStart,zEnd,depth].every(Number.isFinite)||xStart>=xEnd||zStart>=zEnd||depth<0||!Number.isInteger(columns)||!Number.isInteger(rows)||columns<2||rows<2||columns>256||rows>256)throw Error('invalid map');
  const cells=Array.from({length:rows},(_,j)=>Array.from({length:columns},(_,i)=>{
   const x=xStart+(xEnd-xStart)*i/(columns-1),z=zStart+(zEnd-zStart)*j/(rows-1);
   const top=surfaceAt?surfaceAt(x,z):1.15+.13*Math.sin(x*.47+seed*.001)*Math.cos(z*.31);
   return sample(x,top-depth,z);
  }));
  return {schema:'europa-synthetic-map/v0',synthetic:true,xStart,xEnd,zStart,zEnd,depth,columns,rows,cells};
 };
 return {sample,crossSection,surfaceMap};
}
