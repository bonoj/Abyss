// StrandStone / 02b — band-limited granite with stable geometric normals.
export function createStrandStone(T){
 const material=new T.MeshStandardMaterial({name:'StrandStone / 02b · Granite',color:0xffffff,roughness:.94,metalness:0});
 material.userData={finish:'strand-stone-02b',rock:'weathered-granite'};
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStonePosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStonePosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vStonePosition;
float stoneHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float stoneNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 float a=stoneHash(i),b=stoneHash(i+vec3(1,0,0)),c=stoneHash(i+vec3(0,1,0)),d=stoneHash(i+vec3(1,1,0));
 float e=stoneHash(i+vec3(0,0,1)),g=stoneHash(i+vec3(1,0,1)),h=stoneHash(i+vec3(0,1,1)),j=stoneHash(i+vec3(1,1,1));
 return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
}
// Mineral domains use differently scaled, warped 3D fields rather than a grid
// of identical Voronoi cells. All coordinates are object-local.
float stoneFeldspar(vec3 p){
 vec3 warp=vec3(stoneNoise(p*13.0+3.0),stoneNoise(p*15.0+17.0),stoneNoise(p*12.0+29.0))-.5;
 vec3 q=p*24.0+warp*1.35;
 return stoneNoise(q)*.68+stoneNoise(q*1.83+11.0)*.32;
}
float stoneMica(vec3 p){
 vec3 q=p*49.0;
 float fleck=stoneNoise(q+vec3(13.0,7.0,21.0));
 float sparse=stoneNoise(p*18.0+37.0);
 return smoothstep(.72,.86,fleck)*smoothstep(.44,.66,sparse);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 stoneP=vStonePosition;
float pixelFootprint=max(length(dFdx(stoneP)),length(dFdy(stoneP)));
float feldspar=stoneFeldspar(stoneP);
float feldsparFade=1.0-smoothstep(.025,.095,pixelFootprint);
float feldsparDomain=mix(.42,smoothstep(.44,.66,feldspar),feldsparFade);
float quartz=stoneNoise(stoneP*34.0+vec3(8.0,19.0,3.0));
float mica=stoneMica(stoneP)*(1.0-smoothstep(.008,.03,pixelFootprint));
float quartzFade=1.0-smoothstep(.009,.035,pixelFootprint);
vec3 quartzMatrix=mix(vec3(.49,.51,.51),vec3(.69,.70,.68),mix(.5,smoothstep(.25,.80,quartz),quartzFade));
vec3 feldsparCrystal=mix(vec3(.58,.54,.49),vec3(.77,.72,.65),smoothstep(.42,.75,feldspar));
vec3 mineralColor=mix(quartzMatrix,feldsparCrystal,feldsparDomain);
mineralColor=mix(mineralColor,vec3(.16,.18,.19),mica*.84);
float coarse=stoneNoise(stoneP*8.0+4.0);
mineralColor*=.91+.16*coarse;
diffuseColor.rgb*=mineralColor;
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor-.075*feldsparDomain+.035*mica,.77,.99);
`);
 };
 material.customProgramCacheKey=()=> 'strand-stone-02b-v2';
 return material;
}
