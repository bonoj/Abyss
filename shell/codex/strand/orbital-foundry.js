// Strand orbital foundry — compositional study from primitives, not authored textures.
// Reusable vocabulary: stack, radial, ring, attach, cluster. All geometry is shared.
export function createOrbitalFoundry(T,{parent,surface}){
 const root=new T.Group();root.name='Orbital Foundry / assembly';parent.add(root);
 const station=new T.Group();root.add(station);
 const palette={
  hull:new T.MeshStandardMaterial({color:0x747d82,metalness:.68,roughness:.42,flatShading:true}),
  dark:new T.MeshStandardMaterial({color:0x28313c,metalness:.62,roughness:.52,flatShading:true}),
  brass:new T.MeshStandardMaterial({color:0xb58b50,metalness:.66,roughness:.37}),
  light:new T.MeshBasicMaterial({color:0xffbb68}),
  ice:new T.MeshStandardMaterial({color:0x92c8e2,metalness:.12,roughness:.47,flatShading:true,transparent:true,opacity:.92}),
  blue:new T.MeshBasicMaterial({color:0x4ab9ff}),
  panel:new T.MeshStandardMaterial({color:0x77694e,metalness:.4,roughness:.64})
 };
 const g={
  cylinder:new T.CylinderGeometry(1,1,1,10),
  box:new T.BoxGeometry(1,1,1),
  torus:new T.TorusGeometry(1,.055,5,64),
  ice:new T.IcosahedronGeometry(1,1),
  sphere:new T.SphereGeometry(1,10,8)
 };
 let count=0;
 function part(parent,geo,mat,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]){
  const m=new T.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);parent.add(m);count++;return m;
 }
 function beam(parent,a,b,r=.045,mat=palette.dark){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A);
  const m=part(parent,g.cylinder,mat,A.add(B).multiplyScalar(.5).toArray(),[r,d.length(),r]);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
 }
 function ring(y,r,t=.055,mat=palette.hull){
  // Torus is XY by default; rotate to XZ around vertical spine.
  part(station,g.torus,mat,[0,y,0],[r,r,t/.055],[-Math.PI/2,0,0]);
 }
 function radial(y,r,n,fn){for(let i=0;i<n;i++){const a=i*Math.PI*2/n;fn(Math.cos(a),Math.sin(a),a,i)}}
 function boxAt(x,y,z,sx,sy,sz,mat=palette.hull){return part(station,g.box,mat,[x,y,z],[sx,sy,sz])}
 // Strong vertical silhouette: shaft, collars, tapering modules.
 for(const [y,h,r] of [[-2.3,1.25,.19],[-1.2,1.1,.27],[0,1.45,.32],[1.2,1.2,.23],[2.35,1.1,.18]]){
  part(station,g.cylinder,palette.hull,[0,y,0],[r,h,r]);
  ring(y-h*.38,r*1.35,.045,palette.brass);ring(y+h*.38,r*1.25,.045,palette.dark);
 }
 for(let y=-2.6;y<2.85;y+=.33){
  ring(y,.33,.026,palette.dark);
  radial(y,.32,8,(cx,cz)=>part(station,g.box,(Math.round(y*10)%4===0)?palette.light:palette.brass,[cx*.32,y,cz*.32],[.035,.075,.035]));
 }
 // Habitat and docking ring; concentric silhouette and articulated spokes.
 for(const [y,r] of [[-.4,1.52],[.05,1.65],[.45,1.48]]){
  ring(y,r,.085,palette.hull);ring(y,r*.92,.036,palette.brass);
  radial(y,r,12,(cx,cz)=>beam(station,[cx*.35,y,cz*.35],[cx*r,y,cz*r],.035,palette.dark));
 }
 radial(0,1.55,12,(cx,cz,a,i)=>{
  const x=cx*1.55,z=cz*1.55;
  part(station,g.box,i%3?palette.dark:palette.hull,[x,0,z],[.22,.32,.28],[0,-a,0]);
  if(i%2===0)part(station,g.box,palette.light,[x,.18,z],[.09,.035,.09]);
 });
 // Upper extraction mast, arms, gantries, and capture-ring scaffold.
 for(const y of [1.2,1.85,2.35]){
  radial(y,1.3,8,(cx,cz,a,i)=>{
   beam(station,[cx*.22,y,cz*.22],[cx*(1.12+i%2*.2),y+.14,cz*(1.12+i%2*.2)],.032);
   const x=cx*1.15,z=cz*1.15;
   part(station,g.box,palette.hull,[x,y+.14,z],[.28,.12,.19],[0,-a,0]);
   beam(station,[x,y+.14,z],[x,y+.5,z],.02,palette.brass);
  });
 }
 // Industrial equipment at lower levels: tanks, radiator wings, asymmetric pods.
 for(const [x,y,z,r,h] of [[.52,-1.55,.12,.22,.7],[-.53,-1.42,.12,.18,.9],[.38,-.98,-.4,.19,.58],[-.43,-2.0,-.31,.14,.65]]){
  part(station,g.cylinder,palette.hull,[x,y,z],[r,h,r]);
  part(station,g.sphere,palette.dark,[x,y+h*.49,z],[r,r*.3,r]);
 }
 for(let side of [-1,1]){
  boxAt(side*1.12,-1.55,0,.85,.95,.075,palette.panel);
  for(let k=-2;k<=2;k++)boxAt(side*1.12+k*.12,-1.55,.055,.018,.94,.015,palette.brass);
  beam(station,[side*.3,-1.5,0],[side*.75,-1.5,0],.035);
 }
 // Upper ice capture arc: broken silhouette with articulated struts.
 const ice=new T.Group();station.add(ice);
 const seed=i=>{const v=Math.sin(i*127.1+19.3)*43758.5453;return v-Math.floor(v)};
 for(let i=0;i<19;i++){
  const a=(.08+i/18*.84)*Math.PI; // arch from left to right, high over station
  const r=2.0+.22*(seed(i+41)-.5);
  const x=Math.cos(a)*r,z=(seed(i+77)-.5)*.9,y=3.25+Math.sin(a)*1.15;
  const s=.28+.29*seed(i+11);
  const m=part(ice,g.ice,palette.ice,[x,y,z],[s*(.8+seed(i+4)),s*(.8+seed(i+6)),s*(.7+seed(i+8))],[seed(i)*3,seed(i+1)*4,seed(i+2)*3]);
  if(i%2===0){
   beam(station,[x*.68,2.4,z*.6],[x,y,z],.022,palette.brass);
   part(station,g.box,palette.dark,[x,y-s*.55,z],[s*.58,.10,s*.5]);
   part(station,g.box,palette.light,[x,y-s*.63,z],[.055,.045,.055]);
  }
 }
 // Small detached ice fragments give scale and break perfect symmetry.
 for(let i=0;i<22;i++){
  const a=seed(i+110)*Math.PI*2,r=1.8+seed(i+130)*1.5;
  const x=Math.cos(a)*r,z=Math.sin(a)*r,y=2.9+seed(i+150)*1.8;
  const s=.035+seed(i+170)*.085;
  part(ice,g.ice,palette.ice,[x,y,z],[s,s*.85,s]);
 }
 const terrainY=surface(1.6,.7);
 root.position.set(1.6,(terrainY??0)+3.0,.7);
 station.scale.setScalar(.75);
 let elapsed=0;
 function update(dt){elapsed+=Math.min(Math.max(dt||0,0),.05);station.rotation.y=Math.sin(elapsed*.08)*.14;ice.rotation.y=Math.sin(elapsed*.14)*.035;}
 const modes=[['FOUNDRY','Orbital extraction assembly'],['STRUCTURE','Structural composition'],['ICE','Captured ice arc']];
 let mode=0;
 function cycleTreatment(){mode=(mode+1)%modes.length;palette.ice.opacity=mode===1?.18:.92;palette.ice.needsUpdate=true;return currentTreatment()}
 function currentTreatment(){return{index:mode+1,total:modes.length,name:modes[mode][0],description:modes[mode][1]}}
 return{group:root,update,cycleTreatment,currentTreatment,inspect:()=>({name:'Orbital Foundry',meshes:count,geometry:'shared boxes, cylinders, tori, icosahedra and spheres',assembly:'stack + ring + radial + attach + cluster',animation:'slow oscillation',terrainSupport:'floating 3 units above terrain',mode:currentTreatment()})};
}
