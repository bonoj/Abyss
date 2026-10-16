// Minimal node renderer. No geometry search, raycasting, or visibility claims.
// Supply [{x,y,z,kind}] in Hermeticon-local coordinates. Empty until supplied.
export function createNodeMaker(THREE,parent){
 const colors={surfaceTerrain:0x18df83,sdfSurface:0x37c9ff,
   sdfUndersurface:0xc15bff,undersurfaceTerrain:0xff465e};
 const group=new THREE.Group();group.name='witness-nodes';parent.add(group);
 const geometry=new THREE.SphereGeometry(.085,10,8);
 const meshes={},dummy=new THREE.Object3D(),capacity=256;
 for(const [kind,color] of Object.entries(colors)){
   const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({
     color,metalness:.72,roughness:.18,emissive:color,emissiveIntensity:.24
   }),capacity);
   mesh.count=0;mesh.frustumCulled=false;group.add(mesh);meshes[kind]=mesh;
 }
 let updates=0,lastMs=0,rejected=0;
 function set(nodes=[]){
   const t=performance.now(),byKind=Object.fromEntries(Object.keys(colors).map(k=>[k,[]]));
   rejected=0;
   for(const p of nodes){
     if(!p||!byKind[p.kind]||![p.x,p.y,p.z].every(Number.isFinite)){rejected++;continue}
     if(byKind[p.kind].length>=capacity){rejected++;continue}
     byKind[p.kind].push(p);
   }
   for(const [kind,mesh] of Object.entries(meshes)){
     const pts=byKind[kind];mesh.count=pts.length;
     for(let i=0;i<pts.length;i++){
       const p=pts[i];dummy.position.set(p.x,p.y,p.z);dummy.updateMatrix();
       mesh.setMatrixAt(i,dummy.matrix);
     }
     mesh.instanceMatrix.needsUpdate=true;
   }
   updates++;lastMs=+(performance.now()-t).toFixed(2);
 }
 function inspect(){return {kind:'unassigned-node-renderer',source:'external only',
   counts:Object.fromEntries(Object.entries(meshes).map(([k,m])=>[k,m.count])),
   capacityPerKind:capacity,updates,lastMs,rejected,
   visibilityAudited:false,edgeCoverageAudited:false,
   note:'No automatic node placement; awaiting GPU viewport boundary evidence'};}
 return {set,inspect,group};
}
