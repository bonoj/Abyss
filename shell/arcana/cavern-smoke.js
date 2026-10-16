// Low-cost cylindrical geological haze; signed-field voids remain open.
// This is a depth-tested surface approximation, not ray-marched fog.
export function createCavernSmoke(T,{radius=9.92,terrain}={}){
 const group=new T.Group();group.name='cavern:masked-cylinder';
 const material=new T.ShaderMaterial({
  transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,
  uniforms:{time:{value:0}},
  vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 p;uniform float time;
  void main(){float n=sin(p.x*2.3+time*.17)*sin(p.z*1.8-time*.11);
  float a=.34+.12*n;gl_FragColor=vec4(.009,.018,.027,a);}`
 });
 const meshes=[];let ox=0,oz=0,occupied=0,excluded=0;
 function rebuild(){
  for(const mesh of meshes){group.remove(mesh);mesh.geometry.dispose()}
  meshes.length=0;occupied=0;excluded=0;
  const rings=5,segments=160,levels=20;
  for(let k=0;k<rings;k++){
   const r=radius-(k+.5)*.45,pos=[];
   for(let j=0;j<levels;j++)for(let i=0;i<segments;i++){
    const a=(i+.5)*Math.PI*2/segments,y=-1.15+(j+.5)*2.3/levels;
    if(terrain.sample(r*Math.cos(a)+ox,y,r*Math.sin(a)+oz)<=0){excluded++;continue}
    occupied++;
    const a0=i*Math.PI*2/segments,a1=(i+1)*Math.PI*2/segments;
    const y0=-1.15+j*2.3/levels,y1=-1.15+(j+1)*2.3/levels;
    const p=(a,y)=>[r*Math.cos(a),y,r*Math.sin(a)];
    pos.push(...p(a0,y0),...p(a1,y0),...p(a0,y1),...p(a0,y1),...p(a1,y0),...p(a1,y1));
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.computeBoundingSphere();
   const mesh=new T.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=2+k;group.add(mesh);meshes.push(mesh);
  }
 }
 rebuild();
 return {group,rebuild,setOffset:(x,z)=>{ox=x;oz=z;rebuild()},
 update:dt=>{material.uniforms.time.value+=Math.min(dt,.1)},
 inspect:()=>({kind:'masked-cylinder',rings:5,occupied,excluded,low:-1.15,high:1.15,radius,volumetric:false})};
}
