// StrandStone / 04 — fine-grained basalt with sparse non-periodic weathering.
export function createStrandStone(T,{offset=[0,0,0]}={}){
 const material=new T.MeshStandardMaterial({name:'StrandStone / 04 · Basalt',color:0xffffff,roughness:.94,metalness:0});
 material.userData={finish:'strand-stone-04',rock:'weathered-basalt',offset};
 material.onBeforeCompile=shader=>{
  shader.uniforms.uStoneOffset={value:new T.Vector3(...offset)};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStonePosition;\nuniform vec3 uStoneOffset;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStonePosition=position+uStoneOffset;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vStonePosition;
float basaltHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float basaltNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 float a=basaltHash(i),b=basaltHash(i+vec3(1,0,0)),c=basaltHash(i+vec3(0,1,0)),d=basaltHash(i+vec3(1,1,0));
 float e=basaltHash(i+vec3(0,0,1)),g=basaltHash(i+vec3(1,0,1)),h=basaltHash(i+vec3(0,1,1)),j=basaltHash(i+vec3(1,1,1));
 return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
}
// Localized sparse pits: distance to scattered, jittered sites, not a tiled
// Voronoi coloring. Cells are only a search structure; most contain no pit.
float basaltPit(vec3 p){
 vec3 base=floor(p),f=fract(p);
 float nearest=10.0;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){
  vec3 cell=base+vec3(float(x),float(y),float(z));
  float enabled=step(.87,basaltHash(cell+19.0));
  vec3 center=vec3(basaltHash(cell+3.0),basaltHash(cell+7.0),basaltHash(cell+11.0));
  float radius=mix(.10,.22,basaltHash(cell+23.0));
  float dist=length(f-vec3(float(x),float(y),float(z))-center)/radius;
  nearest=min(nearest,mix(10.0,dist,enabled));
 }
 return 1.0-smoothstep(.55,1.1,nearest);
}
// Fractures are sparse thin warped sheets, not repeating lattice boundaries.
float basaltFracture(vec3 p){
 vec3 warp=vec3(basaltNoise(p*8.0+3.0),basaltNoise(p*9.0+17.0),basaltNoise(p*7.0+29.0))-.5;
 vec3 q=p+warp*.035;
 float fracturePlane=abs(dot(q,normalize(vec3(.73,.22,-.64)))+.17);
 float branch=abs(dot(q,normalize(vec3(-.19,.84,.51)))-.065);
 float gate=smoothstep(.37,.58,basaltNoise(p*6.0+51.0));
 float mainCrack=(1.0-smoothstep(.0018,.0055,fracturePlane))*gate;
 float branchCrack=(1.0-smoothstep(.0012,.004,branch))*smoothstep(.56,.72,basaltNoise(p*7.0+13.0));
 return max(mainCrack,branchCrack*.65);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 p=vStonePosition;
float footprint=max(length(dFdx(p)),length(dFdy(p)));
float weather=basaltNoise(p*9.0+5.0);
float broad=basaltNoise(p*3.5+27.0);
float fine=basaltNoise(p*57.0+12.0);
float fineFade=1.0-smoothstep(.008,.028,footprint);
float pitFade=1.0-smoothstep(.009,.035,footprint);
float crackFade=1.0-smoothstep(.004,.020,footprint);
float pits=basaltPit(p*22.0)*pitFade;
float fractures=basaltFracture(p)*crackFade;
float weatherMask=smoothstep(.48,.72,weather*.72+broad*.28);
vec3 base=mix(vec3(.20,.225,.235),vec3(.34,.36,.36),broad);
base*=.90+.20*mix(.5,fine,fineFade);
vec3 oxidized=vec3(.31,.245,.205);
base=mix(base,oxidized,weatherMask*.42);
base*=1.0-.24*pits-.34*fractures;
// Relief agrees with cavity and fracture shading; weather stains remain flat.
float basaltHeight=-.0085*pits-.004*fractures+.0007*(fine-.5)*fineFade;
float basaltReliefFade=1.0-smoothstep(.009,.035,footprint);
diffuseColor.rgb*=base;
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
// Screen-space derivatives of the SAME continuous height field. Project
// into the geometric tangent plane; avoid derivative noise on subpixel detail.
vec3 stoneDx=dFdx(vStonePosition), stoneDy=dFdy(vStonePosition);
float stoneDet=dot(stoneDx,cross(stoneDy,normal));
if(abs(stoneDet)>1e-9){
 vec3 stoneGradient=(cross(stoneDy,normal)*dFdx(basaltHeight)+cross(normal,stoneDx)*dFdy(basaltHeight))/stoneDet;
 normal=normalize(normal-stoneGradient*basaltReliefFade);
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+.035*weatherMask-.065*pits,.86,.99);
`);
 };
 material.customProgramCacheKey=()=> 'strand-stone-04-v1';
 return material;
}
