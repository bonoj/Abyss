// Strand architectural material grammar / 2026-11-02.
// Prior experiments: archive/rock-material-study.js, cube-grammar-study.js, monument-stone-study.js.
// Single undistorted 4x4 subdivided cube: 6 * 4 * 4 * 2 = 192 triangles.
// All age, masonry, occupation and ecology are procedural surface signals, never extra geometry.
export function createMaterialSpecimen(T,{parent,surface,terrain}){
 const group=new T.Group();group.name='Strand / architectural grammar';parent.add(group);
 const specimen=new T.Group();group.add(specimen);
 const geometry=new T.BoxGeometry(1,1,1,4,4,4);
 const treatments=[
  ['MONUMENT','Unmodified warm/cool illumination baseline'],
  ['MASONRY','Staggered stone courses and mortar joints'],
  ['WEATHERED','Masonry with exposure, moisture and edge wear'],
  ['INHABITED','Masonry with repairs, soot and worn surfaces'],
  ['RECLAIMED','Masonry with damp moss and ecological growth'],
  ['PALIMPSEST','Weather, occupation and ecology together']
 ];
 const vertexShader=`
 varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;
 void main(){
  vLocal=position;
  vec4 world=modelMatrix*vec4(position,1.);
  vWorld=world.xyz;
  vNormal=normalize(mat3(modelMatrix)*normal);
  vView=cameraPosition-world.xyz;
  gl_Position=projectionMatrix*viewMatrix*world;
 }`;
 const fragmentShader=`
 precision highp float;
 uniform float uMode;
 varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;
 float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){
  vec3 n=normalize(vNormal),v=normalize(vView),l=normalize(vec3(-.48,.88,.37));
  float diffuse=max(dot(n,l),0.);
  float rim=pow(1.-abs(dot(n,v)),2.);
  vec3 col=mix(vec3(.19,.29,.41),vec3(.93,.72,.45),diffuse)+.09*rim;
  // Exact Monument control from cube grammar: no architectural overlays.
  if(uMode>.5){
   // Face-local coordinates with continuous height: courses meet at all vertical corners.
   vec3 a=abs(vLocal);
   vec2 uv= a.x>a.z ? vec2(vLocal.z,vLocal.y) : vec2(vLocal.x,vLocal.y);
   if(a.y>a.x && a.y>a.z)uv=vec2(vLocal.x,vLocal.z);
   float course=floor((vLocal.y+.5)*8.);
   float shift=mod(course,2.)*.5;
   vec2 grid=vec2((uv.x+.5)*5.+shift,(uv.y+.5)*8.);
   vec2 cell=floor(grid);
   vec2 fracCell=fract(grid);
   float seamX=1.-smoothstep(.025,.075,min(fracCell.x,1.-fracCell.x));
   float seamY=1.-smoothstep(.025,.075,min(fracCell.y,1.-fracCell.y));
   float mortar=max(seamX,seamY);
   float block=hash21(cell+vec2(course*2.,1.));
   float variation=mix(.87,1.12,block);
   vec3 stone=col*variation;
   stone=mix(stone,vec3(.13,.17,.20),mortar*.72);
   // Per-face boundary wear, independent of topology or tessellation.
   vec3 inset=.5-a;
   float boundary=a.x>a.z?min(inset.y,inset.z):min(inset.x,inset.y);
   if(a.y>a.x&&a.y>a.z)boundary=min(inset.x,inset.z);
   float wear=1.-smoothstep(.006,.09,boundary);
   if(uMode>1.5&&uMode<2.5||uMode>4.5){
    // Weather follows exposure and gravity; broad stains, not random displacement.
    float exposed=smoothstep(.0,.65,dot(n,vec3(0.,1.,0.)));
    float damp=1.-smoothstep(-.42,.08,vLocal.y);
    float runoff=smoothstep(.3,.8,hash21(vec2(floor(uv.x*14.),7.)))*smoothstep(.1,.6,vLocal.y);
    stone=mix(stone,stone*vec3(.69,.78,.76),damp*.32+runoff*.18);
    stone+=vec3(.13,.10,.06)*wear*(.24+.45*exposed);
   }
   if(uMode>2.5&&uMode<3.5||uMode>4.5){
    // Repaired courses: coherent blocks, not high-frequency scratches.
    float repaired=step(.84,hash21(cell+vec2(21.,9.)));
    stone=mix(stone,stone*vec3(1.17,.98,.79),repaired*.72);
    // Soot accumulates high on one wall, not uniformly on all faces.
    float wall=step(.65,n.z);
    float soot=wall*smoothstep(.05,.43,vLocal.y)*(1.-smoothstep(.40,.51,abs(vLocal.x)));
    stone=mix(stone,vec3(.10,.11,.13),soot*.42);
    float foot=1.-smoothstep(-.48,-.24,vLocal.y);
    stone=mix(stone,stone*vec3(1.16,1.10,1.02),foot*.24);
   }
   if(uMode>3.5&&uMode<4.5||uMode>4.5){
    // Moss follows damp lower seams; deterministic patches across courses.
    float damp=1.-smoothstep(-.38,.14,vLocal.y);
    float mossPatch=smoothstep(.49,.77,hash21(cell+vec2(13.,31.)));
    float moss=damp*mossPatch*(.25+.75*mortar);
    stone=mix(stone,vec3(.18,.28,.17)*(.68+.48*diffuse),moss*.78);
   }
   col=stone;
  }
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
 }`;
 const material=new T.ShaderMaterial({uniforms:{uMode:{value:0}},vertexShader,fragmentShader});
 const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;specimen.add(mesh);
 const beads=Array.from({length:96},(_,i)=>({id:i,mass:1/96}));
 const x=1.6,z=.7,initial=surface(x,z);
 specimen.position.set(x,(initial??0)+2.3,z);
 let velocity=0,settled=false,index=0;
 function update(dt){
  const step=Math.min(Math.max(dt||0,0),.05),height=surface(specimen.position.x,specimen.position.z);
  const floor=height===null?-Infinity:height+.5;
  if(specimen.position.y>floor+.001){
   velocity-=9.8*step;specimen.position.y+=velocity*step;
   if(specimen.position.y<=floor){specimen.position.y=floor;velocity=0;settled=true}else settled=false;
  }else if(specimen.position.y<floor){specimen.position.y=floor;velocity=0;settled=true}
 }
 function current(){return{index:index+1,total:treatments.length,name:treatments[index][0],description:treatments[index][1]}}
 function cycle(){index=(index+1)%treatments.length;material.uniforms.uMode.value=index;return current()}
 return{group,update,cycleTreatment:cycle,currentTreatment:current,inspect:()=>({name:'Strand architectural grammar',treatment:current(),geometry:'one undistorted 192-triangle cube',bbCount:beads.length,bbMass:1,settled,terrainSupport:'single vertical signed-field sample',limitations:'Surface-only architecture: no physical blocks, windows, damage, or multi-point contact'})};
}
