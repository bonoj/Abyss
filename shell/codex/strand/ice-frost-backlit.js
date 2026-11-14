// Strand-only visual finish adapted from JIT Ice / 03. Contact material remains "ice".
// Deliberately uses Three.js lighting and a single surface pass, not screen-space ray marching.
export function createFrostBacklitIce(T){
 const material=new T.MeshStandardMaterial({
  color:0xb4e2ed,roughness:.58,metalness:0,
  transparent:false,side:T.FrontSide,
  emissive:0x638e9d,emissiveIntensity:.16
 });
 material.name='Strand Ice / Frosted Backlit (33/66, no bubbles)';
 material.userData={finish:'frost-backlit',frost:.33,backlight:.66,bubbles:false,source:'JIT assets ice-frost-backlit specimen 044'};
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIceLocal;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvIceLocal=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vIceLocal;
float iceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float iceNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=iceHash(i),b=iceHash(i+vec3(1,0,0)),c=iceHash(i+vec3(0,1,0)),d=iceHash(i+vec3(1,1,0));
 float e=iceHash(i+vec3(0,0,1)),g=iceHash(i+vec3(1,0,1)),h=iceHash(i+vec3(0,1,1)),j=iceHash(i+vec3(1,1,1));
 return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 // Local coordinates keep frost attached to each rotating physical brick.
 float iceGrain=.65*iceNoise(vIceLocal*23.0)+.35*iceNoise(vIceLocal*59.0);
 float iceCrystal=iceNoise(vIceLocal*7.0+vec3(3.1,8.2,1.4));
 float iceFrost=clamp(0.33*(.38+.62*iceGrain)*(.7+.3*iceCrystal),0.0,1.0);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.76,.89,.94),iceFrost*.60);
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 // Bounded backlit glow approximation; 0.66 preset, no bubble loop.
 totalEmissiveRadiance+=vec3(.20,.36,.42)*0.66*(.45+.55*iceFrost);
`);
 };
 material.customProgramCacheKey=()=> 'strand-ice-frost-backlit-v1';
 return material;
}
