// One isolated material study, independent of terrain collision and inventory.
export function createMaterialSpecimen(T,{parent,surface}) {
 const group=new T.Group();group.name='Strand material specimen';parent.add(group);
 const x=0,z=0,y=surface(x,z)??1.15;
 const geometry=new T.IcosahedronGeometry(1,2);
 const material=new T.MeshStandardMaterial({color:0x77736d,roughness:.92,metalness:0,flatShading:true});
 const mesh=new T.Mesh(geometry,material);
 mesh.position.set(x,y+1.5,z);mesh.scale.set(1.35,.95,1.1);group.add(mesh);
 return {group,inspect:()=>({name:'Strand isolated material specimen',count:1,material:'neutral stone',experimental:true,collision:false})};
}
