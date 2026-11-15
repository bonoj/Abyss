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
float woodRing(vec3 p){
 // Timber runs along X. YZ cross-sections expose annual growth rings.
 vec2 q=p.yz+vec2(.042,-.031);
 float radial=length(q*vec2(1.0,1.15));
 // Warp only by radius and growth-axis position: no preferred Y/Z
 // direction that could imprint vertical bands on the end grain.
 float warp=.0035*sin(radial*17.0+p.x*.65+.4);
 float radius=radial+warp;
 float cycles=radius*115.0;
 float width=fwidth(cycles);
 float band=abs(fract(cycles)-.5)*2.0;
 return 1.0-smoothstep(.12,.40+min(width,.45),band);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 woodP=vWoodPosition;
float ring=woodRing(woodP);
// Fibers follow the growth axis, rather than crossing sine-wave fields.
// Fade fine longitudinal striations on X-facing end grain.
float fiberPhase=woodP.y*76.0+1.2*sin(woodP.z*9.0+woodP.x*.7);
float fiberFade=1.0-smoothstep(.5,2.5,fwidth(fiberPhase));
float capFacing=abs(dFdx(woodP.y)*dFdy(woodP.z)-dFdx(woodP.z)*dFdy(woodP.y));
float sideFacing=1.0-smoothstep(.2,.8,capFacing/(length(cross(dFdx(woodP),dFdy(woodP)))+1e-5));
float fiber=.20*sin(fiberPhase)*fiberFade*sideFacing;
float timberTone=clamp(.58-.22*ring+.20*fiber,0.0,1.0);
vec3 oakDark=vec3(.22,.105,.041);
vec3 oakLight=vec3(.67,.40,.19);
diffuseColor.rgb*=mix(oakDark,oakLight,timberTone);
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+(.5-woodRing(vWoodPosition))*.08,.65,.98);
`);
 };
 material.customProgramCacheKey=()=> 'strand-wood-01-v5';
 return material;
}
