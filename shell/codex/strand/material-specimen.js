// Strand cube grammar laboratory. Archived predecessor: archive/rock-material-study.js
// Exactly one BoxGeometry(1,1,1): no bevel, displacement, subdivisions or added meshes.
export function createMaterialSpecimen(T,{parent,surface,terrain}){
 const group=new T.Group();group.name='Strand / cube grammar';parent.add(group);
 const rock=new T.Group();group.add(rock);
 const geometry=new T.BoxGeometry(1,1,1);
 const treatments=[
  ['MONUMENT','Warm sun / cool shade'],
  ['RELIC','Dark body / luminous edges'],
  ['SPECTRAL','View-dependent iridescence'],
  ['STRATA','Continuous geological bands'],
  ['INK','Graphic faces / inked edges'],
  ['PORCELAIN','Soft ivory / glazed rim']
 ];
 const vertexShader=`varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;void main(){vLocal=position;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*normal);vView=cameraPosition-w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
 const fragmentShader=`precision highp float;uniform float uMode;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vView;
 void main(){
 vec3 n=normalize(vNormal),v=normalize(vView),l=normalize(vec3(-.48,.88,.37));
 float diffuse=max(dot(n,l),0.),rim=pow(1.-abs(dot(n,v)),2.);
 // Analytic cube edge distance, no extra geometry.
 vec3 a=abs(vLocal);float edge=min(min(.5-a.x,.5-a.y),.5-a.z);
 float nearest=min(a.x,min(a.y,a.z));float edgeWidth=.5-max(nearest,0.);
 // Two local coordinates on each visible face; nearest distance to the square perimeter.
 vec3 q=vec3(.5)-a;float faceEdge;
 if(a.x>a.y&&a.x>a.z)faceEdge=min(q.y,q.z);
 else if(a.y>a.z)faceEdge=min(q.x,q.z);
 else faceEdge=min(q.x,q.y);
 float border=1.-smoothstep(.008,.055,faceEdge);
 vec3 col=vec3(.5);
 if(uMode<.5){
 col=mix(vec3(.19,.29,.41),vec3(.93,.72,.45),diffuse);col+=.09*rim;col*=1.-.12*border;
 }else if(uMode<1.5){
 col=vec3(.025,.034,.048)+.11*diffuse;col+=vec3(.13,.78,.91)*(.85*border+.4*rim);
 }else if(uMode<2.5){
 float phase=dot(n,v)*3.8+dot(vLocal,vec3(2.1,3.4,1.7));
 col=.42+.38*cos(vec3(0.,2.1,4.2)+phase);col*=.48+.55*diffuse;col+=.17*rim;
 }else if(uMode<3.5){
 float s=vWorld.y*9.+.35*sin(vWorld.x*5.+vWorld.z*3.);
 float band=smoothstep(.10,.20,fract(s));float palette=mod(floor(s),4.);
 col=mix(vec3(.19,.23,.23),vec3(.71,.56,.37),palette/3.);col*=.52+.55*diffuse;col*=.77+.23*band;
 }else if(uMode<4.5){
 float shade=floor(diffuse*3.999)/3.;col=mix(vec3(.11,.18,.25),vec3(.88,.72,.48),shade);
 col*=1.-.86*border;
 }else{
 col=mix(vec3(.32,.45,.53),vec3(.96,.91,.77),.3+.7*diffuse);
 col+=vec3(.32,.25,.17)*pow(max(dot(reflect(-l,n),v),0.),28.);
 col+=.17*rim;col*=1.-.16*border;
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
  const floor=height===null?-Infinity:height+.5;
  if(rock.position.y>floor+.001){
   velocity-=9.8*step;rock.position.y+=velocity*step;
   if(rock.position.y<=floor){rock.position.y=floor;velocity=0;settled=true}else settled=false;
  }else if(rock.position.y<floor){rock.position.y=floor;velocity=0;settled=true}
 }
 function current(){return{index:index+1,total:treatments.length,name:treatments[index][0],description:treatments[index][1]}}
 function cycle(){index=(index+1)%treatments.length;material.uniforms.uMode.value=index;return current()}
 return{group,update,cycleTreatment:cycle,currentTreatment:current,inspect:()=>({name:'Strand cube grammar',treatment:current(),geometry:'one 12-triangle cube',bbCount:beads.length,bbMass:1,settled,terrainSupport:'single vertical signed-field sample',limitations:'No tilt, rolling, bond physics, fracture or multi-point contact'})};
}
