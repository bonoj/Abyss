import {createMasonryGeometry} from './brick-rain.js';

// An intact architectural entity: masonry is local geometry, not a second rigid-body solver.
// Support probes find a level, nonpenetrating pose; gaps are reported rather than hidden.
export function createMasonryTower(T,{parent,surface,x=-2.7,z=0}){
 const root=new T.Group();root.name='Strand masonry tower';parent.add(root);
 const {geo,w,h,d}=createMasonryGeometry(T);
 const stone=[0xc9c3ad,0xb4b2a3,0xaaa99f,0xd2c8b0,0x979f9e].map(color=>new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));
 const nx=5,nz=5,courses=8,dx=w+.012,dz=d+.012;
 const width=nx*dx,depth=nz*dz;
 let count=0;
 const add=(i,j,k,extraY=0)=>{
  const m=new T.Mesh(geo,stone[(i*3+j*7+k*11)%stone.length]);
  m.position.set((i-(nx-1)/2)*dx,(k+.5)*h+extraY,(j-(nz-1)/2)*dz);
  m.castShadow=true;m.receiveShadow=true;root.add(m);count++;
 };
 for(let k=0;k<courses;k++)for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  if(i!==0&&i!==nx-1&&j!==0&&j!==nz-1)continue;
  // One-brick-wide front doorway; flat lintel is the next intact course.
  if(j===nz-1&&i===2&&k<4)continue;
  // Upper parapet, with regularly spaced gaps.
  if(k===courses-1&&((i+j)%2===1))continue;
  add(i,j,k);
 }
 const probes=[];
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  if(i===0||i===nx-1||j===0||j===nz-1||i===2&&j===2)
   probes.push({x:(i-(nx-1)/2)*dx,z:(j-(nz-1)/2)*dz});
 }
 let placement={status:'unplaced'};
 function place(px=x,pz=z){
  const samples=probes.map(p=>({x:p.x,z:p.z,y:surface(px+p.x,pz+p.z)}));
  const valid=samples.filter(p=>Number.isFinite(p.y));
  if(valid.length===0){placement={status:'no-terrain',samples:samples.length};return placement;}
  const maxY=Math.max(...valid.map(p=>p.y)),minY=Math.min(...valid.map(p=>p.y));
  // The geometry's lowest bevel reaches slightly below its nominal half-height.
  root.position.set(px,maxY+.04,pz);
  const gapTolerance=.16,contacts=valid.filter(p=>maxY-p.y<=gapTolerance).length;
  placement={status:valid.length!==samples.length?'partial-terrain':contacts<4?'limited-support':'supported',
   origin:[px,root.position.y,pz],probeCount:samples.length,validProbes:valid.length,
   nearContacts:contacts,maxGap:+(maxY-minY).toFixed(3),level:true,nonpenetrating:true,
   note:'Kinematic intact assembly; no dynamic settling or stability proof'};
  return placement;
 }
 place(x,z);
 return {group:root,place,inspect:()=>({name:'Strand masonry tower',entity:'single intact assembly',
  bricks:count,dimensions:[width,courses*h,depth],placement})};
}
