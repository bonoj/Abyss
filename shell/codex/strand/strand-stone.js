// StrandStone / 01 — weathered granite with continuous object-space mineral grains.
export function createStrandStone(T){
 const material=new T.MeshStandardMaterial({name:'StrandStone / 01 · Granite',color:0xffffff,roughness:.91,metalness:0});
 material.userData={finish:'strand-stone-01',rock:'weathered-granite'};
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStonePosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStonePosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vStonePosition;
float stoneHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
vec3 stoneCell(vec3 p){
 vec3 base=floor(p),f=fract(p);
 float nearest=1e6,second=1e6,identity=0.0;
 // Eight corners of the containing cell, with modest jitter; bounded cost.
 for(int x=0;x<=1;x++)for(int y=0;y<=1;y++)for(int z=0;z<=1;z++){
  vec3 corner=vec3(float(x),float(y),float(z));
  vec3 cell=base+corner;
  vec3 center=corner+vec3(
   stoneHash(cell+vec3(3.1)),
   stoneHash(cell+vec3(7.2)),
   stoneHash(cell+vec3(11.3)))*.42+.29;
  float dist=length(f-center);
  if(dist<nearest){second=nearest;nearest=dist;identity=stoneHash(cell+vec3(17.7));}
  else if(dist<second)second=dist;
 }
 return vec3(identity,nearest,second-nearest);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 stoneP=vStonePosition;
float mineralScale=43.0;
vec3 mineral=stoneCell(stoneP*mineralScale);
float mica=1.0-smoothstep(.09,.17,mineral.x);
float quartz=smoothstep(.47,.69,mineral.x);
vec3 feldspar=vec3(.52,.51,.48);
vec3 quartzColor=vec3(.70,.72,.71);
vec3 micaColor=vec3(.15,.17,.18);
vec3 mineralColor=mix(feldspar,quartzColor,quartz);
mineralColor=mix(mineralColor,micaColor,mica);
float boundary=1.0-smoothstep(.015,.105,mineral.z);
float boundaryFade=1.0-smoothstep(.035,.095,fwidth(stoneP*mineralScale));
mineralColor*=1.0-.16*boundary*boundaryFade;
float coarse=stoneHash(floor(stoneP*13.0));
mineralColor*=.90+.18*coarse;
diffuseColor.rgb*=mineralColor;
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor-(.11*smoothstep(.65,.9,mineral.x)),.74,.98);
`);
 };
 material.customProgramCacheKey=()=> 'strand-stone-01-v1';
 return material;
}
