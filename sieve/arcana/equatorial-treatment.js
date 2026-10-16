// Reusable equatorial edge-treatment comparison fixture.
// Not the optional occlusion wall; preserve the authored treatment presets.
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
export function createEquatorialTreatment({terrain,parent}){
 const edgeGeometry=(()=>{
  const innerRadius=10.07, apertureRadius=9.72;
  const heights=[-1.15,-0.575,0,0.575,1.15], angles=32, radialSamples=24;
  return {kind:'signed-field-cross-section',innerRadius,apertureRadius,
   rows:heights.map(y=>{
    const inner=Math.sqrt(innerRadius**2-y**2), aperture=Math.sqrt(apertureRadius**2-y**2);
    let solid=0,voidSamples=0;
    for(let i=0;i<angles;i++)for(let j=0;j<radialSamples;j++){
     const a=i*Math.PI*2/angles, radius=aperture+(inner-aperture)*(j+0.5)/radialSamples;
     const value=terrain.sample(radius*Math.cos(a),y,radius*Math.sin(a));
     if(value>0)solid++;else voidSamples++;
    }
    return {y,inner,aperture,radialGap:inner-aperture,solid,void:voidSamples};
   })
  };
 })();

 // Equatorial comparison fixture: one batched signed-field skin, rebuilt only on mode change.
 const edgeModes=['Geological curtain','Pin toy','Twin waterfalls','Equifog','Brass occlusion','Curtain + equifog','Curtain + brass','Surface stitching','Shader-only transition','Full intersection'];
 const edgeGroup=new T.Group();edgeGroup.name='equatorial-treatment';parent.add(edgeGroup);
 let edgeIndex=0,edgeMesh=null,edgeBuildMs=0,edgeTriangles=0,edgeSolid=0,edgeVoid=0,edgeRebuilds=0;
 const edgeMaterial=new T.MeshStandardMaterial({color:0xb3b3aa,roughness:.88,metalness:0,side:T.DoubleSide,vertexColors:true});
 const edgeBrass=new T.MeshStandardMaterial({color:0xc99b50,metalness:.8,roughness:.3,side:T.DoubleSide});
 let edgeTrim=null;
 function setEdgeMode(index){
  edgeIndex=(index+edgeModes.length)%edgeModes.length;
  const t0=performance.now();
  if(edgeMesh){edgeGroup.remove(edgeMesh);edgeMesh.geometry.dispose();edgeMesh=null}
  if(edgeTrim){edgeGroup.remove(edgeTrim);edgeTrim.geometry.dispose();edgeTrim=null}
  const mode=edgeIndex,full=mode===9,shaderOnly=mode===8;
  terrain.setAperture(full?10.04:mode===7?9.83:mode===8?9.92:9.72);
  const segments=mode===1?160:mode===2?192:128,levels=mode===1?10:mode===2?18:12;
  const pos=[],colors=[];edgeSolid=0;edgeVoid=0;
  const color=new T.Color();
  const radius=mode===7?9.82:9.68;
  const emit=(a,b,c,shade)=>{for(const p of [a,b,c]){pos.push(...p);color.setRGB(shade[0],shade[1],shade[2]);colors.push(color.r,color.g,color.b)}};
  if(!full&&!shaderOnly){
   for(let i=0;i<segments;i++){
    const a0=i*2*Math.PI/segments,a1=(i+1)*2*Math.PI/segments;
    for(let j=0;j<levels;j++){
     const y0=-1.15+j*2.3/levels,y1=-1.15+(j+1)*2.3/levels;
     const ym=(y0+y1)/2,am=(a0+a1)/2;
     const geologicalX=radius*Math.cos(am)+wandererOffsetX(),geologicalZ=radius*Math.sin(am)+wandererOffsetZ();
     if(terrain.sample(geologicalX,ym,geologicalZ)<=0){edgeVoid++;continue}
     edgeSolid++;
     const warp=mode===1?0.035*Math.sin(i*2.4):mode===2?0.07*Math.sin(j*.9+i*.21):0;
     const vertex=(a,y)=>[(radius+warp)*Math.cos(a),y,(radius+warp)*Math.sin(a)];
     const p0=vertex(a0,y0),p1=vertex(a1,y0),p2=vertex(a0,y1),p3=vertex(a1,y1);
     const fog=mode===3||mode===5;
     const brass=mode===4;
     const shade=brass?[.48,.30,.12]:fog?[.14,.25,.28]:mode===2?[.39,.44,.45]:mode===1?[.48,.49,.46]:[.52,.51,.48];
     emit(p0,p1,p2,shade);emit(p2,p1,p3,shade);
    }
   }
   const geometry=new T.BufferGeometry();
   geometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));
   geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
   geometry.computeVertexNormals();geometry.computeBoundingSphere();
   const mat=edgeMaterial.clone();mat.transparent=mode===3||mode===5;mat.opacity=mode===3?.24:mode===5?.58:1;mat.depthWrite=!(mode===3||mode===5);mat.metalness=mode===4?.7:0;
   edgeMesh=new T.Mesh(geometry,mat);edgeMesh.frustumCulled=false;edgeGroup.add(edgeMesh);
   if(mode===6||mode===4){edgeTrim=new T.Mesh(new T.TorusGeometry(9.69,.035,6,128),edgeBrass);edgeTrim.rotation.x=Math.PI/2;edgeGroup.add(edgeTrim)}
  }
  edgeTriangles=pos.length/9;edgeRebuilds++;edgeBuildMs=+(performance.now()-t0).toFixed(2);
 }
 let edgeWanderX=0,edgeWanderZ=0;
 function wandererOffsetX(){return edgeWanderX}
 function wandererOffsetZ(){return edgeWanderZ}
 const originalSetOffset=terrain.setOffset;
 terrain.setOffset=(x,z)=>{originalSetOffset(x,z);edgeWanderX=x;edgeWanderZ=z};
 // Static fixture for comparison; edge skin is resampled when the treatment changes.
 setEdgeMode(0);


 setEdgeMode(8);

 return {group:edgeGroup,cycle:()=>{setEdgeMode(edgeIndex+1);return edgeModes[edgeIndex]},getMode:()=>edgeModes[edgeIndex],inspect:()=>({mode:edgeModes[edgeIndex],index:edgeIndex,triangles:edgeTriangles,rebuilds:edgeRebuilds,buildMs:edgeBuildMs,solid:edgeSolid,void:edgeVoid}),geometry:edgeGeometry};
}
