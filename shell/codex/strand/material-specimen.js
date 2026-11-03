// Strand material study: one irregular rigid specimen, terrain-supported, six distinct surface models.
export function createMaterialSpecimen(T,{parent,surface,terrain}) {
 const group=new T.Group();group.name='Strand / supported material study';parent.add(group);
 const rock=new T.Group();group.add(rock);
 const geometry=new T.IcosahedronGeometry(1,1);
 const position=geometry.getAttribute('position');
 // Deterministic, anisotropic geological silhouette, not an ellipsoid.
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
  const h=1+.20*Math.sin(x*5.7+z*2.3)+.13*Math.cos(y*7.1-x*3.2)+.09*Math.sin(z*11+y*4);
  position.setXYZ(i,x*h*1.35+(y>.15?.16:-.07),y*h*.68,z*h*1.08);
 }
 geometry.computeVertexNormals();geometry.computeBoundingBox();
 const bounds=geometry.boundingBox, bottom=bounds.min.y;
 const treatments=[
  {name:'CUT STONE',description:'Flat planes, hard light',kind:'standard'},
  {name:'TOON',description:'Four discrete illumination bands',kind:'toon'},
  {name:'CHROMATIC',description:'Amber light, blue-violet shadow',kind:'chromatic'},
  {name:'OBSIDIAN',description:'Glossy volcanic glass',kind:'obsidian'},
  {name:'CHALK',description:'Porous pale mineral',kind:'chalk'},
  {name:'STRATA',description:'Layered sediment and weathering',kind:'strata'}
 ];
 const shader=(kind)=>new T.ShaderMaterial({
  uniforms:{lightDir:{value:new T.Vector3(-.45,.85,.35).normalize()}},
  vertexShader:`varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;void main(){vLocal=position;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,
  fragmentShader:`uniform vec3 lightDir;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;
  void main(){vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));if(!gl_FrontFacing)n=-n;float d=max(dot(n,normalize(lightDir)),0.);vec3 col;
  ${kind==='toon'?'float q=floor(d*4.)/3.;col=mix(vec3(.18,.23,.29),vec3(.91,.77,.54),q);':
    kind==='chromatic'?'col=mix(vec3(.19,.28,.52),vec3(1.,.66,.29),pow(d,.8));':
    'float bands=floor((vLocal.y+.9)*6.);float seam=1.-smoothstep(.0,.09,fract((vLocal.y+.9)*6.));col=mix(vec3(.24,.27,.24),vec3(.67,.55,.39),mod(bands,3.)/2.);col*=.48+.58*d;col*=1.-.3*seam;'}
  gl_FragColor=vec4(col,1.);}`,
  side:T.DoubleSide
 });
 const materials=[
  new T.MeshStandardMaterial({color:0x938d7d,roughness:1,flatShading:true}),
  shader('toon'),shader('chromatic'),
  new T.MeshPhysicalMaterial({color:0x181e29,metalness:.12,roughness:.13,clearcoat:1,clearcoatRoughness:.08,flatShading:true}),
  new T.MeshStandardMaterial({color:0xe1d9bd,roughness:1,flatShading:true}),
  shader('strata')
 ];
 const mesh=new T.Mesh(geometry,materials[0]);mesh.castShadow=true;mesh.receiveShadow=true;rock.add(mesh);
 // Latent inventory, independent of the render geometry.
 const beads=Array.from({length:96},(_,i)=>{const y=1-2*(i+.5)/96,a=i*2.399963229728653,r=Math.sqrt(1-y*y);return{x:r*Math.cos(a),y,z:r*Math.sin(a),mass:1/96}});
 const x=1.6,z=.7,initial=surface(x,z);
 rock.position.set(x,(initial??0)-bottom+3,z);
 let velocity=0,settled=false,index=0;
 function update(dt){
  const step=Math.min(Math.max(dt||0,0),.05),height=surface(rock.position.x,rock.position.z);
  const floor=height===null?-Infinity:height-bottom;
  if(rock.position.y>floor+.001){velocity-=9.8*step;rock.position.y+=velocity*step;if(rock.position.y<=floor){rock.position.y=floor;velocity=0;settled=true}else settled=false}
  else if(rock.position.y<floor){rock.position.y=floor;velocity=0;settled=true}
 }
 function cycle(){index=(index+1)%treatments.length;mesh.material=materials[index];return current()}
 function current(){return{index:index+1,total:treatments.length,...treatments[index]}}
 return {group,update,cycleTreatment:cycle,currentTreatment:current,inspect:()=>({name:'Strand supported material study',treatment:current(),representation:'irregular hull + latent BB inventory',bbCount:beads.length,bbMass:1,settled,terrainSupport:'sampled signed-field top surface',limitations:'Single-point vertical support, no torque, roll, fracture, or BB bonding'})};
}
