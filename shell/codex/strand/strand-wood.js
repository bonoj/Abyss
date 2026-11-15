// StrandWood / 01 — oak, continuous object-space growth rings and longitudinal grain.
// The existing beveled brick mesh and rigid-body contacts are unchanged.
export function createStrandWood(T,{offset=[0,0,0]}={}){
 const material=new T.MeshStandardMaterial({
  name:'StrandWood / 01 · Oak',color:0xffffff,roughness:.86,metalness:0
 });
 material.userData={finish:'strand-wood-01',species:'oak',grainAxis:'x',offset};
 material.onBeforeCompile=shader=>{\n  shader.uniforms.uWoodOffset={value:new T.Vector3(...offset)};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   '#include <common>\nvarying vec3 vWoodPosition;\nuniform vec3 uWoodOffset;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nvWoodPosition=position+uWoodOffset;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWoodPosition;
float woodHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float woodNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 float a=woodHash(i),b=woodHash(i+vec3(1,0,0)),c=woodHash(i+vec3(0,1,0)),d=woodHash(i+vec3(1,1,0));
 float e=woodHash(i+vec3(0,0,1)),g=woodHash(i+vec3(1,0,1)),h=woodHash(i+vec3(0,1,1)),j=woodHash(i+vec3(1,1,1));
 return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
}
float woodRing(vec3 p){
 // Timber runs along X. YZ cross-sections expose annual growth rings.
 vec2 q=p.yz+vec2(.042,-.031);
 float warp=(woodNoise(vec3(p.x*1.8,q*9.0))-.5)*.012;
 float radius=length(q*vec2(1.0,1.15))+warp;
 float cycles=radius*115.0;
 float width=fwidth(cycles);
 float band=abs(fract(cycles)-.5)*2.0;
 return 1.0-smoothstep(.12,.40+min(width,.45),band);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 woodP=vWoodPosition;
float ring=woodRing(woodP);
float longitudinal=woodNoise(vec3(woodP.x*.7,woodP.y*70.0,woodP.z*70.0));
float grainFade=1.0-smoothstep(.4,1.5,fwidth(woodP.y*70.0)+fwidth(woodP.z*70.0));
float fiber=(longitudinal-.5)*grainFade;
float timberTone=clamp(.58-.22*ring+.20*fiber,0.0,1.0);
vec3 oakDark=vec3(.22,.105,.041);
vec3 oakLight=vec3(.67,.40,.19);
diffuseColor.rgb*=mix(oakDark,oakLight,timberTone);
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+(.5-woodRing(vWoodPosition))*.08,.65,.98);
`);
 };
 material.customProgramCacheKey=()=> 'strand-wood-01-v1';
 return material;
}
