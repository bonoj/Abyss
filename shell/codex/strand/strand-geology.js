// Strand-only material treatment for the existing signed-field triangle mesh.
export function createStrandGeology(T, terrain) {
 const material=terrain.group.children.find(mesh=>mesh.isMesh)?.material;
 if(!material)return {inspect:()=>({name:'Strand geology',installed:false})};
 const previous=material.onBeforeCompile;
 material.vertexColors=false;
 material.color.set(0xffffff);
 material.roughness=1;
 material.metalness=0;
 material.flatShading=true;
 material.onBeforeCompile=shader=>{
  previous(shader);
  shader.vertexShader=shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vStrandPosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvStrandPosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vStrandPosition;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
   // Screen-space derivative bump: no extra triangles, no altered collision.
   vec3 strandP=vStrandPosition*13.0;
   float strandGrain=sin(strandP.x*1.73+sin(strandP.z*0.67))*sin(strandP.z*2.11+strandP.y*1.31);
   float strandFine=sin(dot(strandP,vec3(4.7,3.3,5.9)))*sin(dot(strandP,vec3(3.1,5.7,-4.3)));
   float strandHeight=strandGrain*0.032+strandFine*0.008;
   vec3 strandDx=dFdx(vStrandPosition), strandDy=dFdy(vStrandPosition);
   vec3 strandCross=cross(strandDx,strandDy);
   float strandDet=dot(strandCross,strandCross);
   if(strandDet>1e-12){
    vec3 strandGrad=(cross(strandDy,normal)*dFdx(strandHeight)+cross(normal,strandDx)*dFdy(strandHeight))/max(length(strandCross),1e-6);
    normal=normalize(normal-strandGrad*0.32);
   }`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
   vec3 dpdx=dFdx(vStrandPosition);
   vec3 dpdy=dFdy(vStrandPosition);
   float flatness=abs(normalize(cross(dpdx,dpdy)).y);
   float height=smoothstep(0.8,3.3,vStrandPosition.y);
   vec3 slate=vec3(0.21,0.27,0.28);
   vec3 ochre=vec3(0.48,0.39,0.29);
   vec3 soil=vec3(0.35,0.31,0.26);
   vec3 mineral=vec3(0.62,0.61,0.53);
   vec3 geology=mix(slate,ochre,smoothstep(0.12,0.72,height)*0.62);
   geology=mix(geology,soil,flatness*0.16);
   geology=mix(geology,mineral,smoothstep(0.72,1.0,height)*0.30);
   diffuseColor.rgb*=geology;`);
 };
 material.customProgramCacheKey=()=> 'strand-geology-2';
 material.needsUpdate=true;
 return {inspect:()=>({name:'Strand geology',installed:true,version:2,decorativeMeshes:0})};
}
