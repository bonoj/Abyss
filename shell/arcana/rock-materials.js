// Reusable shader-only rock treatments. No terrain topology or geometry ownership.
export function createRockMaterials(terrainMaterial,capMaterial){
 // Rock laboratory: shader-only geological treatments. No terrain rebuilds or new topology.
 const rockNames=['Original mortar','Midnight basalt','Layered slate','Ironstone','Obsidian','Ancient limestone'];
 let rockMode=0;
 const rockUniform={value:0};
 const cavernDim={value:1};
 const rockShader=(shader)=>{
  shader.uniforms.rockMode=rockUniform;
  shader.uniforms.cavernDim=cavernDim;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vRockPosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRockPosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vRockPosition;
uniform float rockMode;
uniform float cavernDim;
float rockHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float rockNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(rockHash(i),rockHash(i+vec3(1,0,0)),f.x),mix(rockHash(i+vec3(0,1,0)),rockHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(rockHash(i+vec3(0,0,1)),rockHash(i+vec3(1,0,1)),f.x),mix(rockHash(i+vec3(0,1,1)),rockHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
if(rockMode>0.5){
 vec3 p=vRockPosition;
 float coarse=rockNoise(p*0.72);
 float grain=rockNoise(p*4.8);
 float fine=rockNoise(p*15.0);
 float seam=abs(sin(p.y*8.5 + coarse*3.5 + p.x*0.22));
 float fracture=1.0-smoothstep(0.025,0.11,abs(sin(p.x*2.7+p.z*1.83+coarse*2.9)));
 vec3 mineral=vec3(0.12);
 if(rockMode<1.5){
  mineral=mix(vec3(0.038,0.063,0.080),vec3(0.19,0.23,0.25),coarse);
  mineral+=vec3(0.055,0.071,0.080)*grain;
  mineral*=1.0-0.38*fracture;
 }else if(rockMode<2.5){
  float layers=0.5+0.5*sin(p.y*19.0+coarse*4.0+p.x*0.35);
  mineral=mix(vec3(0.075,0.105,0.125),vec3(0.29,0.32,0.31),layers*0.72+coarse*0.28);
  mineral*=1.0-0.33*fracture;
 }else if(rockMode<3.5){
  mineral=mix(vec3(0.115,0.075,0.059),vec3(0.39,0.245,0.145),coarse*0.7+grain*0.3);
  mineral+=vec3(0.12,0.055,0.012)*pow(1.0-seam,9.0);
  mineral*=1.0-0.32*fracture;
 }else if(rockMode<4.5){
  mineral=mix(vec3(0.018,0.025,0.038),vec3(0.13,0.16,0.20),pow(coarse,1.6));
  mineral+=vec3(0.075,0.105,0.125)*pow(grain,6.0);
  mineral*=1.0-0.48*fracture;
 }else{
  float bands=0.5+0.5*sin(p.y*13.0+coarse*3.0);
  mineral=mix(vec3(0.16,0.16,0.14),vec3(0.34,0.33,0.26),bands*0.6+coarse*0.4);
  mineral*=1.0-0.38*fracture;
 }
 mineral*=0.82+0.22*fine;
 diffuseColor.rgb=mineral*cavernDim;
}
`);
 };
 const previousTerrainShader=terrainMaterial.onBeforeCompile;
 terrainMaterial.onBeforeCompile=shader=>{previousTerrainShader(shader);rockShader(shader)};
 capMaterial.onBeforeCompile=rockShader;
 return {rockNames,setCavernDim:value=>{cavernDim.value=Math.max(0,Math.min(1,value))},rockNames,setRockMode:index=>{rockMode=((index%rockNames.length)+rockNames.length)%rockNames.length;rockUniform.value=rockMode;return rockNames[rockMode]},getRockMode:()=>rockMode};
}
