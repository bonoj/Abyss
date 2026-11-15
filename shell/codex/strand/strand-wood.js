// StrandWood / 01 — oak, continuous object-space growth rings and longitudinal grain.
// The existing beveled brick mesh and rigid-body contacts are unchanged.
export function createStrandWood(T,{offset=[0,0,0]}={}){
 const material=new T.MeshStandardMaterial({
  name:'StrandWood / 01 · Oak',color:0xffffff,roughness:.86,metalness:0
 });
 material.userData={finish:'strand-wood-01',species:'oak',grainAxis:'x',offset};
 material.onBeforeCompile=shader=>{
  shader.uniforms.uWoodOffset={value:new T.Vector3(...offset)};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   '#include <common>\nvarying vec3 vWoodPosition;\nuniform vec3 uWoodOffset;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nvWoodPosition=position+uWoodOffset;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWoodPosition;
// Entirely continuous, bounded 3D functions: no cell hashes, floor or fract.
// Every triangle samples the same object-space volume, independent of face UVs.
float woodFlow(vec3 p){
 return .54*sin(dot(p,vec3(1.37,7.13,5.27))+.31)
      + .28*sin(dot(p,vec3(3.11,-11.7,8.41))+1.7)
      + .18*sin(dot(p,vec3(-5.43,4.71,13.3))-.8);
}
float woodRing(vec3 p){
 // Rings are continuous along X and elliptical across YZ.
 vec2 q=p.yz+vec2(.042,-.031);
 float warp=.010*woodFlow(vec3(p.x*.65,q*1.1));
 float radius=length(q*vec2(1.0,1.15))+warp;
 float phase=6.28318530718*(radius*76.0);
 // Analytic footprint attenuation for a sinusoid; at subpixel scale,
 // the ring contribution tends to zero rather than becoming false bands.
 float footprint=max(fwidth(phase),.0001);
 float filter=clamp(2.0*sin(.5*min(footprint,6.2831853))/footprint,0.0,1.0);
 return .5+.5*cos(phase)*filter;
}
float woodFiber(vec3 p){
 float fiber=sin(dot(p,vec3(.29,89.0,47.0))+1.3*woodFlow(p*vec3(.45,2.0,2.0)));
 float footprint=fwidth(dot(p,vec3(.29,89.0,47.0)));
 float fade=1.0-smoothstep(.7,3.2,footprint);
 return .5*fiber*fade;
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 woodP=vWoodPosition;
float ring=woodRing(woodP);
float fiber=woodFiber(woodP);
float timberTone=clamp(.58-.22*ring+.20*fiber,0.0,1.0);
vec3 oakDark=vec3(.22,.105,.041);
vec3 oakLight=vec3(.67,.40,.19);
diffuseColor.rgb*=mix(oakDark,oakLight,timberTone);
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+(.5-woodRing(vWoodPosition))*.08,.65,.98);
`);
 };
 material.customProgramCacheKey=()=> 'strand-wood-01-v2';
 return material;
}
