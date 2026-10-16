import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * COMPOSABLE CONTRACT — Hermeticon vessel (not a world simulation).
 * Owns: glass, equatorial brass, rivets; radii outer=10.25, inner=10.07.
 * Returns TWO DETACHED groups: `group` (shell) and `content` (inhabitants).
 * Caller MUST mount both: `parent.add(vessel.group)` and
 * `vessel.group.add(vessel.content)`. The factory does not mount them.
 * World origin is the sphere center. Shell rotation rotates descendants;
 * rotate inhabitant content inversely if shell hardware needs its own axis.
 * Do not modify accepted glass/brass appearance to fix missing inhabitants.
 * Incident 2026-10-14: missing scene attachment made a nested eye invisible.
 */
const R=10.25, INNER_R=R-.18;
export function createHermeticon(){
 const group=new THREE.Group();group.name='Hermeticon';
 const glass=(radius,color,opacity,side)=>{
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,72,48),
   new THREE.MeshPhysicalMaterial({color,metalness:0,roughness:.08,transparent:true,opacity,depthWrite:false,side}));
  mesh.name='Hermeticon glass';group.add(mesh);return mesh;
 };
 glass(R,0xa0dce2,.055,THREE.FrontSide);
 glass(INNER_R,0x9dcdd7,.035,THREE.BackSide);
 const brass=new THREE.MeshStandardMaterial({color:0xc99b50,metalness:.82,roughness:.28});
 const bright=new THREE.MeshStandardMaterial({color:0xf0d3a0,metalness:.85,roughness:.2});
 const hoop=(radius,tube,material,y)=>{
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,10,120),material);
  mesh.rotation.x=Math.PI/2;mesh.position.y=y;group.add(mesh);
 };
 hoop(R,.095,brass,0);
 for(const y of [-.15,.15])hoop(R,.021,bright,y);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),bright);
  rivet.position.set(Math.cos(a)*R,0,Math.sin(a)*R);group.add(rivet);
 }
 return {group,content:new THREE.Group(),inspect(){return {name:'Hermeticon',vessel:{radius:R,innerRadius:INNER_R,glass:true,equatorialHardware:true},children:this.content.children.length}}};
}

export const hermeticon=createHermeticon();
hermeticon.content.name='Hermeticon contents';
hermeticon.group.add(hermeticon.content);
