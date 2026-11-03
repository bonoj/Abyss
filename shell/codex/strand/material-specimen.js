// Strand Monument surface grammar laboratory. Archived predecessor: archive/rock-material-study.js
// Exactly one BoxGeometry(1,1,1): no bevel, displacement, subdivisions or added meshes.
export function createMaterialSpecimen(T,{parent,surface,terrain}){
 const group=new T.Group();group.name='Strand / cube grammar';parent.add(group);
 const rock=new T.Group();group.add(rock);
 const geometry=new T.IcosahedronGeometry(1,3); // 320 triangular faces; no added detail meshes
 const treatments=[
 ['MONUMENT','Warm sun / cool shade'],
 ['NORMAL DETAIL','Monument + procedural surface normals'],
 ['WEATHERED','Monument + broad mineral staining'],
 ['COMBINED','Monument + normals + weathering'],
 ['INK','Preserved graphic winner'],
 ['PORCELAIN','Preserved glazed winner'],
 ['RELIC','Preserved luminous winner']
 ];
 const vertexShader=`varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;void main(){vLocal=position;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*normal);vView=cameraPosition-w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
 const fragmentShader=`precision highp float;uniform float uMode;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;
 void main(){
 vec3 n=normalize(vNormal),v=normalize(vView),l=normalize(vec3(-.48,.88,.37));
 float detail=sin(vLocal.x*41.)*sin(vLocal.y*37.)*sin(vLocal.z*43.);
 float atten=smoothstep(1.,4.,length(vView));
 if(uMode>0.5 && uMode<1.5 || uMode>2.5 && uMode<3.5){
   vec3 grad=vec3(cos(vLocal.x*41.)*sin(vLocal.y*37.),cos(vLocal.y*37.)*sin(vLocal.z*43.),cos(vLocal.z*43.)*sin(vLocal.x*41.));
   n=normalize(n+grad*.12*(1.-atten));
 }
 float diffuse=max(dot(n,l),0.),rim=pow(1.-abs(dot(n,v)),2.);
 vec3 col=mix(vec3(.19,.29,.41),vec3(.93,.72,.45),diffuse)+.09*rim;
 if(uMode>1.5 && uMode<3.5){
   float stain=sin(vWorld.y*3.2+sin(vWorld.x*2.4+vWorld.z*1.9))*.5+.5;
   col=mix(col,col*vec3(.56,.72,.62),smoothstep(.4,.85,stain)*.46);
 }
 if(uMode>3.5 && uMode<4.5){
   float shade=floor(diffuse*3.999)/3.;col=mix(vec3(.11,.18,.25),vec3(.88,.72,.48),shade);
 }else if(uMode>4.5 && uMode<5.5){
   col=mix(vec3(.32,.45,.53),vec3(.96,.91,.77),.3+.7*diffuse);
   col+=vec3(.32,.25,.17)*pow(max(dot(reflect(-l,n),v),0.),28.)+.17*rim;
 }else if(uMode>5.5){
   col=vec3(.025,.034,.048)+.11*diffuse+vec3(.13,.78,.91)*(.4*rim);
 }
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
 }`;
 const material=new T.ShaderMaterial({uniforms:{uMode:{value:0}},vertexShader,fragmentShader,extensions:{derivatives:true}});
 const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;rock.add(mesh);
 // Existing prototype's BB inventory is retained as inert data; not geometry or contact authority.
 const beads=Array.from({length:96},(_,i)=>({id:i,mass:1/96}));
 const x=1.6,z=.7,initial=surface(x,z);
 rock.position.set(x,(initial??0)+2.3,z);
 let velocity=0,settled=false,index=0;
 function update(dt){
  const step=Math.min(Math.max(dt||0,0),.05),height=surface(rock.position.x,rock.position.z);
  const floor=height===null?-Infinity:height+1.0;
  if(rock.position.y>floor+.001){
   velocity-=9.8*step;rock.position.y+=velocity*step;
   if(rock.position.y<=floor){rock.position.y=floor;velocity=0;settled=true}else settled=false;
  }else if(rock.position.y<floor){rock.position.y=floor;velocity=0;settled=true}
 }
 function current(){return{index:index+1,total:treatments.length,name:treatments[index][0],description:treatments[index][1]}}
 function cycle(){index=(index+1)%treatments.length;material.uniforms.uMode.value=index;return current()}
 return{group,update,cycleTreatment:cycle,currentTreatment:current,inspect:()=>({name:'Strand cube grammar',treatment:current(),geometry:'one 320-triangle icosphere',bbCount:beads.length,bbMass:1,settled,terrainSupport:'single vertical signed-field sample',limitations:'No tilt, rolling, bond physics, fracture or multi-point contact'})};
}
