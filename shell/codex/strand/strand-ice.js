// StrandIce / 01: physically based transmissive ice on the existing beveled meshes.
// Procedural frost is measured in object-local world units, never screen pixels.
// The original ice finish remains independently available in brick-rain.js.
export function createStrandIce(T,{frost=.33,backlight=.66,bubbles=false}={}){
 const settings={frost,backlight,bubbles};
 const material=new T.MeshPhysicalMaterial({
  name:'StrandIce / 01',
  color:0xc3e9f2,metalness:0,roughness:.17,
  transmission:.88,thickness:.16,ior:1.31,
  attenuationColor:0x76c6d9,attenuationDistance:.65,
  specularIntensity:1,side:T.FrontSide,
  transparent:false,depthWrite:true
 });
 material.userData={finish:'strand-ice-01',settings,originalPreserved:true};
 material.onBeforeCompile=shader=>{
  shader.uniforms.iceFrost={value:settings.frost};
  shader.uniforms.iceBacklight={value:settings.backlight};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   '#include <common>\nvarying vec3 vIceObjectPosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nvIceObjectPosition=position;');
  const functions=`
varying vec3 vIceObjectPosition;
uniform float iceFrost;
uniform float iceBacklight;
float iceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float iceNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 float a=iceHash(i),b=iceHash(i+vec3(1,0,0)),c=iceHash(i+vec3(0,1,0)),d=iceHash(i+vec3(1,1,0));
 float e=iceHash(i+vec3(0,0,1)),g=iceHash(i+vec3(1,0,1)),h=iceHash(i+vec3(0,1,1)),j=iceHash(i+vec3(1,1,1));
 return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
}
float iceFrostField(vec3 p){
 // 32 cycles/unit, with derivative-based fade at subpixel scales.
 float footprint=max(length(dFdx(p)),length(dFdy(p)));
 float detail=1.0-smoothstep(.018,.045,footprint);
 return mix(.5,iceNoise(p*32.0),detail);
}
`;
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
   '#include <common>\n'+functions);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',
   `#include <roughnessmap_fragment>
float iceGrain=iceFrostField(vIceObjectPosition);
float iceFrostAmount=clamp(iceFrost*(.55+.9*iceGrain),0.0,1.0);
roughnessFactor=mix(roughnessFactor,.88,iceFrostAmount);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',
   `#include <normal_fragment_maps>
// Derivative-filtered local-space microtexture, without displacing the mesh.
float icePixelFootprint=max(length(dFdx(vIceObjectPosition)),length(dFdy(vIceObjectPosition)));
float iceNormalFade=1.0-smoothstep(.008,.032,icePixelFootprint);
vec3 iceGradient=vec3(dFdx(iceGrain),dFdy(iceGrain),0.0);
normal=normalize(normal-vec3(iceGradient.xy,0.0)*iceFrostAmount*.09*iceNormalFade);`);
  // No emissive fake backlight: physical transmission uses the scene's
  // illumination/background. The parameter controls transmission strength.
  shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',
   `material.transmission *= mix(.30,1.0,iceBacklight);
#include <transmission_fragment>`);
  material.userData.shader=shader;
 };
 material.customProgramCacheKey=()=> 'strand-ice-01-v1';
 return material;
}
