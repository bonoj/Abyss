import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
// Optional signed-field spherical occlusion wall. Never mounted by default.
// Supply a terrain with sample(x,y,z); call setOffset when its offset changes.
export function createOcclusionWall({terrain,radius=9.72}){
 const fieldSample=terrain.sample;
 let wanderX=0,wanderZ=0,activeAperture=radius;
 const solid=new T.Group();solid.name='occlusion-wall:offset-root';
 // Signed-field aperture cap: solid is opaque; genuine void remains open.
 // Triangles are clipped against the field's zero crossing, not bore coordinates.
 const capGroup=new T.Group();capGroup.name='terrain:aperture-cap';solid.add(capGroup);
 const capMaterial=new T.MeshStandardMaterial({color:0x7a817e,roughness:1,metalness:0,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 let capMesh=null,capTriangles=0,capBuildMs=0,capRebuilds=0,capEnabled=true;
 function rebuildCap(){
  const start=performance.now(),positions=[],latitude=80,longitude=240,r=activeAperture-0.012;
  const vertex=(i,j)=>{
   const theta=Math.PI*i/latitude,phi=2*Math.PI*j/longitude;
   const x=r*Math.sin(theta)*Math.cos(phi),y=r*Math.cos(theta),z=r*Math.sin(theta)*Math.sin(phi);
   return {p:[x+wanderX,y,z+wanderZ],v:fieldSample(x+wanderX,y,z+wanderZ)};
  };
  // Local coordinates are world coordinates; solid's wander offset is applied by its parent.
  const interpolate=(a,b)=>{const t=a.v/(a.v-b.v);return {p:a.p.map((n,k)=>n+(b.p[k]-n)*t),v:0}};
  const clip=tri=>{
   const polygon=[];
   for(let k=0;k<3;k++){const a=tri[k],b=tri[(k+1)%3],inside=a.v>0,next=b.v>0;
    if(inside)polygon.push(a);
    if(inside!==next)polygon.push(interpolate(a,b));
   }
   for(let k=1;k+1<polygon.length;k++)for(const v of [polygon[0],polygon[k],polygon[k+1]])positions.push(...v.p);
  };
  for(let i=0;i<latitude;i++)for(let j=0;j<longitude;j++){
   const a=vertex(i,j),b=vertex(i+1,j),c=vertex(i,j+1),d=vertex(i+1,j+1);
   clip([a,b,c]);clip([c,b,d]);
  }
  if(capMesh){capGroup.remove(capMesh);capMesh.geometry.dispose()}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
  capMesh=new T.Mesh(geometry,capMaterial);capMesh.frustumCulled=false;capGroup.add(capMesh);
  capTriangles=positions.length/9;capRebuilds++;capBuildMs=+(performance.now()-start).toFixed(2);
 }

 rebuildCap();
 return {group:solid,setOffset(x,z){wanderX=x;wanderZ=z;solid.position.set(-x,0,-z);rebuildCap()},setRadius(r){if(r!==activeAperture){activeAperture=r;rebuildCap()}},setEnabled(v){capEnabled=!!v;solid.visible=capEnabled},inspect(){return {enabled:capEnabled,triangles:capTriangles,rebuilds:capRebuilds,buildMs:capBuildMs,radius:activeAperture}},dispose(){if(capMesh){capMesh.geometry.dispose();capGroup.remove(capMesh)}capMaterial.dispose()}};
}
